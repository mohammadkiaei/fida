"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { LIMITS, RECORDING } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nProvider";

const MIME_CANDIDATES = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
const pickMime = () =>
  typeof MediaRecorder === "undefined" ? "" : MIME_CANDIDATES.find((m) => MediaRecorder.isTypeSupported(m)) || "";

const cameraErrorKey = (e) => {
  if (e?.name === "NotAllowedError" || e?.name === "SecurityError") return "denied";
  if (e?.name === "NotFoundError" || e?.name === "OverconstrainedError") return "notFound";
  if (e?.name === "NotReadableError") return "busy";
  return "generic";
};

/**
 * Camera + recorder + review, in one component.
 * Phases: idle -> starting -> ready -> recording -> review (or error at any point).
 * Calls onSubmit(blob, durationSeconds) when the user confirms the take.
 */
export default function VideoRecorder({ sentence, gestures, onSubmit, submitting = false, progress = 0 }) {
  const { t, n, clock } = useI18n();
  const { minSeconds, maxSeconds } = RECORDING;
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [take, setTake] = useState(null); // { blob, url, duration }

  const liveRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const takeUrlRef = useRef(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  const clearTake = useCallback(() => {
    if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    takeUrlRef.current = null;
    setTake(null);
  }, []);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      stopStream();
      if (takeUrlRef.current) URL.revokeObjectURL(takeUrlRef.current);
    },
    [stopStream]
  );

  const startCamera = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(t("recorder.unsupported"));
      setPhase("error");
      return;
    }
    setPhase("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 480, max: 720 }, height: { ideal: 640, max: 960 }, frameRate: { ideal: 20, max: 24 } },
        audio: true,
      });
      streamRef.current = stream;
      setPhase("ready");
    } catch (e) {
      setError(t(`recorder.err.${cameraErrorKey(e)}`));
      setPhase("error");
    }
  }, [t]);

  useEffect(() => {
    if ((phase === "ready" || phase === "recording") && liveRef.current && streamRef.current) {
      liveRef.current.srcObject = streamRef.current;
      liveRef.current.play().catch(() => {});
    }
  }, [phase]);

  const finish = useCallback(() => {
    clearInterval(timerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const startRecording = () => {
    chunksRef.current = [];
    const mimeType = pickMime();
    let rec;
    try {
      rec = new MediaRecorder(streamRef.current, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 600_000, audioBitsPerSecond: 32_000 });
    } catch {
      setError(t("recorder.startFailed"));
      setPhase("error");
      return;
    }
    recorderRef.current = rec;
    rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    rec.onstop = () => {
      const duration = (Date.now() - startedAtRef.current) / 1000;
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || mimeType || "video/webm" });
      if (blob.size > LIMITS.maxVideoKB * 1024) {
        stopStream();
        setError(t("recorder.tooLarge"));
        setPhase("error");
        return;
      }
      const url = URL.createObjectURL(blob);
      takeUrlRef.current = url;
      setTake({ blob, url, duration });
      stopStream();
      setPhase("review");
    };
    startedAtRef.current = Date.now();
    setElapsed(0);
    rec.start(500);
    setPhase("recording");
    timerRef.current = setInterval(() => {
      const s = (Date.now() - startedAtRef.current) / 1000;
      setElapsed(s);
      if (s >= maxSeconds) finish();
    }, 200);
  };

  const retake = () => {
    clearTake();
    startCamera();
  };

  const handPatterns = gestures?.handPatterns?.length ? gestures.handPatterns.slice(0, 3) : [1, 2, 3];
  const headSequence = gestures?.headSequence?.length ? gestures.headSequence : ["left", "right"];
  const gestureStage = elapsed < 9 ? "hands" : elapsed < 11 ? "move" : elapsed < 11 + headSequence.length * 2 ? "head" : "smile";
  const activeHandPattern = handPatterns[Math.min(handPatterns.length - 1, Math.floor(elapsed / 3))];
  const activeHeadDirection = headSequence[Math.min(headSequence.length - 1, Math.floor((elapsed - 11) / 2))];
  const gestureCompletionSeconds = 11 + headSequence.length * 2 + 1;
  const canStop = elapsed >= Math.max(minSeconds, gestureCompletionSeconds);

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-ink p-5 text-white">
        <p className="mb-2 text-sm text-white/70">{t("recorder.readAloud")}</p>
        <p className="text-xl font-bold leading-10 sm:text-2xl">{sentence}</p>
      </div>

      <div className="rounded-xl border border-brand/20 bg-mist p-4 text-sm leading-7 text-deep">
        <p className="font-bold">{t("recorder.gestureTitle")}</p>
        <ol className="mt-2 list-decimal space-y-1 ps-5">
          {(gestures?.handPatterns || []).slice(0, 3).map((count, index) => <li key={`${count}-${index}`}>{t("recorder.showFingers", { count: n(count) })}</li>)}
          <li>{t("recorder.moveHands")}</li>
          <li>{t("recorder.turnHead", { direction: (gestures?.headSequence || ["left", "right"]).map((direction) => t(`recorder.${direction}`)).join(` ${t("recorder.then")} `) })}</li>
          <li>{t("recorder.smile")}</li>
        </ol>
        <p className="mt-2 text-xs text-muted">{t("recorder.gestureNote")}</p>
      </div>

      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-ink">
        {(phase === "ready" || phase === "recording") && (
          <video ref={liveRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
        )}
        {phase === "review" && take && <video src={take.url} controls playsInline className="h-full w-full object-cover" />}
        {(phase === "idle" || phase === "starting" || phase === "error") && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center text-white/80">
            {phase === "error" ? (
              <p role="alert" className="text-sm leading-7 text-red-200">{error}</p>
            ) : (
              <p className="text-sm leading-7">{phase === "starting" ? t("recorder.starting") : t("recorder.enable")}</p>
            )}
          </div>
        )}
        {["top-3 start-3 border-t-4 border-s-4 rounded-ts-lg", "top-3 end-3 border-t-4 border-e-4 rounded-te-lg", "bottom-3 start-3 border-b-4 border-s-4 rounded-bs-lg", "bottom-3 end-3 border-b-4 border-e-4 rounded-be-lg"].map((c) => (
          <span key={c} aria-hidden="true" className={`pointer-events-none absolute h-8 w-8 border-brand-light ${c}`} />
        ))}
        {phase === "recording" && (
          <div className="pointer-events-none absolute inset-0" aria-live="polite">
            <div className="absolute start-3 top-16 flex min-h-28 w-24 flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/95 p-2 text-center text-xs font-bold leading-5 text-deep shadow-xl">
              {gestureStage === "hands" && <>
                {/* The source hand-pattern cards are part of the supplied Fida assets. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/hand-patterns/${activeHandPattern}.png.jpeg`} alt={t("recorder.handImageAlt", { count: n(activeHandPattern) })} className="h-16 w-16 object-contain" />
                <span>{t("recorder.sayPattern", { count: n(activeHandPattern) })}</span>
              </>}
              {gestureStage === "move" && <><span className="text-4xl leading-none" aria-hidden="true">↔</span><span>{t("recorder.moveHandsShort")}</span></>}
              {gestureStage === "head" && <><span className="text-5xl leading-none" aria-hidden="true">{activeHeadDirection === "right" ? "⬅" : "➡"}</span><span>{t("recorder.turnHeadShort", { direction: t(`recorder.${activeHeadDirection}`) })}</span></>}
              {gestureStage === "smile" && <><span className="text-5xl leading-none" aria-hidden="true">☺</span><span>{t("recorder.smileShort")}</span></>}
            </div>
          </div>
        )}
        {phase === "recording" && (
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
            <span>{clock(elapsed)}</span>
          </div>
        )}
      </div>

      {phase === "recording" && (
        <p className="text-center text-sm text-muted">
          {canStop ? t("recorder.stopHint", { max: n(maxSeconds) }) : t("recorder.minHint", { min: n(minSeconds) })}
        </p>
      )}

      {submitting && (
        <div aria-live="polite">
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-center text-sm text-muted">{t("recorder.uploading", { p: n(progress) })}</p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {(phase === "idle" || phase === "error") && <Button onClick={startCamera}>{phase === "error" ? t("common.retry") : t("recorder.enableBtn")}</Button>}
        {phase === "ready" && <Button variant="danger" onClick={startRecording}>{t("recorder.start")}</Button>}
        {phase === "recording" && (
          <Button variant="danger" onClick={finish} disabled={!canStop}>
            {t("recorder.stop")}
          </Button>
        )}
        {phase === "review" && (
          <>
            <Button variant="outline" onClick={retake} disabled={submitting}>{t("recorder.retake")}</Button>
            <Button onClick={() => onSubmit(take.blob, take.duration)} loading={submitting}>
              {t("recorder.submit")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

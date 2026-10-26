"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { RECORDING } from "@/lib/constants";
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
export default function VideoRecorder({ sentence, onSubmit, submitting = false, progress = 0 }) {
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
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } },
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
      rec = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
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

  const canStop = elapsed >= minSeconds;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-ink p-5 text-white">
        <p className="mb-2 text-sm text-white/70">{t("recorder.readAloud")}</p>
        <p className="text-xl font-bold leading-10 sm:text-2xl">{sentence}</p>
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

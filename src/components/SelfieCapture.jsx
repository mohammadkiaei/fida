"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { LIMITS } from "@/lib/constants";
import { useI18n } from "@/i18n/I18nProvider";

const errKey = (e) =>
  e?.name === "NotAllowedError" || e?.name === "SecurityError" ? "denied" : e?.name === "NotFoundError" ? "notFound" : e?.name === "NotReadableError" ? "busy" : "generic";

/** Shrinks the JPEG until it fits the 500 KB limit. */
async function toJpeg(video) {
  const scale = Math.min(1, 720 / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  for (const q of [0.88, 0.75, 0.6, 0.45, 0.3]) {
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", q));
    if (blob && blob.size <= LIMITS.maxFileKB * 1024) return blob;
  }
  return new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.2));
}

/** Live selfie only (no file picker): camera -> capture -> review -> confirm. */
export default function SelfieCapture({ onConfirm }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState("idle"); // idle | starting | ready | review | error
  const [error, setError] = useState("");
  const [shot, setShot] = useState(null); // { blob, url }
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const urlRef = useRef(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stop();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [stop]
  );

  const start = useCallback(async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("selfie.unsupported"));
      setPhase("error");
      return;
    }
    setPhase("starting");
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1080 } }, audio: false });
      setPhase("ready");
    } catch (e) {
      setError(t(`recorder.err.${errKey(e)}`));
      setPhase("error");
    }
  }, [t]);

  useEffect(() => {
    if (phase === "ready" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const capture = async () => {
    const v = videoRef.current;
    if (!v?.videoWidth) return;
    const blob = await toJpeg(v);
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    setShot({ blob, url });
    stop();
    setPhase("review");
  };

  const retake = () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setShot(null);
    start();
  };

  return (
    <div className="space-y-5">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl bg-ink">
        {phase === "ready" && <video ref={videoRef} muted playsInline className="h-full w-full -scale-x-100 object-cover" />}
        {phase === "review" && shot && /* eslint-disable-next-line @next/next/no-img-element */ <img src={shot.url} alt={t("selfie.previewAlt")} className="h-full w-full object-cover" />}
        {(phase === "idle" || phase === "starting" || phase === "error") && (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm leading-7 text-white/80">
            {phase === "error" ? <p role="alert" className="text-red-200">{error}</p> : phase === "starting" ? t("recorder.starting") : t("selfie.enable")}
          </div>
        )}
        {["top-3 start-3 border-t-4 border-s-4 rounded-ts-lg", "top-3 end-3 border-t-4 border-e-4 rounded-te-lg", "bottom-3 start-3 border-b-4 border-s-4 rounded-bs-lg", "bottom-3 end-3 border-b-4 border-e-4 rounded-be-lg"].map((c) => (
          <span key={c} aria-hidden="true" className={`pointer-events-none absolute h-8 w-8 border-brand-light ${c}`} />
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {(phase === "idle" || phase === "error") && <Button onClick={start}>{phase === "error" ? t("common.retry") : t("recorder.enableBtn")}</Button>}
        {phase === "ready" && <Button onClick={capture}>{t("selfie.capture")}</Button>}
        {phase === "review" && (
          <>
            <Button variant="outline" onClick={retake}>{t("selfie.retake")}</Button>
            <Button onClick={() => onConfirm(shot.blob)}>{t("selfie.confirm")}</Button>
          </>
        )}
      </div>
    </div>
  );
}

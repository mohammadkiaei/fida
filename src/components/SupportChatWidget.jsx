"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n/I18nProvider";

const VISITOR_KEY = "fida_support_visitor_v1";
const CHAT_KEY = "fida_support_messages_v1";
const CHAT_ID_KEY = "fida_support_conversation_v1";

export default function SupportChatWidget() {
  const { t, n, errorText } = useI18n();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("ai");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    let visitor = localStorage.getItem(VISITOR_KEY);
    if (!visitor) {
      visitor = globalThis.crypto?.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, visitor);
    }
    setVisitorId(visitor);
    setConversationId(localStorage.getItem(CHAT_ID_KEY) || "");
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
      setMessages(Array.isArray(saved) ? saved : []);
    } catch { setMessages([]); }
  }, []);

  useEffect(() => {
    if (!visitorId) return;
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-100)));
    if (conversationId) localStorage.setItem(CHAT_ID_KEY, conversationId);
  }, [messages, conversationId, visitorId]);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages, busy]);

  useEffect(() => {
    const showChat = () => setOpen(true);
    window.addEventListener("fida-support-open", showChat);
    return () => window.removeEventListener("fida-support-open", showChat);
  }, []);

  useEffect(() => {
    if (!open || mode !== "human" || !conversationId || !visitorId) return;
    const poll = async () => {
      const after = messages[messages.length - 1]?.sentAt || "";
      try {
        const incoming = await api.getSupportMessages(conversationId, visitorId, after);
        if (!Array.isArray(incoming) || !incoming.length) return;
        setMessages((current) => {
          const known = new Set(current.map((item) => item.id));
          return [...current, ...incoming.filter((item) => item.id && !known.has(item.id)).map((item) => ({ ...item, role: "assistant" }))];
        });
      } catch { /* Keep the open conversation usable during temporary network errors. */ }
    };
    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [open, mode, conversationId, visitorId, messages]);

  const send = async (event) => {
    event.preventDefault();
    const message = text.trim();
    if (!message || busy || !visitorId) return;
    setError(""); setText(""); setBusy(true);
    setMessages((current) => [...current, { id: `local-${Date.now()}`, role: "user", text: message, channel: mode, sentAt: new Date().toISOString() }]);
    try {
      const result = await api.sendSupportMessage(message, mode, { visitorId, conversationId: conversationId || undefined });
      if (result.conversationId) setConversationId(result.conversationId);
      const reply = result.reply || (mode === "human" ? t("supportChat.queued") : t("supportChat.noReply"));
      setMessages((current) => [...current, { id: result.id || `reply-${Date.now()}`, role: "assistant", text: reply, channel: mode, sentAt: new Date().toISOString() }]);
    } catch (e) { setError(errorText(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed bottom-4 end-4 z-[100] print:hidden">
      {open && <section className="mb-3 flex h-[min(72vh,600px)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl" aria-label={t("supportChat.title")}>
        <header className="flex items-center justify-between bg-ink px-4 py-3 text-white">
          <div><h2 className="font-bold">{t("supportChat.title")}</h2><p className="text-xs text-white/70">{mode === "ai" ? t("supportChat.aiMode") : t("supportChat.humanMode")}</p></div>
          <button type="button" aria-label={t("supportChat.close")} onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-xl hover:bg-white/10">×</button>
        </header>
        <div className="flex gap-2 border-b border-line p-3">
          <button type="button" onClick={() => setMode("ai")} aria-pressed={mode === "ai"} className={`flex-1 rounded-lg px-2 py-2 text-sm ${mode === "ai" ? "bg-brand text-white" : "bg-mist text-deep"}`}>{t("supportChat.ai")}</button>
          <button type="button" onClick={() => setMode("human")} aria-pressed={mode === "human"} className={`flex-1 rounded-lg px-2 py-2 text-sm ${mode === "human" ? "bg-brand text-white" : "bg-mist text-deep"}`}>{t("supportChat.human")}</button>
        </div>
        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-mist/50 p-3" aria-live="polite">
          {!messages.length && <div className="max-w-[88%] rounded-2xl rounded-es-sm bg-white p-3 text-sm leading-6 text-deep shadow-sm">{t("supportChat.welcome")}</div>}
          {messages.map((item) => <div key={item.id} className={`flex ${item.role === "user" ? "justify-start" : "justify-end"}`}><p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${item.role === "user" ? "rounded-es-sm bg-brand text-white" : "rounded-ee-sm bg-white text-deep shadow-sm"}`}>{item.text}<span className="mt-1 block text-end text-[10px] opacity-60">{item.sentAt ? n(new Date(item.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })) : ""}</span></p></div>)}
          {busy && <p className="text-xs text-muted">{t("supportChat.typing")}</p>}
        </div>
        {error && <p role="alert" className="px-3 pt-2 text-xs text-red-600">{error}</p>}
        <form onSubmit={send} className="flex items-end gap-2 border-t border-line p-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={2000} placeholder={t("supportChat.placeholder")} aria-label={t("supportChat.placeholder")} className="max-h-28 min-h-10 flex-1 resize-y rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-brand" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
          <button type="submit" disabled={busy || !text.trim()} className="rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50">{t("supportChat.send")}</button>
        </form>
      </section>}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? t("supportChat.close") : t("supportChat.open")} className="ms-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition hover:scale-105 hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/30">
        {open ? <span className="text-2xl leading-none">×</span> : <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.7-3.3A7.5 7.5 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 11.5h8M8 14.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>}
      </button>
    </div>
  );
}

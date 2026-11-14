import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  ImageIcon,
  ImagePlus,
  Languages,
  Loader2,
  MessageSquare,
  Sparkles,
  Send,
  Wand2,
} from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { useEntitlement } from "#/lib/api";
import { AppShell } from "#/components/app-shell";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export const Route = createFileRoute("/playground")({ component: Playground });

type Tab = "summarize" | "translate" | "chat" | "image" | "edit";

const TABS: { key: Tab; label: string; icon: typeof Sparkles }[] = [
  { key: "summarize", label: "Summarize", icon: Sparkles },
  { key: "translate", label: "Translate", icon: Languages },
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "edit", label: "Edit", icon: Wand2 },
];

const LANGUAGES = [
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "german", label: "German" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
] as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T & { error?: string }> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok)
    throw Object.assign(new Error(data.error ?? `HTTP ${res.status}`), { status: res.status });
  return data;
}

function Playground() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const { data: entitlement } = useEntitlement();

  const [tab, setTab] = useState<Tab>("summarize");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Summarize
  const [sumInput, setSumInput] = useState("");
  const [sumOutput, setSumOutput] = useState("");

  // Translate
  const [trInput, setTrInput] = useState("");
  const [trLang, setTrLang] = useState<string>("french");
  const [trOutput, setTrOutput] = useState("");

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Image
  const [imgPrompt, setImgPrompt] = useState("");
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Edit image
  const [editSrc, setEditSrc] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editResult, setEditResult] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPending && !session) navigate({ to: "/login" });
  }, [isPending, session, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (isPending || !session) {
    return <main className="mx-auto max-w-3xl px-4 py-24 text-center text-ink-3">Loading…</main>;
  }

  function afterCall() {
    queryClient.invalidateQueries({ queryKey: ["entitlement"] });
    queryClient.invalidateQueries({ queryKey: ["usage-events"] });
  }

  function formatError(e: unknown): string {
    const err = e as { message?: string; status?: number };
    if (err.status === 402) return "Insufficient credits — upgrade to keep using AI features.";
    if (err.status === 429) return "Rate limit exceeded. Wait a minute and try again.";
    return err.message ?? "Request failed";
  }

  async function runSummarize() {
    if (!sumInput.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await postJson<{ summary: string }>("/api/ai/summarize", { text: sumInput });
      setSumOutput(data.summary);
      afterCall();
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(false);
    }
  }

  async function runTranslate() {
    if (!trInput.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await postJson<{ translated: string }>("/api/ai/translate", {
        text: trInput,
        targetLang: trLang,
      });
      setTrOutput(data.translated);
      afterCall();
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(false);
    }
  }

  async function sendChat() {
    const content = chatInput.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...chatMessages, { role: "user", content }];
    setChatMessages(next);
    setChatInput("");
    setBusy(true);
    setError(null);
    try {
      const data = await postJson<{ response: string }>("/api/ai/chat", {
        messages: next.map((m) => ({ role: m.role, content: m.content })),
      });
      setChatMessages([...next, { role: "assistant", content: data.response }]);
      afterCall();
    } catch (e) {
      setError(formatError(e));
      setChatMessages(next); // keep user message even on failure
    } finally {
      setBusy(false);
    }
  }

  async function runImage() {
    if (!imgPrompt.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await postJson<{ image: string }>("/api/ai/image", { prompt: imgPrompt });
      setImgSrc(data.image);
      afterCall();
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(false);
    }
  }

  function onEditFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditSrc(reader.result as string);
    reader.readAsDataURL(file);
    setEditResult(null);
  }

  async function runEdit() {
    if (!editSrc || !editPrompt.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await postJson<{ image: string }>("/api/ai/edit-image", {
        image: editSrc,
        prompt: editPrompt,
      });
      setEditResult(data.image);
      afterCall();
    } catch (e) {
      setError(formatError(e));
    } finally {
      setBusy(false);
    }
  }

  const credits = entitlement?.credits ?? 0;

  return (
    <AppShell active="playground" title="AI Playground" email={session.user.email}>
      {/* Credits badge */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-3">Workers AI demos — each call costs 1 credit.</p>
        <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs font-medium text-ink-2 tabular-nums">
          {credits} credit{credits === 1 ? "" : "s"} left
        </span>
      </div>

      {/* Tab bar */}
      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-panel-2 p-1">
        {TABS.map((t) =>
          t.key === tab ? (
            <div
              key={t.key}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-panel px-3 py-1.5 text-sm font-medium text-ink-1 shadow-xs"
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </div>
          ) : (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setError(null);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink-1"
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ),
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Summarize ───────────────────────────────────────────── */}
      {tab === "summarize" && (
        <Card>
          <CardHeader>
            <CardTitle>Summarize text</CardTitle>
            <CardDescription>Llama 3.2 3B — paste a long passage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="sum-input">Input</Label>
              <textarea
                id="sum-input"
                rows={5}
                value={sumInput}
                onChange={(e) => setSumInput(e.target.value)}
                placeholder="Paste the text you want summarized…"
                className="flex w-full rounded-lg border border-border-strong bg-panel px-3 py-2 text-sm text-ink-1 shadow-xs transition-all duration-150 placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
              />
            </div>
            <Button variant="primary" onClick={runSummarize} disabled={busy || !sumInput.trim()}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {busy ? "Summarizing…" : "Summarize"}
            </Button>
            {sumOutput && (
              <div className="rounded-lg border border-border bg-panel-2 px-4 py-3">
                <p className="mb-1 text-xs font-medium tracking-wide text-ink-3 uppercase">
                  Summary
                </p>
                <p className="text-sm text-ink-1 whitespace-pre-wrap">{sumOutput}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Translate ───────────────────────────────────────────── */}
      {tab === "translate" && (
        <Card>
          <CardHeader>
            <CardTitle>Translate text</CardTitle>
            <CardDescription>M2M100 1.2B — English to a target language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tr-input">Input</Label>
              <textarea
                id="tr-input"
                rows={4}
                value={trInput}
                onChange={(e) => setTrInput(e.target.value)}
                placeholder="Text to translate…"
                className="flex w-full rounded-lg border border-border-strong bg-panel px-3 py-2 text-sm text-ink-1 shadow-xs transition-all duration-150 placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tr-lang">Target language</Label>
              <select
                id="tr-lang"
                value={trLang}
                onChange={(e) => setTrLang(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-border-strong bg-panel px-3 text-sm text-ink-1 shadow-xs transition-all duration-150 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="primary" onClick={runTranslate} disabled={busy || !trInput.trim()}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Languages className="h-4 w-4" />
              )}
              {busy ? "Translating…" : "Translate"}
            </Button>
            {trOutput && (
              <div className="rounded-lg border border-border bg-panel-2 px-4 py-3">
                <p className="mb-1 text-xs font-medium tracking-wide text-ink-3 uppercase">
                  Translated
                </p>
                <p className="text-sm text-ink-1 whitespace-pre-wrap">{trOutput}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Chat ────────────────────────────────────────────────── */}
      {tab === "chat" && (
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Llama 3.2 3B Instruct — conversation stays in this tab
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border bg-panel-2 p-4">
              {chatMessages.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-3">
                  Send a message to start chatting.
                </p>
              )}
              {chatMessages.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] rounded-xl bg-accent-800 px-3.5 py-2 text-sm text-on-accent"
                        : "max-w-[80%] rounded-xl border border-border bg-panel px-3.5 py-2 text-sm text-ink-1"
                    }
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-panel px-3.5 py-2 text-sm text-ink-3">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder="Type a message…"
                disabled={busy}
              />
              <Button variant="primary" onClick={sendChat} disabled={busy || !chatInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Image ───────────────────────────────────────────────── */}
      {tab === "image" && (
        <Card>
          <CardHeader>
            <CardTitle>Generate image</CardTitle>
            <CardDescription>FLUX.1 Schnell — describe what you want to see</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="img-prompt">Prompt</Label>
              <Input
                id="img-prompt"
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                placeholder="A teal sailboat on calm water at golden hour…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runImage();
                  }
                }}
              />
            </div>
            <Button variant="primary" onClick={runImage} disabled={busy || !imgPrompt.trim()}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              {busy ? "Generating…" : "Generate"}
            </Button>
            {imgSrc && (
              <div className="rounded-lg border border-border bg-panel-2 p-4">
                <img
                  src={imgSrc}
                  alt={imgPrompt}
                  className="mx-auto max-h-128 rounded-lg border border-border shadow-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Edit image ──────────────────────────────────────────── */}
      {tab === "edit" && (
        <Card>
          <CardHeader>
            <CardTitle>Edit image</CardTitle>
            <CardDescription>
              FLUX.1 Schnell img2img — upload an image and describe the change
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-file">Source image</Label>
              <input
                id="edit-file"
                ref={editFileRef}
                type="file"
                accept="image/*"
                onChange={onEditFile}
                className="flex w-full rounded-lg border border-border-strong bg-panel px-3 py-2 text-sm text-ink-1 shadow-xs transition-all duration-150 file:mr-3 file:rounded-md file:border-0 file:bg-panel-2 file:px-3 file:py-1 file:text-sm file:text-ink-2 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-prompt">Prompt</Label>
              <textarea
                id="edit-prompt"
                rows={3}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe the edit — e.g. make the sky a sunset gradient…"
                className="flex w-full rounded-lg border border-border-strong bg-panel px-3 py-2 text-sm text-ink-1 shadow-xs transition-all duration-150 placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/30"
              />
            </div>
            <Button
              variant="primary"
              onClick={runEdit}
              disabled={busy || !editSrc || !editPrompt.trim()}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {busy ? "Editing…" : "Edit image"}
            </Button>

            {(editSrc || editResult) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {editSrc && (
                  <div className="rounded-lg border border-border bg-panel-2 p-4">
                    <p className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
                      Original
                    </p>
                    <img
                      src={editSrc}
                      alt="Source for editing"
                      className="mx-auto max-h-80 rounded-lg border border-border shadow-sm"
                    />
                  </div>
                )}
                {editResult && (
                  <div className="rounded-lg border border-border bg-panel-2 p-4">
                    <p className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
                      Result
                    </p>
                    <img
                      src={editResult}
                      alt={editPrompt}
                      className="mx-auto max-h-80 rounded-lg border border-border shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

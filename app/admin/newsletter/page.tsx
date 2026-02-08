"use client";

import { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import TextArea from "@/components/admin/form/input/TextArea";
import Input from "@/components/admin/form/input/InputField";

interface Recipient {
  id: string;
  email: string;
  name: string | null;
}

interface SavedCampaign {
  id: string;
  subject: string;
  body: string;
  isHtml: boolean;
  sentCount: number;
  createdAt: string;
}

export default function NewsletterPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [sendTo, setSendTo] = useState<"all" | "custom">("all");
  const [customEmails, setCustomEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [viewCampaign, setViewCampaign] = useState<SavedCampaign | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchCampaigns = () => {
    setCampaignsLoading(true);
    fetch("/api/admin/newsletter/campaigns")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCampaigns(data);
      })
      .catch(() => setCampaigns([]))
      .finally(() => setCampaignsLoading(false));
  };

  useEffect(() => {
    fetch("/api/admin/newsletter/recipients")
      .then((r) => r.json())
      .then((data) => {
        if (data.recipients) setRecipients(data.recipients);
      })
      .catch(() => setRecipients([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSending(true);

    try {
      const to =
        sendTo === "all"
          ? "all"
          : customEmails
              .split(/[\n,;]+/)
              .map((e) => e.trim())
              .filter((e) => e.length > 0 && e.includes("@"));

      if (sendTo === "custom" && to.length === 0) {
        setMessage({ type: "error", text: "Вкажіть хоча б один email" });
        setSending(false);
        return;
      }

      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sendTo === "all" ? "all" : to,
          subject,
          body,
          isHtml,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Помилка відправки" });
        setSending(false);
        return;
      }

      setMessage({
        type: "success",
        text: data.message || `Надіслано ${data.sent ?? 0} листів`,
      });
      setSubject("");
      setBody("");
      fetchCampaigns();
    } catch {
      setMessage({ type: "error", text: "Помилка з'єднання" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6">
      <PageBreadCrumb pageTitle="Розсилки" />

      <div className="mt-6 space-y-6">
        <ComponentCard
          title="Отримувачі з бази"
          desc="Користувачі з вказаним email у профілі або реєстрації."
        >
          {loading ? (
            <p className="text-sm text-gray-500">Завантаження...</p>
          ) : (
            <p className="text-sm text-gray-700">
              У базі <strong>{recipients.length}</strong> отримувачів з email.
            </p>
          )}
        </ComponentCard>

        <ComponentCard
          title="Написати та надіслати лист"
          desc="Тема та тіло листа. Можна використовувати HTML (увімкніть «Лист у HTML»)."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Тема листа</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Наприклад: Нова колекція 13в+"
                required
              />
            </div>

            <div>
              <Label htmlFor="body">
                Текст листа {isHtml ? "(HTML)" : ""}
              </Label>
              <TextArea
                id="body"
                value={body}
                onChange={setBody}
                rows={12}
                placeholder={
                  isHtml
                    ? "<p>Привіт!</p><p>Ваш HTML-контент...</p>"
                    : "Введіть текст листа. Користувачі побачать його як звичайний текст."
                }
                className="font-mono text-sm"
              />
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  {showPreview ? "Сховати попередній перегляд" : "Попередній перегляд листа"}
                </button>
                {showPreview && (
                  <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <p className="px-3 py-2 text-xs text-gray-500 border-b bg-gray-50">
                      Як побачать отримувачі
                    </p>
                    <div className="min-h-[200px] max-h-[400px] overflow-auto">
                      {isHtml && body.trim() ? (
                        <iframe
                          title="Попередній перегляд листа"
                          srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0; padding:12px;">${body}</body></html>`}
                          className="w-full min-h-[300px] border-0"
                          sandbox="allow-same-origin"
                          style={{ height: "400px" }}
                        />
                      ) : (
                        <pre className="p-4 text-sm text-gray-800 whitespace-pre-wrap font-sans">
                          {body || "(порожньо)"}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isHtml"
                checked={isHtml}
                onChange={(e) => setIsHtml(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isHtml" className="mb-0">
                Лист у HTML (теги &lt;p&gt;, &lt;a&gt;, &lt;strong&gt; тощо)
              </Label>
            </div>

            <div>
              <Label>Кому надіслати</Label>
              <div className="flex flex-col gap-2 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    checked={sendTo === "all"}
                    onChange={() => setSendTo("all")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Усім з бази ({recipients.length} email)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sendTo"
                    checked={sendTo === "custom"}
                    onChange={() => setSendTo("custom")}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Вказані адреси (по одній на рядок або через кому)</span>
                </label>
                {sendTo === "custom" && (
                  <TextArea
                    value={customEmails}
                    onChange={setCustomEmails}
                    rows={4}
                    placeholder="user1@example.com\nuser2@example.com"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            {message && (
              <div
                className={`rounded-lg px-4 py-2 text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={sending || !subject.trim() || !body.trim()}
              className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? "Надсилання…" : "Надіслати листи"}
            </button>
          </form>
        </ComponentCard>

        <ComponentCard
          title="Збережені розсилки"
          desc="Усі надіслані листи збережено. Можна переглянути або розіслати знову усім з бази."
        >
          {campaignsLoading ? (
            <p className="text-sm text-gray-500">Завантаження...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-gray-500">Ще немає збережених розсилок.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {campaigns.map((c) => (
                <li key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{c.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(c.createdAt).toLocaleString("uk-UA")} · надіслано {c.sentCount} разів
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewCampaign(c)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Переглянути
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setResendingId(c.id);
                        setMessage(null);
                        try {
                          const res = await fetch(`/api/admin/newsletter/campaigns/${c.id}`, {
                            method: "POST",
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setMessage({ type: "success", text: data.message || "Надіслано" });
                            fetchCampaigns();
                          } else {
                            setMessage({ type: "error", text: data.error || "Помилка" });
                          }
                        } catch {
                          setMessage({ type: "error", text: "Помилка з'єднання" });
                        } finally {
                          setResendingId(null);
                        }
                      }}
                      disabled={resendingId === c.id}
                      className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                      {resendingId === c.id ? "Надсилання…" : "Розіслати знову"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ComponentCard>

        {viewCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold truncate pr-4">{viewCampaign.subject}</h3>
                <button
                  type="button"
                  onClick={() => setViewCampaign(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1 text-sm">
                <p className="text-gray-500 mb-2">
                  {new Date(viewCampaign.createdAt).toLocaleString("uk-UA")} · надіслано{" "}
                  {viewCampaign.sentCount} разів · {viewCampaign.isHtml ? "HTML" : "Текст"}
                </p>
                {viewCampaign.isHtml ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <iframe
                      title="Перегляд збереженого листа"
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0; padding:12px;">${viewCampaign.body}</body></html>`}
                      className="w-full border-0 rounded-b-lg"
                      sandbox="allow-same-origin"
                      style={{ minHeight: "320px", height: "50vh" }}
                    />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 bg-gray-50 p-4 rounded-lg">
                    {viewCampaign.body}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

export default function ContactsPage() {
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!agreed || !form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Помилка відправки");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Помилка відправки. Спробуйте пізніше.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-[1920px] mx-auto px-3 lg:px-8 pt-4 pb-20">

        {/* Хлібні крихти */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm font-['Montserrat'] text-[#3D1A00]/60">
            <li>
              <Link href="/" className="hover:text-[#3D1A00] transition-colors">
                Головна
              </Link>
            </li>
            <li aria-hidden className="text-[#3D1A00]/30">|</li>
            <li className="text-[#3D1A00]">Контакти</li>
          </ol>
        </nav>

        {/* Великий заголовок по центру */}
        <h1
          className="text-center text-[#3D1A00] uppercase mb-16"
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(48px, 9vw, 120px)",
            lineHeight: "115%",
            letterSpacing: "-0.02em",
          }}
        >
          Контакти
        </h1>

        {/* Основний блок: форма зліва + інфо справа */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

          {/* ── Ліва: форма ── */}
          <div
            id="contact-form"
            className="w-full lg:w-[55%] rounded-2xl p-8 lg:p-12 bg-white border border-[#3D1A00]/10 scroll-mt-24"
          >
            <h2
              className="text-[#3D1A00] uppercase mb-8"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 600,
                fontSize: "clamp(18px, 2vw, 26px)",
                letterSpacing: "0.04em",
              }}
            >
              Зв&apos;язатися з Choice
            </h2>

            {submitted ? (
              <div className="py-12 text-center">
                <p
                  className="text-[#3D1A00]"
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: "18px", fontWeight: 500 }}
                >
                  Дякуємо! Ми отримали ваше повідомлення і зв&apos;яжемося найближчим часом.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ім'я */}
                <div>
                  <label
                    className="block text-[#3D1A00]/60 mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                  >
                    ІМ&apos;Я *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-transparent border-b border-[#3D1A00]/30 pb-2 text-[#3D1A00] outline-none focus:border-[#3D1A00] transition-colors placeholder-transparent"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                    placeholder="Ваше ім'я"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    className="block text-[#3D1A00]/60 mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                  >
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-[#3D1A00]/30 pb-2 text-[#3D1A00] outline-none focus:border-[#3D1A00] transition-colors placeholder-transparent"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                    placeholder="email@example.com"
                  />
                </div>

                {/* Запит */}
                <div>
                  <label
                    className="block text-[#3D1A00]/60 mb-1"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "11px", letterSpacing: "0.08em" }}
                  >
                    ВАШ ЗАПИТ *
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className="w-full bg-transparent border-b border-[#3D1A00]/30 pb-2 text-[#3D1A00] outline-none focus:border-[#3D1A00] transition-colors resize-none"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "15px" }}
                    placeholder="Що ви хочете дізнатися/замовити?"
                  />
                  <p
                    className="text-[#3D1A00]/40 mt-1"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "12px" }}
                  >
                    Що ви хочете дізнатися/замовити?
                  </p>
                </div>

                {/* Згода */}
                <label className="flex items-start gap-3 cursor-pointer group mt-2">
                  <span
                    className={`mt-0.5 w-5 h-5 flex-shrink-0 border rounded-sm transition-colors flex items-center justify-center ${
                      agreed
                        ? "bg-[#3D1A00] border-[#3D1A00]"
                        : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"
                    }`}
                    onClick={() => setAgreed(!agreed)}
                  >
                    {agreed && (
                      <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                        <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span
                    className="text-[#3D1A00]/70 leading-relaxed"
                    style={{ fontFamily: "Montserrat, sans-serif", fontSize: "13px" }}
                    onClick={() => setAgreed(!agreed)}
                  >
                    Продовжуючи, я приймаю умови{" "}
                    <Link href="/terms-of-service" className="underline hover:text-[#3D1A00] transition-colors">
                      Публічної оферти
                    </Link>{" "}
                    та надаю згоду на обробку своїх персональних даних відповідно до{" "}
                    <Link href="/privacy-policy" className="underline hover:text-[#3D1A00] transition-colors">
                      Політики конфіденційності
                    </Link>
                  </span>
                </label>

                {error && (
                  <p className="text-red-600 text-sm font-['Montserrat']">{error}</p>
                )}
                {/* Кнопка */}
                <div className="pt-2 w-full">
                  <button
                    onClick={handleSubmit}
                    disabled={!agreed || !form.name.trim() || !form.email.trim() || !form.message.trim() || sending}
                    className="w-full px-10 py-4 bg-[#3D1A00] text-white uppercase transition-all hover:bg-[#3D1A00]/85 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: "13px",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {sending ? "Відправка…" : "Відправити"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Права: контактна інформація ── */}
          <div
            className="w-full lg:w-[45%] rounded-2xl p-8 lg:p-12 grid grid-cols-2 gap-x-8 gap-y-12 content-start bg-white border border-[#3D1A00]/10"
          >
            {/* Телефон */}
            <div>
              <p
                className="text-[#3D1A00]/50 uppercase mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                  letterSpacing: "0.06em",
                }}
              >
                Телефон
              </p>
              <a
                href="tel:+380937537855"
                className="text-[#3D1A00] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  lineHeight: "159%",
                }}
              >
                +380 (93) 753 78 55
              </a>
            </div>

            {/* Соц-мережі */}
            <div>
              <p
                className="text-[#3D1A00]/50 uppercase mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                  letterSpacing: "0.06em",
                }}
              >
                Соц-мережі
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/my_choice_mari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[#3D1A00]/30 flex items-center justify-center text-[#3D1A00] hover:border-[#3D1A00] hover:bg-[#3D1A00]/5 transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.22 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/my_choice_mari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-[#3D1A00]/30 flex items-center justify-center text-[#3D1A00] hover:border-[#3D1A00] hover:bg-[#3D1A00]/5 transition-all"
                  aria-label="Telegram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* E-mail */}
            <div>
              <p
                className="text-[#3D1A00]/50 uppercase mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                  letterSpacing: "0.06em",
                }}
              >
                E-mail
              </p>
              <a
                href="mailto:info@choice-ukraine.com"
                className="text-[#3D1A00] hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  lineHeight: "159%",
                }}
              >
                info@choice-ukraine.com
              </a>
            </div>

            {/* Графік роботи */}
            <div>
              <p
                className="text-[#3D1A00]/50 uppercase mb-3"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(13px, 1.2vw, 16px)",
                  letterSpacing: "0.06em",
                }}
              >
                Графік роботи
              </p>
              <div
                className="text-[#3D1A00] space-y-1"
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(13px, 1.1vw, 15px)",
                  lineHeight: "159%",
                }}
              >
                <p>Пн.-Пт.:&nbsp;&nbsp;11.00 - 18.00</p>
                <p>Сб.-Нд.:&nbsp;&nbsp;за попередньою домовленістю</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

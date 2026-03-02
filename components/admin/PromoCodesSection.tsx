"use client";

import React, { useCallback, useEffect, useState } from "react";
import ComponentCard from "./ComponentCard";
import Input from "./form/input/InputField";
import Label from "./form/Label";

interface PromoRow {
  id: number;
  code: string;
  type: string;
  value: number;
  validFrom: string | null;
  validUntil: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

export default function PromoCodesSection() {
  const [list, setList] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-codes");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const codeTrim = code.trim().toUpperCase();
    if (!codeTrim) {
      setMessage({ type: "error", text: "Введіть код промокоду" });
      return;
    }
    const numValue = type === "percent" ? Number(value) : Number(value);
    if (!Number.isFinite(numValue) || numValue <= 0) {
      setMessage({ type: "error", text: "Введіть коректне значення знижки" });
      return;
    }
    if (type === "percent" && (numValue < 1 || numValue > 100)) {
      setMessage({ type: "error", text: "Відсоток має бути від 1 до 100" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeTrim,
          type,
          value: numValue,
          validFrom: validFrom || null,
          validUntil: validUntil || null,
          maxUses: maxUses ? Math.max(0, parseInt(maxUses, 10)) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Помилка створення" });
        return;
      }
      setMessage({ type: "success", text: "Промокод створено" });
      setCode("");
      setValue("");
      setValidFrom("");
      setValidUntil("");
      setMaxUses("");
      fetchList();
    } catch (e) {
      setMessage({ type: "error", text: "Помилка мережі" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <ComponentCard title="Новий промокод">
        <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Код</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="наприклад SALE10"
              className="uppercase"
            />
          </div>
          <div>
            <Label>Тип знижки</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#3D1A00] focus:outline-none focus:ring-1 focus:ring-[#3D1A00]"
            >
              <option value="percent">Відсоток (%)</option>
              <option value="fixed">Фіксована сума (грн)</option>
            </select>
          </div>
          <div>
            <Label>{type === "percent" ? "Відсоток знижки (1–100)" : "Сума знижки (грн)"}</Label>
            <Input
              type="number"
              min={type === "percent" ? "1" : "0"}
              max={type === "percent" ? "100" : undefined}
              step={type === "percent" ? 1 : 0.01}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "10" : "50"}
            />
          </div>
          <div>
            <Label>Дійсний з (необовʼязково)</Label>
            <Input
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div>
            <Label>Дійсний до (необовʼязково)</Label>
            <Input
              type="datetime-local"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div>
            <Label>Макс. використань (порожньо = необмежено)</Label>
            <Input
              type="number"
              min="0"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="необмежено"
            />
          </div>
          <div className="sm:col-span-2">
            {message && (
              <p
                className={`mb-2 text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-[#3D1A00] px-4 py-2 text-sm font-medium text-white hover:bg-[#2d1200] disabled:opacity-50"
            >
              {submitting ? "Створення…" : "Створити промокод"}
            </button>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Список промокодів">
        {loading ? (
          <p className="text-sm text-gray-500">Завантаження…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500">Промокодів ще немає. Створіть перший вище.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 rounded-tl-lg">Код</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Тип</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Значення</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Використано</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Макс.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 rounded-tr-lg">Створено</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900">{row.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.type === "percent" ? "%" : "грн"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.value}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.usedCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.maxUses ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(row.createdAt).toLocaleDateString("uk-UA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}

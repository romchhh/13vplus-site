"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import ComponentCard from "@/components/admin/ComponentCard";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";
import Image from "next/image";

const seasonOptions = ["Весна", "Літо", "Осінь", "Зима"];

const multiOptions = [
  { value: "ONESIZE", text: "ONESIZE", selected: false },
  { value: "XL", text: "XL", selected: false },
  { value: "L", text: "L", selected: false },
  { value: "M", text: "M", selected: false },
  { value: "S", text: "S", selected: false },
  { value: "XS", text: "XS", selected: false },
];

interface Category {
  id: number;
  name: string;
}

export default function FormElements() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [priority, setPriority] = useState("0");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  // const [images, setImages] = useState<File[]>([]);

  const [topSale, setTopSale] = useState(false);
  const [limitedEdition, setLimitedEdition] = useState(false);

  const [color, setColor] = useState("");
  const [colors, setColors] = useState<{ label: string; hex?: string }[]>([]);
  const [customColorLabel, setCustomColorLabel] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [availableColors, setAvailableColors] = useState<
    { color: string; hex?: string }[]
  >([]);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [season, setSeason] = useState<string[]>([]);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);

  const [fabricComposition, setFabricComposition] = useState("");
  const [hasLining, setHasLining] = useState(false);
  const [liningDescription, setLiningDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchColors() {
      try {
        const res = await fetch("/api/colors");
        const data = await res.json();
        setAvailableColors(data);
      } catch (error) {
        console.error("Failed to fetch colors", error);
      }
    }

    fetchColors();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId(null);
      return;
    }

    async function fetchSubcategories() {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        if (!res.ok) throw new Error("Failed to fetch subcategories");
        const data: Category[] = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    }

    fetchSubcategories();
  }, [categoryId]);

  type MediaFile = {
    file: File;
    type: "photo" | "video";
  };

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const handleDrop = (files: File[]) => {
    const newMedia = files.map((file) => {
      // Determine if file is video by mime type OR extension
      const isVideo = file.type.startsWith("video/") || 
        file.name.toLowerCase().endsWith('.webm') ||
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.mov') ||
        file.name.toLowerCase().endsWith('.avi') ||
        file.name.toLowerCase().endsWith('.mkv') ||
        file.name.toLowerCase().endsWith('.flv') ||
        file.name.toLowerCase().endsWith('.wmv');
      
      console.log('[handleDrop] File:', file.name, 'Type:', file.type, 'Is video:', isVideo);
      
      return {
        file,
        type: (isVideo ? "video" : "photo") as MediaFile["type"],
      };
    });
    setMediaFiles((prev) => [...prev, ...newMedia]);
  };
// const handleDeleteMediaFile = (indexToRemove: number) => {
//   setMediaFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
// };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // 1) Upload images first (if any)
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];
      if (mediaFiles.length > 0) {
        const uploadForm = new FormData();
        mediaFiles.forEach((m) => uploadForm.append("images", m.file));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media || [];
      }

      // 2) Create product via JSON body (no files)
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          discount_percentage: discountPercentage
            ? Number(discountPercentage)
            : null,
          priority: Number(priority || 0),
          color,
          colors,
          sizes: sizes.map((s) => ({ size: s, stock: sizeStocks[s] ?? 0 })),
          top_sale: topSale,
          limited_edition: limitedEdition,
          season: season.length === 0 ? null : season,
          category_id: categoryId,
          subcategory_id: subcategoryId,
          media: uploadedMedia,
          fabric_composition: fabricComposition,
          has_lining: hasLining,
          lining_description: liningDescription,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json();
        throw new Error(errBody.error || "Failed to create product");
      }

      setSuccess("Товар успішно створено!");
      setName("");
      setDescription("");
      setPrice("");
      setOldPrice("");
      setDiscountPercentage("");
      setPriority("0");
      setColor("");
      setColors([]);
      setSizes([]);
      setSizeStocks({});
      setMediaFiles([]);
      setTopSale(false);
      setLimitedEdition(false);
      setSeason([]);
      setCategoryId(null);
      setFabricComposition("");
      setHasLining(false);
      setLiningDescription("");
      setSubcategoryId(null);
      setSubcategories([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка при створенні товару"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Додати Товар" />
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side: inputs */}
          <div className="p-4">
            <ComponentCard title="Дані Товару">
              <div className="space-y-5">
                <div>
                  <Label>Назва Товару</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Опис</Label>
                  <TextArea
                    value={description}
                    onChange={setDescription}
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Ціна</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Поточна ціна"
                  />
                </div>
                <div>
                  <Label>Стара ціна (опціонально)</Label>
                  <Input
                    type="number"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="Ціна до знижки"
                  />
                </div>
                <div>
                  <Label>Відсоток знижки (опціонально)</Label>
                  <Input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="Наприклад: 20"
                  />
                </div>
                <div>
                  <Label>Пріоритет показу</Label>
                  <Input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    placeholder="0 - звичайний, 1 - високий"
                  />
                </div>
                <div>
                  <Label>Розміри</Label>
                  <MultiSelect
                    label="Розміри"
                    options={multiOptions}
                    defaultSelected={sizes}
                    onChange={(values: string[]) => {
                      // Update selected sizes
                      setSizes(values);
                      // Ensure stocks exist for any newly added size
                      setSizeStocks((prev) => {
                        const next = { ...prev };
                        values.forEach((sz: string) => {
                          if (next[sz] === undefined) next[sz] = 0;
                        });
                        // Remove stocks for sizes no longer selected
                        Object.keys(next).forEach((sz) => {
                          if (!values.includes(sz)) delete (next as Record<string, number>)[sz];
                        });
                        return next;
                      });
                    }}
                    zIndex={51}
                  />
                </div>

                {/* Per-size stock editor */}
                {sizes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label>Кількість по розмірах</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {sizes.map((sz) => (
                        <div key={sz} className="flex items-center gap-2 border rounded px-2 py-1">
                          <span className="min-w-10 text-sm font-medium">{sz}</span>
                          <input
                            type="number"
                            min={0}
                            value={sizeStocks[sz] ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, Number(e.target.value) || 0);
                              setSizeStocks((prev) => ({ ...prev, [sz]: val }));
                            }}
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Категорія</Label>
                  <select
                    value={categoryId ?? ""}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Виберіть категорію</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {subcategories.length > 0 && (
                  <div>
                    <Label>Підкатегорія</Label>
                    <select
                      value={subcategoryId ?? ""}
                      onChange={(e) => setSubcategoryId(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Виберіть підкатегорію</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <MultiSelect
                    label="Сезон"
                    options={seasonOptions.map((s) => ({
                      value: s,
                      text: s,
                      selected: season.includes(s),
                    }))}
                    defaultSelected={season}
                    onChange={setSeason}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Кольори</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <button
                        type="button"
                        key={`${c.label}-${idx}`}
                        className="relative w-8 h-8 rounded-full border"
                        style={{ backgroundColor: c.hex || "#fff" }}
                        title={c.label}
                        onClick={() =>
                          setColors(colors.filter((_, i) => i !== idx))
                        }
                      >
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Removed dropdown; using swatch list below */}
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((c) => (
                      <button
                        type="button"
                        key={`pal-${c.color}`}
                        className="flex items-center gap-2 border rounded-full px-2 py-1 text-xs hover:shadow transition"
                        onClick={() =>
                          setColors((prev) => [
                            ...prev,
                            { label: c.color, hex: c.hex },
                          ])
                        }
                        title={c.color}
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        <span>{c.color}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-10 h-10 p-0 border rounded"
                    />
                    <Input
                      type="text"
                      value={customColorLabel}
                      onChange={(e) => setCustomColorLabel(e.target.value)}
                      placeholder="Назва кольору"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customColorLabel.trim()) return;
                        setColors([
                          ...colors,
                          {
                            label: customColorLabel.trim(),
                            hex: customColorHex,
                          },
                        ]);
                        setCustomColorLabel("");
                        setCustomColorHex("#000000");
                      }}
                      className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
                    >
                      Додати власний
                    </button>
                  </div>
                </div>

                {/* Блок: Склад тканини і Підкладка */}
                <div className="border border-gray-300 rounded-lg p-4 space-y-4 bg-white">
                  <div>
                    <Label>Склад тканини</Label>
                    <TextArea
                      value={fabricComposition}
                      onChange={setFabricComposition}
                      rows={3}
                      placeholder="Наприклад: 80% бавовна, 20% поліестер"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Підкладка?</Label>
                    <ToggleSwitch
                      enabled={hasLining}
                      setEnabled={setHasLining}
                      label="Has Lining"
                    />
                  </div>
                </div>
                {/* Lining description input */}
                {hasLining && (
                  <div>
                    <Label>Опис підкладки</Label>
                    <TextArea
                      value={liningDescription}
                      onChange={setLiningDescription}
                      rows={2}
                      placeholder="Опис підкладки товару"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Label className="mb-0">Топ продаж?</Label>
                  <ToggleSwitch
                    enabled={topSale}
                    setEnabled={setTopSale}
                    label="Top Sale"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Лімітована серія?</Label>
                  <ToggleSwitch
                    enabled={limitedEdition}
                    setEnabled={setLimitedEdition}
                    label="Limited Edition"
                  />
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Right side: images and videos */}
          <div className="p-4">
            <DropzoneComponent onDrop={handleDrop} />
            {/* {images.length > 0 &&
              images.map((file, i) => {
                const previewUrl = URL.createObjectURL(file);
                const isVideo = file.type.startsWith("video/");
                return (
                  <div key={`new-${i}`} className="relative inline-block mt-4">
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoadedData={() => URL.revokeObjectURL(previewUrl)}
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px]"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteNewImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                );
              })} */}

            {mediaFiles.length > 0 &&
              mediaFiles.map((media, i) => {
                const previewUrl = URL.createObjectURL(media.file);
                const isVideo = media.type === "video";
                
                console.log('[Preview] File:', media.file.name, 'Type:', media.type, 'Is video:', isVideo, 'MIME:', media.file.type);

                return (
                  <div
                    key={`media-${i}`}
                    className="relative inline-block mt-4 mx-2"
                  >
                    <span className="absolute bottom-1 left-1 text-xs bg-black/70 text-white px-1 rounded">
                      #{i + 1}
                    </span>

                    {isVideo ? (
                      <video
                        src={previewUrl}
                        width={200}
                        height={200}
                        controls
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        onLoadedData={() => {
                          console.log('[Preview] Video loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                        onError={(e) => {
                          console.error('[Preview] Video error:', e);
                        }}
                      />
                    ) : (
                      <Image
                        src={previewUrl}
                        alt={media.file.name}
                        width={200}
                        height={200}
                        className="rounded max-w-[200px] max-h-[200px] object-cover"
                        unoptimized
                        onLoadingComplete={() => {
                          console.log('[Preview] Image loaded');
                          URL.revokeObjectURL(previewUrl);
                        }}
                      />
                    )}

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setMediaFiles((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>

                    {/* Reorder Buttons */}
                    <div className="flex justify-center gap-1 mt-2">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i - 1], newArr[i]] = [
                              newArr[i],
                              newArr[i - 1],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={i === mediaFiles.length - 1}
                        onClick={() =>
                          setMediaFiles((prev) => {
                            const newArr = [...prev];
                            [newArr[i], newArr[i + 1]] = [
                              newArr[i + 1],
                              newArr[i],
                            ];
                            return newArr;
                          })
                        }
                        className="text-sm bg-gray-200 px-2 py-1 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-lg text-sm disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Збереження..." : "Створити Товар"}
          </button>
        </div>

        {success && <div className="text-green-600 text-center">{success}</div>}
        {error && <div className="text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
}

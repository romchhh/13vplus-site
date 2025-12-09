"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import MultiSelect from "@/components/admin/form/MultiSelect";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

const multiOptions = [
  { value: "O/S", text: "O/S", selected: false },
  { value: "160 cm", text: "160 cm", selected: false },
  { value: "XXS", text: "XXS", selected: false },
  { value: "XS", text: "XS", selected: false },
  { value: "XS/S", text: "XS/S", selected: false },
  { value: "S", text: "S", selected: false },
  { value: "M", text: "M", selected: false },
  { value: "M/L", text: "M/L", selected: false },
  { value: "L", text: "L", selected: false },
  { value: "L/XL", text: "L/XL", selected: false },
  { value: "XL", text: "XL", selected: false },
  { value: "ONESIZE", text: "ONESIZE", selected: false },
];

const seasonOptions = [
  { value: "Літо", text: "Літо", selected: false },
  { value: "Весна", text: "Весна", selected: false },
  { value: "Зима", text: "Зима", selected: false },
  { value: "Осінь", text: "Осінь", selected: false },
];

type MediaFile = {
  id?: number; // for existing ones
  file?: File; // for new uploads
  url?: string; // for existing ones
  preview?: string; // for new ones (via URL.createObjectURL)
  type: "photo" | "video";
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    discountPercentage: "",
    priority: "0",
    sizes: [] as string[],
    media: [] as { type: string; url: string }[],
    topSale: false,
    limitedEdition: false,
    season: [] as string[],
    color: "",
    categoryId: null as number | null,
    subcategoryId: null as number | null,
    fabricComposition: "",
    hasLining: false,
    liningDescription: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState<
    { id: number; name: string; category_id: number }[]
  >([]);

  const [availableColors, setAvailableColors] = useState<
    { color: string; hex?: string }[]
  >([]);
  const [customColorLabel, setCustomColorLabel] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [colors, setColors] = useState<{ label: string; hex?: string }[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/products/${productId}`),
          fetch(`/api/categories`),
        ]);

        const productData = await productRes.json();
        const categoryData = await categoriesRes.json();
        
        // Safely handle media data
        const mediaArray = Array.isArray(productData.media) ? productData.media : [];
        setMediaFiles(
          mediaArray.map((item: { url: string; type: string }) => ({
            type: item.type,
            url: item.url,
          }))
        );

        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: String(productData.price || ""),
          oldPrice: String(productData.old_price || ""),
          discountPercentage: String(productData.discount_percentage || ""),
          priority: String(productData.priority || 0),
          sizes: (productData.sizes || []).map((s: { size: string }) => s.size),
          media: mediaArray,
          topSale: productData.top_sale || false,
          limitedEdition: productData.limited_edition || false,
          season: productData.season || [],
          color: productData.color || "",
          categoryId: productData.category_id || null,
          subcategoryId: productData.subcategory_id || null,
          fabricComposition: productData.fabric_composition || "",
          hasLining: productData.has_lining || false,
          liningDescription: productData.lining_description || "",
        });

        // Initialize sizeStocks from productData.sizes
        const initialStocks: Record<string, number> = {};
        (productData.sizes || []).forEach(
          (s: { size: string; stock?: number }) => {
            initialStocks[s.size] = typeof s.stock === "number" ? s.stock : 0;
          }
        );
        setSizeStocks(initialStocks);

        setCategoryOptions(categoryData);
        setColors(productData.colors || []);
      } catch (err) {
        console.error("Failed to fetch product or categories", err);
        setError("Помилка при завантаженні товару або категорій");
      } finally {
        setLoadingData(false);
      }
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

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
    async function fetchSubcategories() {
      if (!formData.categoryId) {
        setSubcategoryOptions([]); // Clear if no category selected
        return;
      }

      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${formData.categoryId}`
        );
        if (!res.ok) throw new Error("Failed to fetch subcategories");

        const data = await res.json();
        setSubcategoryOptions(data);
      } catch (error) {
        console.error("Error fetching subcategories", error);
      }
    }

    fetchSubcategories();
  }, [formData.categoryId]);

  // useEffect(() => {
  //   console.log("formData", formData);
  // }, [formData]);

  const handleDrop = (files: File[]) => {
    console.log('[EditProduct] handleDrop called with files:', files);
    
    // Add to images state (for new uploads)
    setImages((prev) => [...prev, ...files]);
    
    // Also add to mediaFiles for preview with metadata
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: (file.type.startsWith("video/")
        ? "video"
        : "photo") as MediaFile["type"],
    }));

    setMediaFiles((prev) => [...prev, ...newMedia]);
  };

  // Reorder for existing images
  const moveExistingMedia = (fromIndex: number, toIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.media];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return { ...prev, media: updated };
    });
  };

  // Reorder for new images
  const moveNewImage = (fromIndex: number, toIndex: number) => {
    console.log('[EditProduct] Moving new image from', fromIndex, 'to', toIndex);
    
    // Get only new files (with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const existingMedia = mediaFiles.filter((m) => !m.file);
    
    const updated = [...newMediaFiles];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    
    setMediaFiles([...existingMedia, ...updated]);
    
    // Also update images state
    setImages(updated.map((m) => m.file!));
  };

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== indexToRemove),
    }));
  };

  const handleDeleteNewImage = (indexToRemove: number) => {
    console.log('[EditProduct] Deleting new image at index:', indexToRemove);
    
    // Get all new media files (those with file property)
    const newMediaFiles = mediaFiles.filter((m) => m.file);
    const itemToDelete = newMediaFiles[indexToRemove];
    
    // Revoke object URL to prevent memory leak
    if (itemToDelete?.preview) {
      URL.revokeObjectURL(itemToDelete.preview);
    }
    
    // Remove from images state
    const newMediaFilesArray = mediaFiles.filter((m) => m.file).map((m) => m.file).filter((f): f is File => !!f);
    const newImages = newMediaFilesArray.filter((_, i) => i !== indexToRemove);
    setImages(newImages);
    
    // Remove from mediaFiles state
    setMediaFiles((prev) => {
      const newFiles = prev.filter((m) => m.file);
      const rest = prev.filter((m) => !m.file);
      const updatedNewFiles = newFiles.filter((_, i) => i !== indexToRemove);
      return [...rest, ...updatedNewFiles];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      console.log('[EditProduct] Submitting form. Images to upload:', images.length);
      
      let uploadedMedia: { type: "photo" | "video"; url: string }[] = [];

      if (images.length > 0) {
        console.log('[EditProduct] Uploading new images:', images.map(f => f.name));
        
        const uploadForm = new FormData();
        images.forEach((img) => uploadForm.append("images", img));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadData = await uploadRes.json();
        uploadedMedia = uploadData.media;
        
        console.log('[EditProduct] Uploaded media:', uploadedMedia);
      }

      const updatedMedia = [...formData.media, ...uploadedMedia];

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
          discount_percentage: formData.discountPercentage
            ? Number(formData.discountPercentage)
            : null,
          priority: Number(formData.priority),
          sizes: formData.sizes.map((s) => ({ size: s, stock: sizeStocks[s] ?? 0 })),
          media: updatedMedia,
          top_sale: formData.topSale,
          limited_edition: formData.limitedEdition,
          season: formData.season,
          color: formData.color,
          colors,
          category_id: formData.categoryId,
          subcategory_id: formData.subcategoryId,
          fabric_composition: formData.fabricComposition,
          has_lining: formData.hasLining,
          lining_description: formData.liningDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      setSuccess("Товар успішно оновлено");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити товар");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження даних...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Товар" />
          <div className="flex w-full h-auto">
            <div className="w-1/2 p-4">
              <ComponentCard title="Редагувати дані">
                <Label>Назва Товару</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />

                <Label>Опис</Label>
                <TextArea
                  value={formData.description}
                  onChange={(value) => handleChange("description", value)}
                  rows={6}
                />

                <Label>Ціна</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="Поточна ціна"
                />

                <Label>Стара ціна (опціонально)</Label>
                <Input
                  type="number"
                  value={formData.oldPrice}
                  onChange={(e) => handleChange("oldPrice", e.target.value)}
                  placeholder="Ціна до знижки"
                />

                <Label>Відсоток знижки (опціонально)</Label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    handleChange("discountPercentage", e.target.value)
                  }
                  placeholder="Наприклад: 20"
                />

                <Label>Пріоритет показу</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  placeholder="0 - звичайний, 1 - високий"
                />

                <Label>Розміри</Label>
                <MultiSelect
                  label="Розміри"
                  options={multiOptions}
                  defaultSelected={formData.sizes}
                  onChange={(values: string[]) => {
                    // Update selected sizes
                    handleChange("sizes", values);
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
                />

                {/* Per-size stock editor */}
                {formData.sizes?.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <Label>Кількість по розмірах</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {formData.sizes.map((sz) => (
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

                <Label>Категорія</Label>
                <select
                  value={formData.categoryId ?? ""}
                  onChange={(e) => {
                    const selectedCategoryId = Number(e.target.value);
                    handleChange("categoryId", selectedCategoryId);
                    handleChange("subcategoryId", null); // ✅ Reset subcategory
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Виберіть категорію</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {formData.categoryId && (
                  <>
                    <Label>Підкатегорія</Label>
                    <select
                      value={formData.subcategoryId ?? ""}
                      onChange={(e) =>
                        handleChange("subcategoryId", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Виберіть підкатегорію</option>
                      {subcategoryOptions
                        .filter(
                          (sub) => sub.category_id === formData.categoryId
                        )
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </>
                )}

                <Label>Cезон</Label>
                <MultiSelect
                  label="Сезон"
                  options={seasonOptions}
                  defaultSelected={formData.season}
                  onChange={(values) => handleChange("season", values)}
                />

                <div className="space-y-2">
                  <Label>Кольори</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.hex || "#fff" }}
                        />
                        {c.label}
                        <button
                          type="button"
                          className="ml-1 text-red-600"
                          onClick={() =>
                            setColors(colors.filter((_, i) => i !== idx))
                          }
                        >
                          ×
                        </button>
                      </span>
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
                <div className="border border-gray-300 rounded-lg p-4 space-y-4 bg-white mt-4">
                  <div>
                    <Label>Склад тканини</Label>
                    <TextArea
                      value={formData.fabricComposition}
                      onChange={(value) =>
                        handleChange("fabricComposition", value)
                      }
                      rows={3}
                      placeholder="Наприклад: 80% бавовна, 20% поліестер"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="mb-0">Підкладка?</Label>
                    <ToggleSwitch
                      enabled={formData.hasLining}
                      setEnabled={(value) => handleChange("hasLining", value)}
                      label="Has Lining"
                    />
                  </div>
                  {formData.hasLining && (
                    <div>
                      <Label>Опис підкладки</Label>
                      <TextArea
                        value={formData.liningDescription}
                        onChange={(value) =>
                          handleChange("liningDescription", value)
                        }
                        rows={2}
                        placeholder="Опис підкладки товару"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Топ продаж?</Label>
                  <ToggleSwitch
                    enabled={formData.topSale}
                    setEnabled={(value) => handleChange("topSale", value)}
                    label="Top Sale"
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Label className="mb-0">Лімітована серія?</Label>
                  <ToggleSwitch
                    enabled={formData.limitedEdition}
                    setEnabled={(value) =>
                      handleChange("limitedEdition", value)
                    }
                    label="Limited Edition"
                  />
                </div>
              </ComponentCard>
            </div>

            <div className="w-1/2 p-4">
              <DropzoneComponent onDrop={handleDrop} />
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {formData.media.map((item, i) => (
                  <div key={`existing-${i}`} className="relative inline-block">
                    {item.type === "video" ? (
                      <video
                        src={`/api/images/${item.url}`}
                        controls
                        className="w-32 h-32 object-cover rounded"
                      />
                    ) : (
                      <Image
                        src={`/api/images/${item.url}`}
                        alt={`media-${i}`}
                        width={128}
                        height={128}
                        className="rounded object-cover"
                      />
                    )}
                    <div className="absolute top-1 left-1 flex gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i - 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="←"
                        >
                          ←
                        </button>
                      )}
                      {i < formData.media.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveExistingMedia(i, i + 1)}
                          className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                          title="→"
                        >
                          →
                        </button>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Видалити"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {mediaFiles
                  .filter((m) => m.file) // Only show new files (with file property)
                  .map((media, i) => {
                    console.log('[EditProduct] Rendering new media preview:', media);
                    const previewUrl = media.preview || URL.createObjectURL(media.file!);
                    const isVideo = media.type === "video";
                    return (
                      <div key={`new-${i}`} className="relative inline-block">
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            controls
                            className="w-32 h-32 object-cover rounded"
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={`new-media-${i}`}
                            width={128}
                            height={128}
                            className="rounded object-cover"
                          />
                        )}
                      <div className="absolute top-1 left-1 flex gap-1">
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i - 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="←"
                          >
                            ←
                          </button>
                        )}
                        {i < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveNewImage(i, i + 1)}
                            className="bg-white text-black rounded-full w-6 h-6 text-xs flex items-center justify-center shadow"
                            title="→"
                          >
                            →
                          </button>
                        )}
                      </div>

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
                })}
              </div>
            </div>
          </div>

          <div className="p-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти Зміни"}
            </button>

            {success && (
              <div className="text-green-600 text-center mt-2">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-2">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

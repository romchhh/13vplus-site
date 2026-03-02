"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import TextArea from "@/components/admin/form/input/TextArea";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import ToggleSwitch from "@/components/admin/form/ToggleSwitch";

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
    subtitle: "",
    releaseForm: "",
    course: "",
    packageWeight: "",
    mainInfo: "",
    shortDescription: "",
    description: "",
    mainAction: "",
    indicationsForUse: "",
    benefits: "",
    fullComposition: "",
    usageMethod: "",
    contraindications: "",
    storageConditions: "",
    price: "",
    oldPrice: "",
    discountPercentage: "",
    priority: "0",
    stock: "0",
    media: [] as { type: string; url: string }[],
    topSale: false,
    inStock: true,
    categoryId: null as number | null,
    subcategoryId: null as number | null,
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
          subtitle: productData.subtitle || "",
          releaseForm: productData.release_form || "",
          course: productData.course || "",
          packageWeight: productData.package_weight || "",
          mainInfo: productData.main_info || "",
          shortDescription: productData.short_description || "",
          description: productData.description || "",
          mainAction: productData.main_action || "",
          indicationsForUse: productData.indications_for_use || "",
          benefits: productData.benefits || "",
          fullComposition: productData.full_composition || "",
          usageMethod: productData.usage_method || "",
          contraindications: productData.contraindications || "",
          storageConditions: productData.storage_conditions || "",
          price: String(productData.price || ""),
          oldPrice: String(productData.old_price || ""),
          discountPercentage: String(productData.discount_percentage || ""),
          priority: String(productData.priority || 0),
          stock: String(productData.stock ?? 0),
          media: mediaArray,
          topSale: productData.top_sale || false,
          inStock: productData.in_stock !== false,
          categoryId: productData.category_id || null,
          subcategoryId: productData.subcategory_id || null,
        });

        setCategoryOptions(categoryData);
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
          subtitle: formData.subtitle || null,
          release_form: formData.releaseForm || null,
          course: formData.course || null,
          package_weight: formData.packageWeight || null,
          main_info: formData.mainInfo || null,
          short_description: formData.shortDescription || null,
          description: formData.description || null,
          main_action: formData.mainAction || null,
          indications_for_use: formData.indicationsForUse || null,
          benefits: formData.benefits || null,
          full_composition: formData.fullComposition || null,
          usage_method: formData.usageMethod || null,
          contraindications: formData.contraindications || null,
          storage_conditions: formData.storageConditions || null,
          price: Number(formData.price),
          old_price: formData.oldPrice ? Number(formData.oldPrice) : null,
          discount_percentage: formData.discountPercentage ? Number(formData.discountPercentage) : null,
          priority: Number(formData.priority),
          stock: Number(formData.stock) || 0,
          media: updatedMedia,
          top_sale: formData.topSale,
          in_stock: formData.inStock,
          category_id: formData.categoryId,
          subcategory_id: formData.subcategoryId,
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
    <div className="min-w-0">
      {loadingData ? (
        <div className="p-4 text-center text-base sm:text-lg">Завантаження даних...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <PageBreadcrumb pageTitle="Редагувати Товар" />
          <div className="flex flex-col md:flex-row w-full gap-4 md:gap-6">
            <div className="w-full min-w-0 md:w-1/2 p-0 sm:p-2 md:p-4">
              <ComponentCard title="Основна інформація">
                <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label>Назва</Label>
                  <Input type="text" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                </div>
                <div>
                  <Label>Підзаголовок</Label>
                <Input type="text" value={formData.subtitle} onChange={(e) => handleChange("subtitle", e.target.value)} placeholder="Опціонально" />
                </div>
                <div>
                  <Label>Форма випуску</Label>
                  <Input type="text" value={formData.releaseForm} onChange={(e) => handleChange("releaseForm", e.target.value)} placeholder="Напр. 30 саше по 2 г" />
                </div>
                <div>
                  <Label>Курс</Label>
                  <Input type="text" value={formData.course} onChange={(e) => handleChange("course", e.target.value)} placeholder="Напр. 30 днів" />
                </div>
                <div>
                  <Label>Вага упаковки</Label>
                  <Input type="text" value={formData.packageWeight} onChange={(e) => handleChange("packageWeight", e.target.value)} placeholder="Напр. 60 г" />
                </div>
                <div>
                  <Label>Ціна (грн)</Label>
                  <Input type="number" value={formData.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="Поточна ціна" />
                </div>
                <div>
                  <Label>Стара ціна / ціна без знижки (опціонально)</Label>
                  <Input type="number" value={formData.oldPrice} onChange={(e) => handleChange("oldPrice", e.target.value)} placeholder="Ціна до знижки" />
                </div>
                <div>
                  <Label>Відсоток знижки (опціонально)</Label>
                  <Input type="number" value={formData.discountPercentage} onChange={(e) => handleChange("discountPercentage", e.target.value)} placeholder="20" />
                </div>
                <div>
                  <Label>Категорія</Label>
                  <select
                  value={formData.categoryId ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleChange("categoryId", v === "" ? null : Number(v));
                    handleChange("subcategoryId", null);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 min-h-[44px] sm:min-h-0 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Виберіть категорію</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                </div>
                {formData.categoryId && (
                  <div>
                    <Label>Підкатегорія</Label>
                    <select
                      value={formData.subcategoryId ?? ""}
                      onChange={(e) =>
                        handleChange("subcategoryId", Number(e.target.value))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 min-h-[44px] sm:min-h-0 text-sm bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                  </div>
                )}
                <div>
                  <Label>Основна інформація</Label>
                  <TextArea value={formData.mainInfo} onChange={(v) => handleChange("mainInfo", v)} rows={2} />
                </div>
                <div>
                  <Label>Короткий опис</Label>
                  <TextArea value={formData.shortDescription} onChange={(v) => handleChange("shortDescription", v)} rows={3} />
                </div>
                <div>
                  <Label>Повний опис</Label>
                  <TextArea value={formData.description} onChange={(v) => handleChange("description", v)} rows={6} />
                </div>
              </div>
              </ComponentCard>

              <ComponentCard title="Деталі товару" className="mt-4 sm:mt-6">
                <div className="space-y-3 sm:space-y-4">
                  <div><Label>Основна дія</Label><TextArea value={formData.mainAction} onChange={(v) => handleChange("mainAction", v)} rows={2} /></div>
                  <div><Label>Показання до використання</Label><TextArea value={formData.indicationsForUse} onChange={(v) => handleChange("indicationsForUse", v)} rows={3} /></div>
                  <div><Label>Переваги</Label><TextArea value={formData.benefits} onChange={(v) => handleChange("benefits", v)} rows={3} /></div>
                  <div><Label>Повний склад</Label><TextArea value={formData.fullComposition} onChange={(v) => handleChange("fullComposition", v)} rows={3} /></div>
                  <div><Label>Спосіб використання</Label><TextArea value={formData.usageMethod} onChange={(v) => handleChange("usageMethod", v)} rows={3} /></div>
                  <div><Label>Протипоказання</Label><TextArea value={formData.contraindications} onChange={(v) => handleChange("contraindications", v)} rows={2} /></div>
                  <div><Label>Умови зберігання</Label><TextArea value={formData.storageConditions} onChange={(v) => handleChange("storageConditions", v)} rows={2} /></div>
                </div>
              </ComponentCard>

              <ComponentCard title="Налаштування та ціни" className="mt-4 sm:mt-6">
                <div className="flex items-center justify-between">
                  <Label className="mb-0">Бестселлер</Label>
                  <ToggleSwitch enabled={formData.topSale} setEnabled={(v) => handleChange("topSale", v)} label="Бестселлер" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="mb-0">В наявності</Label>
                  <ToggleSwitch enabled={formData.inStock} setEnabled={(v) => handleChange("inStock", v)} label="В наявності" />
                </div>
                <Label>Пріоритет показу</Label>
                <Input type="number" value={formData.priority} onChange={(e) => handleChange("priority", e.target.value)} placeholder="0" />
                <Label>Кількість на складі</Label>
                <Input type="number" min="0" value={String(formData.stock)} onChange={(e) => handleChange("stock", e.target.value)} placeholder="0" />
              </ComponentCard>
            </div>

            <div className="w-full min-w-0 md:w-1/2 p-0 sm:p-2 md:p-4">
              <ComponentCard title="Медіа товарів">
                <DropzoneComponent onDrop={handleDrop} />
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
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
                          <Image
                            src={previewUrl}
                            alt={`new-media-${i}`}
                            width={128}
                            height={128}
                            className="rounded object-cover"
                            unoptimized
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
              </ComponentCard>
            </div>
          </div>

          <div className="pt-4 pb-2">
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[48px] sm:min-h-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 sm:px-4 sm:py-2 rounded-lg font-medium disabled:opacity-50 touch-manipulation"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти Зміни"}
            </button>

            {success && (
              <div className="text-green-600 text-center mt-2 text-sm sm:text-base">{success}</div>
            )}
            {error && (
              <div className="text-red-600 text-center mt-2 text-sm sm:text-base">{error}</div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

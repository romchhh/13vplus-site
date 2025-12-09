"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ComponentCard from "@/components/admin/ComponentCard";
import PageBreadcrumb from "@/components/admin/PageBreadCrumb";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import DropzoneComponent from "@/components/admin/form/form-elements/DropZone";
import Image from "next/image";

type Subcategory = {
  id?: number;
  name: string;
};

type MediaFile = {
  file: File;
  type: "photo" | "video";
  preview?: string;
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = Number(params?.id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [deletedSubcategoryIds, setDeletedSubcategoryIds] = useState<number[]>(
    []
  );

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [existingMediaType, setExistingMediaType] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    priority: 0,
    subcategories: [] as Subcategory[],
  });

  // Fetch category + its subcategories
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      setError(null);
      try {
        // Fetch category first
        const categoryRes = await fetch(`/api/categories/${categoryId}`);
        if (!categoryRes.ok) {
          const errorData = await categoryRes.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch category: ${categoryRes.status}`);
        }

        const category = await categoryRes.json();

        // Fetch subcategories (this might fail if there are no subcategories, which is OK)
        let subcategories = [];
        try {
          const subcategoriesRes = await fetch(`/api/subcategories?parent_category_id=${categoryId}`);
          if (subcategoriesRes.ok) {
            subcategories = await subcategoriesRes.json();
          }
        } catch (subErr) {
          console.warn("Failed to fetch subcategories:", subErr);
          // Continue without subcategories
        }

        setFormData({
          name: category.name || "",
          priority: category.priority ?? 0,
          subcategories: subcategories || [],
        });

        if (category.mediaUrl) {
          setExistingMediaUrl(category.mediaUrl);
          setExistingMediaType(category.mediaType);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(err instanceof Error ? err.message : "Помилка при завантаженні категорії");
      } finally {
        setLoadingData(false);
      }
    }

    if (!isNaN(categoryId) && categoryId > 0) fetchData();
  }, [categoryId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "priority" ? Number(value) : value,
    }));
  };

  const handleDrop = (files: File[]) => {
    const newMedia = files.map((file) => {
      const isVideo = file.type.startsWith("video/") || 
        file.name.toLowerCase().endsWith('.webm') ||
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.mov') ||
        file.name.toLowerCase().endsWith('.avi') ||
        file.name.toLowerCase().endsWith('.mkv') ||
        file.name.toLowerCase().endsWith('.flv') ||
        file.name.toLowerCase().endsWith('.wmv');
      
      return {
        file,
        type: (isVideo ? "video" : "photo") as MediaFile["type"],
        preview: URL.createObjectURL(file),
      };
    });

    setMediaFiles((prev) => [...prev, ...newMedia]);
    setExistingMediaUrl(null);
    setExistingMediaType(null);
  };

  const handleRemoveMedia = (index: number) => {
    const mediaToRemove = mediaFiles[index];
    if (mediaToRemove?.preview) {
      URL.revokeObjectURL(mediaToRemove.preview);
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubcategoryNameChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newSubs = [...prev.subcategories];
      newSubs[index] = { ...newSubs[index], name: value };
      return { ...prev, subcategories: newSubs };
    });
  };

  const handleAddSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [...prev.subcategories, { name: "" }],
    }));
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData((prev) => {
      const subToRemove = prev.subcategories[index];
      const updated = [...prev.subcategories];
      updated.splice(index, 1);

      if (subToRemove.id) {
        setDeletedSubcategoryIds((prevIds) => [...prevIds, subToRemove.id!]);
      }

      return { ...prev, subcategories: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const { name, subcategories } = formData;

      if (!name.trim()) {
        setError("Назва категорії не може бути порожньою");
        setLoading(false);
        return;
      }

      let finalMediaUrl = existingMediaUrl;
      let finalMediaType = existingMediaType;

      // Upload new media if provided
      if (mediaFiles.length > 0) {
        const uploadForm = new FormData();
        mediaFiles.forEach((m) => uploadForm.append("images", m.file));

        const uploadRes = await fetch("/api/images", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const uploadData = await uploadRes.json();
        if (uploadData.media && uploadData.media.length > 0) {
          // Use the first uploaded media
          finalMediaUrl = uploadData.media[0].url;
          finalMediaType = uploadData.media[0].type;
        }
      }

      // Update category
      const categoryRes = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          priority: formData.priority,
          mediaType: finalMediaType,
          mediaUrl: finalMediaUrl,
        }),
      });

      if (!categoryRes.ok) throw new Error("Failed to update category");

      // Delete subcategories
      for (const subId of deletedSubcategoryIds) {
        await fetch(`/api/subcategories/${subId}`, {
          method: "DELETE",
        });
      }

      for (const sub of subcategories) {
        const trimmedName = sub.name.trim();
        if (!trimmedName) continue;

        if (sub.id) {
          await fetch(`/api/subcategories/${sub.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId,
            }),
          });
        } else {
          await fetch(`/api/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              parent_category_id: categoryId,
            }),
          });
        }
      }

      setSuccess("Категорію успішно оновлено");
      router.push("/admin/categories");
    } catch (err) {
      console.error(err);
      setError("Не вдалося оновити категорію");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loadingData ? (
        <div className="p-4 text-center text-lg">Завантаження...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <PageBreadcrumb pageTitle="Редагувати Категорію" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: form fields */}
            <div className="p-4">
              <ComponentCard title="Редагування Категорії">
                <Label>Назва категорії</Label>
                <Input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Введіть назву категорії"
                />

                <Label className="mt-4">Пріоритет</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                />

                <Label className="mt-6">Підкатегорії</Label>
                {formData.subcategories.map((sub, index) => (
                  <div
                    key={sub.id ?? `new-${index}`}
                    className="flex items-center gap-2 mb-2"
                  >
                    <Input
                      type="text"
                      value={sub.name}
                      onChange={(e) =>
                        handleSubcategoryNameChange(index, e.target.value)
                      }
                      placeholder="Назва підкатегорії"
                    />
                    <button
                      type="button"
                      className="text-red-600 font-bold px-2"
                      onClick={() => handleRemoveSubcategory(index)}
                      title="Видалити"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded shadow-sm hover:bg-green-600 transition"
                >
                  Додати підкатегорію
                </button>
              </ComponentCard>
            </div>

            {/* Right side: media */}
            <div className="p-4">
              <DropzoneComponent onDrop={handleDrop} />
              
              {/* Existing media preview */}
              {existingMediaUrl && (
                <div className="mt-4 relative inline-block">
                  {existingMediaType === "video" ? (
                    <video
                      src={`/api/images/${existingMediaUrl}`}
                      className="w-32 h-32 object-cover rounded"
                      controls
                    />
                  ) : (
                    <div className="relative w-32 h-32">
                      <Image
                        src={`/api/images/${existingMediaUrl}`}
                        alt="Category media"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setExistingMediaUrl(null);
                      setExistingMediaType(null);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="Видалити"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* New media previews */}
              {mediaFiles.map((media, i) => {
                const previewUrl = media.preview || URL.createObjectURL(media.file);
                const isVideo = media.type === "video";
                return (
                  <div key={`new-${i}`} className="relative inline-block mt-4 mx-2">
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
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(i)}
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

          <div className="mt-6 flex justify-end px-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition font-medium"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти"}
            </button>
          </div>

          {success && (
            <div className="text-green-600 text-center mt-4">{success}</div>
          )}
          {error && (
            <div className="text-red-600 text-center mt-4">{error}</div>
          )}
        </form>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Image from "next/image";

interface Category {
  id: number;
  name: string;
}

type MediaFile = {
  file: File;
  type: "photo" | "video";
  preview?: string;
};

export default function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleMediaDrop = (files: File[]) => {
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
  };

  const handleRemoveMedia = (index: number) => {
    const mediaToRemove = mediaFiles[index];
    if (mediaToRemove?.preview) {
      URL.revokeObjectURL(mediaToRemove.preview);
    }
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      let finalMediaUrl: string | null = null;
      let finalMediaType: string | null = null;

      // Upload media if provided
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

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newCategoryName.trim(),
          mediaType: finalMediaType,
          mediaUrl: finalMediaUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to create category");
      
      const newCategory = await res.json();
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setMediaFiles([]);
      setIsAddingNew(false);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Помилка при створенні категорії");
    }
  }

  async function handleUpdateCategory(id: number, name: string) {
    if (!name.trim()) {
      alert("Введіть назву категорії");
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update category");

      const updatedCategory = await res.json();
      setCategories(
        categories.map((cat) => (cat.id === id ? updatedCategory : cat))
      );
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Помилка при оновленні категорії");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Ви впевнені, що хочете видалити цю категорію?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Помилка при видаленні категорії");
    }
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Категорії
            </h2>
            <button
              onClick={() => setIsAddingNew(true)}
              className="inline-block rounded-md bg-green-500 px-4 py-2 text-white text-sm font-medium hover:bg-green-600 transition shadow-sm"
            >
              + Додати категорію
            </button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-200 bg-white">
              {/* Add new category row */}
              {isAddingNew && (
                <>
                  <TableRow className="bg-green-50">
                    <TableCell className="px-5 py-4 text-sm text-gray-900 font-medium">
                      —
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleAddCategory();
                          if (e.key === "Escape") {
                            setIsAddingNew(false);
                            setNewCategoryName("");
                            setMediaFiles([]);
                          }
                        }}
                        placeholder="Введіть назву категорії"
                        className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        autoFocus
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <button
                        onClick={handleAddCategory}
                        className="inline-block rounded-md bg-green-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-green-600 transition shadow-sm"
                      >
                        Зберегти
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingNew(false);
                          setNewCategoryName("");
                          setMediaFiles([]);
                        }}
                        className="inline-block rounded-md bg-gray-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-gray-600 transition shadow-sm"
                      >
                        Скасувати
                      </button>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-green-50">
                    <TableCell colSpan={3} className="px-5 py-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Фото/Відео категорії
                          </label>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                handleMediaDrop(files);
                              }
                            }}
                            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        {mediaFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {mediaFiles.map((media, i) => {
                              const previewUrl = media.preview || URL.createObjectURL(media.file);
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
                                    <div className="relative w-32 h-32">
                                      <Image
                                        src={previewUrl}
                                        alt={`new-media-${i}`}
                                        fill
                                        className="object-cover rounded"
                                      />
                                    </div>
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              )}

              {/* Loading state */}
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-600"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-6 text-gray-600"
                  >
                    Категорій не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {category.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm">
                      {editingId === category.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter")
                              handleUpdateCategory(category.id, editingName);
                            if (e.key === "Escape") cancelEditing();
                          }}
                          className="w-full px-3 py-2 border border-gray-400 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateCategory(category.id, editingName)
                            }
                            className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                          >
                            Зберегти
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="inline-block rounded-md bg-gray-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-gray-600 transition shadow-sm"
                          >
                            Скасувати
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin/categories/${category.id}`}
                            className="inline-block rounded-md bg-blue-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                          >
                            Редагувати
                          </Link>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="inline-block rounded-md bg-red-500 px-3 py-1.5 text-white text-sm font-medium hover:bg-red-600 transition shadow-sm"
                          >
                            Видалити
                          </button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


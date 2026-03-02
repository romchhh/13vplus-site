"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Alert from "@/components/shared/Alert";
import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { useProduct } from "@/lib/useProducts";

export default function Product() {
  const { addItem } = useBasket();
  const quantity = 1;
  const { id } = useParams();
  const { product, loading, error } = useProduct(id as string);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const handleAddToCart = async () => {
    if (!product) {
      setAlertMessage("Товар не завантажений");
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    try {
      const media = product.media || [];
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: "—",
        quantity,
        imageUrl: getFirstProductImage(media),
        discount_percentage: product.discount_percentage
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Недостатньо товару в наявності"
      );
      setAlertType("error");
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };

  if (loading) return <div className="p-10">Loading product...</div>;
  if (error || !product)
    return <div className="p-10">Error: {error || "Product not found"}</div>;

  const media = product.media || [];
  const outOfStock = (product.stock ?? 0) <= 0;

  return (
    <section className="max-w-[1920px] w-full mx-auto">
      <div className="flex flex-col lg:flex-row justify-around p-4 md:p-10 gap-10">
        {/* Media Section */}
        <div className="relative flex justify-center w-full lg:w-1/2">
          <div className="w-full max-w-[800px] max-h-[85vh] flex items-center justify-center overflow-hidden">
            {media[activeImageIndex]?.type === "video" ? (
              <video
                className="w-full h-auto max-h-[85vh] object-contain"
                src={`/api/images/${media[activeImageIndex]?.url}`}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                className="object-contain"
                src={`/api/images/${media[activeImageIndex]?.url}`}
                alt={product.name}
                width={800}
                height={1160}
                style={{ maxHeight: "85vh", width: "auto", height: "auto" }}
              />
            )}
          </div>

          {media.length > 1 && (
            <>
              {/* Prev */}
              <button
                className="absolute top-[40%] -translate-y-1/2 left-2 md:left-4 rounded-full cursor-pointer z-10 opacity-60 hover:opacity-100 transition"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === 0 ? media.length - 1 : prev - 1
                  )
                }
              >
                <Image
                  src="/images/light-theme/slider-button-left.svg"
                  alt="Previous"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>

              {/* Next */}
              <button
                className="absolute top-[40%] -translate-y-1/2 right-2 md:right-4 rounded-full cursor-pointer z-10 opacity-60 hover:opacity-100 transition"
                onClick={() =>
                  setActiveImageIndex((prev) =>
                    prev === media.length - 1 ? 0 : prev + 1
                  )
                }
              >
                <Image
                  src="/images/light-theme/slider-button-right.svg"
                  alt="Next"
                  width={32}
                  height={32}
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-6 md:gap-10 px-4 md:px-0 w-full lg:w-1/2">
          {/* Availability */}
          <div className="text-base md:text-lg font-normal font-['Montserrat'] leading-relaxed tracking-wide">
            В наявності
          </div>

          {/* Product Name */}
          <div className="text-3xl md:text-5xl lg:text-6xl font-normal font-['Montserrat'] capitalize leading-tight">
            {product.name}
          </div>

          {/* Price */}
          <div className="w-full flex flex-col sm:flex-row justify-start border-b p-2 sm:p-4 gap-2">
            <div className="text-red-500 text-lg md:text-xl font-['Montserrat']">
              {product.price} ₴
            </div>
          </div>

          {outOfStock && (
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm uppercase tracking-wide bg-red-50 text-red-700 border-red-200 w-fit">
              Немає в наявності
            </div>
          )}

          {/* Add to Cart Button */}
          <div
            onClick={outOfStock ? undefined : handleAddToCart}
            className={`w-full text-center bg-black text-white hover:bg-gray-800 p-3 text-lg md:text-xl font-medium font-['Montserrat'] uppercase tracking-tight transition-all duration-200 ${
              outOfStock
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            }`}
          >
            в кошик
          </div>

          {/* Telegram Manager Link */}
          <a
            href="https://t.me/my_choice_mari"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center border border-gray-400 text-gray-600 hover:border-black hover:text-black py-2 px-3 text-sm md:text-base font-light font-['Montserrat'] cursor-pointer transition-all duration-200"
          >
            Написати менеджеру
          </a>

          {/* Toast */}
          {showToast && (
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-black text-white px-5 py-3 rounded shadow-lg z-50">
              Товар додано до кошика!
            </div>
          )}

          {/* Alert */}
          <Alert
            type={alertType}
            message={alertMessage || ""}
            isVisible={!!alertMessage}
            onClose={() => setAlertMessage(null)}
          />

          {/* Description Section */}
          <div className="w-full md:w-[522px]">
            <div className="mb-3 md:mb-4 text-xl md:text-2xl font-['Montserrat'] uppercase tracking-tight">
              опис
            </div>
            <div className="text-sm md:text-lg font-['Montserrat'] leading-relaxed tracking-wide">
              {product.description}
            </div>
          </div>

          {product.fabric_composition && (
            <div className="opacity-90">
              <h3>Cклад тканини: </h3>
              <span>{product.fabric_composition}</span>
            </div>
          )}

          {product.has_lining && (
            <div className="opacity-90">
              <h3>Підкладка: </h3>
              <span>{product.lining_description}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

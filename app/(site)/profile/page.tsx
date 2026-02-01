"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/lib/WishlistProvider";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  clothingSize: string | null;
  birthDate: string | null;
  bonusPoints: number;
  image: string | null;
}

interface Order {
  id: number;
  customerName: string;
  createdAt: string;
  paymentStatus: string;
  status: string | null;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string | null;
    } | null;
  }>;
}

interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  discount_percentage: number | null;
  first_media?: { url: string; type: string } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, setWishlist } = useWishlist();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<WishlistProduct[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "bonuses">("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "wishlist") setActiveTab("wishlist");
  }, [searchParams]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    clothingSize: "",
    birthDate: "",
  });

  // Statistics state (setStats reserved for future stats API)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for stats fetch
  const [stats, setStats] = useState({
    totalSpent: 0,
    ordersCount: 0,
    favoriteSize: null as string | null,
    favoriteCategory: null as string | null,
  });

  // Calculate loyalty tier based on total spent (reserved for bonuses UI)
  const getLoyaltyTier = (totalSpent: number) => {
    if (totalSpent >= 20000) return { name: "Platinum", color: "text-purple-600", bgColor: "bg-purple-100", nextTier: null, progress: 100 };
    if (totalSpent >= 10000) return { name: "Gold", color: "text-yellow-600", bgColor: "bg-yellow-100", nextTier: 20000, progress: ((totalSpent - 10000) / 10000) * 100 };
    if (totalSpent >= 5000) return { name: "Silver", color: "text-gray-400", bgColor: "bg-gray-100", nextTier: 10000, progress: ((totalSpent - 5000) / 5000) * 100 };
    return { name: "Bronze", color: "text-amber-700", bgColor: "bg-amber-50", nextTier: 5000, progress: (totalSpent / 5000) * 100 };
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for bonuses tab UI
  const loyaltyTier = getLoyaltyTier(stats.totalSpent);

  // Нова пошта: місто та відділення
  const [npCityInput, setNpCityInput] = useState("");
  const [npCitySelected, setNpCitySelected] = useState("");
  const [npWarehouseInput, setNpWarehouseInput] = useState("");
  const [, setNpWarehouseSelected] = useState("");
  const [npCitiesList, setNpCitiesList] = useState<string[]>([]);
  const [npWarehousesList, setNpWarehousesList] = useState<string[]>([]);
  const [npCitiesLoading, setNpCitiesLoading] = useState(false);
  const [npWarehousesLoading, setNpWarehousesLoading] = useState(false);
  const [npShowCityDropdown, setNpShowCityDropdown] = useState(false);
  const [npShowWarehouseDropdown, setNpShowWarehouseDropdown] = useState(false);
  const npCityInputRef = useRef<HTMLInputElement>(null);
  const npWarehouseInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchOrders();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile");
      const data = await res.json();
      setProfile(data);
      const addr = data.address || "";
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: addr,
        clothingSize: data.clothingSize || "",
        birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
      });
      const commaIdx = addr.indexOf(", ");
      if (commaIdx > 0) {
        setNpCitySelected(addr.slice(0, commaIdx));
        setNpCityInput(addr.slice(0, commaIdx));
        setNpWarehouseSelected(addr.slice(commaIdx + 2));
        setNpWarehouseInput(addr.slice(commaIdx + 2));
      } else if (addr) {
        setNpCityInput(addr);
        setNpWarehouseInput(addr);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const NP_API = "https://api.novaposhta.ua/v2.0/json/";
  const npApiKey = process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY || "";

  useEffect(() => {
    if (!npCityInput || npCityInput.length < 2) {
      setNpCitiesList([]);
      return;
    }
    const t = setTimeout(() => {
      setNpCitiesLoading(true);
      fetch(NP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: npApiKey,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: { FindByString: npCityInput, limit: 20 },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setNpCitiesList(data.data.map((c: { Description: string }) => c.Description));
          } else {
            setNpCitiesList([]);
          }
        })
        .catch(() => setNpCitiesList([]))
        .finally(() => setNpCitiesLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [npCityInput, npApiKey]);

  useEffect(() => {
    if (!npCitySelected) {
      setNpWarehousesList([]);
      return;
    }
    setNpWarehousesLoading(true);
    fetch(NP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: npApiKey,
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: { CityName: npCitySelected, FindByString: "", limit: 50 },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setNpWarehousesList(data.data.map((w: { Description: string }) => w.Description));
        } else {
          setNpWarehousesList([]);
        }
      })
      .catch(() => setNpWarehousesList([]))
      .finally(() => setNpWarehousesLoading(false));
  }, [npCitySelected, npApiKey]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/users/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/users/wishlist?full=1");
      if (res.ok) {
        const data = await res.json();
        setWishlistProducts(data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [session?.user, activeTab]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await fetch(`/api/users/wishlist/${productId}`, { method: "DELETE" });
      setWishlistProducts((prev) => prev.filter((p) => p.id !== productId));
      setWishlist(wishlist.filter((id) => id !== productId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-['Montserrat']">Завантаження...</div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "canceled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Оплачено";
      case "pending":
        return "Очікує оплати";
      case "canceled":
        return "Скасовано";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Montserrat'] uppercase tracking-wider mb-2">
            Особистий кабінет
          </h1>
          <p className="text-gray-600 font-['Montserrat']">
            Вітаємо, {profile.name || session.user?.email}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-1 border-b-2 font-['Montserrat'] font-medium text-sm uppercase transition-colors ${
                activeTab === "profile"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Профіль
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 px-1 border-b-2 font-['Montserrat'] font-medium text-sm uppercase transition-colors ${
                activeTab === "orders"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Мої замовлення
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`pb-4 px-1 border-b-2 font-['Montserrat'] font-medium text-sm uppercase transition-colors ${
                activeTab === "wishlist"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Вішлист
            </button>
            <button
              onClick={() => setActiveTab("bonuses")}
              className={`pb-4 px-1 border-b-2 font-['Montserrat'] font-medium text-sm uppercase transition-colors ${
                activeTab === "bonuses"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Мої бонуси
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white">
          {activeTab === "profile" && (
            <div className="max-w-2xl">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Ім&apos;я
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                      placeholder="0960908006"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Адреса доставки (Нова пошта)
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          ref={npCityInputRef}
                          type="text"
                          value={npCityInput}
                          onChange={(e) => {
                            setNpCityInput(e.target.value);
                            setNpShowCityDropdown(true);
                            if (!e.target.value) setNpCitySelected("");
                          }}
                          onFocus={() => npCitiesList.length > 0 && setNpShowCityDropdown(true)}
                          onBlur={() => setTimeout(() => setNpShowCityDropdown(false), 200)}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                          placeholder="Місто"
                          autoComplete="off"
                        />
                        {npCitiesLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">...</span>
                        )}
                        {npShowCityDropdown && npCitiesList.length > 0 && (
                          <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto border border-gray-300 bg-white font-['Montserrat'] text-sm shadow-lg">
                            {npCitiesList.map((name) => (
                              <li
                                key={name}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onMouseDown={() => {
                                  setNpCityInput(name);
                                  setNpCitySelected(name);
                                  setNpShowCityDropdown(false);
                                  setNpWarehouseInput("");
                                  setNpWarehouseSelected("");
                                  setFormData((prev) => ({ ...prev, address: "" }));
                                }}
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          ref={npWarehouseInputRef}
                          type="text"
                          value={npWarehouseInput}
                          onChange={(e) => {
                            setNpWarehouseInput(e.target.value);
                            setNpShowWarehouseDropdown(true);
                          }}
                          onFocus={() => npCitySelected && npWarehousesList.length > 0 && setNpShowWarehouseDropdown(true)}
                          onBlur={() => setTimeout(() => setNpShowWarehouseDropdown(false), 200)}
                          className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                          placeholder="Відділення (оберіть спочатку місто)"
                          autoComplete="off"
                          disabled={!npCitySelected}
                        />
                        {npWarehousesLoading && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">...</span>
                        )}
                        {npShowWarehouseDropdown && npWarehousesList.length > 0 && (
                          <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto border border-gray-300 bg-white font-['Montserrat'] text-sm shadow-lg">
                            {npWarehousesList
                              .filter((w) => w.toLowerCase().includes(npWarehouseInput.toLowerCase()))
                              .map((name) => (
                              <li
                                key={name}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                                onMouseDown={() => {
                                  setNpWarehouseInput(name);
                                  setNpWarehouseSelected(name);
                                  setNpShowWarehouseDropdown(false);
                                  setFormData((prev) => ({ ...prev, address: `${npCitySelected}, ${name}` }));
                                }}
                              >
                                {name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      {formData.address && (
                        <p className="text-sm font-['Montserrat'] text-gray-600">
                          Збережена адреса: {formData.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Розмір одягу
                    </label>
                    <input
                      type="text"
                      value={formData.clothingSize}
                      onChange={(e) =>
                        setFormData({ ...formData, clothingSize: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                      placeholder="S, M, L, XL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Дата народження
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 focus:border-black focus:outline-none font-['Montserrat']"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-black text-white font-['Montserrat'] font-bold uppercase hover:bg-gray-800 transition-colors"
                    >
                      Зберегти
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 border border-black text-black font-['Montserrat'] font-bold uppercase hover:bg-black hover:text-white transition-colors"
                    >
                      Скасувати
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Контакти
                    </h3>
                    <p className="font-['Montserrat']">{profile.email || "Не вказано"}</p>
                    <p className="font-['Montserrat']">{profile.phone || "Не вказано"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Адреса доставки (Нова пошта)
                    </h3>
                    <p className="font-['Montserrat']">{profile.address || "Не вказано"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Розмір одягу
                    </h3>
                    <p className="font-['Montserrat']">{profile.clothingSize || "Не вказано"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-['Montserrat'] font-medium text-gray-700 mb-2">
                      Дата народження
                    </h3>
                    <p className="font-['Montserrat']">
                      {profile.birthDate
                        ? new Date(profile.birthDate).toLocaleDateString("uk-UA")
                        : "Не вказано"}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-3 bg-black text-white font-['Montserrat'] font-bold uppercase hover:bg-gray-800 transition-colors"
                  >
                    Редагувати профіль
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-red-50 text-red-700 font-['Montserrat'] font-medium rounded-md hover:bg-red-100 hover:border-red-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v3.75M9 10.5l3 3m0 0l3-3m-3 3V15" />
                  </svg>
                  Вийти з акаунта
                </button>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Мої замовлення</h2>
              {orders.length === 0 ? (
                <p className="text-gray-600 font-['Montserrat']">У вас поки немає замовлень</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-['Montserrat'] font-bold">
                            Замовлення #{order.id}
                          </p>
                          <p className="text-sm text-gray-600 font-['Montserrat']">
                            {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-['Montserrat'] font-medium ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {getStatusText(order.paymentStatus)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            {item.product?.imageUrl ? (
                              <div className="relative w-14 h-14 flex-shrink-0 bg-gray-100 overflow-hidden rounded">
                                <Image
                                  src={`/api/images/${item.product.imageUrl}`}
                                  alt={item.product?.name || "Товар"}
                                  width={56}
                                  height={56}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-gray-400 text-xs">Фото</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-['Montserrat']">
                                {item.product?.name || "Товар"} x {item.quantity}
                              </span>
                            </div>
                            <span className="font-['Montserrat'] whitespace-nowrap">
                              {Number(item.price).toFixed(2)} грн
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-['Montserrat'] font-bold">Всього:</span>
                          <span className="font-['Montserrat'] font-bold">
                            {order.items
                              .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
                              .toFixed(2)}{" "}
                            грн
                          </span>
                        </div>
                        <Link
                          href={`/profile/orders/${order.id}`}
                          className="text-sm font-['Montserrat'] font-medium text-black hover:underline"
                        >
                          Переглянути деталі
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Вішлист</h2>
              {wishlistLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <p className="text-gray-600 font-['Montserrat']">У вас поки немає товарів у вішлисті.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                  {wishlistProducts.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 group relative">
                      <Link href={`/product/${item.id}`} className="block">
                        <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveFromWishlist(item.id);
                            }}
                            className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-white/80 hover:bg-white shadow-sm transition-colors"
                            title="Прибрати з вішлиста"
                            aria-label="Прибрати з вішлиста"
                          >
                            <svg
                              className="w-4 h-4 text-amber-600 fill-amber-600"
                              fill="currentColor"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={1}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                          </button>
                          {item.first_media?.type === "video" ? (
                            <video
                              src={`/api/images/${item.first_media.url}`}
                              className="object-cover transition-all duration-300 group-hover:opacity-95 w-full h-full"
                              loop
                              muted
                              playsInline
                              autoPlay
                              preload="none"
                            />
                          ) : (
                            <Image
                              src={getProductImageSrc(item.first_media)}
                              alt={`${item.name} від 13VPLUS`}
                              className="object-cover transition-all duration-300 group-hover:opacity-95"
                              fill
                              sizes="(max-width: 420px) 45vw, (max-width: 640px) 45vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-sm sm:text-base font-normal font-['Montserrat'] text-gray-900 leading-snug uppercase tracking-wider">
                            {item.name}
                          </h3>
                          {item.discount_percentage ? (
                            <div className="flex items-baseline gap-1 flex-wrap">
                              <span className="text-gray-900 line-through text-base sm:text-lg font-normal">
                                {item.price.toLocaleString()} ₴
                              </span>
                              <span className="text-gray-900 text-base sm:text-lg font-normal">
                                -{item.discount_percentage}%
                              </span>
                              <span className="font-bold text-red-800 text-base sm:text-lg tracking-tight">
                                {(item.price * (1 - item.discount_percentage / 100))
                                  .toFixed(0)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{" "}
                                ₴
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
                              {item.price}₴
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bonuses" && (
            <div>
              <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Мої бонуси</h2>
              <div className="bg-gray-50 p-8 text-center">
                <p className="text-4xl font-bold font-['Montserrat'] mb-2">
                  {profile.bonusPoints}
                </p>
                <p className="text-gray-600 font-['Montserrat']">Бонусних балів</p>
              </div>
              <p className="mt-4 text-gray-600 font-['Montserrat'] text-sm">
                Використовуйте бонуси для знижок на наступні покупки
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

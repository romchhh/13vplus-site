"use client";

import { useEffect, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import Image from "next/image";
import Link from "next/link";

/** Calculate order subtotal from basket items */
function getSubtotal(items: { price: number | string; quantity: number; discount_percentage?: number | string }[]) {
  return items.reduce((total, item) => {
    const itemPrice = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    const discount = item.discount_percentage
      ? typeof item.discount_percentage === "string"
        ? parseFloat(item.discount_percentage)
        : item.discount_percentage
      : 0;
    const price = discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;
    return total + price * item.quantity;
  }, 0);
}

export default function FinalCard() {
  // GENERAL
  const { items, updateQuantity, removeItem, clearBasket } = useBasket();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // CUSTOMER (Ім'я та Прізвище окремо для макета)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const customerName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("nova_poshta_branch");
  const [city, setCity] = useState("");
  const [postOffice, setPostOffice] = useState("");
  const DELIVERY_COST_BRANCH = 100; // грн за доставку у відділення
  // Auto-fill showroom address when selected
  useEffect(() => {
    if (deliveryMethod === "showroom_pickup") {
      setCity("Київ");
      setPostOffice("Самовивіз: вул. Костянтинівська, 21 (13:00–19:00)");
    } else {
      // Для способів Нової пошти не фіксуємо місто за замовчуванням
      setCity("");
      setPostOffice("");
    }
  }, [deliveryMethod]);

  // Track InitiateCheckout event for Meta Pixel when component mounts with items
  useEffect(() => {
    if (items.length > 0 && typeof window !== 'undefined' && window.fbq) {
      const totalValue = items.reduce((total, item) => {
        const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        const discount = item.discount_percentage 
          ? (typeof item.discount_percentage === 'string' ? parseFloat(item.discount_percentage) : item.discount_percentage)
          : 0;
        const price = discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;
        return total + price * item.quantity;
      }, 0);

      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map(item => String(item.id)),
        content_type: 'product',
        value: totalValue,
        currency: 'UAH',
        num_items: items.reduce((sum, item) => sum + item.quantity, 0)
      });
    }
  }, [items]); // Track when basket changes

  const [comment, setComment] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  // Промокод: введений код, результат перевірки
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    promoCodeId: number;
    discountAmount: number;
    message?: string;
  } | null>(null);
  const [promoValidating, setPromoValidating] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Form validation states
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    postOffice?: string;
    paymentType?: string;
  }>({});

  const validateName = () => {
    if (!firstName.trim()) return "Ім'я обов'язкове";
    if (!lastName.trim()) return "Прізвище обов'язкове";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) {
      return "Телефон обов'язковий";
    }
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
      return "Введіть коректний номер телефону";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return "Введіть коректний email";
      }
    }
    return "";
  };

  const validateCity = (city: string) => {
    if (!city.trim()) {
      return "Місто обов'язкове";
    }
    return "";
  };

  const validatePostOffice = (postOffice: string) => {
    if (!postOffice.trim()) {
      return "Відділення/адреса обов'язкові";
    }
    return "";
  };

  const validatePaymentType = (paymentType: string) => {
    if (!paymentType) {
      return "Оберіть спосіб оплати";
    }
    return "";
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    setFieldErrors((prev) => ({ ...prev, firstName: value.trim() ? undefined : "Ім'я обов'язкове" }));
  };
  const handleLastNameChange = (value: string) => {
    setLastName(value);
    setFieldErrors((prev) => ({ ...prev, lastName: value.trim() ? undefined : "Прізвище обов'язкове" }));
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (value) {
      const error = validatePhone(value);
      setFieldErrors((prev) => ({ ...prev, phone: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.phone;
        return newErrors;
      });
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      const error = validateEmail(value);
      setFieldErrors((prev) => ({ ...prev, email: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleCityChangeWithValidation = (value: string) => {
    setCity(value);
    if (value) {
      const error = validateCity(value);
      setFieldErrors((prev) => ({ ...prev, city: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.city;
        return newErrors;
      });
    }
  };

  const handlePostOfficeChangeWithValidation = (value: string) => {
    setPostOffice(value);
    if (value) {
      const error = validatePostOffice(value);
      setFieldErrors((prev) => ({ ...prev, postOffice: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.postOffice;
        return newErrors;
      });
    }
  };

  const handlePaymentTypeChange = (value: string) => {
    setPaymentType(value);
    if (value) {
      const error = validatePaymentType(value);
      setFieldErrors((prev) => ({ ...prev, paymentType: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.paymentType;
        return newErrors;
      });
    }
  };

  const [submittedOrder, setSubmittedOrder] = useState<{
    items: typeof items;
    customer: {
      name: string;
      email?: string;
      phone: string;
      city: string;
      postOffice: string;
      comment?: string;
      paymentType: string;
    };
    orderId?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !phoneNumber ||
      !deliveryMethod ||
      !city ||
      !postOffice ||
      !paymentType
    ) {
      setError("Будь ласка, заповніть усі обов’язкові поля.");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Ваш кошик порожній.");
      setLoading(false);
      return;
    }

    if (!agreedToPolicy) {
      setError("Будь ласка, підтвердіть згоду з Політикою конфіденційності та Публічною офертою.");
      setLoading(false);
      return;
    }

    // Check stock availability before submitting order
    try {
      const stockCheckResponse = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            size: item.size,
            quantity: item.quantity,
          })),
        }),
      });

      if (!stockCheckResponse.ok) {
        const stockData = await stockCheckResponse.json();
        const errorMessages = stockData.insufficientItems?.map(
          (item: { product_id: number; size: string; requested: number; available: number }) =>
            `Товар ID ${item.product_id} (розмір ${item.size}): доступно ${item.available} шт., запитано ${item.requested} шт.`
        ) || ["Недостатньо товару в наявності"];
        setError(`Недостатньо товару в наявності:\n${errorMessages.join("\n")}`);
        setLoading(false);
        return;
      }
    } catch (stockError) {
      console.error("[FinalCard] Stock check error:", stockError);
      setError("Помилка перевірки наявності товару. Спробуйте ще раз.");
      setLoading(false);
      return;
    }

    // Формуємо товари для API (з урахуванням знижки)
    const apiItems = items.map((item) => {
      // Перетворюємо ціну в число
      const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const discount = item.discount_percentage 
        ? (typeof item.discount_percentage === 'string' ? parseFloat(item.discount_percentage) : item.discount_percentage)
        : 0;
      
      const discountedPrice = discount > 0
        ? itemPrice * (1 - discount / 100)
        : itemPrice;

      return {
        product_id: item.id,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: discountedPrice.toFixed(2), // передаємо кінцеву ціну
        original_price: itemPrice, // можна залишити для запису, якщо треба
        discount_percentage: discount || null,
        color: item.color || null,
      };
    });

    const subtotal = getSubtotal(items);
    const deliveryCost = deliveryMethod === "nova_poshta_branch" ? DELIVERY_COST_BRANCH : 0;
    const promoDiscount = appliedPromo?.discountAmount ?? 0;
    const fullAmount = Math.max(0, subtotal + deliveryCost - promoDiscount);

    try {
      const requestBody = {
        customer_name: customerName,
        phone_number: phoneNumber,
        email: email || null,
        delivery_method: deliveryMethod,
        city,
        post_office: postOffice,
        comment,
        payment_type: paymentType,
        total_amount: fullAmount.toFixed(2),
        bonus_points_to_spend: 0,
        delivery_cost: deliveryCost,
        promo_code: appliedPromo ? promoCodeInput.trim().toUpperCase() : undefined,
        items: apiItems,
      };
      
      console.log("[FinalCard] Sending order request with:", JSON.stringify(requestBody, null, 2));
      
      // Надсилаємо дані замовлення
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("[FinalCard] Error response:", data);
        let errorMessage = data.error || "Помилка при оформленні замовлення.";
        
        if (data.details) {
          if (Array.isArray(data.details)) {
            errorMessage = `${errorMessage}\n${data.details.join("\n")}`;
          } else {
            errorMessage = `${errorMessage}\n${data.details}`;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      } else {
        const data = await response.json();
        
        const { orderId, invoiceUrl } = data;

        if (!orderId) {
          console.error("[FinalCard] No order ID received!");
          setError("Не вдалося створити замовлення.");
          return;
        }

        // Track Purchase event for Meta Pixel
        if (typeof window !== 'undefined' && window.fbq) {
          const totalValue = items.reduce((total, item) => {
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const discount = item.discount_percentage 
              ? (typeof item.discount_percentage === 'string' ? parseFloat(item.discount_percentage) : item.discount_percentage)
              : 0;
            const price = discount > 0 ? itemPrice * (1 - discount / 100) : itemPrice;
            return total + price * item.quantity;
          }, 0);

          window.fbq('track', 'Purchase', {
            content_ids: items.map(item => String(item.id)),
            content_type: 'product',
            value: totalValue,
            currency: 'UAH',
            num_items: items.reduce((sum, item) => sum + item.quantity, 0)
          });
        }

        const requiresPayment = paymentType !== "test_payment";
        if (invoiceUrl) {
          // Зберігаємо orderId для сторінки success (після повернення з Mono без query)
          localStorage.setItem(
            "pendingPayment",
            JSON.stringify({ orderId, paymentType })
          );
          localStorage.setItem("pendingOrderItems", JSON.stringify(items));
          localStorage.setItem(
            "pendingOrderCustomer",
            JSON.stringify({
              name: customerName,
              email,
              phone: phoneNumber,
              city,
              postOffice,
              comment,
              paymentType,
            })
          );
          setSuccess(paymentType === "test_payment" ? "Замовлення оформлено. Переходимо на сторінку підтвердження..." : "Переходимо до оплати...");
          setTimeout(() => {
            window.location.href = invoiceUrl;
          }, paymentType === "test_payment" ? 800 : 1500);
        } else if (requiresPayment) {
          setError(
            data.message ||
            "Не вдалося створити платіж. Будь ласка, спробуйте ще раз або зв'яжіться з нами."
          );
          setLoading(false);
        } else {
          // Should not happen, but just in case
          setSuccess("Замовлення успішно оформлено! Ми зв'яжемося з вами найближчим часом.");
          clearBasket();
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("[FinalCard] Network error:", error);
      setError("Помилка мережі. Спробуйте пізніше.");
      setLoading(false);
    }
    // Note: Don't set loading to false in finally block, as it would interfere with payment redirect
  };

  useEffect(() => {
    // Check if returning from payment gateway
    const urlParams = new URLSearchParams(window.location.search);
    const orderReference = urlParams.get("orderReference");
    const status = urlParams.get("status");
    
    // Check for pending payment
    const pendingPayment = localStorage.getItem("pendingPayment");
    
    if (pendingPayment && orderReference) {
      // User returned from payment gateway - check payment status
      const pendingData = JSON.parse(pendingPayment);
      
      if (status === "failed") {
        setError("Оплата не була завершена. Будь ласка, спробуйте ще раз або зв'яжіться з нами.");
        localStorage.removeItem("pendingPayment");
        localStorage.removeItem("pendingOrderItems");
        localStorage.removeItem("pendingOrderCustomer");
        return;
      }
      
      // Fetch order status from API
      fetch(`/api/orders/by-invoice/${pendingData.orderId}`)
        .then((res) => res.json())
        .then((orderData) => {
          if (orderData.payment_status === "paid") {
            // Payment successful - save order info and clear basket
            const storedItems = localStorage.getItem("pendingOrderItems");
            if (storedItems) {
              const items = JSON.parse(storedItems);
              const storedCustomer = localStorage.getItem("pendingOrderCustomer");
              const customer = storedCustomer ? JSON.parse(storedCustomer) : {};
              
              localStorage.setItem(
                "submittedOrder",
                JSON.stringify({
                  items,
                  customer,
                  orderId: pendingData.orderId,
                })
              );
              localStorage.removeItem("pendingPayment");
              localStorage.removeItem("pendingOrderItems");
              localStorage.removeItem("pendingOrderCustomer");
              setSubmittedOrder({
                items,
                customer,
                orderId: pendingData.orderId,
              });
              clearBasket();
            } else {
              setSuccess("Оплата успішно завершена! Замовлення обробляється.");
            }
          } else {
            // Payment not completed yet
            setError("Оплата ще не завершена. Будь ласка, завершіть оплату або зв'яжіться з нами.");
            localStorage.removeItem("pendingPayment");
            localStorage.removeItem("pendingOrderItems");
            localStorage.removeItem("pendingOrderCustomer");
          }
        })
        .catch((err) => {
          console.error("[FinalCard] Error checking payment status:", err);
          setError("Не вдалося перевірити статус оплати. Будь ласка, зв'яжіться з нами.");
        });
    } else {
      // Normal order display (from localStorage) - only show if payment was completed
      const storedOrder = localStorage.getItem("submittedOrder");
      if (storedOrder) {
        const order = JSON.parse(storedOrder);
        // Only show if it's not a pending payment
        if (!pendingPayment) {
          setSubmittedOrder(order);
        }
      }
    }
  }, [clearBasket]);

  // POST OFFICE
  const [cities, setCities] = useState<string[]>([]); // Available cities
  const [postOffices, setPostOffices] = useState<string[]>([]); // Available post offices
  const [loadingCities, setLoadingCities] = useState<boolean>(false); // Loading state for cities
  const [loadingPostOffices, setLoadingPostOffices] = useState<boolean>(false); // Loading state for post offices
  const [filteredCities, setFilteredCities] = useState<string[]>([]); // Filtered cities list for autocomplete
  const [filteredPostOffices, setFilteredPostOffices] = useState<string[]>([]); // Filtered post offices list for autocomplete
  const [cityListVisible, setCityListVisible] = useState(false);
  const [postOfficeListVisible, setPostOfficeListVisible] = useState(false);
  // Region and district for Ukrposhta (currently unused but kept for future implementation)
  const [region] = useState(""); // For Ukrposhta - область
  const [district] = useState(""); // For Ukrposhta - район

  // Example useEffect for region and district fetching for Ukrposhta
  useEffect(() => {
    if (region) {
      setLoadingCities(true);
      // API call to fetch regions for Ukrposhta
      setLoadingCities(false);
    }
  }, [region]);

  useEffect(() => {
    if (district) {
      setLoadingPostOffices(true);
      // API call to fetch districts for Ukrposhta
      setLoadingPostOffices(false);
    }
  }, [district]);

  useEffect(() => {
    // Fetch available cities when delivery method changes to Nova Poshta
    if (deliveryMethod.startsWith("nova_poshta")) {
      setLoadingCities(true);

      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: city,
            limit: 20,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("City fetch response", data); // ✅ Add this
          if (data.success) {
            const cityData = data.data || [];
            setCities(
              cityData.map((c: { Description: string }) => c.Description)
            );
          } else {
            setCities([]);
            setError("Не вдалося знайти міста.");
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError("Помилка при завантаженні міст.");
        })
        .finally(() => {
          setLoadingCities(false);
        });
    } else if (deliveryMethod == "ukrposhta") {
      setLoadingCities(true);

      // Fetch cities with `fetch`
      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
          modelName: "AddressGeneral",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: city, // Replace with a dynamic city string if necessary
            limit: 20,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const cityData = data.data || [];
          setCities(
            cityData.map((city: { Description: unknown }) => city.Description)
          );
          // console.log(data);
        })
        .catch(() => {
          console.error("Error fetching cities");
          setError("Failed to load cities.");
        })
        .finally(() => {
          setLoadingCities(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryMethod]);

  useEffect(() => {
    // Filter and sort the cities based on the current input
    const filtered = cities.filter((cityOption) =>
      cityOption.toLowerCase().includes(city.toLowerCase())
    );

    // Sort: exact matches first, then starts with, then contains
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = city.toLowerCase();

      // Exact match
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;

      // Starts with
      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Alphabetical for remaining
      return a.localeCompare(b);
    });

    setFilteredCities(sorted);
  }, [city, cities]); // Re-filter cities whenever `city` or `cities` changes

  useEffect(() => {
    // Fetch available post offices when a city is selected
    if (city) {
      setLoadingPostOffices(true);

      // Fetch post offices with `fetch`
      fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY, // Replace with your actual API Key
          modelName: "AddressGeneral",
          calledMethod: "getWarehouses",
          methodProperties: {
            CityName: city, // Use the selected city
            FindByString: postOffice,
            limit: 20,
          },
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const postOfficeData = data.data || [];
          setPostOffices(
            postOfficeData.map(
              (post: { Description: unknown }) => post.Description
            )
          );
          // console.log(data);
        })
        .catch(() => {
          console.error("Error fetching post offices");
          setError("Failed to load post offices.");
        })
        .finally(() => {
          setLoadingPostOffices(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  useEffect(() => {
    // Filter and sort the post offices based on the current input
    const filtered = postOffices.filter((postOfficeOption) =>
      postOfficeOption.toLowerCase().includes(postOffice.toLowerCase())
    );

    // Sort: exact matches first, then starts with, then contains
    const sorted = filtered.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = postOffice.toLowerCase();

      // Exact match
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;

      // Starts with
      const aStarts = aLower.startsWith(searchLower);
      const bStarts = bLower.startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Alphabetical for remaining
      return a.localeCompare(b);
    });

    setFilteredPostOffices(sorted);
  }, [postOffice, postOffices]); // Re-filter post offices whenever `postOffice` or `postOffices` changes

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCityChangeWithValidation(e.target.value);
    setCityListVisible(true); // Show the city list while typing
  };

  const handlePostOfficeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePostOfficeChangeWithValidation(e.target.value);
    setPostOfficeListVisible(true); // Show the post office list while typing
  };

  const handleCitySelect = (cityOption: string) => {
    handleCityChangeWithValidation(cityOption);
    setCityListVisible(false); // Hide the city list after selecting an option
  };

  const handlePostOfficeSelect = (postOfficeOption: string) => {
    handlePostOfficeChangeWithValidation(postOfficeOption);
    setPostOfficeListVisible(false); // Hide the post office list after selecting an option
  };

  // STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ⬇️ Сторінка оформленого замовлення (як на скріні)
  if (items.length == 0 && submittedOrder) {
    return (
      <section className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl mx-auto">
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] font-normal">
              <li>
                <Link href="/" className="text-[#3D1A00] hover:opacity-80 transition-opacity">
                  Головна
                </Link>
              </li>
              <li className="text-gray-400">|</li>
              <li className="text-gray-400">Оформлення замовлення</li>
            </ol>
          </nav>

          <div className="text-center py-12 sm:py-16">
            <h1 className="font-['Montserrat'] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#3D1A00] uppercase tracking-tight mb-4">
              Дякуємо!
            </h1>
            <p className="font-['Montserrat'] font-bold text-2xl sm:text-3xl lg:text-4xl text-[#3D1A00] uppercase tracking-tight mb-10 sm:mb-12">
              Ваше замовлення оформлене!
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-base tracking-tight bg-[#9B9B5A] hover:bg-[#8a8a4e] transition-colors"
            >
              Повернутися на головну
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden bg-[#FFFFFF] min-h-screen px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-12">
      {!mounted ? (
        <div className="py-12 sm:py-20 flex items-center justify-center w-full min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : items.length == 0 ? (
        <div className="py-12 px-4 sm:py-20 flex flex-col items-center gap-10 sm:gap-14 w-full max-w-2xl mx-auto">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#3D1A00]/5 flex items-center justify-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-[#3D1A00]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-center text-2xl sm:text-4xl md:text-5xl font-semibold font-['Montserrat'] text-[#3D1A00] uppercase tracking-tight leading-tight">
            Ваш кошик порожній
          </h2>
          <Link
            href="/catalog"
            className="w-full sm:w-80 h-14 sm:h-16 px-6 py-3 rounded-xl bg-[#8B9A47] hover:bg-[#7a8940] text-white font-['Montserrat'] font-semibold text-base sm:text-lg uppercase tracking-tight inline-flex items-center justify-center text-center transition-colors"
          >
            Продовжити покупки
          </Link>
        </div>
      ) : (
        <>
          {/* Breadcrumbs */}
          <nav className="mb-6 pt-2" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm font-['Montserrat'] font-normal text-[#3D1A00]/70">
              <li><Link href="/" className="hover:text-[#3D1A00] transition-colors">Головна</Link></li>
              <li aria-hidden className="text-[#3D1A00]/40">|</li>
              <li className="text-[#3D1A00]/80">Оформлення замовлення</li>
            </ol>
          </nav>

          <h1 className="font-['Montserrat'] font-semibold text-2xl sm:text-3xl lg:text-4xl text-[#3D1A00] uppercase tracking-tight text-center mb-10 sm:mb-12">
            ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
          </h1>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-10">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left column: forms */}
            <div className="w-full lg:w-1/2 flex flex-col gap-6">
              {/* ІНФОРМАЦІЯ ПРО ПОКУПЦЯ */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h2 className="font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-sm tracking-wide mb-4">Інформація про покупця</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">E-mail</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      onBlur={(e) => { const err = validateEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: err || undefined })); }}
                      className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.email ? "border-red-500" : ""}`}
                      placeholder="example@email.com"
                      autoComplete="email"
                    />
                    {fieldErrors.email && <p className="text-red-500 text-xs">{fieldErrors.email}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">Телефон <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      onBlur={(e) => { const err = validatePhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: err || undefined })); }}
                      className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.phone ? "border-red-500" : ""}`}
                      placeholder="+380 50 123 4567"
                      required
                      autoComplete="tel"
                    />
                    {fieldErrors.phone && <p className="text-red-500 text-xs">{fieldErrors.phone}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="firstName" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">Ім&apos;я <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.firstName ? "border-red-500" : ""}`}
                      required
                      autoComplete="given-name"
                    />
                    {fieldErrors.firstName && <p className="text-red-500 text-xs">{fieldErrors.firstName}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lastName" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">Прізвище <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => handleLastNameChange(e.target.value)}
                      className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.lastName ? "border-red-500" : ""}`}
                      required
                      autoComplete="family-name"
                    />
                    {fieldErrors.lastName && <p className="text-red-500 text-xs">{fieldErrors.lastName}</p>}
                  </div>
                </div>
              </div>

              {/* СПОСІБ ДОСТАВКИ */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h2 className="font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-sm tracking-wide mb-4">Спосіб доставки</h2>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input type="radio" name="delivery" value="nova_poshta_branch" checked={deliveryMethod === "nova_poshta_branch"} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === "nova_poshta_branch" ? "border-[#3D1A00] bg-[#3D1A00]" : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"}`}>
                      {deliveryMethod === "nova_poshta_branch" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]">Доставка у відділення</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input type="radio" name="delivery" value="nova_poshta_courier" checked={deliveryMethod === "nova_poshta_courier"} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === "nova_poshta_courier" ? "border-[#3D1A00] bg-[#3D1A00]" : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"}`}>
                      {deliveryMethod === "nova_poshta_courier" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]">Доставка кур&apos;єром</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input type="radio" name="delivery" value="showroom_pickup" checked={deliveryMethod === "showroom_pickup"} onChange={(e) => setDeliveryMethod(e.target.value)} className="sr-only" />
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${deliveryMethod === "showroom_pickup" ? "border-[#3D1A00] bg-[#3D1A00]" : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"}`}>
                      {deliveryMethod === "showroom_pickup" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]">Самовивіз з магазину</span>
                  </label>
                </div>
              </div>

              {/* АДРЕСА ДОСТАВКИ */}
              {(deliveryMethod === "nova_poshta_branch" || deliveryMethod === "nova_poshta_courier" || deliveryMethod === "nova_poshta_locker") && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                  <h2 className="font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-sm tracking-wide mb-4">Адреса доставки</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="city" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">Місто <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={handleCityChange}
                        onBlur={(e) => { const err = validateCity(e.target.value); setFieldErrors((p) => ({ ...p, city: err || undefined })); }}
                        className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.city ? "border-red-500" : ""}`}
                        placeholder="Київ"
                        required
                      />
                      {fieldErrors.city && <p className="text-red-500 text-xs">{fieldErrors.city}</p>}
                      {cityListVisible && filteredCities.length > 0 && (
                        <ul className="border border-gray-200 rounded-lg mt-1 max-h-32 overflow-y-auto bg-white shadow-lg py-1">
                          {filteredCities.map((c, i) => (
                            <li key={i} className="px-4 py-2.5 text-sm font-['Montserrat'] text-[#3D1A00] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleCitySelect(c)}>{c}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="postOffice" className="text-sm font-['Montserrat'] text-[#3D1A00]/80">{deliveryMethod === "nova_poshta_courier" ? "Адреса" : "Номер відділення"} <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={handlePostOfficeChange}
                        onBlur={(e) => { const err = validatePostOffice(e.target.value); setFieldErrors((p) => ({ ...p, postOffice: err || undefined })); }}
                        className={`border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors ${fieldErrors.postOffice ? "border-red-500" : ""}`}
                        placeholder={deliveryMethod === "nova_poshta_courier" ? "Вул., будинок, квартира" : "Відділення"}
                        required
                      />
                      {fieldErrors.postOffice && <p className="text-red-500 text-xs">{fieldErrors.postOffice}</p>}
                      {postOfficeListVisible && filteredPostOffices.length > 0 && deliveryMethod !== "nova_poshta_courier" && (
                        <ul className="border border-gray-200 rounded-lg mt-1 max-h-32 overflow-y-auto bg-white shadow-lg py-1">
                          {filteredPostOffices.map((po, i) => (
                            <li key={i} className="px-4 py-2.5 text-sm font-['Montserrat'] text-[#3D1A00] cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handlePostOfficeSelect(po)}>{po}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {deliveryMethod === "showroom_pickup" && (
                <div className="text-sm font-['Montserrat'] text-[#3D1A00]/80 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                  Самовивіз: Київ, вул. Костянтинівська, 21 (13:00–19:00)
                </div>
              )}

              {/* СПОСІБ ОПЛАТИ */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h2 className="font-['Montserrat'] font-semibold text-[#3D1A00] uppercase text-sm tracking-wide mb-4">Спосіб оплати</h2>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input type="radio" name="payment" value="full" checked={paymentType === "full"} onChange={(e) => handlePaymentTypeChange(e.target.value)} className="sr-only" />
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentType === "full" ? "border-[#3D1A00] bg-[#3D1A00]" : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"}`}>
                      {paymentType === "full" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]">Онлайн оплата MonoPay</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer py-1 group">
                    <input type="radio" name="payment" value="prepay" checked={paymentType === "prepay"} onChange={(e) => handlePaymentTypeChange(e.target.value)} className="sr-only" />
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentType === "prepay" ? "border-[#3D1A00] bg-[#3D1A00]" : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"}`}>
                      {paymentType === "prepay" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="font-['Montserrat'] text-sm text-[#3D1A00]">Накладений платіж (мінімальна передоплата 200 грн)</span>
                  </label>
                </div>
                {fieldErrors.paymentType && <p className="text-red-500 text-xs mt-1">{fieldErrors.paymentType}</p>}
              </div>
            </div>

            {/* Right column: order summary */}
            <div className="w-full lg:w-1/2 flex flex-col gap-5">
              {items.map((item) => {
                const displayPrice = item.discount_percentage ? Math.round(item.price * (1 - item.discount_percentage / 100)) : item.price;
                return (
                  <div key={`${item.id}-${item.size}`} className="bg-white border border-[#3D1A00]/15 rounded-xl p-5 sm:p-6 flex flex-row gap-4 sm:gap-6 relative">
                    {/* Кнопка видалити — темно-коричневий X у правому верхньому куті картки */}
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors text-lg font-medium leading-none"
                      onClick={() => removeItem(item.id, item.size)}
                      aria-label="Видалити"
                    >
                      ×
                    </button>

                    {/* Ліва частина: назва, опис; знизу — кількість + ціна */}
                    <div className="min-w-0 flex-1 flex flex-col pr-8 sm:pr-10">
                      <p className="font-['Montserrat'] font-bold text-[#3D1A00] uppercase text-base sm:text-lg leading-tight">
                        {item.name}
                      </p>
                      {(item as { subtitle?: string }).subtitle && (
                        <p className="font-['Montserrat'] text-[#3D1A00]/70 text-sm leading-relaxed line-clamp-2 mt-1">
                          {(item as { subtitle?: string }).subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-4 sm:mt-5">
                        <div className="flex items-center border border-[#3D1A00]/12 rounded overflow-hidden shrink-0">
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 disabled:opacity-50 transition-colors text-sm font-medium"
                            onClick={async () => {
                              try {
                                await updateQuantity(item.id, item.size, item.quantity - 1);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="w-10 h-8 flex items-center justify-center font-['Montserrat'] text-sm text-[#3D1A00] border-x border-[#3D1A00]/12 bg-transparent">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="w-8 h-8 flex items-center justify-center text-[#3D1A00] hover:bg-[#3D1A00]/5 transition-colors text-sm font-medium"
                            onClick={async () => {
                              try {
                                await updateQuantity(item.id, item.size, item.quantity + 1);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : "Недостатньо товару");
                                setTimeout(() => setError(null), 5000);
                              }
                            }}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-['Montserrat'] font-semibold text-[#3D1A00] text-lg sm:text-xl">
                          {displayPrice.toLocaleString("uk-UA")} грн
                        </span>
                      </div>
                    </div>

                    {/* Права частина: зображення товару — така сама структура на моб і комп */}
                    <div className="shrink-0 flex items-center justify-end">
                      <div className="w-28 h-36 sm:w-40 sm:h-48 relative rounded-lg overflow-hidden bg-[#fafafa]">
                        <Image
                          src={
                            item.imageUrl
                              ? item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")
                                ? item.imageUrl
                                : `/api/images/${item.imageUrl}`
                              : "https://placehold.co/160x200/eee/999?text=No+Image"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-2">
                <div className="flex flex-col gap-1.5 mb-4">
                  <label className="text-sm font-['Montserrat'] text-[#3D1A00]/80">Промокод:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value);
                        setPromoError(null);
                        if (appliedPromo) setAppliedPromo(null);
                      }}
                      className="flex-1 border border-gray-200 px-4 py-3 font-['Montserrat'] text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#3D1A00]/15 focus:border-[#3D1A00]/30 transition-colors uppercase"
                      placeholder="Введіть промокод"
                    />
                    <button
                      type="button"
                      disabled={promoValidating || !promoCodeInput.trim()}
                      onClick={async () => {
                        const code = promoCodeInput.trim().toUpperCase();
                        if (!code) return;
                        setPromoError(null);
                        setPromoValidating(true);
                        try {
                          const subtotal = getSubtotal(items);
                          const deliveryCostVal = deliveryMethod === "nova_poshta_branch" ? DELIVERY_COST_BRANCH : 0;
                          const res = await fetch("/api/promo/validate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              code,
                              subtotal,
                              deliveryCost: deliveryCostVal,
                            }),
                          });
                          const data = await res.json();
                          if (data.valid && data.promoCodeId != null && data.discountAmount != null) {
                            setAppliedPromo({
                              promoCodeId: data.promoCodeId,
                              discountAmount: data.discountAmount,
                              message: data.message,
                            });
                          } else {
                            setAppliedPromo(null);
                            setPromoError(data.message || "Промокод не дійсний");
                          }
                        } catch {
                          setPromoError("Помилка перевірки промокоду");
                          setAppliedPromo(null);
                        } finally {
                          setPromoValidating(false);
                        }
                      }}
                      className="shrink-0 px-4 py-3 font-['Montserrat'] text-sm font-medium rounded-lg bg-[#3D1A00]/10 text-[#3D1A00] hover:bg-[#3D1A00]/20 disabled:opacity-50 transition-colors"
                    >
                      {promoValidating ? "Перевірка…" : "Застосувати"}
                    </button>
                  </div>
                  {promoError && <p className="text-xs text-red-600 font-['Montserrat']">{promoError}</p>}
                  {appliedPromo && (
                    <p className="text-xs text-green-600 font-['Montserrat']">
                      {appliedPromo.message} (−{appliedPromo.discountAmount.toLocaleString("uk-UA")} грн)
                    </p>
                  )}
                </div>
                {(() => {
                  const subtotal = getSubtotal(items);
                  const deliveryCostVal = deliveryMethod === "nova_poshta_branch" ? DELIVERY_COST_BRANCH : 0;
                  const discount = appliedPromo?.discountAmount ?? 0;
                  const total = Math.max(0, subtotal + deliveryCostVal - discount);
                  return (
                    <div className="space-y-2 font-['Montserrat'] text-[#3D1A00] text-sm">
                      {deliveryMethod === "nova_poshta_branch" && <div className="flex justify-between"><span className="text-gray-600">Доставка у відділення</span><span>100 грн</span></div>}
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Знижка (промокод)</span>
                          <span>−{discount.toLocaleString("uk-UA")} грн</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-1 border-t border-gray-100"><span>Всього:</span><span>{Math.round(total).toLocaleString("uk-UA")} грн</span></div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Обов'язково: Політика конфіденційності (галочка) + Публічна оферта */}
          <div className="pt-6">
            <p className="text-sm font-['Montserrat'] font-semibold text-[#3D1A00] mb-3">Обов&apos;язково:</p>
            <label className="flex items-start gap-3 cursor-pointer group">
              <span
                className={`mt-0.5 w-5 h-5 flex-shrink-0 border rounded-sm transition-colors flex items-center justify-center ${
                  agreedToPolicy
                    ? "bg-[#3D1A00] border-[#3D1A00]"
                    : "border-[#3D1A00]/40 group-hover:border-[#3D1A00]"
                }`}
                onClick={() => setAgreedToPolicy(!agreedToPolicy)}
              >
                {agreedToPolicy && (
                  <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                    <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span
                className="text-[#3D1A00]/80 text-sm font-['Montserrat'] leading-relaxed"
                onClick={() => setAgreedToPolicy(!agreedToPolicy)}
              >
                Я приймаю умови{" "}
                <Link href="/terms-of-service" className="underline hover:text-[#3D1A00] transition-colors">
                  Публічної оферти
                </Link>{" "}
                та надаю згоду на обробку персональних даних згідно з{" "}
                <Link href="/privacy-policy" className="underline hover:text-[#3D1A00] transition-colors">
                  Політикою конфіденційності
                </Link>
              </span>
            </label>
          </div>

          <div className="flex justify-center pt-8 pb-16">
            <button
              type="submit"
              disabled={loading || !agreedToPolicy}
              className="w-full sm:w-auto min-w-[300px] max-w-md py-4 px-10 bg-[#D7D799] hover:bg-[#c5c58a] text-[#3D1A00] font-['Montserrat'] font-semibold uppercase text-base tracking-tight rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Обробка..." : "ОФОРМИТИ ЗАМОВЛЕННЯ"}
            </button>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded text-sm font-['Montserrat'] mb-4"><p className="whitespace-pre-line">{error}</p></div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded text-sm font-['Montserrat'] mb-4">{success}</div>}
          </form>
        </>
      )}
    </section>
  );
}

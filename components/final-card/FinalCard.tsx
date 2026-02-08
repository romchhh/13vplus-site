"use client";

import { useEffect, useState } from "react";
import { useBasket } from "@/lib/BasketProvider";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Mousewheel } from "swiper/modules";
import "swiper/css/scrollbar";
import LoginModal from "@/components/auth/LoginModal";

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
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountPromoModalOpen, setIsAccountPromoModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // При переході на сторінку оформлення — показати модалку «Маєте акаунт?» гостям з товарами в кошику
  useEffect(() => {
    if (!mounted || status === "loading") return;
    if (!session && items.length > 0) {
      setIsAccountPromoModalOpen(true);
    }
  }, [mounted, status, session, items.length]);

  // CUSTOMER
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("nova_poshta_branch");
  const [city, setCity] = useState("");
  const [postOffice, setPostOffice] = useState("");
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
  const [bonusPercentFromLoyalty, setBonusPercentFromLoyalty] = useState(3);

  // Fetch loyalty tier for bonus % when logged in
  useEffect(() => {
    if (session?.user?.email) {
      fetch("/api/users/loyalty")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.bonusPercent != null) setBonusPercentFromLoyalty(Number(data.bonusPercent));
        })
        .catch(() => {});
    } else {
      setBonusPercentFromLoyalty(3);
    }
  }, [session?.user?.email]);

  // Form validation states
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    postOffice?: string;
    paymentType?: string;
  }>({});

  // Real-time validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Ім'я та прізвище обов'язкові";
    }
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return "Введіть ім'я та прізвище повністю";
    }
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

  // Handle field changes with validation
  const handleNameChange = (value: string) => {
    setCustomerName(value);
    if (value) {
      const error = validateName(value);
      setFieldErrors((prev) => ({ ...prev, name: error || undefined }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
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
      !customerName ||
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

    const trimmedName = customerName.trim();
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) {
      setError("Введіть ім’я та прізвище повністю.");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Ваш кошик порожній.");
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
    const fullAmount = subtotal;

    try {
      const profileData = session?.user?.email
        ? await fetch("/api/users/profile").then((r) => (r.ok ? r.json() : null))
        : null;
      const userId = profileData?.id ?? null;

      const requestBody = {
        user_id: userId,
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
        
        const { orderId, invoiceUrl, paymentUrl, paymentData } = data;

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

        // Check if payment is required
        const requiresPayment = paymentType !== "crypto";
        const isCryptoPayment = paymentType === "crypto";
        
        // Use invoiceUrl if available (new WayForPay invoice API), otherwise fallback to paymentUrl
        const redirectUrl = invoiceUrl || paymentUrl;
        
        // If payment/invoice URL is provided, redirect to payment gateway
        if (redirectUrl) {
          // Store order info temporarily (don't clear basket yet)
          localStorage.setItem(
            "pendingPayment",
            JSON.stringify({
              orderId,
              paymentType,
            })
          );
          // Store items and customer info for after payment
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
          
          if (invoiceUrl) {
            // For test_payment or WayForPay Invoice API - redirect to success page
            setTimeout(() => {
              window.location.href = invoiceUrl;
            }, paymentType === "test_payment" ? 800 : 1500);
          } else if (isCryptoPayment && paymentUrl) {
            // For Plisio - simple redirect to invoice URL
            setTimeout(() => {
              window.location.href = paymentUrl;
            }, 1500);
          } else if (paymentData && paymentUrl) {
            // Check if this is a CREATE_INVOICE request (to api.wayforpay.com/api)
            if (paymentUrl === "https://api.wayforpay.com/api") {
              // For CREATE_INVOICE, send JSON via fetch and redirect to invoiceUrl
              setTimeout(async () => {
                try {
                  const response = await fetch(paymentUrl, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(paymentData),
                  });

                  const result = await response.json();
                  
                  if (result.reasonCode === "Ok" || result.reasonCode === 1100) {
                    // Redirect to invoice URL
                    if (result.invoiceUrl) {
                      window.location.href = result.invoiceUrl;
                    } else {
                      setError("Не вдалося отримати посилання на оплату");
                      setLoading(false);
                    }
                  } else {
                    setError(result.reason || "Помилка створення рахунку");
                    setLoading(false);
                  }
                } catch (error) {
                  console.error("[FinalCard] Invoice creation error:", error);
                  setError("Помилка створення рахунку. Спробуйте ще раз.");
                  setLoading(false);
                }
              }, 500);
            } else {
              // For regular payment form (to secure.wayforpay.com/pay)
              setTimeout(() => {
                const form = document.createElement("form");
                form.method = "POST";
                form.action = paymentUrl;
                form.acceptCharset = "utf-8";
                
                Object.entries(paymentData).forEach(([key, value]) => {
                  if (Array.isArray(value)) {
                    // For arrays (productName, productCount, productPrice)
                    value.forEach((item, index) => {
                      const input = document.createElement("input");
                      input.type = "hidden";
                      input.name = `${key}[${index}]`;
                      input.value = String(item);
                      form.appendChild(input);
                    });
                  } else {
                    // For regular fields
                    const input = document.createElement("input");
                    input.type = "hidden";
                    input.name = key;
                    input.value = String(value);
                    form.appendChild(input);
                  }
                });
                
                document.body.appendChild(form);
                form.submit();
              }, 1500);
            }
          } else {
            // Fallback - simple redirect
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1500);
          }
        } else if (requiresPayment && !redirectUrl) {
          // Payment required but not created - show error
          setError(
            data.message || 
            "Не вдалося створити платіж. Будь ласка, спробуйте ще раз або зв'яжіться з нами."
          );
          setLoading(false);
        } else if (isCryptoPayment && !redirectUrl) {
          // Crypto payment failed to create
          setError(
            data.message || 
            "Не вдалося створити платіж криптовалютою. Будь ласка, спробуйте ще раз або зв'яжіться з нами."
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
      
      // If status=failed from Plisio, show error
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

  // Автозаповнення полів з профілю користувача
  useEffect(() => {
    if (session?.user?.email && status === "authenticated") {
      fetch("/api/users/profile")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            if (data.name) setCustomerName(data.name);
            if (data.email) setEmail(data.email);
            if (data.phone) setPhoneNumber(data.phone);
            if (data.address) {
              const commaIdx = data.address.indexOf(", ");
              if (commaIdx > 0) {
                setCity(data.address.slice(0, commaIdx));
                setPostOffice(data.address.slice(commaIdx + 2));
              }
            }
          }
        })
        .catch(() => {});
    }
  }, [session, status]);

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

  // ⬇️ When order is completed
  if (items.length == 0 && submittedOrder) {
    const { items: orderItems, customer } = submittedOrder;

    return (
      <section className="max-w-[1280px] w-full mx-auto p-6 flex flex-col items-center gap-10">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-normal leading-tight">
            <span className="text-stone-500">Дякуємо за </span>
            <span className="">ваше замовлення!</span>
          </h1>
        </div>

        {/* Layout container */}
        <div className="flex flex-col md:flex-row justify-around gap-10 w-full">
          {/* Vertical Swiper */}
          <div className="w-full md:w-1/2 h-[450px]">
            <Swiper
              direction="vertical"
              modules={[Mousewheel]}
              mousewheel
              spaceBetween={0}
              slidesPerView={2.5}
              className="h-full"
            >
              {orderItems.map((item, idx) => (
                <SwiperSlide key={`${item.id}-${item.size}-${idx}`}>
                  <div className="flex gap-4 items-start p-4 border border-stone-200 rounded">
                    {item.imageUrl ? (
                      <div className="relative w-20 h-28">
                        <Image
                          src={`/api/images/${item.imageUrl}`}
                          alt={item.name}
                          width={80}
                          height={112}
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Фото</span>
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-1">
                      <div className="text-base font-['Helvetica Neue'] ">
                        {item.name}
                      </div>
                      <div className="text-base  font-['Helvetica Neue']">
                        {item.size}
                      </div>
                      {item.color && (
                        <div className="text-base font-['Helvetica Neue']">
                          Колір: {item.color}
                        </div>
                      )}
                      <div className="text-base  font-['Helvetica Neue']">
                        Кількість: {item.quantity}x
                      </div>
                      <div className="text-base text-zinc-600 font-['Helvetica Neue']">
                        {item.discount_percentage ? (
                          <div className="flex items-center gap-2">
                            {/* Discounted price */}
                            <span className="font-medium text-red-600">
                              {(
                                item.price *
                                (1 - item.discount_percentage / 100)
                              ).toFixed(2)}
                              ₴
                            </span>

                            {/* Original (crossed-out) price */}
                            <span className="text-gray-500 line-through">
                              {item.price}₴
                            </span>

                            {/* Optional: show discount percentage */}
                            <span className="text-green-600 text-sm">
                              -{item.discount_percentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">{item.price}₴</span>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Customer Info */}
          {/* Title */}
          <div className="flex flex-col justify-between gap-3">
            <div className="text-3xl  font-normal text-center">
              Дані клієнта
            </div>
            <div className="text-xl font-normal leading-loose w-full md:w-1/3 text-left">
              <p className="flex justify-start gap-3">
                <span className="">Ім’я: </span>
                <span className="text-neutral-400">{customer.name}</span>
              </p>
              {customer.email && (
                <p className="flex justify-start gap-3">
                  <span className="">Email: </span>
                  <span className="text-neutral-400">{customer.email}</span>
                </p>
              )}
              <p className="flex justify-start gap-3">
                <span className="">Телефон: </span>
                <span className="text-neutral-400">{customer.phone}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">Місто: </span>
                <span className="text-neutral-400">{customer.city}</span>
              </p>
              <p className="flex justify-start gap-3">
                <span className="">Відділення: </span>
                <span className="text-neutral-400">{customer.postOffice}</span>
              </p>
              {customer.comment && (
                <p className="flex justify-start gap-3">
                  <span className="">Коментар: </span>
                  <span className="text-neutral-400">{customer.comment}</span>
                </p>
              )}
            </div>
            {/* Back to home */}
            <Link
              href="/"
              className={`w-80 h-16 ${
                "bg-stone-100 text-black"
              } inline-flex justify-center items-center gap-2.5 p-2.5 rounded`}
            >
              <span className=" text-xl font-medium font-['Helvetica Neue'] tracking-tight leading-snug">
                На головну
              </span>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1922px] w-full mx-auto relative overflow-hidden px-4 sm:px-6 lg:px-8">
      {!mounted ? (
        <div className="py-12 px-4 sm:py-20 flex items-center justify-center w-full min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : items.length == 0 ? (
        <div className="py-12 px-4 sm:py-20 flex flex-col items-center gap-10 sm:gap-14 w-full max-w-2xl mx-auto">
          <Image
            src="/images/light-theme/order.svg"
            alt="empty cart icon"
            width={200}
            height={200}
          />
          <span className="text-center text-2xl sm:text-4xl md:text-6xl font-normal font-['Helvetica Neue'] leading-tight sm:leading-[64.93px]">
            Ваш кошик порожній
          </span>
          <Link
            href="/catalog"
            className="bg-stone-900 text-stone-100 w-full sm:w-80 h-14 sm:h-16 px-6 py-3 inline-flex items-center justify-center gap-2.5 text-base sm:text-xl text-center"
          >
            Продовжити покупки
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
            <div className="mt-10 text-center sm:text-left text-3xl sm:text-6xl font-normal font-['Helvetica Neue'] leading-snug sm:leading-[64.93px] mb-5">
              Заповніть всі поля
            </div>

            <div className="w-full sm:w-1/4"></div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-10 sm:gap-50">
            <div className="w-full sm:w-1/3 flex flex-col gap-4">
              {!session && items.length > 0 && (
                <div className="mb-1">
                  <button
                    type="button"
                    onClick={() => setIsAccountPromoModalOpen(true)}
                    className="text-left text-sm text-amber-800 hover:text-amber-900 underline underline-offset-2 transition-colors"
                  >
                    Маєте акаунт? Увійдіть або зареєструйтесь — отримайте знижку 3% на першу покупку.
                  </button>
                </div>
              )}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="name"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                >
                  Ім&apos;я та прізвище <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Напр.: Іван Петренко"
                  className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-black focus:border-transparent"
                  }`}
                  value={customerName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={(e) => {
                    const error = validateName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, name: error || undefined }));
                  }}
                  required
                  autoComplete="name"
                />
                {fieldErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@email.com"
                  className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-black focus:border-transparent"
                  }`}
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={(e) => {
                    const error = validateEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: error || undefined }));
                  }}
                  autoComplete="email"
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="phone"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                >
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="+380 50 123 4567"
                  pattern="^\+?\d{10,15}$"
                  title="Введіть номер телефону у форматі +380xxxxxxxxx"
                  className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.phone
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-black focus:border-transparent"
                  }`}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={(e) => {
                    const error = validatePhone(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, phone: error || undefined }));
                  }}
                  required
                  autoComplete="tel"
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Add delivery method, city, and post office fields */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="deliveryMethod"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                >
                  Спосіб доставки <span className="text-red-500">*</span>
                </label>
                <select
                  id="deliveryMethod"
                  className="border border-gray-300 px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  required
                >
                  <option value="">Оберіть спосіб доставки</option>
                  <option value="nova_poshta_branch">
                    Нова пошта — у відділення
                  </option>
                  <option value="nova_poshta_locker">
                    Нова пошта — у поштомат
                  </option>
                  <option value="nova_poshta_courier">
                    Нова пошта — кур&apos;єром
                  </option>
                  {/* <option value="ukrposhta">Укрпошта</option> */}
                  <option value="showroom_pickup">
                    Самовивіз з шоуруму (13:00–19:00)
                  </option>
                </select>
              </div>

              {deliveryMethod.startsWith("nova_poshta") && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="city"
                      className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                    >
                      {deliveryMethod === "nova_poshta_courier"
                        ? "Місто для доставки кур'єром"
                        : "Місто"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={handleCityChange} // Update city on input change
                      onBlur={(e) => {
                        const error = validateCity(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, city: error || undefined }));
                      }}
                      placeholder="Напр.: Київ"
                      className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                        fieldErrors.city
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-black focus:border-transparent"
                      }`}
                      required
                    />
                    {fieldErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                    )}
                    {loadingCities ? (
                      <p className="text-sm text-gray-500 mt-1">Завантаження міст...</p>
                    ) : (
                      cityListVisible && (
                        <div className="max-h-40 overflow-y-auto shadow-lg rounded-md border border-gray-200 mt-1 bg-white z-10">
                          <ul className="list-none p-0">
                            {filteredCities.map((cityOption, idx) => (
                              <li
                                key={idx}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm sm:text-base transition-colors"
                                onClick={() => handleCitySelect(cityOption)} // Set city on click
                              >
                                {cityOption}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </div>

                  {/* Post Office Input with Autocomplete */}
                  {deliveryMethod === "nova_poshta_courier" ? (
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="postOffice"
                        className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                      >
                        Адреса доставки <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={(e) => handlePostOfficeChangeWithValidation(e.target.value)}
                        onBlur={(e) => {
                          const error = validatePostOffice(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, postOffice: error || undefined }));
                        }}
                        placeholder="Вул. Січових Стрільців, 10, кв. 25"
                        className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                          fieldErrors.postOffice
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-black focus:border-transparent"
                        }`}
                        required
                      />
                      {fieldErrors.postOffice && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.postOffice}</p>
                      )}
                      {fieldErrors.postOffice && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.postOffice}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-0.5">
                        Вкажіть вулицю, будинок та квартиру
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="postOffice"
                        className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                      >
                        {deliveryMethod === "nova_poshta_locker"
                          ? "Поштомат"
                          : "Відділення"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="postOffice"
                        value={postOffice}
                        onChange={handlePostOfficeChange}
                        onBlur={(e) => {
                          const error = validatePostOffice(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, postOffice: error || undefined }));
                        }}
                        placeholder={
                          deliveryMethod === "nova_poshta_locker"
                            ? "Начніть вводити назву поштомата"
                            : "Начніть вводити назву відділення"
                        }
                        className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all ${
                          fieldErrors.postOffice
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-black focus:border-transparent"
                        }`}
                        required
                      />
                      {fieldErrors.postOffice && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.postOffice}</p>
                      )}
                      {loadingPostOffices ? (
                        <p className="text-sm text-gray-500 mt-1">Завантаження відділень...</p>
                      ) : (
                        postOfficeListVisible && (
                          <div className="max-h-40 overflow-y-auto shadow-lg rounded-md border border-gray-200 mt-1 bg-white z-10">
                            <ul className="list-none p-0">
                              {filteredPostOffices.map(
                                (postOfficeOption, idx) => (
                                  <li
                                    key={idx}
                                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm sm:text-base transition-colors"
                                    onClick={() =>
                                      handlePostOfficeSelect(postOfficeOption)
                                    }
                                  >
                                    {postOfficeOption}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </>
              )}

              {deliveryMethod === "showroom_pickup" && (
                <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
                  <p className="font-medium mb-1">Самовивіз з шоуруму</p>
                  <p className="text-xs">13:00–19:00, Київ, вул. Костянтинівська, 21</p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="comment"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700"
                >
                  Коментар
                </label>
                <textarea
                  id="comment"
                  placeholder="Додаткові побажання до замовлення (необов'язково)"
                  className="border border-gray-300 px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none min-h-[80px]"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="paymentType"
                  className="text-sm sm:text-base font-medium font-['Helvetica Neue'] text-gray-700 flex items-center gap-2"
                >
                  <Image
                    src="/images/light-theme/tag.svg"
                    alt="payment tag"
                    width={18}
                    height={18}
                    className="opacity-70"
                  />
                  Спосіб оплати <span className="text-red-500">*</span>
                </label>
                <select
                  id="paymentType"
                  className={`border px-3 py-2.5 text-sm sm:text-base font-normal font-['Helvetica Neue'] rounded-md focus:outline-none focus:ring-2 transition-all bg-white ${
                    fieldErrors.paymentType
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-black focus:border-transparent"
                  }`}
                  value={paymentType}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  onBlur={(e) => {
                    const error = validatePaymentType(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, paymentType: error || undefined }));
                  }}
                  required
                >
                  <option value="">Оберіть спосіб оплати</option>
                  <option value="full">Повна оплата</option>
                  <option value="prepay">Передоплата 200 грн</option>
                  {/* <option value="test_payment">Тест оплата (імітація повної оплати)</option> */}
                  <option value="installment">В розсрочку</option>
                  <option value="crypto">Крипта (USDT, BTC та інші)</option>
                </select>
                {fieldErrors.paymentType && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.paymentType}</p>
                )}
              </div>

              {/* Знижка зареєстрованим (для гостей — модальне вікно по кліку над формою) */}
              {items.length > 0 && session && (() => {
                const percent = bonusPercentFromLoyalty;
                const bonusToEarn = Math.floor((getSubtotal(items) * percent) / 100);
                if (bonusToEarn <= 0) return null;
                return (
                  <div className="rounded-lg px-4 py-3 text-sm bg-green-50 border border-green-200 text-green-800">
                    <p>За цю покупку ви отримаєте знижку <strong>{percent}%</strong> на наступні покупки (еквівалент <strong>{bonusToEarn} ₴</strong>).</p>
                  </div>
                );
              })()}

              <button
                className="bg-black text-white px-4 py-3 rounded-md mt-2 mb-6 font-medium text-sm sm:text-base hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Обробка..." : "Оформити"}
              </button>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-md text-sm mt-2">
                  <p className="font-medium mb-1">Помилка</p>
                  <p className="whitespace-pre-line">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 rounded-md text-sm mt-2">
                  <p className="font-medium">{success}</p>
                </div>
              )}
            </form>
            </div>

            <div className="w-full sm:w-1/4 px-4 sm:px-0 flex flex-col gap-4">
              {items.length === 0 ? (
                <p>Ваш кошик порожній</p>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.id}-${item.size}`}
                    className="flex gap-4 border-b pb-4 last:border-none"
                  >
                    <Image
                      src={
                        item.imageUrl
                          ? `/api/images/${item.imageUrl}`
                          : "https://placehold.co/100x150/cccccc/666666?text=No+Image"
                      }
                      alt={item.name}
                      width={112}
                      height={160}
                      className="w-28 h-40 object-cover"
                    />
                    <div className="flex flex-col justify-between flex-1">
                      <div>
                        <p className="text-base font-medium">{item.name}</p>
                        <div className="text-zinc-600 mt-1">
                          {item.discount_percentage ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-red-600">
                                {(
                                  item.price *
                                  (1 - item.discount_percentage / 100)
                                ).toFixed(2)}
                                ₴
                              </span>
                              <span className="line-through">{item.price}₴</span>
                              <span className="text-green-600 text-sm">
                                -{item.discount_percentage}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">{item.price}₴</span>
                          )}
                        </div>
                        <p className="text-stone-900 mt-1">Розмір: {item.size}</p>
                        {item.color && (
                          <p className="text-stone-900 mt-1">Колір: {item.color}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-400/60 w-24 h-9 justify-between px-2">
                          <button
                            className="text-zinc-500 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={async () => {
                              try {
                                await updateQuantity(item.id, item.size, item.quantity - 1);
                              } catch (error) {
                                console.error("Error updating quantity:", error);
                              }
                            }}
                            aria-label={`Зменшити кількість ${item.name}`}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
                          <button
                            className="text-zinc-500 text-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                            onClick={async () => {
                              try {
                                await updateQuantity(item.id, item.size, item.quantity + 1);
                              } catch (error) {
                                setError(
                                  error instanceof Error
                                    ? error.message
                                    : "Недостатньо товару в наявності"
                                );
                                setTimeout(() => setError(null), 5000);
                              }
                            }}
                            aria-label={`Збільшити кількість ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="text-red-600 text-xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center"
                          onClick={() => removeItem(item.id, item.size)}
                          aria-label={`Видалити ${item.name} з кошика`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Total price container */}
              <div className="pt-2 mt-2 mb-6 md:mb-0 space-y-2">
                <div className="flex justify-between items-center text-base text-gray-600">
                  <span>Сума товарів</span>
                  <span className="font-medium text-gray-800">{getSubtotal(items).toFixed(2)} ₴</span>
                </div>
                {session && bonusPercentFromLoyalty > 0 && items.length > 0 && (() => {
                  const sub = getSubtotal(items);
                  const loyaltyDiscount = Math.round((sub * bonusPercentFromLoyalty) / 100 * 100) / 100;
                  if (loyaltyDiscount <= 0) return null;
                  return (
                    <div className="flex justify-between items-center gap-2 py-1.5 text-sm">
                      <span className="font-medium text-emerald-800">
                        Знижка по програмі лояльності ({bonusPercentFromLoyalty}%)
                      </span>
                      <span className="font-semibold text-emerald-700 whitespace-nowrap">
                        −{loyaltyDiscount.toFixed(2)} ₴
                      </span>
                    </div>
                  );
                })()}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-semibold text-gray-900">До сплати</span>
                  <span className="text-xl font-bold text-[#8C7461] whitespace-nowrap">
                    {session && bonusPercentFromLoyalty > 0 && items.length > 0
                      ? (Math.round((getSubtotal(items) * (1 - bonusPercentFromLoyalty / 100)) * 100) / 100).toFixed(2)
                      : getSubtotal(items).toFixed(2)}{" "}
                    ₴
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Модальне вікно: Маєте акаунт? + знижка 3% */}
      {isAccountPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setIsAccountPromoModalOpen(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Маєте акаунт?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Увійдіть, щоб автоматично заповнити дані та відстежувати замовлення.
              </p>
              <p className="text-gray-600 text-sm mb-5">
                Не втратьте знижку <strong className="text-amber-700">3%</strong> за першу покупку — увійдіть або зареєструйтесь, щоб отримувати знижки.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountPromoModalOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="flex-1 bg-black text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
                >
                  Увійти або зареєструватися
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccountPromoModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Продовжити без входу
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} redirectAfterLogin="/final" />
    </section>
  );
}

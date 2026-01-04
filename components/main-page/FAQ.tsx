"use client";

import { useState, useEffect, useRef } from "react";

export default function FAQ() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute("data-index") || "0");
          setVisibleItems((prev) => new Set(prev).add(index));
        }
      });
    }, observerOptions);

    // Observe title
    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

    // Observe FAQ items
    itemsRef.current.forEach((item) => {
      if (item) {
        observer.observe(item);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const faqItems = [
    {
      number: "01",
      title: "Оплата | 13VPLUS",
      content: `Оплата товарів на нашому сайті доступна через банківські картки, Apple Pay та PayPal, оплата на Crypto-гаманець та розстрочка на 3–4 платежі.

Для товарів з наших колекцій доступні варіанти оплати:
— Передоплата 50% (після підтвердження наявності товару)
— Повна оплата

Усі деталі щодо оплати уточнюються після оформлення замовлення нашим менеджером.`,
    },
    {
      number: "02",
      title: "Відправка замовлення | 13VPLUS",
      content: `Відправка замовлень здійснюється в робочі дні (понеділок - п'ятниця) після підтвердження замовлення та оплати.

Терміни відправки:
— Готові товари з колекції: 1-3 робочі дні після оплати
— Індивідуальний пошив: 7-14 робочих днів після оплати (залежить від складності)

Після відправки замовлення ви отримаєте SMS та email з трек-номером для відстеження посилки. Усі деталі щодо відправки уточнюються після оформлення замовлення нашим менеджером.`,
    },
    {
      number: "03",
      title: "Доставка | 13VPLUS",
      content: `Вартість доставки по Україні через службу "Нова Пошта" розраховується з урахуванням декількох параметрів - параметри та вага відправлення і наявності додаткових платних послуг і сервісів.
Термін обробки замовлення становить 1-2 робочі дні. Формування та відправка замовлень здійснюється в понеділок, середу та пʼятницю.

Якщо Ваше замовлення оформлене на подарунок, ми з радістю додамо подарункове упакування БЕЗКОШТОВНО. Лише сповістіть нас про це. Також до кожного замовлення додаємо іменну листівку. 
Якщо Ваше замовлення було оформлено у вихідний або святковий день або в неробочий час - воно буде відправлене у найближчій відправці.

Доставка товару під замовлення триває орієнтовно 15-20 робочих днів. 

Замовлення оформляємо після передоплати 50%. У разі відмови передоплата не повертається.`,
    },
    {
      number: "04",
      title: "Обмін та повернення | 13VPLUS",
      content: `У разі необхідності Ви можете обміняти або повернути товар протягом 14-ти календарних днів з моменту його отримання.

Обмін і повернення товару можливо у випадку, якщо збережено його товарний вигляд, фабричні ярлики, етикетки, коробку. Товар, що був у використанні НЕ підлягає поверненню та обміну.

Зв'яжіться з нами в месенджері, з запитом на обмін/повернення (Viber, Telegram, Instagram).

Відправте товар Новою поштою за адресою, що вкаже менеджер Вам у повідомленні. Після відправки повідомте будь ласка номер ТТН. 
Обмін або ж повернення товару за рахунок відправника.

Після схвалення повернення ми перерахуємо кошти автоматично Вам на карту в термін до 5 банківських днів.

Після схвалення обміну, ми створюємо нове замовлення і формуємо відправку.

Термін схвалення обміну або повернення становить до 3-ох робочих днів з моменту отримання на склад поверненого товару.`,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="payment-and-delivery"
      className="scroll-mt-20 max-w-[1920px] w-full mx-auto bg-black py-16 lg:py-24 px-6 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
        {/* Left side - Title */}
        <div
          ref={titleRef}
          data-index={0}
          className={`lg:w-96 transition-all duration-1000 ease-out ${
            visibleItems.has(0)
              ? "opacity-100 translate-x-0 translate-y-0 scale-100"
              : "opacity-0 -translate-x-20 translate-y-10 scale-95"
          }`}
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-white leading-tight mb-6">
            <span className="inline-block transition-all duration-700 delay-100">
              Ви часто
            </span>
            <br />
            <span className="inline-block transition-all duration-700 delay-200">
              запитуєте
            </span>
          </h2>
          <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed transition-all duration-1000 delay-300">
            Зібрали найпоширеніші запитання наших відвідувачів
          </p>
        </div>

        {/* Right side - Accordion */}
        <div className="flex-1 max-w-4xl">
          {faqItems.map((item, index) => {
            const itemIndex = index + 1;
            const isVisible = visibleItems.has(itemIndex);
            
            // Різні напрямки анімації для кожного елемента
            const getAnimationClass = () => {
              if (isVisible) {
                return "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0";
              }
              
              // Різні напрямки для різних елементів
              switch (index % 4) {
                case 0: // Зправа
                  return "opacity-0 translate-x-32 translate-y-0 scale-95";
                case 1: // Зліва
                  return "opacity-0 -translate-x-32 translate-y-0 scale-95";
                case 2: // Знизу
                  return "opacity-0 translate-x-0 translate-y-20 scale-95";
                case 3: // Зверху з поворотом
                  return "opacity-0 translate-x-0 -translate-y-20 scale-95 rotate-2";
                default:
                  return "opacity-0 translate-x-0 translate-y-10 scale-95";
              }
            };
            
            return (
              <div
                key={index}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                data-index={itemIndex}
                className={`border-b border-white/10 last:border-b-0 transition-all duration-700 ease-out ${getAnimationClass()}`}
                style={{
                  transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
                }}
              >
                <button
                  onClick={() => toggleAccordion(itemIndex)}
                  className="w-full flex items-center justify-between py-6 lg:py-8 gap-4 text-left group bg-black hover:bg-gray-800 hover:shadow-md transition-all duration-300 rounded-lg px-4 -mx-4 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center gap-6 lg:gap-10">
                    <span className="text-2xl lg:text-3xl font-bold font-['Montserrat'] text-white group-hover:scale-110 transition-all duration-300 inline-block">
                      {item.number}
                    </span>
                    <h3 className="text-lg lg:text-2xl font-medium font-['Montserrat'] text-white group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-300">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-2xl lg:text-3xl font-light font-['Montserrat'] text-white/60 group-hover:text-white group-hover:scale-125 group-hover:rotate-90 transition-all duration-300 inline-block">
                    {openAccordion === itemIndex ? "−" : "+"}
                  </span>
                </button>

                {/* Accordion content */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openAccordion === itemIndex
                      ? "max-h-[2000px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-4"
                  }`}
                >
                  <div className="pb-6 lg:pb-8 pl-0 lg:pl-20 text-base lg:text-lg font-normal font-['Montserrat'] text-white/70 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

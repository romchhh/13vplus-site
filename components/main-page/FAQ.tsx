"use client";

import { useState } from "react";

export default function FAQ() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const faqItems = [
    {
      number: "01",
      title: "Оплата | 13VPLUS",
      content: `Штани з корегуванням параметрів. Ми надаємо можливість легкого корегування штанів за талією та довжиною. Такі вироби виготовляються виключно за попередньою домовленістю та потребують 100% оплати перед початком роботи.

Готові колекції. Для товарів з наших колекцій доступні два варіанти оплати:
— Передплата 300 грн (після підтвердження наявності товару)
— Повна оплата

Усі деталі щодо оплати уточнюються після оформлення замовлення нашим менеджером.`,
    },
    {
      number: "02",
      title: "Доставка | 13VPLUS",
      content: `Вартість доставки по Україні через службу "Нова Пошта" розраховується з урахуванням декількох параметрів - параметри та вага відправлення і наявності додаткових платних послуг і сервісів.
Термін обробки замовлення становить 1-2 робочі дні. Формування та відправка замовлень здійснюється в понеділок, середу та пʼятницю.

Якщо Ваше замовлення оформлене на подарунок, ми з радістю додамо подарункове упакування БЕЗКОШТОВНО. Лише сповістіть нас про це. Також до кожного замовлення додаємо іменну листівку. 
Якщо Ваше замовлення було оформлено у вихідний або святковий день або в неробочий час - воно буде відправлене у найближчій відправці.

Оплата товарів на нашому сайті доступна через банківські картки, Apple Pay та PayPal, оплата на Crypto-гаманець та розстрочка на 3–4 платежі

Доставка товару під замовлення триває орієнтовно 15-20 робочих днів. 

Замовлення оформляємо після передоплати 50%. У разі відмови передоплата не повертається.`,
    },
    {
      number: "03",
      title: "Повернення | 13VPLUS",
      content: `У разі необхідності Ви можете обміняти або повернути товар протягом 14-ти календарних днів з моменту його отримання.

Обмін і повернення товару можливо у випадку, якщо збережено його товарний вигляд, фабричні ярлики, етикетки, коробку. Товар, що був у використанні НЕ підлягає поверненню та обміну.

Зв'яжіться з нами в месенджері, з запитом на обмін/повернення (Viber, Telegram, Instagram).

Відправте товар Новою поштою за адресою, що вкаже менеджер Вам у повідомленні. Після відправки повідомте будь ласка номер ТТН. 
Обмін або ж повернення товару за рахунок відправника.

Після схвалення повернення ми перерахуємо кошти автоматично Вам на карту в термін до 5 банківських днів.

Після схвалення обміну, ми створюємо нове замовлення і формуємо відправку.

Термін схвалення обміну або повернення становить до 3-ох робочих днів з моменту отримання на склад поверненого товару.`,
    },
    {
      number: "04",
      title: "Відправка замовлення | 13VPLUS",
      content: `Відправка замовлень здійснюється в робочі дні (понеділок - п'ятниця) після підтвердження замовлення та оплати.

Терміни відправки:
— Готові товари з колекції: 1-3 робочі дні після оплати
— Індивідуальний пошив: 7-14 робочих днів після оплати (залежить від складності)

Після відправки замовлення ви отримаєте SMS та email з трек-номером для відстеження посилки. Усі деталі щодо відправки уточнюються після оформлення замовлення нашим менеджером.`,
    },
  ];

  return (
    <section
      id="payment-and-delivery"
      className="scroll-mt-20 max-w-[1920px] w-full mx-auto bg-white py-16 lg:py-24 px-6"
    >
      <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
        {/* Left side - Title */}
        <div className="lg:w-96">
          <h2 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black leading-tight mb-6">
            Ви часто
            <br />
            запитуєте
          </h2>
          <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
            Зібрали найпоширеніші запитання наших відвідувачів
          </p>
        </div>

        {/* Right side - Accordion */}
        <div className="flex-1 max-w-4xl">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border-b border-black/10 last:border-b-0"
            >
              <button
                onClick={() => toggleAccordion(index + 1)}
                className="w-full flex items-center justify-between py-6 lg:py-8 gap-4 text-left group"
              >
                <div className="flex items-center gap-6 lg:gap-10">
                  <span className="text-2xl lg:text-3xl font-bold font-['Montserrat'] text-black/40">
                    {item.number}
                  </span>
                  <h3 className="text-lg lg:text-2xl font-medium font-['Montserrat'] text-black">
                    {item.title}
                  </h3>
                </div>
                <span className="text-2xl lg:text-3xl font-light font-['Montserrat'] text-black/60 group-hover:text-black transition-colors">
                  {openAccordion === index + 1 ? "−" : "+"}
                </span>
              </button>

              {/* Accordion content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openAccordion === index + 1 ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pb-6 lg:pb-8 pl-0 lg:pl-20 text-base lg:text-lg font-normal font-['Montserrat'] text-black/70 leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

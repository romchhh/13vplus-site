"use client";

import { useRef, useState } from "react";

export default function InfoPage() {
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const [firstVideoStarted, setFirstVideoStarted] = useState(false);

  const handleFirstVideoPlay = () => {
    const video = firstVideoRef.current;
    if (!video) return;
    video.muted = false;
    video.play().catch(() => {});
    setFirstVideoStarted(true);
  };

  const handleFirstVideoEnded = () => {
    const video = firstVideoRef.current;
    if (!video) return;
    video.muted = true;
    video.currentTime = 0;
    setFirstVideoStarted(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Перше відео — без рамки програвача, клік для перегляду зі звуком */}
      <section className="max-w-[1920px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-8 flex flex-col items-center">
        <div
          className="relative w-full lg:max-w-4xl cursor-pointer group"
          style={{ maxHeight: "80vh" }}
          onClick={!firstVideoStarted ? handleFirstVideoPlay : undefined}
        >
          <video
            ref={firstVideoRef}
            src="/images/IMG_9023.webm"
            playsInline
            muted
            className="w-full h-auto max-h-[80vh] object-contain block"
            aria-label="13VPLUS"
            onEnded={handleFirstVideoEnded}
          />
          {!firstVideoStarted && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"
              aria-hidden
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-black/50 mt-2 font-['Montserrat']">Натисніть на відео для перегляду зі звуком</p>
      </section>

      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-20 text-center">
        {/* ДОСТАВКА ТА ОПЛАТА ПО УКРАЇНІ */}
        <section id="dostavka-ukraina" className="mb-16 lg:mb-24">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-8">
            Доставка та оплата по Україні
          </h2>
          <div className="grid gap-8 lg:grid-cols-1">
            <div className="p-6 lg:p-8 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-black">Нова Пошта</h3>
              <ul className="text-black/80 space-y-1 text-sm lg:text-base list-inside mx-auto">
                <li>• Доставка у відділення</li>
                <li>• Адресна доставка</li>
                <li><strong>Строки доставки:</strong> 2–4 дні</li>
                <li><strong>Оплата доставки:</strong> за рахунок отримувача</li>
              </ul>
            </div>
            <div className="p-6 lg:p-8 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-black">13 V PLUS — самовивіз</h3>
              <p className="text-black/80"><strong>Адреса:</strong> м. Київ, вул. Щербаківського, 45А</p>
              <p className="text-black/80"><strong>Оплата:</strong> готівковий та безготівковий розрахунок</p>
            </div>
            <div className="p-6 lg:p-8 rounded-xl">
              <p className="text-black/80 font-medium">Накладений платіж. Мінімальна передоплата — 300 грн.</p>
            </div>
          </div>
        </section>

        {/* ДОСТАВКА ТА ОПЛАТА В ІНШІ КРАЇНИ */}
        <section id="dostavka-mizhnarodna" className="mb-16 lg:mb-24">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-8">
            Доставка та оплата в інші країни
          </h2>
          <div className="p-6 lg:p-8 rounded-xl space-y-4 text-black/80">
            <p>Здійснюється міжнародною поштою. Вартість доставки: 1 кг — 15 $. Кожен наступний кілограм +10 $. Орієнтовні терміни доставки — 15–20 днів. За потреби можлива термінова доставка DHL (умови обговорюємо індивідуально).</p>
            <p className="font-semibold text-black">Повна оплата замовлення.</p>
            <p className="font-semibold text-red-700">У Росію та Білорусь доставки немає.</p>
          </div>
        </section>

        {/* ОБМІН ТА ПОВЕРНЕННЯ ТОВАРУ */}
        <section id="obmin-povernennya" className="mb-16 lg:mb-24">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-8">
            Обмін та повернення товару
          </h2>
          <div className="p-6 lg:p-8 rounded-xl space-y-4 text-black/80">
            <p>Обмін або повернення товару можливе протягом <strong>14 календарних днів</strong> з моменту отримання замовлення.</p>
            <p>Обмін та повернення здійснюються, якщо: товар не був у вжитку, збережений товарний вигляд, споживчі властивості, пломби, фабричні ярлики, оригінальна упаковка, відсутність слідів носіння, плям та інших забруднень, а також за наявності документа, що підтверджує факт покупки.</p>
            <p>Для оформлення обміну або повернення товару належної якості напишіть нам — ми надішлемо вам форму для заповнення.</p>
          </div>
        </section>

        {/* ПРОЦЕДУРА ПОВЕРНЕННЯ ТА ОБМІНУ */}
        <section className="mb-16 lg:mb-24">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-8">
            Процедура повернення та обміну
          </h2>
          <div className="p-6 lg:p-8 rounded-xl space-y-4 text-black/80">
            <p>Ви можете самостійно привезти товар до нас у магазин за адресою м. Київ, вул. Щербаківського, 45А — за попереднім записом.</p>
            <p>По Україні обмін можливий за допомогою компанії-перевізника «Нова Пошта». Для оформлення обміну або повернення заповніть форму для повернення, де потрібно вказати: ваше ПІБ, контактний номер, причину повернення, нік при оформленні замовлення та банківську карту, на яку буде зроблено повернення коштів.</p>
            <p>Обміняти чи повернути товар можна протягом <strong>14 днів</strong> з моменту отримання товару.</p>
            <p className="font-semibold text-black">Важливо! Усі затрати, повʼязані з поверненням чи обміном товару, сплачує покупець.</p>
            <p>Повернення коштів проводиться протягом <strong>1–7 банківських днів</strong> з моменту отримання товару.</p>
          </div>
        </section>

        {/* На рахунок оплати */}
        <section className="mb-16 lg:mb-24">
          <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-8">
            На рахунок оплати
          </h2>
          <div className="p-6 lg:p-8 rounded-xl space-y-4 text-black/80">
            <p>У нас є накладний платіж при мінімальній передоплаті 200 грн.</p>
            <p>Речі індивідуального пошиву — лише при повній оплаті.</p>
            <p>Завжди вам вигідніше оплатити повну суму — так ви не сплачуєте комісію за переказ коштів на пошті.</p>
            <p className="pt-4 font-['Montserrat']">З любов&apos;ю ваш <a href="https://www.instagram.com/13vplus" target="_blank" rel="noopener noreferrer" className="text-black font-semibold underline hover:no-underline">@13vplus</a></p>
          </div>
        </section>
      </div>

      {/* Друге відео — на чорному фоні */}
      <section className="w-full bg-black py-8 sm:py-12 px-4 sm:px-6 flex justify-center items-center min-h-[50vh]">
        <video
          src="/images/IMG_8370.webm"
          autoPlay
          muted
          loop
          playsInline
          className="w-full lg:max-w-4xl h-auto max-h-[80vh] object-contain"
          aria-label="13VPLUS"
        />
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Договір публічної оферти | 13VPLUS",
  description: "Договір публічної оферти 13VPLUS",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <Link
            href="/"
            className="inline-block mb-8 text-lg opacity-60 hover:opacity-100 transition-opacity duration-300"
          >
            ← На головну
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            Договір публічної оферти
          </h1>
          <div className="w-20 h-1 bg-black mt-6"></div>
        </div>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg opacity-80">
              Прочитайте текст цього Договору публічної оферти, надалі – &quot;Договір&quot;,
              і якщо Ви не згодні з яким-небудь його пунктом, чи не зрозуміли будь-який пункт
              Договору, пропонуємо Вам відмовитися від купівлі товару.
            </p>
            <p className="opacity-80">
              У випадку прийняття умов Договору, Ви погоджуєтеся з усіма його умовами і
              підтверджуєте, що Вам зрозумілі всі його положення.
            </p>
            <p className="opacity-80">
              Ця угода носить характер публічної оферти, є еквівалентом &quot;усної угоди&quot;
              і відповідно до чинного законодавства України має належну юридичну силу.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Визначення термінів
            </h2>
            <div className="space-y-4">
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">Сайт</p>
                <p className="text-sm opacity-70">
                  Веб-сайт, що розміщений в мережі Інтернет за адресою:
                  https://13vplus.com, включаючи всі його веб-сторінки.
                </p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">Товар</p>
                <p className="text-sm opacity-70">
                  Товари, зображення та/або опис яких розміщено на Сайті.
                </p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">Публічна оферта</p>
                <p className="text-sm opacity-70">
                  Спрямована невизначеному колу осіб публічна
                  пропозиція Продавця, що стосується укладення договору купівлі-продажу Товарів.
                </p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">Користувач/Покупець</p>
                <p className="text-sm opacity-70">
                  Особа, що переглядає інформацію на Сайті
                  та/або замовляє, та/або отримує Товари.
                </p>
              </div>
              <div className="p-5 border border-black/10 rounded-lg space-y-2">
                <p className="font-semibold">Замовлення</p>
                <p className="text-sm opacity-70">
                  Належним чином оформлений та розміщений запит
                  Користувача на здійснення купівлі обраних ним Товарів.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              1. Загальні положення
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Цей Договір є договором публічної оферти, його умови однакові для всіх
                  Користувачів/Покупців незалежно від статусу.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  У разі прийняття умов цього Договору, тобто Публічної оферти Продавця, Користувач
                  стає Покупцем.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">2. Предмет договору</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Продавець зобов&apos;язується передати у власність Покупцеві Товар, а Покупець
                  зобов&apos;язується оплатити та прийняти Товар на умовах цього Договору.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">Договір поширюється на всі види Товарів і послуг, що представлені на Сайті.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">3. Порядок оформлення Замовлення</h2>
            <div className="space-y-3">
              <p className="opacity-80">
                Представлені фото-зразки містять один або більше видів Товару певного артикулу та
                текстову інформацію про артикул, доступні розміри, ціну.
              </p>
              <p className="opacity-80">
                Відомості, розміщені на сайті мають виключно інформативний характер.
              </p>
              <p className="opacity-80">
                Користувач/Покупець має самостійно оформити Замовлення на будь-який Товар, який
                є доступним для замовлення на Сайті.
              </p>
              <p className="opacity-80">
                У разі відсутності замовленого Товару, Продавець має право виключити зазначений
                Товар із Замовлення.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">4. Ціна і порядок оплати</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Ціна кожного окремого Товару визначається Продавцем і вказується на Сайті.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Ціна Договору дорівнює ціні Замовлення. Сума Замовлення може змінюватися в
                  залежності від ціни, кількості або номенклатури Товару.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Покупець здійснює оплату Товару згідно Замовлення. Покупець самостійно вибирає
                  один з таких способів оплати: готівковий розрахунок або безготівковий розрахунок.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">Оплата Товару здійснюється виключно у гривні.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">5. Доставка Товару</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Доставка виконується силами Продавця або службами доставки по території України
                  за рахунок Покупця.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Загальний термін доставки Товару складається з терміну обробки Замовлення і строку
                  доставки. Термін обробки Замовлення – від одного робочого дня до трьох.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  При отриманні Товару Одержувач зобов&apos;язаний перевірити Товар за кількістю,
                  якістю, асортиментом та комплектністю.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">6. Повернення Товару</h2>
            <div className="p-5 border border-black/10 rounded-lg space-y-3">
              <p className="opacity-80">
                Повернення Товару належної якості здійснюється відповідно до Закону України
                «Про захист прав споживачів».
              </p>
              <p className="opacity-80">
                Покупець має право відмовитися від поставленого Товару належної якості протягом
                14 (чотирнадцяти) днів з моменту отримання Товару виключно за умови, що збережено
                товарний вид, споживчі властивості Товару, фабричну упаковку, ярлики та розрахунковий
                документ.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">7. Права та обов&apos;язки Продавця</h2>
            <div>
              <p className="font-semibold mb-3">Продавець має право:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 border-l-2 border-black/20">
                  <p className="text-sm opacity-70">
                    В односторонньому порядку призупинити продаж Товарів у випадку порушення
                    Користувачем/Покупцем умов
                  </p>
                </div>
                <div className="p-4 border-l-2 border-black/20">
                  <p className="text-sm opacity-70">На власний розсуд змінювати ціну на Товари</p>
                </div>
                <div className="p-4 border-l-2 border-black/20 md:col-span-2">
                  <p className="text-sm opacity-70">
                    У разі відсутності замовлених Товарів, виключити зазначений Товар із Замовлення
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">8. Права та обов&apos;язки Покупця</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">Користувач/Покупець має право:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 border-l-2 border-black/20">
                    <p className="text-sm opacity-70">Обрати Товари, оформлювати та направляти Замовлення</p>
                  </div>
                  <div className="p-4 border-l-2 border-black/20">
                    <p className="text-sm opacity-70">Вимагати від Продавця виконання умов та обов&apos;язків</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-3">Користувач/Покупець зобов&apos;язується:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 border-l-2 border-black/20">
                    <p className="text-sm opacity-70">
                      Належним чином оплатити та отримати оформлене Замовлення
                    </p>
                  </div>
                  <div className="p-4 border-l-2 border-black/20">
                    <p className="text-sm opacity-70">
                      Надати Продавцю повну інформацію, що необхідна для здійснення доставки Замовлення
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">9. Термін дії Договору</h2>
            <div className="p-5 border-l-4 border-black/30">
              <p className="opacity-80">
                Цей Договір набирає чинності з дня оформлення Замовлення або реєстрації
                Користувача/Покупця на Сайті і діє до виконання всіх умов Договору.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">10. Реквізити</h2>
            <div className="bg-black/5 p-8 rounded-2xl border border-black/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">Отримувач</p>
                  <p className="text-sm opacity-90">ФОП Романець Микола Миколайович</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">ІПН/ЄДРПОУ</p>
                  <p className="text-sm opacity-90">3357714797</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold mb-2 opacity-60">IBAN</p>
                  <p className="text-sm opacity-90">UA353220010000026007320071773</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">Акціонерне товариство</p>
                  <p className="text-sm opacity-90">УНІВЕРСАЛ БАНК</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">МФО</p>
                  <p className="text-sm opacity-90">322001</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">ЄДРПОУ Банку</p>
                  <p className="text-sm opacity-90">21133352</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10">
            <p className="text-sm opacity-50">
              Дата останнього оновлення: 27 жовтня 2025 року
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

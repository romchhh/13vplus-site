import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Політика конфіденційності | 13VPLUS",
  description: "Політика конфіденційності персональних даних 13VPLUS",
};

export default function PrivacyPolicyPage() {
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
            Політика конфіденційності
          </h1>
          <div className="w-20 h-1 bg-black dark:bg-white mt-6"></div>
        </div>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed">
          <section className="space-y-4">
            <p className="text-lg opacity-80">
              Ця Політика конфіденційності персональних даних (далі – Політика
              конфіденційності) діє щодо всієї інформації, яку Інтернет-магазин
              «13VPLUS», може отримати про Користувача під час використання сайту
              Інтернет-магазину, програм та продуктів Інтернет-магазину.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">1. ВИЗНАЧЕННЯ ТЕРМІНІВ</h2>
            <p className="opacity-70">
              У цій Політиці конфіденційності використовуються такі терміни:
            </p>
            <div className="space-y-5 mt-6">
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">Адміністрація сайту Інтернет-магазину</p>
                <p className="opacity-70 text-sm">
                  Уповноважені співробітники на управління сайтом, що діють від імені інтернет-магазину,
                  які організовують та здійснює обробку персональних даних, а також визначає
                  цілі обробки персональних даних, склад персональних даних, що підлягають
                  обробці, дії чи операції, що здійснюються з персональними даними.
                </p>
              </div>
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">Персональні дані</p>
                <p className="opacity-70 text-sm">
                  Будь-яка інформація, що відноситься до
                  прямо чи опосередковано визначеної чи визначеної фізичної особи (суб&apos;єкта
                  персональних даних).
                </p>
              </div>
              <div className="pl-6 border-l-2 border-black/10 dark:border-white/10">
                <p className="font-semibold mb-2">Обробка персональних даних</p>
                <p className="opacity-70 text-sm">
                  Будь-яка дія (операція) або
                  сукупність дій (операцій), що здійснюються з використанням засобів
                  автоматизації або без використання таких засобів з персональними даними,
                  включаючи збирання, записування, систематизацію, накопичення, зберігання,
                  уточнення (оновлення, зміну), вилучення, використання, передачу
                  (поширення, надання, доступ), знеособлення, блокування, видалення, знищення
                  персональних даних.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              2. ЗАГАЛЬНІ ПОЛОЖЕННЯ
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Використання Користувачем сайту Інтернет-магазину означає згоду з цією
                  Політикою конфіденційності та умовами обробки персональних даних Користувача.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  У разі незгоди з умовами Політики конфіденційності Користувач повинен припинити
                  використання веб-сайту Інтернет-магазину.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Ця Політика конфіденційності застосовується лише до сайту
                  Інтернет-магазину. Інтернет-магазин не контролює та не несе відповідальності
                  за сайти третіх осіб, на які Користувач може перейти за посиланнями, доступними
                  на сайті Інтернет-магазину.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl leading-none mt-1">•</span>
                <span className="opacity-80">
                  Адміністрація сайту не перевіряє достовірність персональних даних, які надає
                  Користувач сайту Інтернет-магазину.
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              3. ПРЕДМЕТ ПОЛІТИКИ КОНФІДЕНЦІЙНОСТІ
            </h2>
            <div className="space-y-4">
              <p className="opacity-80">
                Ця Політика конфіденційності встановлює зобов&apos;язання Адміністрації сайту
                інтернет-магазину щодо нерозголошення та забезпечення режиму захисту конфіденційності
                персональних даних, які Користувач надає на запит Адміністрації сайту при реєстрації
                на сайті інтернет-магазину або при оформленні замовлення на придбання Товару.
              </p>
              <p className="opacity-80">
                Персональні дані, дозволені для обробки в рамках цієї Політики конфіденційності,
                надаються Користувачем шляхом заповнення реєстраційної форми на Сайті
                інтернет-магазину та включають наступну інформацію:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">ПІБ Користувача</p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">Контактний телефон</p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">E-mail адреса</p>
                </div>
                <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg">
                  <p className="text-sm opacity-70">Адреса доставки</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              4. ЦІЛІ ЗБОРУ ПЕРСОНАЛЬНОЇ ІНФОРМАЦІЇ КОРИСТУВАЧА
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Ідентифікація Користувача</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Надання персоналізованих ресурсів</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Встановлення зворотного зв&apos;язку</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Підтвердження достовірності даних</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Створення облікового запису</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Повідомлення про стан Замовлення</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Оброблення платежів</p>
              </div>
              <div className="p-4 border-l-2 border-black/20 dark:border-white/20">
                <p className="text-sm opacity-80">Клієнтська підтримка</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              5. СПОСОБИ ТА ТЕРМІНИ ОБРОБКИ ПЕРСОНАЛЬНОЇ ІНФОРМАЦІЇ
            </h2>
            <div className="space-y-4">
              <p className="opacity-80">
                Обробка персональних даних Користувача здійснюється без обмеження строку
                будь-яким законним способом.
              </p>
              <p className="opacity-80">
                Користувач погоджується з тим, що Адміністрація сайту має право передавати
                персональні дані третім особам, зокрема кур&apos;єрським службам, організаціям
                поштового зв&apos;язку, виключно з метою виконання замовлення.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">6. ОБОВ&apos;ЯЗКИ СТОРІН</h2>
            <div className="space-y-6">
              <div>
                <p className="font-semibold mb-3">Користувач зобов&apos;язаний:</p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>Надати інформацію про персональні дані, необхідну для користування Сайтом</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>Оновити, доповнити надану інформацію про персональні дані у разі зміни даної
                      інформації</span>
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-3">Адміністрація сайту зобов&apos;язана:</p>
                <ul className="space-y-2 opacity-70">
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>Використовувати отриману інформацію виключно для вказаних цілей</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      Забезпечити зберігання конфіденційної інформації в таємниці
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>↪</span>
                    <span>
                      Вживати запобіжних заходів для захисту конфіденційності персональних даних
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">7. РЕКВІЗИТИ</h2>
            <div className="bg-black/5 dark:bg-white/5 p-8 rounded-2xl border border-black/10 dark:border-white/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">Отримувач</p>
                  <p className="text-sm opacity-90">[Назва отримувача]</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">ІПН/ЄДРПОУ</p>
                  <p className="text-sm opacity-90">[ІПН/ЄДРПОУ]</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold mb-2 opacity-60">IBAN</p>
                  <p className="text-sm opacity-90">[IBAN]</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">Акціонерне товариство</p>
                  <p className="text-sm opacity-90">[Назва банку]</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">МФО</p>
                  <p className="text-sm opacity-90">[МФО]</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 opacity-60">ЄДРПОУ Банку</p>
                  <p className="text-sm opacity-90">[ЄДРПОУ Банку]</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
            <p className="text-sm opacity-50">
              Дата останнього оновлення: 27 жовтня 2025 року
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

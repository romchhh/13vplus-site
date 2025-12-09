export default function ServiceFeatures() {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 lg:w-12 lg:h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.25v1.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25v-1.5M3 9.375l9-5.25 9 5.25m-9 0v12m-9-9h18M12 4.125v12"
          />
        </svg>
      ),
      title: "Безкоштовне подарункове упакування",
      description: "Також до кожного замовлення додаємо іменну листівку.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 lg:w-12 lg:h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      ),
      title: "Обмін та повернення",
      description: "Можливість обміняти або повернути товар протягом 14-ти календарних днів з моменту його отримання.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 lg:w-12 lg:h-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
      ),
      title: "Зручне оформлення",
      description: "Оформлення покупки зручним для вас способом, включаючи швидку покупку та будь-яку можливість доставки.",
    },
  ];

  return (
    <section className="max-w-[1920px] mx-auto w-full px-6 py-12 lg:py-16 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="border border-black/10 rounded-sm p-6 lg:p-8 flex flex-col gap-4 hover:border-black/20 transition-colors"
            >
              <div className="text-black/80 mb-2 flex items-center justify-start">
                {feature.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-semibold font-['Montserrat'] text-black">
                {feature.title}
              </h3>
              <p className="text-sm lg:text-base font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

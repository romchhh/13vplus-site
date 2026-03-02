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

    if (titleRef.current) {
      observer.observe(titleRef.current);
    }

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
      title: "Чи це оригінальна продукція Choice?",
      content: "Так. Всі продукти є оригінальною продукцією Choice.",
    },
    {
      number: "02",
      title: "Як обрати продукт?",
      content: "Ви можете обрати самостійно або звернутись за консультацією.",
    },
    {
      number: "03",
      title: "Як швидко відправляється замовлення?",
      content: "Зазвичай протягом 1–2 робочих днів.",
    },
    {
      number: "04",
      title: "Чи можна отримати консультацію?",
      content: "Так. Ви можете звернутись через форму або месенджери.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="payment-and-delivery"
      className="scroll-mt-20 max-w-[1920px] w-full mx-auto bg-black py-16 lg:py-24 px-6 overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
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
              Часті
            </span>
            <br />
            <span className="inline-block transition-all duration-700 delay-200">
              запитання
            </span>
          </h2>
          <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed transition-all duration-1000 delay-300">
            Відповіді на популярні питання про продукцію та замовлення
          </p>
        </div>

        <div className="flex-1 max-w-4xl">
          {faqItems.map((item, index) => {
            const itemIndex = index + 1;
            const isVisible = visibleItems.has(itemIndex);

            const getAnimationClass = () => {
              if (isVisible) {
                return "opacity-100 translate-x-0 translate-y-0 scale-100 rotate-0";
              }
              switch (index % 4) {
                case 0:
                  return "opacity-0 translate-x-32 translate-y-0 scale-95";
                case 1:
                  return "opacity-0 -translate-x-32 translate-y-0 scale-95";
                case 2:
                  return "opacity-0 translate-x-0 translate-y-20 scale-95";
                case 3:
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

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openAccordion === itemIndex
                      ? "max-h-[2000px] opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-4"
                  }`}
                >
                  <div className="pb-6 lg:pb-8 pl-0 lg:pl-20 text-base lg:text-lg font-normal font-['Montserrat'] text-white/70 leading-relaxed">
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

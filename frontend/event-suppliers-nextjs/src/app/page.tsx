/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPostLoginFallbackPath } from "@/shared/lib/safe-redirect-path";
import { SUPPLIER_LIST } from "@/shared/data/supplier-catalog";
import { CtaPill } from "@/shared/components/cta-pill";
import { CarouselArrowImg } from "@/shared/components/carousel-arrow-img";
import { SupplierGlassCard } from "@/shared/components/supplier-glass-card";
import { useAppSelector } from "@/store/hooks";

export default function Home() {
  const router = useRouter();
  const sessionUser = useAppSelector((state) => state.auth.user);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!sessionUser) return;
    router.replace(getPostLoginFallbackPath(sessionUser.roles));
  }, [sessionUser, router]);

  if (sessionUser) return null;

  const stats = [
    { value: "0", label: "ללא פשרות על איכות", dot: "#10B981" },
    { value: "1.2k+", label: "אירועים הופקו", dot: "#10B981" },
    { value: "100%", label: "שביעות רצון לקוחות", dot: "#10B981" },
    { value: "2,450", label: "ספקים רשומים", dot: "#10B981" },
    { value: "38", label: "מפיקים ומשא״ן במערכת", dot: "#10B981" },
    { value: "142", label: "משתמשים ב-AI כעת", dot: "#10B981" },
  ];
  const maxSlideIndex = Math.max(SUPPLIER_LIST.length - 3, 0);
  const visibleSlides = SUPPLIER_LIST.slice(slideIndex, slideIndex + 3);

  return (
    <section className="relative mx-auto w-full overflow-hidden bg-white">
      <div className="absolute left-0 top-0 min-h-[1163px] w-full bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] lg:h-[1163px]" />
      <div
        className="pointer-events-none absolute left-1/2 h-[1975.43px] w-[min(1440px,calc(100vw+80px))] max-w-none -translate-x-1/2 rotate-[-179.98deg] bg-[url('/2.png')] bg-cover bg-center bg-no-repeat md:left-[329.7px] md:w-[1440px] md:translate-x-0"
        style={{ top: 1163.57 }}
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute left-[-140px] top-[110px] size-[min(300px,55vw)] max-w-[300px] rotate-58 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-[3px] md:left-[-160px] md:size-[360px]" />
      <div className="pointer-events-none absolute right-[-150px] top-[70px] size-[min(340px,60vw)] max-w-[340px] rotate-[-120deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-[3px] md:right-[-180px] md:size-[420px]" />
      <div className="pointer-events-none absolute left-[-95px] top-[2050px] size-[min(300px,55vw)] max-w-[300px] rotate-99 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-[3px] md:top-[2180px] md:size-[360px]" />
      <div className="pointer-events-none absolute right-[-60px] top-[1560px] size-[min(180px,35vw)] max-w-[180px] rotate-149 rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60%)] blur-[20px] md:right-0 md:size-[230px]" />
      <div className="pointer-events-none absolute left-[515px] top-[132px] hidden h-[79px] w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[13.5px] min-[1100px]:block" />
      <div className="pointer-events-none absolute left-[407px] top-[1213px] hidden h-[79px] w-[89px] rotate-[-161deg] rounded-full bg-[linear-gradient(180deg,#2998FF_0%,#FFFFFF_60.33%)] blur-[13.5px] min-[1100px]:block" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-10 sm:pt-44">
        <div className="mx-auto flex w-full max-w-[892px] flex-col items-center gap-5 text-center lg:gap-7">
          <div className="flex w-full flex-col items-center">
            <h1 className="w-full text-center text-[52px] leading-[0.92] text-[#201C44] sm:text-[64px] lg:text-[74px]">
              הפקת אירוע בלחיצת כפתו
            </h1>
            <p className="mt-2 w-full text-center text-[20px] leading-[1.1] text-[#201C44] sm:text-[25px] lg:text-[41px] lg:leading-[1.04]">
              גלו את הספקים הטובים ביותר והפיקו את האירוע שלכם בקלות ובמהירות
            </p>
          </div>

          <div className="flex w-full max-w-full flex-wrap items-center justify-center gap-2 lg:w-[455px] lg:max-w-[455px] lg:gap-[7px]">
            <CtaPill
              href="/ai-planner"
              variant="primary"
              size="responsive"
              className="w-auto shrink-0"
            >
              תכנון אירוע עם AI
            </CtaPill>
            <CtaPill
              href="/event-production"
              variant="outline"
              size="responsive"
              className="w-auto shrink-0"
            >
              תכנון עצמאי
            </CtaPill>
          </div>

          <CtaPill href="/marketplace" variant="field" className="mx-auto w-full">
            <span className="flex min-h-[14px] min-w-0 max-w-full flex-1 items-center justify-end text-right text-[14px] leading-[14px] text-[#201C44] sm:max-w-[171px]">
              מצאו ספקים לאירוע שלכם
            </span>
          </CtaPill>
        </div>

        <div className="mt-16 lg:mt-14">
          <div className="mb-6 flex min-h-[68px] w-full items-center gap-2 sm:gap-3">
            <h2 className="max-w-[58%] shrink text-right text-[24px] leading-none text-[#201C44] sm:max-w-none sm:shrink-0 sm:whitespace-nowrap sm:text-[30px]">
              ספקים נבחרים
            </h2>
            <span className="h-px min-w-6 flex-1 border-t border-[rgba(32,28,68,0.5)]" />
            <button
              type="button"
              className="flex h-[40px] shrink-0 items-center justify-end gap-2 text-[18px] leading-[14px] text-[#201C44] sm:min-w-[152px]"
            >
              <span>לכל הספקים</span>
              <span className="text-[14px] leading-none text-[#0F2D38]">←</span>
            </button>
          </div>
          <div className="mx-auto flex w-full max-w-[1148px] items-center gap-2 sm:gap-4 lg:gap-[60px]">
            <button
              type="button"
              aria-label="ספקים קודמים"
              onClick={() => setSlideIndex((prev) => Math.max(prev - 1, 0))}
              disabled={slideIndex === 0}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#201C44] disabled:opacity-40 sm:size-[58px]"
            >
              <CarouselArrowImg direction="right" className="h-[26px] w-auto sm:h-[34px]" />
            </button>

            <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
              {visibleSlides.map((supplier) => (
                <SupplierGlassCard
                  key={supplier.id}
                  href={`/suppliers/${supplier.id}`}
                  name={supplier.name}
                  subtitle={supplier.subtitle}
                  description={supplier.description}
                  location={supplier.location}
                  rating={supplier.rating}
                  imageUrl={supplier.imageUrl}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="ספקים הבאים"
              onClick={() => setSlideIndex((prev) => Math.min(prev + 1, maxSlideIndex))}
              disabled={slideIndex === maxSlideIndex}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-[#201C44] disabled:opacity-40 sm:size-[58px]"
            >
              <CarouselArrowImg direction="left" className="h-[26px] w-auto sm:h-[34px]" />
            </button>
          </div>
        </div>

        <div className="mt-10 rounded-[40px] bg-[#00113A] px-4 py-5 text-white shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] lg:min-h-[120px] lg:px-6 lg:py-8">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-4 lg:min-h-[56px] lg:flex-row">
           

            <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#6AB7FF]">
                <img src="/hammer.svg" alt="" className="h-[19px] w-[18px] invert-15 sepia-16 saturate-2100 hue-rotate-220 brightness-40 contrast-95" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[24px] leading-7 tracking-[-0.5px] text-white lg:text-[32px]">
                  הצטרפו ללוח ההצעות שלנו
                </p>
                <p className="max-w-xl text-[12px] leading-5 text-white lg:text-[20px] lg:leading-6">
                  פרסמו הצעת עבודה וקבלו פניות מספקים איכותיים שישמחו לתת לכם שירות!
                </p>
              </div>
            </div>
            <CtaPill href="/jobs/publish" variant="soft" size="lg" className="w-auto shrink-0">
              פרסום הצעת עבודה
            </CtaPill>
          </div>
        </div>

        <div className="mx-auto mt-14 flex w-full max-w-[892px] flex-col items-center gap-8 text-center">
          <div className="w-full">
            <h2 className="w-full text-center text-[34px] leading-[1.05] text-[#201C44] sm:text-[42px] lg:text-[50px]">
              סקרנים איך מתחילים?
            </h2>
            <p className="mx-auto mt-3 w-full max-w-[892px] text-center text-[19px] leading-6 text-[#201C44] sm:mt-4 sm:text-[24px] lg:text-[30px] lg:leading-7">
              גלו איך הפלטפורמה שלנו משנה את כללי המשחק בהפקת אירועים, חוסכת לכם זמן ומחברת אתכם לספקים המובילים בישראל.
            </p>
          </div>

          <div className="relative flex h-[320px] w-full max-w-[818px] items-center justify-center rounded-[24px] border border-[rgba(134,85,246,0.2)] bg-[rgba(230,238,255,0.59)] shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] sm:h-[390px] lg:h-[450px]">
            <button
              type="button"
              aria-label="נגן סרטון היכרות"
              className="flex size-[78px] items-center justify-center rounded-full bg-[#6AB7FF] text-[30px] text-[#201C44] shadow-[0_0_30px_#6AB7FF] sm:size-[88px] lg:size-24"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="mx-auto mt-16 flex w-full max-w-[1096px] flex-col items-center text-center">
          <h3 className="w-full text-center text-[34px] leading-[1.05] text-[#201C44] sm:text-[42px] lg:text-[50px]">
            אודות
          </h3>
          <p className="mt-3 w-full text-center text-[18px] leading-7 text-[#201C44] sm:mt-4 sm:text-[24px] sm:leading-8 lg:text-[30px] lg:leading-[34px]">
            הפלטפורמה נולדה מהבנה עמוקה של עולם האירועים והצורך לייעל את התקשורת בין ספקים ללקוחות. שילבנו ניסיון מקצועי מהשטח עם טכנולוגיית AI מתקדמת כדי שכל אירוע יתחיל בחיבור המדויק, המהיר והאיכותי ביותר.
          </p>
        </div>

        <div className="mx-auto mt-10 w-full max-w-[1241px]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-[17px]">
            {stats.map((item) => (
              <div
                key={item.label}
                className="flex min-h-[121px] flex-col justify-between rounded-2xl bg-[rgba(242,239,253,0.37)] px-4 py-4 shadow-[0px_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-[6px] lg:h-[123px] lg:px-6 lg:py-6"
              >
                <div className="flex items-center gap-2">
                  <p className="text-[30px] leading-[36px] text-[#00113A] lg:text-[40px]">{item.value}</p>
                </div>
                <p className="text-right text-[11px] leading-4 uppercase tracking-[0.55px] text-black lg:text-[16px] lg:leading-4">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-[680px] flex-wrap md:flex-nowrap items-center justify-center gap-3">
          <CtaPill
            href="/auth/register"
            variant="primary"
            size="xl"
            endIcon="arrowCircle"
            className="min-w-[min(100%,260px)] flex-1 basis-[min(100%,380px)]"
          >
            פתיחת משתמש
          </CtaPill>
          <CtaPill
            href="/auth/register"
            variant="outlineAccent"
            size="xl"
            className="min-w-[min(100%,260px)] flex-1 basis-[min(100%,320px)]"
          >
            הצטרף כספק
          </CtaPill>
        </div>
      </div>

      <footer className="mt-14 min-h-[499px] w-full border border-black/10 bg-[rgba(230,239,244,0.42)] backdrop-blur-[6px]">
        <div className="mx-auto w-full max-w-[1280px] pt-10 sm:pt-[69px]">
          <div className="mx-4 grid min-h-0 auto-rows-auto grid-cols-1 gap-8 sm:mx-8 md:min-h-[212px] md:grid-cols-4 md:gap-12">
          <div className="w-full max-w-[268px] justify-self-center text-right md:justify-self-end">
              <h4 className="text-[24px] leading-8 tracking-[-0.6px] text-black">עולם הספקים</h4>
              <p className="mt-6 text-[14px] leading-[23px] text-black">
                הבית שלכם לפלטפורמת אירועים בלתי נשכחים. אנו מחברים ספקים מובילים עם חולמים בעזרת טכנולוגיה מתקדמת וליווי אישי.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-[rgba(230,239,244,0.42)]">
                  <img src="/whatsapp.svg" alt="" className="size-5" />
                </span>
                <span className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-[rgba(230,239,244,0.42)]">
                  <img src="/facebook.svg" alt="" className="size-5" />
                </span>
                <span className="flex size-10 items-center justify-center rounded-full border border-black/10 bg-[rgba(230,239,244,0.42)]">
                  <img src="/instagram.svg" alt="" className="size-5" />
                </span>
              </div>
            </div>
            <div className="w-full max-w-[268px] justify-self-center">
              <h4 className="flex items-center gap-2 text-[16px] leading-6 text-black">
                <span className="size-[6px] rounded-full bg-[#895AF6]" /> קישורים מהירים
              </h4>
              <ul className="mt-6 space-y-4 text-[14px] leading-5 text-black">
                <li>דף הבית</li>
                <li>קונספטים</li>
                <li>ספקים</li>
                <li>הצעות עבודה</li>
                <li>אודות</li>
              </ul>
            </div>

            <div className="w-full max-w-[268px] justify-self-center">
              <h4 className="flex items-center gap-2 text-[16px] leading-6 text-black">
                <span className="size-[6px] rounded-full bg-[#22D3EE]" /> מידע משפטי
              </h4>
              <ul className="mt-6 space-y-4 text-[14px] leading-5 text-black">
                <li>תנאי שימוש</li>
                <li>מדיניות פרטיות</li>
                <li>הצהרת נגישות</li>
              </ul>
            </div>

           
            <div className="w-full max-w-[268px] justify-self-center">
              <h4 className="flex items-center gap-2 text-[16px] leading-6 text-black">
                <span className="size-[6px] rounded-full bg-[#FBBF24]" /> צור קשר
              </h4>
              <ul className="mt-6 space-y-4 text-[14px] leading-5 text-black">
                <li className="flex items-center gap-2">
                  <img src="/mail.svg" alt="" className="h-3 w-[15px]" />
                  <span>hello@galaxyevents.co.il</span>
                </li>
                <li className="flex items-center gap-2">
                  <img src="/phone.svg" alt="" className="size-[13.5px]" />
                  <span>03-755-1234</span>
                </li>
                <li className="flex items-center gap-2">
                  <img src="/globe.svg" alt="" className="size-[15px]" />
                  <span>תל אביב, מגדל ToHa</span>
                </li>
              </ul>
            </div>

           
          </div>

          <div className="mx-4 mt-7 flex flex-col items-stretch gap-4 sm:mx-8 sm:items-end md:mt-[26px]">
            <p className="text-center text-[18px] leading-7 text-[#444650] sm:text-right">הירשמו לניוזלטר שלנו</p>
            <div className="flex w-full max-w-[448px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <input
                className="h-[41px] min-h-[41px] w-full min-w-0 rounded-[99px] border border-black px-6 text-right text-[16px] leading-[19px] text-black sm:max-w-[300px] sm:flex-1"
                placeholder="כתובת האימייל שלך"
              />
              <button
                type="button"
                className="h-[41px] w-full shrink-0 rounded-[99px] bg-[#00113A] text-[16px] leading-6 text-white sm:w-[136px]"
              >
                הרשמה
              </button>
            </div>
          </div>

          <div className="mx-4 mt-6 flex flex-col gap-4 border-t border-black/5 pt-8 text-[12px] leading-4 text-black sm:mx-8 sm:flex-row sm:items-center sm:justify-between">
            <p>כל הזכויות שמורות © עיצוב</p>
            <p dir="ltr">עברית | EN</p>
          </div>
        </div>
      </footer>
    </section>
  );
}

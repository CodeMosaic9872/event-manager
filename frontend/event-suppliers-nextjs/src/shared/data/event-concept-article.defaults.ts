import type { EventConceptArticle } from "@/shared/types/event-concept-article";

/** תוכן מאמר לדוגמה — גיבור מותאם לפי slug ב־`getEventConceptArticle`. */
export const eventConceptArticleDefaults: Omit<EventConceptArticle, "slug" | "hero"> = {
  visionTitle: "החזון והאווירה",
  visionParagraphs: [
    "קונספט של מסיבת בריכה בווילה פרטית משלב אירוע יוקרתי עם אווירה רגועה. האירוע מתחיל אחר הצהריים עם קוקטיילים מרעננים ליד הבריכה, ונמשך לתוך הלילה עם תאורה דקורטיבית, מוזיקה סוחפת ותפריט שף מותאם.",
    "העיצוב מתמקד בגווני כחול עמוק ומגעי כתום נועזים ליצירת ניגוד מרשים. שימוש בריהוט גן יוקרתי, פינות ישיבה מפנקות ותאורה שנשקעת במים יוצרים חלל אירוח יוצא דופן. כל פרט נבחר בקפידה — מהמיתוג על כוסות הקוקטייל ועד לצליל המדויק סביב רחבת הריקוד הצפה.",
  ],
  quote:
    '"המטרה שלנו הייתה ליצור ניתוק מוחלט מהשגרה. רצינו שהאורחים ירגישו בחופשה יוקרתית על הריביירה, אבל עם החום האישי של אירוע פרטי."',
  specs: [
    { label: "מחיר משוער", value: "₪150k - 250k", icon: "wallet" },
    { label: "כמות אורחים", value: "80 - 150", icon: "users" },
    { label: "סוג אירוע", value: "וילה פרטית / חוץ", icon: "map-pin" },
    { label: "עונה מומלצת", value: "קיץ / אביב", icon: "clock" },
  ],
  map: {
    imageSrc:
      "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80&auto=format&fit=crop",
    imageAlt: "תצוגת מפה ליד החוף",
    recommendedArea: "הרצליה פיתוח",
  },
  teamTitle: "נבחרת הספקים",
  team: [
    {
      name: "די-ג'יי אופיר רם",
      specialty: "מוזיקה ואווירה",
      imageSrc: "https://images.unsplash.com/photo-1571266028243-e4733b0f91d1?w=200&q=80&auto=format&fit=crop",
      imageAlt: "די ג׳י ליד המיקסר",
      profileHref: "#",
    },
    {
      name: "שף עידן לוי",
      specialty: "שף קייטרינג",
      imageSrc: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&q=80&auto=format&fit=crop",
      imageAlt: "דיוקן שף",
      profileHref: "#",
    },
    {
      name: "וילה 'בלו-ביי'",
      specialty: "מתחם אירועים",
      imageSrc: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=200&q=80&auto=format&fit=crop",
      imageAlt: "חזית וילה יוקרתית",
      profileHref: "#",
    },
  ],
  galleryTitle: "גלריית רגעים",
  gallery: [
    {
      src: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=600&q=80&auto=format&fit=crop",
      alt: "אורחים ליד הבריכה",
    },
    {
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80&auto=format&fit=crop",
      alt: "עיצוב שולחן ערב",
    },
    {
      src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80&auto=format&fit=crop",
      alt: "פרטי חגיגה",
    },
    {
      src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80&auto=format&fit=crop",
      alt: "לאונג׳ חוץ",
    },
    {
      src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop",
      alt: "ציפים בבריכה ודקור",
    },
    {
      src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80&auto=format&fit=crop",
      alt: "אורחים נהנים מהבריכה",
    },
  ],
};

export const eventConceptArticleDefaultHero: EventConceptArticle["hero"] = {
  badgeLabel: "",
  title: "מסיבת בריכה יוקרתית בוילה",
  subtitle: "חוויה אקסקלוסיבית המשלבת יוקרה, מים ואווירה חופשית תחת כיפת השמיים",
  imageSrc:
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80&auto=format&fit=crop",
  imageAlt: "ארוחת ערב יוקרתית ליד הבריכה בדמדומים",
};

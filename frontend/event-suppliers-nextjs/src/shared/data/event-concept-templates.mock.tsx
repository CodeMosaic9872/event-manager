import type { EventConceptTemplate } from "@/shared/types/event-concept-template";
import { IconCamera, IconFlower, IconGlass, IconMic, IconSparkles, IconUtensils } from "@/shared/components/event-concepts/icons";
import { eventConceptArticlePath } from "@/shared/lib/event-concept-routes";

export const eventConceptTemplatesMock: EventConceptTemplate[] = [
  {
    id: "tech-networking",
    title: "נטוורקינג טכנולוגי",
    description: "אירוע מלא בתוכן מקצועי ברמה אחרת.",
    imageSrc:
      "https://images.unsplash.com/photo-1540575467063-27aef4e7bd44?w=800&q=80",
    imageAlt: "משתתפים בכנס מקצועי",
    badge: "new",
    audience: "business",
    vendors: [
      { label: "הרצאות אורח", icon: <IconMic /> },
      { label: "בר ג׳וני", icon: <IconGlass /> },
    ],
    href: eventConceptArticlePath("tech-networking"),
  },
  {
    id: "minimal-wedding",
    title: "חתונה מינימליסטית מודרנית",
    description: "לופט במרכז העיר",
    imageSrc:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    imageAlt: "עיצוב פרחים לחתונה",
    badge: "popular",
    audience: "private",
    vendors: [
      { label: "סטודיו לומייר", icon: <IconCamera /> },
      { label: "עלי כותרת", icon: <IconFlower /> },
    ],
    href: eventConceptArticlePath("minimal-wedding"),
  },
  {
    id: "bachelorette",
    title: "מסיבת רווקות",
    description: "חוגגים רווקות הקיץ? אלה הספקים שכדאי להזמין",
    imageSrc:
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80",
    imageAlt: "חגיגה ליד בריכה",
    badge: "popular",
    audience: "private",
    vendors: [
      { label: "די ג׳י גלקסי", icon: <IconMic /> },
      { label: "שף מורן", icon: <IconUtensils /> },
    ],
    href: eventConceptArticlePath("bachelorette"),
  },
  {
    id: "wellness-retreat",
    title: "ריטריט בריאות למנהלים",
    description: "יומיים של שקט וגיבוש לעובדי החברה במיקום פסטורלי.",
    imageSrc:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    imageAlt: "מרחב וולנס רגוע",
    audience: "business",
    vendors: [
      { label: "קולקטיב יוגה מודעת", icon: <IconSparkles /> },
      { label: "קייטרינג שורשים אורגניים", icon: <IconFlower /> },
    ],
    href: eventConceptArticlePath("wellness-retreat"),
  },
  {
    id: "passover",
    title: "אירוע לפסח",
    description:
      "מחפשים אירוע מיוחד לפסח? אולם המורשת מציע חוויה ייחודית ואלגנטית.",
    imageSrc:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    imageAlt: "אולם אירועים אלגנטי",
    audience: "both",
    vendors: [
      { label: "עיצוב אלגנטי", icon: <IconSparkles /> },
      { label: "קייטרינג כשר", icon: <IconUtensils /> },
    ],
    href: eventConceptArticlePath("passover"),
  },
  {
    id: "summer-gala",
    title: "גאלה תאגידית לקיץ",
    description: "ערב פתוח עם מוזיקה חיה, פינוקים קולינריים וקוד לבוש רגוע.",
    imageSrc:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    imageAlt: "אירוע ערב בחוץ",
    audience: "business",
    vendors: [
      { label: "שמיים קול ותמונה", icon: <IconMic /> },
      { label: "קייטרינג הנמל", icon: <IconGlass /> },
    ],
    href: eventConceptArticlePath("summer-gala"),
  },
];

import type { EventConceptTemplate } from "@/shared/types/event-concept-template";
import { IconCamera, IconFlower, IconGlass, IconMic, IconSparkles, IconUtensils } from "@/shared/components/event-concepts/icons";
import { eventConceptArticlePath } from "@/shared/lib/event-concept-routes";

export const eventConceptTemplatesMock: EventConceptTemplate[] = [
  {
    id: "tech-networking",
    title: "Technological networking",
    description: "An event full of professional content on a different level.",
    imageSrc:
      "https://images.unsplash.com/photo-1540575467063-27aef4e7bd44?w=800&q=80",
    imageAlt: "Professionals networking at a conference",
    badge: "new",
    audience: "business",
    vendors: [
      { label: "Guest lectures", icon: <IconMic /> },
      { label: "Johnny's Bar", icon: <IconGlass /> },
    ],
    href: eventConceptArticlePath("tech-networking"),
  },
  {
    id: "minimal-wedding",
    title: "Modern minimalist wedding",
    description: "The loft in the city center",
    imageSrc:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    imageAlt: "Floral wedding installation",
    badge: "popular",
    audience: "private",
    vendors: [
      { label: "Lumiere Studio", icon: <IconCamera /> },
      { label: "Petals and stem", icon: <IconFlower /> },
    ],
    href: eventConceptArticlePath("minimal-wedding"),
  },
  {
    id: "bachelorette",
    title: "Bachelorette party",
    description: "Celebrating a bachelorette party this summer? Here are the vendors you must book",
    imageSrc:
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=800&q=80",
    imageAlt: "Poolside celebration",
    badge: "popular",
    audience: "private",
    vendors: [
      { label: "DJ Galaxy", icon: <IconMic /> },
      { label: "Chef Moran", icon: <IconUtensils /> },
    ],
    href: eventConceptArticlePath("bachelorette"),
  },
  {
    id: "wellness-retreat",
    title: "Wellness retreat for executives",
    description: "Two days of quiet and consolidation for company employees in a pastoral location.",
    imageSrc:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    imageAlt: "Calm wellness setting",
    audience: "business",
    vendors: [
      { label: "Mindful Yoga Collective", icon: <IconSparkles /> },
      { label: "Organic Roots Catering", icon: <IconUtensils /> },
    ],
    href: eventConceptArticlePath("wellness-retreat"),
  },
  {
    id: "passover",
    title: "Passover party",
    description:
      "Looking for a special event for Passover? The magnificent Heritage Hall offers a unique and elegant experience.",
    imageSrc:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    imageAlt: "Elegant event hall",
    audience: "both",
    vendors: [
      { label: "Elegant design", icon: <IconSparkles /> },
      { label: "Kosher catering", icon: <IconUtensils /> },
    ],
    href: eventConceptArticlePath("passover"),
  },
  {
    id: "summer-gala",
    title: "Summer corporate gala",
    description: "An open-air evening with live music, curated bites, and a relaxed dress code.",
    imageSrc:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    imageAlt: "Outdoor evening event",
    audience: "business",
    vendors: [
      { label: "Skyline AV", icon: <IconMic /> },
      { label: "Harbor Catering", icon: <IconGlass /> },
    ],
    href: eventConceptArticlePath("summer-gala"),
  },
];

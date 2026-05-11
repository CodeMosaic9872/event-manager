/* eslint-disable @next/next/no-img-element */

import type { SupplierProfileResponse } from "@/shared/types";

type ContactLink = {
  label: string;
  href: string;
  icon: "facebook" | "mail" | "globe" | "instagram" | "phone" | "whatsapp" | "bookmark" | "share";
};

function Icon({ kind }: { kind: ContactLink["icon"] }) {
  const cls = "size-5 object-contain invert brightness-0";
  switch (kind) {
    case "facebook": return <img src="/icons/facebook.svg" alt="" className={cls} />;
    case "mail": return <img src="/icons/mail.svg" alt="" className={cls} />;
    case "globe": return <img src="/icons/globe.svg" alt="" className={cls} />;
    case "instagram": return <img src="/icons/instagram.svg" alt="" className={cls} />;
    case "phone": return <img src="/icons/phone.svg" alt="" className={cls} />;
    case "whatsapp": return <img src="/icons/whatsapp.svg" alt="" className={cls} />;
    case "bookmark": return <span className="flex size-5 items-center justify-center text-sm font-bold leading-none text-white" aria-hidden>⌗</span>;
    case "share": return <img src="/icons/share.svg" alt="" className={cls} />;
    default: return null;
  }
}

function buildLinks(profile: SupplierProfileResponse): ContactLink[] {
  const links: ContactLink[] = [];
  if (profile.phone) {
    links.push({ label: "טלפון", href: `tel:${profile.phone}`, icon: "phone" });
    links.push({ label: "וואטסאפ", href: `https://wa.me/${profile.phone.replace(/[^\d]/g, "")}`, icon: "whatsapp" });
  }
  (profile.socialLinks ?? []).forEach((link) => {
    switch (link.platform) {
      case "facebook": links.push({ label: "פייסבוק", href: link.url, icon: "facebook" }); break;
      case "instagram": links.push({ label: "אינסטגרם", href: link.url, icon: "instagram" }); break;
      case "tiktok": links.push({ label: "TikTok", href: link.url, icon: "globe" }); break;
      case "youtube": links.push({ label: "YouTube", href: link.url, icon: "globe" }); break;
    }
  });
  if (profile.website) links.push({ label: "אתר", href: profile.website, icon: "globe" });
  if (profile.email) links.push({ label: "אימייל", href: `mailto:${profile.email}`, icon: "mail" });
  links.push({ label: "שיתוף", href: "#share", icon: "share" });
  return links;
}

type SupplierContactIconsRowProps = {
  profile: SupplierProfileResponse;
};

export function SupplierContactIconsRow({ profile }: SupplierContactIconsRowProps) {
  const links = buildLinks(profile);

  return (
    <div className="mx-auto border-y border-[#E2E8F0] px-0 py-6">
      <div className="flex flex-wrap items-start justify-center gap-6">
        {links.map(({ label, icon, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex min-w-[48px] flex-col items-center gap-2 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#201C44]">
              <Icon kind={icon} />
            </span>
            <span className="text-center text-xs leading-4 text-[#475569]">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

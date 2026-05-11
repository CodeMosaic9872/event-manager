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
    case "facebook": return <img src="/facebook.svg" alt="" className={cls} />;
    case "mail": return <img src="/mail.svg" alt="" className={cls} />;
    case "globe": return <img src="/globe.svg" alt="" className={cls} />;
    case "instagram": return <img src="/instagram.svg" alt="" className={cls} />;
    case "phone": return <img src="/phone.svg" alt="" className={cls} />;
    case "whatsapp": return <img src="/whatsapp.svg" alt="" className={cls} />;
    case "bookmark": return <span className="flex size-5 items-center justify-center text-sm font-bold leading-none text-white" aria-hidden>⌗</span>;
    case "share": return <img src="/share.svg" alt="" className={cls} />;
    default: return null;
  }
}

function buildLinks(profile: SupplierProfileResponse): ContactLink[] {
  const links: ContactLink[] = [];
  if (profile.facebook) links.push({ label: "\u05E4\u05D9\u05D9\u05E1\u05D1\u05D5\u05E7", href: profile.facebook, icon: "facebook" });
  if (profile.email) links.push({ label: "\u05D0\u05D9\u05DE\u05D9\u05D9\u05DC", href: `mailto:${profile.email}`, icon: "mail" });
  if (profile.website) links.push({ label: "\u05D0\u05EA\u05E8", href: profile.website, icon: "globe" });
  if (profile.instagram) links.push({ label: "\u05D0\u05D9\u05E0\u05E1\u05D8\u05D2\u05E8\u05DD", href: profile.instagram, icon: "instagram" });
  if (profile.phone) {
    links.push({ label: "\u05D8\u05DC\u05E4\u05D5\u05DF", href: `tel:${profile.phone}`, icon: "phone" });
    links.push({ label: "\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4", href: `https://wa.me/${profile.phone.replace(/[^\d]/g, "")}`, icon: "whatsapp" });
  }
  links.push({ label: "\u05E9\u05D9\u05EA\u05D5\u05E3", href: "#share", icon: "share" });
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

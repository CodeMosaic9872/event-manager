/* eslint-disable @next/next/no-img-element */

const items: Array<{ label: string; icon: "facebook" | "mail" | "globe" | "instagram" | "phone" | "whatsapp" | "bookmark" | "share" }> = [
  { label: "פייסבוק", icon: "facebook" },
  { label: "אימייל", icon: "mail" },
  { label: "אתר", icon: "globe" },
  { label: "אינסטגרם", icon: "instagram" },
  { label: "טלפון", icon: "phone" },
  { label: "וואטסאפ", icon: "whatsapp" },
  { label: "שמירה", icon: "bookmark" },
  { label: "שיתוף", icon: "share" },
];

function Icon({ kind }: { kind: (typeof items)[number]["icon"] }) {
  const cls = "size-5 object-contain invert brightness-0";
  switch (kind) {
    case "facebook":
      return <img src="/facebook.svg" alt="" className={cls} />;
    case "mail":
      return <img src="/mail.svg" alt="" className={cls} />;
    case "globe":
      return <img src="/globe.svg" alt="" className={cls} />;
    case "instagram":
      return <img src="/instagram.svg" alt="" className={cls} />;
    case "phone":
      return <img src="/phone.svg" alt="" className={cls} />;
    case "whatsapp":
      return <img src="/whatsapp.svg" alt="" className={cls} />;
    case "bookmark":
      return (
        <span className="flex size-5 items-center justify-center text-sm font-bold leading-none text-white" aria-hidden>
          ⌗
        </span>
      );
    case "share":
      return <img src="/share.svg" alt="" className={cls} />;
    default:
      return null;
  }
}

export function SupplierContactIconsRow() {
  return (
    <div className="mx-auto border-y border-[#E2E8F0] px-0 py-6">
      <div className="flex flex-wrap items-start justify-center gap-6">
        {items.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            className="flex min-w-[48px] flex-col items-center gap-2 text-center"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-[#201C44]">
              <Icon kind={icon} />
            </span>
            <span className="text-center text-xs leading-4 text-[#475569]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

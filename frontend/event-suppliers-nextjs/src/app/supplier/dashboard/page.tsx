"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, startTransition, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetRecommendedSupplierJobsQuery,
  useGetSupplierReferralLinkQuery,
  useUpdateSupplierProfileMutation,
  useUpdateSupplierServiceAreasMutation,
  useMeQuery,
  useUploadGalleryFilesMutation,
  useDeleteGalleryItemsMutation,
} from "@/shared/api/api";
import type { GalleryMediaItem } from "@/shared/api/endpoints/suppliers-endpoints";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { SupplierDashboardSectionCard } from "@/shared/components/supplier-dashboard/supplier-dashboard-section-card";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { saveSupplierDraftField } from "@/features/job-board/job-board-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const SERVICE_AREAS = [
  "Eilat and the Arava",
  "Jerusalem",
  "כל הארץ",
  "Sharon",
  "דרום",
  "מרכז",
  "צפון",
] as const;

const SPECIALTIES = [
  "טבעוני",
  "עוטף",
  "כשרות",
  "מילואימניק",
  "ספק משרד הביטחון",
] as const;

const DEMO_JOB_CARDS = [
  {
    timeLabel: "לפני שעתיים",
    badge: "new" as const,
    meta: "מיקום: תל אביב | תקציב: 12,000-15,000 ₪",
    title: "חתונה קטנה ל-50 איש",
  },
  {
    timeLabel: "אתמול",
    badge: "relevant" as const,
    meta: "מיקום: הרצליה פיתוח | תקציב: 8,000-12,000 ₪",
    title: "אירוע ערב חברה",
  },
];

const DASHBOARD_NOTIFICATIONS = [
  {
    title: "שינוי מחיר",
    body: "שימו לב שמחיר הצעת העבודה השתנה ב-1,000 ₪.",
    actionLabel: "לצפייה בהצעת עבודה",
  },
  {
    title: "הודעה חדשה",
    body: "שימו לב שמחיר הצעת העבודה השתנה ב-1,000 ₪.",
    actionLabel: "לצפייה בהצעת עבודה",
  },
  {
    title: "מכרז חדש",
    body: "פורסמה הצעת עבודה חדשה ומתאימה לעסק שלך.",
    actionLabel: "לצפייה בהצעת עבודה",
  },
] as const;

function displayNameFromUser(email: string | undefined) {
  if (!email) return "Sharon Halls";
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
  if (!local) return "Sharon Halls";
  return local
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SectionHeaderIcon({
  title,
  iconSrc,
  iconSizeClass = "size-6",
}: {
  title: string;
  iconSrc: string;
  iconSizeClass?: string;
}) {
  return (
    <div className="relative flex w-full flex-row-reverse items-center justify-end gap-2">
      <h3 className="text-right text-xl font-bold leading-7 text-[#1E1B4B]">{title}</h3>
      <Image
        src={iconSrc}
        alt=""
        width={24}
        height={24}
        className={`shrink-0 object-contain ${iconSizeClass}`}
        unoptimized
      />
    </div>
  );
}

function ReferFriendBlock({
  title,
  shareTitle,
  shareHint,
  referralUrl,
  onCopy,
  copied,
}: {
  title: string;
  shareTitle: string;
  shareHint: string;
  referralUrl: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <SupplierDashboardSectionCard>
      <SectionHeaderIcon title={title} iconSrc="/icons/refer.svg" />
      <SupplierDashboardSectionCard.InnerWell>
        <div
          dir="ltr"
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>

          </div>
          <div className="flex min-w-0 flex-1 flex-row items-stretch overflow-hidden rounded-xl border border-[var(--supplier-dashboard-inner-border)] bg-white">
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 bg-[#3B82F6] px-4 py-2.5 text-base font-bold leading-6 text-white transition hover:opacity-95"
            >
              {copied ? "הועתק" : "העתק"}
            </button>
            <div className="flex min-h-[42px] min-w-0 flex-1 items-center px-4 py-2">
              <p className="w-full truncate text-left text-sm leading-5 text-[#1E293B]" dir="ltr">
                {referralUrl}
              </p>
            </div>
          </div>
          <div className="flex max-w-md flex-col gap-1 text-right sm:shrink-0 sm:pl-2">
            <p className="text-base font-bold leading-6 text-[#1E1B4B]">{shareTitle}</p>
            <p className="text-sm font-normal leading-5 text-[#64748B] font-bold">{shareHint}</p>
          </div>
        </div>
      </SupplierDashboardSectionCard.InnerWell>
    </SupplierDashboardSectionCard>
  );
}

function JobBadge({ kind }: { kind: "new" | "relevant" }) {
  if (kind === "new") {
    return (
      <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-normal uppercase leading-[15px] text-[#15803D]">
        חדש
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-normal uppercase leading-[15px] text-[#1D4ED8]">
      רלוונטי
    </span>
  );
}

function ChipToggle({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold leading-5 transition ${
        selected
          ? "border-[#3B82F6] bg-[#3B82F6] text-black"
          : "border-[#BFDBFE] bg-white text-black"
      }`}
    >
      {label}
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-base leading-none" aria-hidden>
        {selected ? "×" : "+"}
      </span>
    </button>
  );
}

export default function SupplierDashboardPage() {
  const dispatch = useAppDispatch();
  const sessionUser = useAppSelector((state) => state.auth.user);
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);
  const shouldSkipProtectedQueries = !isAuthHydrated || !sessionUser;
  const { data: me } = useMeQuery(undefined, { skip: shouldSkipProtectedQueries });
  const { data: referralData } = useGetSupplierReferralLinkQuery(me?.id ?? "", {
    skip: shouldSkipProtectedQueries,
  });
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateSupplierProfileMutation();
  const [updateServiceAreas] = useUpdateSupplierServiceAreasMutation();
  const [uploadGalleryFiles] = useUploadGalleryFilesMutation();
  const [deleteGalleryItems] = useDeleteGalleryItemsMutation();
  const { data: recommendedJobs = [] } = useGetRecommendedSupplierJobsQuery(undefined, {
    skip: shouldSkipProtectedQueries,
  });
  const draft = useAppSelector((state) => state.jobBoard.supplierDraft);

  const displayName = useMemo(() => displayNameFromUser(sessionUser?.email), [sessionUser?.email]);
  const referralUrl = referralData?.link ?? "https://wed-app.co.il/ref/sharon-halls";

  const [showMessages, setShowMessages] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedRating, setCopiedRating] = useState(false);
  const [businessName, setBusinessName] = useState(draft.businessName || "Sharon Halls");
  const [category, setCategory] = useState("אולמות אירועים");
  const [description, setDescription] = useState(
    "A prestigious event hall in the heart of Sharon, offering an exceptional culinary experience and spectacular modern design for all types of events.",
  );
  const [address, setAddress] = useState("");

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(["מרכז", "צפון"]),
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    () => new Set(["מילואימניק", "ספק משרד הביטחון"]),
  );
  const [galleryItems, setGalleryItems] = useState<GalleryMediaItem[]>([]);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showUploadSuccessModal, setShowUploadSuccessModal] = useState(false);
  const [verificationFileName, setVerificationFileName] = useState<string | null>(null);
  const verificationInputRef = useRef<HTMLInputElement | null>(null);
  const [_linkEmail, setLinkEmail] = useState("");
  const [linkPhone, setLinkPhone] = useState("");
  const [linkFacebook, setLinkFacebook] = useState("");
  const [linkInstagram, setLinkInstagram] = useState("");
  const [linkYoutube, setLinkYoutube] = useState("");
  const [linkTiktok, setLinkTiktok] = useState("");
  const [linkWebsite, setLinkWebsite] = useState("");
  const [linkWhatsapp, setLinkWhatsapp] = useState("");
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  useEffect(() => {
    const mp = me?.marketplaceProfile;
    if (!mp) return;
    startTransition(() => {
      setBusinessName(mp.businessName);
      if (mp.description) setDescription(mp.description);
      setLinkEmail(mp.email ?? "");
      setLinkPhone(mp.phone ?? "");
      setLinkFacebook(mp.facebook ?? "");
      setLinkInstagram(mp.instagram ?? "");
      setLinkYoutube(mp.socialLinks?.find((s: { platform: string }) => s.platform === "youtube")?.url ?? "");
      setLinkTiktok(mp.socialLinks?.find((s: { platform: string }) => s.platform === "tiktok")?.url ?? "");
      setLinkWebsite(mp.website ?? "");
      setLinkWhatsapp(mp.whatsapp ?? "");
    });
  }, [me?.marketplaceProfile]);

  const jobCards = useMemo(() => {
    return DEMO_JOB_CARDS.map((demo, i) => {
      const api = recommendedJobs[i];
      return {
        ...demo,
        id: api?.id ?? `demo-${i}`,
        title: api?.title ?? demo.title,
      };
    });
  }, [recommendedJobs]);

  const copyLink = (url: string, which: "referral" | "rating") => {
    void navigator.clipboard.writeText(url);
    if (which === "referral") {
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 2000);
    } else {
      setCopiedRating(true);
      window.setTimeout(() => setCopiedRating(false), 2000);
    }
  };

  const onSave = async (event: FormEvent<HTMLElement>) => {
    event.preventDefault();
    const slug = businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      await updateProfile({ businessName, slug, description }).unwrap();
      await updateServiceAreas({
        serviceAreas: [...selectedAreas].map((a) => ({ regionCode: a.toLowerCase().replace(/\s+/g, "_") })),
      }).unwrap();
    } catch {
      /* silently fail */
    }
    const areaSummary = [...selectedAreas].join(", ");
    dispatch(saveSupplierDraftField({ key: "businessName", value: businessName }));
    dispatch(saveSupplierDraftField({ key: "serviceArea", value: areaSummary }));
  };

  const toggleInSet = (set: Set<string>, key: string, update: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update(next);
  };
  const onPickGalleryImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setIsUploadingGallery(true);
    try {
      const result = await uploadGalleryFiles({ files, sortOrder: galleryItems.length }).unwrap();
      if (result.items?.length) {
        setGalleryItems((prev) => [...prev, ...result.items].slice(0, 24));
      }
    } catch {
      /* silently fail */
    } finally {
      setIsUploadingGallery(false);
      event.target.value = "";
    }
  };

  const onDeleteGalleryItem = async (id: string) => {
    try {
      await deleteGalleryItems({ ids: [id] }).unwrap();
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      /* silently fail */
    }
  };

  const onPickVerificationFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVerificationFileName(file.name);
    setShowVerificationModal(false);
    setShowUploadSuccessModal(true);
    event.target.value = "";
  };

  const isSaving = isSavingProfile;

  return (
    <ProtectedRoute roles={["supplier", "admin"]}>
      <div
        className="relative min-h-screen w-full overflow-x-hidden"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url('/images/background-1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />


        <div className="relative z-10 mx-auto flex w-full max-w-[896px] flex-col gap-8 px-6 py-8 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-28">
        <button
          type="button"
          className="absolute -left-4 top-24 z-20 flex size-[60px] items-center justify-center rounded-full text-[#040606] transition sm:left-14 sm:top-28"
          onClick={() => setShowMessages(true)}
          aria-label="פתח הודעות"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
        </button>
          <header className="flex flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-[40px] font-bold leading-9 text-[#1E1B4B]">
              ברוך הבא, {displayName}
            </h1>
            <p className="max-w-xl text-base font-normal leading-6 text-[#64748B] font-bold">
              כאן אפשר לערוך את הפרטים של העסק, לראות הצעות עבודה ועוד...
            </p>
          </header>

          {me?.marketplaceProfile && (me.marketplaceProfile.extraLanguage == null || me.marketplaceProfile.kosher == null) && (
            <div className="w-full rounded-2xl border border-[#6AB7FF] bg-[#EEF5FF] p-5 text-right" dir="rtl">
              <h3 className="text-lg text-[#201C44] font-bold">השלם את הפרופיל שלך</h3>
              <p className="mt-1 text-sm text-[#444650]">השלימי את הצעדים לקבלת יותר הצעות עבודה.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {me.marketplaceProfile.extraLanguage == null ? (
                  <Link href="/join-supplier/step-2" className="rounded-full border border-[#201C44] px-4 py-1.5 text-sm font-bold text-[#201C44] hover:bg-[#201C44] hover:text-white!">תיאור וקישורים</Link>
                ) : me.marketplaceProfile.kosher == null && (
                  <Link href="/join-supplier/step-3" className="rounded-full border border-[#201C44] px-4 py-1.5 text-sm font-bold text-[#201C44] hover:bg-[#201C44] hover:text-white!">העלאת מדיה</Link>
                )}
              </div>
            </div>
          )}

          <ReferFriendBlock
            title="חבר מביא חבר"
            shareTitle="שתפו את הקישור שלכם"
            shareHint="וקבלו הטבה על כל ספק שנרשם דרך הקישור שלכם"
            referralUrl={referralUrl}
            onCopy={() => copyLink(referralUrl, "referral")}
            copied={copiedReferral}
          />

          <ReferFriendBlock
            title="שלח לינק לחבר לדירוג"
            shareTitle="שתפו את הקישור שלכם"
            shareHint="וקבלו דירוג לעמוד שלכם."
            referralUrl={referralUrl}
            onCopy={() => copyLink(referralUrl, "rating")}
            copied={copiedRating}
          />

          <SupplierDashboardSectionCard dir="rtl">
            <div className="relative flex w-full flex-row items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-2">
                <h3 className="text-right text-xl font-bold leading-7 text-[#1E1B4B]">
                  הצעות עבודה חדשות בנישה שלך
                </h3>
                <Image
                  src="/icons/job-offer.svg"
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 shrink-0 object-contain"
                  unoptimized
                />
              </div>
              <Link
                href="/jobs"
                className="shrink-0 text-base font-bold leading-5 text-[#3B82F6]! hover:text-[#3B82F6]! transition hover:underline"
              >
                צפה בהכל
              </Link>
            </div>

            <div className="relative grid gap-4 md:grid-cols-2">
              {jobCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-[#F1F5F9] bg-white p-5 text-right"
                >
                  <div className="flex flex-row items-start justify-between gap-2">
                    <span className="text-xs leading-4 text-[#94A3B8]">{card.timeLabel}</span>
                    <JobBadge kind={card.badge} />
                  </div>
                  <h4 className="mt-3 text-base font-bold leading-6 text-[#1E1B4B]">{card.title}</h4>
                  <p className="mt-2 text-xs leading-4 text-[#64748B] font-bold">{card.meta}</p>
                </article>
              ))}
            </div>

            <div className="relative mt-8 flex justify-end">
              <Link
                href="/jobs"
                className="inline-flex h-12 items-center justify-center rounded-[99px] bg-[#201C44] px-10 text-base font-bold leading-6 text-white! shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition hover:opacity-95"
              >
                עבור לעמוד המכרזים
              </Link>
            </div>
          </SupplierDashboardSectionCard>

          <SupplierDashboardSectionCard as="form" onSubmit={onSave} dir="rtl">
            <SectionHeaderIcon
              title="פרטי העסק"
              iconSrc="/icons/business-detail.svg"
              iconSizeClass="h-[22px] w-5"
            />

            <div className="relative grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-right text-xs leading-4 text-[#64748B] font-bold">שם העסק</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-right text-xs leading-4 text-[#64748B] font-bold">קטגוריה</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-[50px] w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                    >
                      <option>אולמות אירועים</option>
                      <option>דיג׳יי ומוזיקה</option>
                      <option>צילום</option>
                    </select>
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
                      ▾
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-right text-xs leading-4 text-[#64748B] font-bold">תיאור העסק</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="min-h-[146px] w-full resize-y rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                />
              </div>
            </div>

            <div className="relative mt-8">
              <p className="mb-3 text-right text-base leading-5 text-black">אזור מתן שירות</p>
              <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
                {SERVICE_AREAS.map((a) => (
                  <ChipToggle
                    key={a}
                    label={a}
                    selected={selectedAreas.has(a)}
                    onToggle={() => toggleInSet(selectedAreas, a, setSelectedAreas)}
                  />
                ))}
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <span className="rounded-lg bg-black/10 px-2 py-0.5 text-[10px] leading-5 text-black">אופציונלי</span>
                <span className="text-base leading-5 text-black">כתובת העסק</span>
              </div>
              <div className="relative">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="רחוב, עיר, מספר בית"
                  className="h-[50px] w-full rounded-2xl border border-black/10 bg-white py-3 pl-4 pr-12 text-right text-base text-black outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#3B82F6]/30"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/70" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21s7-6.14 7-11a7 7 0 10-14 0c0 4.86 7 11 7 11z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
              </div>
              <div className="mt-2 h-32 w-full rounded-2xl border border-black/10 bg-slate-200/80 bg-cover opacity-90" />
            </div>

            <div className="relative mt-8">
              <p className="mb-3 text-right text-base leading-5 text-black">התמחויות</p>
              <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
                {SPECIALTIES.map((s) => (
                  <ChipToggle
                    key={s}
                    label={s}
                    selected={selectedSpecialties.has(s)}
                    onToggle={() => {
                      toggleInSet(selectedSpecialties, s, setSelectedSpecialties);
                      if (s === "כשרות") setShowVerificationModal(true);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative mt-10 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-[99px] px-10 text-base font-normal leading-6 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition ${
                  isSaving ? "cursor-not-allowed bg-[#201C44] opacity-60" : "cursor-pointer bg-[#201C44] hover:opacity-95"
                }`}
              >
                {isSaving ? "שומר..." : "שמור שינויים"}
                <Image
                  src="/icons/save.svg"
                  alt=""
                  width={18}
                  height={13}
                  className="h-[13px] w-[18px] brightness-0 invert"
                  unoptimized
                  aria-hidden
                />
              </button>
            </div>
          </SupplierDashboardSectionCard>

          <SupplierDashboardSectionCard dir="rtl">
            <SectionHeaderIcon title="קישורים" iconSrc="/icons/linking.svg" iconSizeClass="h-6 w-[30px]" />

            <div className="relative flex flex-col gap-8">
              {(() => {
                const rows = [
                  [
                    { label: "אימייל", value: me?.email ?? "", setter: setLinkEmail, placeholder: "name@gmail.com", disabled: true },
                    { label: "מספר טלפון", value: linkPhone, setter: setLinkPhone, placeholder: "050-0000000" },
                  ],
                  [
                    { label: "דף פייסבוק", value: linkFacebook, setter: setLinkFacebook, placeholder: "facebook.com/yourpage" },
                    { label: "חשבון אינסטגרם", value: linkInstagram, setter: setLinkInstagram, placeholder: "instagram.com/username" },
                  ],
                  [
                    { label: "עמוד יוטיוב", value: linkYoutube, setter: setLinkYoutube, placeholder: "youtube.com/@channel" },
                    { label: "עמוד טיקטוק", value: linkTiktok, setter: setLinkTiktok, placeholder: "tiktok.com/@username" },
                  ],
                  [
                    { label: "אתר אינטרנט", value: linkWebsite, setter: setLinkWebsite, placeholder: "www.example.com" },
                    { label: "וואטסאפ", value: linkWhatsapp, setter: setLinkWhatsapp, placeholder: "050-0000000" },
                  ],
                ];
                return rows.map((pair, rowIdx) => (
                  <div key={rowIdx} className="grid gap-8 md:grid-cols-2">
                    {pair.map((row) => (
                      <div key={row.label} className="flex flex-col gap-2">
                        <label className="text-right text-xs leading-4 text-[#64748B] font-bold">{row.label}</label>
                        <input
                          value={row.value}
                          onChange={(e) => row.setter(e.target.value)}
                          placeholder={row.placeholder}
                          className={`h-[50px] w-full rounded-xl border border-[#E2E8F0] px-4 py-3 text-right text-sm text-black outline-none focus:ring-2 focus:ring-[#3B82F6]/30 ${row.disabled ? "bg-[#F1F5F9] cursor-not-allowed" : "bg-white"}`}
                          disabled={row.disabled}
                          dir="ltr"
                        />
                      </div>
                    ))}
                  </div>
                ));
              })()}
            </div>

            <div className="relative mt-10 flex justify-start">
              <button
                type="button"
                disabled={isSavingLinks}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-[99px] px-10 text-base font-normal leading-6 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition ${isSavingLinks ? "cursor-not-allowed bg-[#201C44] opacity-60" : "cursor-pointer bg-[#201C44] hover:opacity-95"}`}
                onClick={async () => {
                  setIsSavingLinks(true);
                  try {
                    const socialLinks = [
                      ...(linkInstagram ? [{ platform: "instagram", url: linkInstagram }] : []),
                      ...(linkFacebook ? [{ platform: "facebook", url: linkFacebook }] : []),
                      ...(linkYoutube ? [{ platform: "youtube", url: linkYoutube }] : []),
                      ...(linkTiktok ? [{ platform: "tiktok", url: linkTiktok }] : []),
                      ...(linkWhatsapp ? [{ platform: "whatsapp", url: linkWhatsapp }] : [])
                    ];
                    await updateProfile({
                      businessName,
                      slug: businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                      description,
                      phone: linkPhone || undefined,
                      website: linkWebsite || undefined,
                      socialLinks: socialLinks.length > 0 ? socialLinks : undefined,
                    }).unwrap();
                  } catch {
                    /* silently fail */
                  } finally {
                    setIsSavingLinks(false);
                  }
                }}
              >
                {isSavingLinks ? "שומר..." : "עדכן קישורים"}
                <Image
                  src="/icons/upload.svg"
                  alt=""
                  width={18}
                  height={13}
                  className="h-[13px] w-[18px] brightness-0 invert"
                  unoptimized
                  aria-hidden
                />
              </button>
            </div>
          </SupplierDashboardSectionCard>

          <SupplierDashboardSectionCard dir="rtl">
            <SectionHeaderIcon title="ניהול גלריה" iconSrc="/icons/gallery.svg" iconSizeClass="h-7 w-7" />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickGalleryImages}
              disabled={isUploadingGallery}
            />

            <div
              className="relative grid grid-cols-2 gap-3 sm:grid-cols-4"
              dir="ltr"
            >
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isUploadingGallery}
                className={`flex min-h-[184px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[rgba(255,255,255,0.5)] text-[#94A3B8] transition hover:bg-white/80 ${isUploadingGallery ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isUploadingGallery ? (
                  <svg className="animate-spin size-8 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 5v14M5 12h14" stroke="#94A3B8" strokeWidth="2.67" strokeLinecap="round" />
                  </svg>
                )}
                <span className="text-sm leading-5">{isUploadingGallery ? "מעלה..." : "הוסף תמונה"}</span>
              </button>
              {(() => {
                const mp = me?.marketplaceProfile;
                const apiImages: { id: string; url: string }[] = (mp?.gallery ?? []).map((url: string, i: number) => ({
                  id: `api-${i}-${url}`,
                  url,
                }));
                const allItems: { id: string; url: string; isNew?: boolean }[] = [
                  ...apiImages,
                  ...galleryItems.map((item) => ({ id: item.id, url: item.url, isNew: true })),
                ];
                return allItems.map((item) => (
                  <div
                    key={item.id}
                    className="group relative min-h-[184px] overflow-hidden rounded-2xl border border-[#F1F5F9] bg-slate-100"
                  >
                    <Image src={item.url} alt="" fill className="object-cover" sizes="200px" unoptimized />
                    {item.isNew && (
                      <button
                        type="button"
                        onClick={() => onDeleteGalleryItem(item.id)}
                        aria-label="מחק תמונה"
                        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>
                ));
              })()}
              {me?.marketplaceProfile?.avatarImageUrl && (
                <div className="relative min-h-[184px] overflow-hidden rounded-2xl border-4 border-[#3B82F6] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
                  <Image
                    src={me.marketplaceProfile.avatarImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="240px"
                    unoptimized
                  />
                  <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] font-bold leading-[15px] text-white">
                    תמונת פרופיל
                  </span>
                </div>
              )}
            </div>
          </SupplierDashboardSectionCard>
        </div>

        {showMessages && (
          <div className="fixed inset-0 z-200">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
              aria-label="סגור הודעות"
              onClick={() => setShowMessages(false)}
            />
            <div className="absolute left-6 top-[7.75rem] z-1 w-[min(460px,calc(100vw-48px))] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] p-5 shadow-[0px_24px_50px_rgba(15,23,42,0.25)] sm:left-14 sm:top-[8.75rem]">
              <button
                type="button"
                className="text-2xl leading-none text-[#64748B] font-bold hover:text-[#1E1B4B]"
                onClick={() => setShowMessages(false)}
                aria-label="סגור"
              >
                ×
              </button>
              <div className="space-y-2">
                {DASHBOARD_NOTIFICATIONS.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right">
                    <p className="text-xs font-semibold leading-4 text-[#1E1B4B]">{item.title}</p>
                    <p className="mt-1 text-xs leading-4 text-[#64748B] font-bold">{item.body}</p>
                    <button type="button" className="mt-1 inline-flex items-center gap-1 text-[11px] leading-4 text-[#3B82F6] hover:underline">
                      {item.actionLabel}
                      <span className="text-sm leading-none text-[#3B82F6]" aria-hidden>
                        ←
                      </span>
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}

        {showVerificationModal && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center px-4">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
              aria-label="סגור חלון אימות"
              onClick={() => setShowVerificationModal(false)}
            />
            <div className="relative z-1 w-full max-w-[500px] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] px-8 py-7 text-center shadow-[0px_24px_50px_rgba(15,23,42,0.25)]">
              <button
                type="button"
                className="absolute right-4 top-3 text-xl leading-none text-[#94A3B8] hover:text-[#1E1B4B]"
                onClick={() => setShowVerificationModal(false)}
                aria-label="סגור"
              >
                ×
              </button>

              <h3 className="mx-auto max-w-[280px] text-[34px] font-normal leading-10 text-[#1E1B4B]">
                אימות תווית: תעודת כשרות
              </h3>
              <p className="mx-auto mt-5 max-w-[320px] text-sm leading-[23px] text-[#4B5563]">
                לאחר האישור, הקובץ יופיע בפרופיל העסקי שלך עם אייקון תעודת כשרות.
              </p>

              <input
                ref={verificationInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={onPickVerificationFile}
              />
              <button
                type="button"
                onClick={() => verificationInputRef.current?.click()}
                className="mx-auto mt-8 inline-flex h-12 min-w-[205px] items-center justify-center rounded-[99px] bg-[#201C44] px-8 text-base font-normal leading-6 text-white transition hover:opacity-95"
              >
                צרף קובץ
              </button>

              {verificationFileName ? (
                <p className="mt-4 text-xs leading-5 text-[#1E1B4B]">צורף: {verificationFileName}</p>
              ) : null}

              <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                צריך עזרה? <span className="text-[#3B82F6]">צור קשר עם התמיכה</span>.
              </p>
            </div>
          </div>
        )}

        {showUploadSuccessModal && (
          <div className="fixed inset-0 z-[230] flex items-center justify-center px-4">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
              aria-label="סגור חלון העלאה"
              onClick={() => setShowUploadSuccessModal(false)}
            />
            <div className="relative z-1 w-full max-w-[560px] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] px-7 pb-8 pt-7 text-center shadow-[0px_24px_50px_rgba(15,23,42,0.25)] sm:px-8 sm:pb-10 sm:pt-8">
              <button
                type="button"
                className="absolute right-4 top-3 text-xl leading-none text-[#A3A3A3] hover:text-[#1E1B4B]"
                onClick={() => setShowUploadSuccessModal(false)}
                aria-label="סגור"
              >
                ×
              </button>

              <div className="mx-auto mt-4 flex w-full max-w-[360px] items-center justify-center gap-2 rounded-[99px] bg-[#6AB7FF] px-4 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#201C44]" aria-hidden>
                  <svg width="16" height="12" viewBox="0 0 22 16" fill="none">
                    <path
                      d="M1.5 8L7.5 14L20.5 1.5"
                      stroke="white"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="text-balance text-xl font-normal leading-6 text-[#201C44]">
                  הקובץ הורד בהצלחה!
                </p>
              </div>

              <p className="mt-8 text-4xl font-normal leading-[1.1] text-[#1C1C1C] sm:text-[42px]">
                תודה על שיתוף הפעולה!
              </p>

              <Link
                href="/"
                className="mx-auto mt-10 inline-flex h-14 w-full max-w-[380px] items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-xl font-normal leading-none text-white! transition hover:opacity-95"
              >
                חזרה לעמוד הראשי
                <Image
                  src="/icons/left-arrow.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0 brightness-0 invert"
                  unoptimized
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

"use client";
import { toSlug } from "@/shared/lib/to-slug";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  useGetRecommendedSupplierJobsQuery,
  useGetSupplierReferralLinkQuery,
  useGetMySupplierProfileQuery,
  useUpdateSupplierProfileMutation,
  useUpdateSupplierServiceAreasMutation, useMeQuery,
} from "@/shared/api/api";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { saveSupplierDraftField } from "@/features/job-board/job-board-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const PANEL_CLASS =
  "relative isolate overflow-hidden rounded-2xl border border-[#BFDBFE] bg-white shadow-[0px_4px_24px_rgba(30,27,75,0.08)]";

const INNER_WELL_CLASS =
  "rounded-2xl border border-[#BFDBFE] bg-[#F8FAFC] p-6";

const SERVICE_AREAS = [
  "Eilat and the Arava",
  "Jerusalem",
  "The whole country",
  "Sharon",
  "south",
  "coordinator",
  "north",
] as const;

const SPECIALTIES = [
  "vegan",
  "Envelope",
  "kashrut",
  "Reservist",
  "Ministry of Defense Supplier",
] as const;

const DEMO_JOB_CARDS = [
  {
    timeLabel: "2 hours ago",
    badge: "new" as const,
    meta: "Location: Tel Aviv | Budget: 12,000-15,000 ₪",
    title: "Small wedding for 50 people",
  },
  {
    timeLabel: "yesterday",
    badge: "relevant" as const,
    meta: "Location: Herzliya Pituach | Budget: 8,000-12,000 ₪",
    title: "Corporate evening event",
  },
];

const DASHBOARD_NOTIFICATIONS = [
  {
    title: "Price change",
    body: "Please note that the price of the job offer has changed by 1,000 ₪.",
    actionLabel: "To view a job offer",
  },
  {
    title: "New message",
    body: "Please note that the price of the job offer has changed by 1,000 ₪.",
    actionLabel: "To view a job offer",
  },
  {
    title: "New tender",
    body: "A new and suitable job offer for your business has been published.",
    actionLabel: "To view a job offer",
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
    <div className="relative z-1 mb-6 flex w-full flex-row-reverse items-center justify-end gap-2">
      <h3 className="text-right text-xl font-normal leading-7 text-[#1E1B4B]">{title}</h3>
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
    <section className={`${PANEL_CLASS} p-6 sm:p-10`}>
      <SectionHeaderIcon title={title} iconSrc="/icons/refer.svg" />
      <div className={`relative z-2 ${INNER_WELL_CLASS}`}>
        <div
          dir="ltr"
          className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-1 flex-row items-stretch overflow-hidden rounded-xl border border-[#BFDBFE] bg-white">
            <button
              type="button"
              onClick={onCopy}
              className="shrink-0 bg-[#3B82F6] px-4 py-2.5 text-base font-normal leading-6 text-white transition hover:opacity-95"
            >
              {copied ? "Copied" : "copy"}
            </button>
            <div className="flex min-h-[42px] min-w-0 flex-1 items-center px-4 py-2">
              <p className="w-full truncate text-left text-sm leading-5 text-[#1E293B]" dir="ltr">
                {referralUrl}
              </p>
            </div>
          </div>
          <div className="flex max-w-md flex-col gap-1 text-right sm:shrink-0 sm:pl-2">
            <p className="text-base font-normal leading-6 text-[#1E1B4B]">{shareTitle}</p>
            <p className="text-sm font-normal leading-5 text-[#64748B]">{shareHint}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function JobBadge({ kind }: { kind: "new" | "relevant" }) {
  if (kind === "new") {
    return (
      <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-normal uppercase leading-[15px] text-[#15803D]">
        new
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-normal uppercase leading-[15px] text-[#1D4ED8]">
      Relevant
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
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-normal leading-5 transition ${
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
  const { data: profileData } = useGetMySupplierProfileQuery(undefined, {
    skip: shouldSkipProtectedQueries,
  });
  const [updateProfile, { isLoading: isSavingProfile }] = useUpdateSupplierProfileMutation();
  const [updateServiceAreas, { isLoading: isSavingAreas }] = useUpdateSupplierServiceAreasMutation();
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
  const [category, setCategory] = useState("Event halls");
  const [description, setDescription] = useState(
    "A prestigious event hall in the heart of Sharon, offering an exceptional culinary experience and spectacular modern design for all types of events.",
  );
  const [address, setAddress] = useState("");

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    () => new Set(["coordinator", "north"]),
  );
  const [selectedSpecialties, setSelectedSpecialties] = useState<Set<string>>(
    () => new Set(["Reservist", "Ministry of Defense Supplier"]),
  );
  const [uploadedGalleryImages, setUploadedGalleryImages] = useState<string[]>([]);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showUploadSuccessModal, setShowUploadSuccessModal] = useState(false);
  const [verificationFileName, setVerificationFileName] = useState<string | null>(null);
  const verificationInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profileData) return;
    setBusinessName(profileData.businessName);
    if (profileData.description) setDescription(profileData.description);
  }, [profileData]);

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

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const slug = businessName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      await updateProfile({ businessName, slug, description }).unwrap();
      await updateServiceAreas({
        serviceAreas: [...selectedAreas].map((a) => a.toLowerCase().replace(/\s+/g, "_")),
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

  const onPickGalleryImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const nextUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedGalleryImages((prev) => [...prev, ...nextUrls].slice(0, 12));
    event.target.value = "";
  };

  const onPickVerificationFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVerificationFileName(file.name);
    setShowVerificationModal(false);
    setShowUploadSuccessModal(true);
    event.target.value = "";
  };

  const isSaving = isSavingProfile || isSavingAreas;

  return (
    <ProtectedRoute roles={["supplier", "admin"]}>
      <div
        className="relative min-h-screen w-full overflow-x-hidden"
        style={{ fontFamily: marketingPloniFont }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url('/images/background-1.png'), url('/images/background-2.png')",
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
          aria-label="Open messages"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
        </button>
          <header className="flex flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-[40px] font-normal leading-9 text-[#1E1B4B]">
              Welcome, {displayName}
            </h1>
            <p className="max-w-xl text-base font-normal leading-6 text-[#64748B]">
              Here you can edit your business details, see job offers, and more...
            </p>
          </header>

          {me?.marketplaceProfile && (me.marketplaceProfile.extraLanguage == null || me.marketplaceProfile.kosher == null) && (
            <div className="w-full rounded-2xl border border-[#6AB7FF] bg-[#EEF5FF] p-5 text-right" dir="rtl">
              <h3 className="text-lg text-[#201C44]">Complete your profile</h3>
              <p className="mt-1 text-sm text-[#444650]">Complete these steps to get more job offers.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {me.marketplaceProfile.extraLanguage == null ? (
                  <Link href="/join-supplier/step-2" className="rounded-full border border-[#201C44] px-4 py-1.5 text-sm text-[#201C44] hover:bg-[#201C44] hover:text-white!">Description & social links</Link>
                ) : me.marketplaceProfile.kosher == null && (
                  <Link href="/join-supplier/step-3" className="rounded-full border border-[#201C44] px-4 py-1.5 text-sm text-[#201C44] hover:bg-[#201C44] hover:text-white!">Media upload</Link>
                )}
              </div>
            </div>
          )}

          <ReferFriendBlock
            title="Friend brings friend"
            shareTitle="Share your link"
            shareHint="And receive a bonus for every vendor who signs up through your link."
            referralUrl={referralUrl}
            onCopy={() => copyLink(referralUrl, "referral")}
            copied={copiedReferral}
          />

          <ReferFriendBlock
            title="Send a link to a friend for the rating"
            shareTitle="Share your link"
            shareHint="And get a ranking for your page."
            referralUrl={referralUrl}
            onCopy={() => copyLink(referralUrl, "rating")}
            copied={copiedRating}
          />

          <section className={`${PANEL_CLASS} px-6 pb-8 pt-10 sm:px-10`} dir="rtl">
            <div className="relative z-1 mb-6 flex w-full flex-row items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-2">
                <h3 className="text-right text-xl font-normal leading-7 text-[#1E1B4B]">
                  New job offers in your niche
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
                className="shrink-0 text-base font-normal leading-5 text-[#3B82F6] transition hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="relative z-[2] grid gap-4 md:grid-cols-2">
              {jobCards.map((card) => (
                <article
                  key={card.id}
                  className="rounded-2xl border border-[#F1F5F9] bg-white p-5 text-right"
                >
                  <div className="flex flex-row items-start justify-between gap-2">
                    <span className="text-xs leading-4 text-[#94A3B8]">{card.timeLabel}</span>
                    <JobBadge kind={card.badge} />
                  </div>
                  <h4 className="mt-3 text-base font-normal leading-6 text-[#1E1B4B]">{card.title}</h4>
                  <p className="mt-2 text-xs leading-4 text-[#64748B]">{card.meta}</p>
                </article>
              ))}
            </div>

            <div className="relative z-2 mt-8 flex justify-start">
              <Link
                href="/jobs"
                className="inline-flex h-12 items-center justify-center rounded-[99px] bg-[#201C44] px-10 text-base font-normal leading-6 text-white! shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition hover:opacity-95"
              >
                Go to the auctions page
              </Link>
            </div>
          </section>

          <form className={`${PANEL_CLASS} p-6 sm:p-10`} onSubmit={onSave} dir="rtl">
            <SectionHeaderIcon
              title="Business details"
              iconSrc="/icons/business-detail.svg"
              iconSizeClass="h-[22px] w-5"
            />

            <div className="relative z-[2] grid gap-6 md:grid-cols-2 md:gap-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-right text-xs leading-4 text-[#64748B]">Business name</label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-right text-xs leading-4 text-[#64748B]">category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-[50px] w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                    >
                      <option>Event halls</option>
                      <option>DJ &amp; Music</option>
                      <option>Photography</option>
                    </select>
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" aria-hidden>
                      ▾
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-right text-xs leading-4 text-[#64748B]">Business description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="min-h-[146px] w-full resize-y rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-base leading-6 text-[#1E293B] outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                />
              </div>
            </div>

            <div className="relative z-[2] mt-8">
              <p className="mb-3 text-right text-base leading-5 text-black">Service area</p>
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

            <div className="relative z-[2] mt-8 flex flex-col gap-2">
              <div className="flex flex-row items-center gap-2">
                <span className="rounded-lg bg-black/10 px-2 py-0.5 text-[10px] leading-5 text-black">Optional</span>
                <span className="text-base leading-5 text-black">Business address</span>
              </div>
              <div className="relative">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, house number"
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

            <div className="relative z-[2] mt-8">
              <p className="mb-3 text-right text-base leading-5 text-black">Specialties</p>
              <div className="flex flex-row-reverse flex-wrap justify-end gap-3">
                {SPECIALTIES.map((s) => (
                  <ChipToggle
                    key={s}
                    label={s}
                    selected={selectedSpecialties.has(s)}
                    onToggle={() => {
                      toggleInSet(selectedSpecialties, s, setSelectedSpecialties);
                      if (s === "kashrut") setShowVerificationModal(true);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="relative z-2 mt-10 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-[99px] px-10 text-base font-normal leading-6 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition ${
                  isSaving ? "cursor-not-allowed bg-[#201C44] opacity-60" : "cursor-pointer bg-[#201C44] hover:opacity-95"
                }`}
              >
                {isSaving ? "Saving..." : "Save changes"}
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
          </form>

          <section className={`${PANEL_CLASS} p-6 sm:p-10`} dir="rtl">
            <SectionHeaderIcon title="Links" iconSrc="/icons/linking.svg" iconSizeClass="h-6 w-[30px]" />

            <div className="relative z-[2] flex flex-col gap-8">
              {(
                [
                  [
                    { label: "Email", placeholder: "name@gmail.com", defaultValue: "name@gmail.com" },
                    { label: "Phone number", placeholder: "050-0000000", defaultValue: "050-0000000" },
                  ],
                  [
                    { label: "Personal page", placeholder: "yoursite.com or social URL", defaultValue: "" },
                    { label: "Instagram account", placeholder: "@username", defaultValue: "@username" },
                  ],
                  [
                    { label: "YouTube page", placeholder: "www.youtube.com", defaultValue: "" },
                    { label: "TikTok page", placeholder: "@username", defaultValue: "@username" },
                  ],
                  [
                    { label: "Website", placeholder: "www.example.com", defaultValue: "" },
                    { label: "WhatsApp", placeholder: "050-0000000", defaultValue: "050-0000000" },
                  ],
                ] as const
              ).map((pair, rowIdx) => (
                <div key={rowIdx} className="grid gap-8 md:grid-cols-2">
                  {pair.map((row) => (
                    <div key={row.label} className="flex flex-col gap-2">
                      <label className="text-right text-xs leading-4 text-[#64748B]">{row.label}</label>
                      <input
                        defaultValue={row.defaultValue}
                        placeholder={row.placeholder}
                        className="h-[50px] w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right text-sm text-black outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
                        dir="ltr"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="relative z-2 mt-10 flex justify-start">
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-10 text-base font-normal leading-6 text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition hover:opacity-95"
              >
                Update links
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
          </section>

          <section className={`${PANEL_CLASS} p-6 sm:p-10`} dir="rtl">
            <SectionHeaderIcon title="Gallery management" iconSrc="/icons/gallery.svg" iconSizeClass="h-7 w-7" />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={onPickGalleryImages}
            />

            <div
              className="relative z-[2] grid grid-cols-2 gap-3 sm:grid-cols-4"
              dir="ltr"
            >
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex min-h-[184px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[rgba(255,255,255,0.5)] text-[#94A3B8] transition hover:bg-white/80"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="#94A3B8"
                    strokeWidth="2.67"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm leading-5">Add a photo</span>
              </button>
              {uploadedGalleryImages.map((src) => (
                <div
                  key={src}
                  className="relative min-h-[184px] overflow-hidden rounded-2xl border border-[#F1F5F9] bg-slate-100"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="200px" unoptimized />
                </div>
              ))}
              {["/avatars/3.jpg", "/avatars/2.jpg", "/avatars/1.jpg"].map((src) => (
                <div
                  key={src}
                  className="relative min-h-[184px] overflow-hidden rounded-2xl border border-[#F1F5F9] bg-slate-100"
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="200px" unoptimized />
                </div>
              ))}
              <div className="relative min-h-[184px] overflow-hidden rounded-2xl border-4 border-[#3B82F6] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
                <Image
                  src="/avatars/4.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="240px"
                  unoptimized
                />
                <span className="absolute right-3 top-3 rounded-lg bg-[#3B82F6] px-2 py-1 text-[10px] font-bold leading-[15px] text-white">
                  Set as profile picture
                </span>
              </div>
            </div>
          </section>
        </div>

        {showMessages && (
          <div className="fixed inset-0 z-200">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
              aria-label="Close messages"
              onClick={() => setShowMessages(false)}
            />
            <div className="absolute left-6 top-[7.75rem] z-1 w-[min(460px,calc(100vw-48px))] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] p-5 shadow-[0px_24px_50px_rgba(15,23,42,0.25)] sm:left-14 sm:top-[8.75rem]">
              <button
                type="button"
                className="text-2xl leading-none text-[#64748B] hover:text-[#1E1B4B]"
                onClick={() => setShowMessages(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="space-y-2">
                {DASHBOARD_NOTIFICATIONS.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-right">
                    <p className="text-xs font-semibold leading-4 text-[#1E1B4B]">{item.title}</p>
                    <p className="mt-1 text-xs leading-4 text-[#64748B]">{item.body}</p>
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
              aria-label="Close verification modal"
              onClick={() => setShowVerificationModal(false)}
            />
            <div className="relative z-1 w-full max-w-[500px] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] px-8 py-7 text-center shadow-[0px_24px_50px_rgba(15,23,42,0.25)]">
              <button
                type="button"
                className="absolute right-4 top-3 text-xl leading-none text-[#94A3B8] hover:text-[#1E1B4B]"
                onClick={() => setShowVerificationModal(false)}
                aria-label="Close"
              >
                ×
              </button>

              <h3 className="mx-auto max-w-[280px] text-[34px] font-normal leading-10 text-[#1E1B4B]">
                Label Verification: Kosher Certificate
              </h3>
              <p className="mx-auto mt-5 max-w-[320px] text-sm leading-[23px] text-[#4B5563]">
                Once approved, your file will appear in your business profile with a kosher certificate icon.
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
                Attach a file
              </button>

              {verificationFileName ? (
                <p className="mt-4 text-xs leading-5 text-[#1E1B4B]">Attached: {verificationFileName}</p>
              ) : null}

              <p className="mt-4 text-xs leading-5 text-[#6B7280]">
                Need help? <span className="text-[#3B82F6]">Contact support</span>.
              </p>
            </div>
          </div>
        )}

        {showUploadSuccessModal && (
          <div className="fixed inset-0 z-[230] flex items-center justify-center px-4">
            <button
              type="button"
              className="absolute inset-0 bg-[rgba(15,23,42,0.45)]"
              aria-label="Close upload success modal"
              onClick={() => setShowUploadSuccessModal(false)}
            />
            <div className="relative z-1 w-full max-w-[560px] rounded-2xl border border-[#CFE3FF] bg-[#EAF3FF] px-7 pb-8 pt-7 text-center shadow-[0px_24px_50px_rgba(15,23,42,0.25)] sm:px-8 sm:pb-10 sm:pt-8">
              <button
                type="button"
                className="absolute right-4 top-3 text-xl leading-none text-[#A3A3A3] hover:text-[#1E1B4B]"
                onClick={() => setShowUploadSuccessModal(false)}
                aria-label="Close"
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
                  The file was successfully downloaded!
                </p>
              </div>

              <p className="mt-8 text-4xl font-normal leading-[1.1] text-[#1C1C1C] sm:text-[42px]">
                Thank you for your cooperation!
              </p>

              <Link
                href="/"
                className="mx-auto mt-10 inline-flex h-14 w-full max-w-[380px] items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-8 text-xl font-normal leading-none text-white! transition hover:opacity-95"
              >
                Back to main page
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

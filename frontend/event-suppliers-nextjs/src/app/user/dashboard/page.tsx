"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetUserJobsQuery, useGetUserFavoritesQuery, useGetEventTypesQuery } from "@/shared/api/api";
import { AdditionalSuppliersSection } from "@/features/suppliers/components/additional-suppliers-section";
import { SupplierJobOfferCard } from "@/shared/components/jobs/supplier-job-offer-card";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { useAppSelector } from "@/store/hooks";

function displayNameFromUser(email: string | undefined) {
  if (!email) return "Daniel";
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? "";
  if (!local) return "Daniel";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

const likedConcepts = [
  {
    title: "Summer wedding in Jaffa",
    href: "/event-production/concepts",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    panelBg: "bg-[#EEF5FF]",
  },
  {
    title: "Annual Technology Conference",
    href: "/event-production/concepts",
    image:
      "https://images.unsplash.com/photo-1478144592103-25e218a04891?q=80&w=1200&auto=format&fit=crop",
    panelBg: "bg-[#EAF3FE]",
  },
] as const;

function QuickActionCard(props: {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  iconSrc: string;
}) {
  const { title, description, buttonLabel, href, iconSrc } = props;
  return (
    <div
      className="relative box-border flex w-full min-h-[246px] flex-col items-center rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] shadow-[1px_1px_2px_#4721DF]"
      dir="rtl"
    >
      <div className="flex w-full flex-1 flex-col items-start px-8 pb-6 pt-9">
        <div className="flex flex-row-reverse items-center justify-center gap-2.5">
          <h3 className="text-center text-base font-normal leading-6 text-[#201C44]">
            <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
              {title}
            </span>
          </h3>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#201C44]">
            <Image
              src={iconSrc}
              alt=""
              width={18}
              height={19}
              className="h-[19px] w-[18px] brightness-0 invert"
            />
          </div>
        </div>
        <p className="mt-4 w-full text-right text-sm font-normal leading-[23px] text-[#444650]">
          <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
            {description}
          </span>
        </p>
        <div className="mt-auto flex w-full pt-8">
          <Link
            href={href}
            dir="ltr"
            className="inline-flex h-11 min-w-[199px] items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-5 text-center text-sm font-normal leading-5 text-white!"
          >
            <Image
              src="/icons/left-arrow.svg"
              alt=""
              width={10}
              height={8}
              className="h-2.5 w-auto shrink-0 brightness-0 invert"
              aria-hidden
            />
            {buttonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const sessionUser = useAppSelector((state) => state.auth.user);
  const isAuthHydrated = useAppSelector((state) => state.auth.isHydrated);
  const { data: apiJobs, isLoading } = useGetUserJobsQuery(undefined, {
    skip: !isAuthHydrated || !sessionUser,
  });
  const { data: favoritesData } = useGetUserFavoritesQuery(undefined, {
    skip: !isAuthHydrated || !sessionUser,
  });
  const favoritesCount = favoritesData?.items?.length ?? 0;
  const { data: eventTypes } = useGetEventTypesQuery();

  const concepts = useMemo(() => {
    if (eventTypes && eventTypes.length > 0) {
      return eventTypes.slice(0, 2).map((et, i) => ({
        title: et.name,
        href: "/event-production/concepts",
        image: et.image || likedConcepts[i]?.image || "",
        panelBg: likedConcepts[i]?.panelBg || "bg-[#EEF5FF]",
      }));
    }
    return likedConcepts;
  }, [eventTypes]);

  const myTenders = useMemo(() => (Array.isArray(apiJobs) ? apiJobs : []), [apiJobs]);

  const choosingSuppliersHref = useMemo(() => {
    const tenderId = myTenders[0]?.id;
    return tenderId ? `/user/tenders/${tenderId}/suppliers` : "/jobs/publish";
  }, [myTenders]);

  const welcomeName = displayNameFromUser(sessionUser?.email);

  useEffect(() => {
    if (!isAuthHydrated) return;
    if (sessionUser) return;
    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [sessionUser, isAuthHydrated, router, pathname]);

  if (!sessionUser) return null;

  return (
    <div
      className="relative w-full overflow-x-hidden pb-24 pt-20 sm:pt-24 lg:pt-[123px]"
      dir="rtl"
      lang="he"
      style={{
        fontFamily: marketingPloniFont,
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="flex w-full flex-col text-start">
          <header className="mb-6 w-full lg:mb-8">
            <p className="text-[40px] font-normal leading-9 text-[#1E1B4B] text-right">
              <span dir="ltr" className="inline-block w-full" style={{ unicodeBidi: "isolate" }}>
                Welcome, {welcomeName}.
              </span>
            </p>
          </header>

          <section className="mb-14 w-full" aria-labelledby="quick-actions-heading">
            <h2
              id="quick-actions-heading"
              className="mb-6 text-[30px] font-normal leading-8 text-[#00113A] text-right"
            >
              <span dir="ltr" className="inline-block w-full" style={{ unicodeBidi: "isolate" }}>
                Quick actions
              </span>
            </h2>
            <div className="flex w-full flex-col gap-6 md:flex-row md:gap-9 lg:gap-8">
              <div className="min-w-0 flex-1">
                <QuickActionCard
                  title="Add a new tender"
                  description="Add a tender to find the breaks that suit you best."
                  buttonLabel="To open a tender"
                  href="/jobs/publish"
                  iconSrc="/icons/hammer.svg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <QuickActionCard
                  title="Supplier Approval Page"
                  description={`You have ${favoritesCount} supplier${favoritesCount !== 1 ? "s" : ""} saved.`}
                  buttonLabel="Choosing suppliers"
                  href={choosingSuppliersHref}
                  iconSrc="/icons/calender-white.svg"
                />
              </div>
            </div>
          </section>
        </div>

        <section className="mb-16 w-full" aria-labelledby="tenders-heading">
          <div className="mb-8 flex w-full flex-col gap-1 text-right">
            <h2
              id="tenders-heading"
              className="text-2xl font-normal leading-8 text-[#00113A]"
            >
              <span className="inline-block" style={{ unicodeBidi: "isolate" }}>
                Manage my tenders
              </span>
            </h2>
            <p className="text-sm font-normal leading-5 text-[#444650]">
              <span className="inline-block" style={{ unicodeBidi: "isolate" }}>
                The best offers for your auction
              </span>
            </p>
          </div>

          {isLoading ? (
            <p className="w-full rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] p-8 text-[#00113A]">
              <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
                Loading tenders…
              </span>
            </p>
          ) : myTenders.length === 0 ? (
            <div
              className="w-full rounded-[14px] border border-[#4721DF] bg-[rgba(230,241,255,0.64)] p-8 text-[#00113A]"
              dir="rtl"
            >
              <p className="text-start text-base leading-6">No tenders published yet.</p>
              <div className="mt-4 flex justify-start">
                <Link
                  href="/jobs/publish"
                  className="inline-flex h-11 items-center justify-center rounded-[99px] bg-[#201C44] px-8 text-sm text-white!"
                >
                  Publish a new tender
                </Link>
              </div>
            </div>
          ) : (
            <>
              <ul className="flex w-full list-none flex-col gap-6 md:flex-row md:flex-wrap md:gap-x-9 md:gap-y-8">
                {myTenders.map((job) => (
                  <li
                    key={job.id}
                    className="flex min-w-0 w-full flex-col md:w-[calc(50%-1.125rem)]"
                  >
                    <SupplierJobOfferCard job={job} />
                    <div className="mt-6 flex flex-wrap justify-start gap-3">
                      <Link
                        href={`/user/tenders/${job.id}/suppliers`}
                        dir="ltr"
                        className="inline-flex h-8 min-w-[160px] items-center justify-center gap-2 rounded-[99px] bg-[#201C44] px-4 text-center text-sm font-normal leading-5 text-white!"
                      >
                        <Image
                          src="/icons/left-arrow.svg"
                          alt=""
                          width={10}
                          height={8}
                          className="h-2.5 w-auto shrink-0 brightness-0 invert"
                          aria-hidden
                        />
                        Tendering
                      </Link>
                      <Link
                        href={`/user/tenders/${job.id}/edit`}
                        dir="ltr"
                        className="inline-flex h-8 min-w-[140px] items-center justify-center rounded-[99px] border border-[#4721DF] px-4 text-center text-sm font-normal leading-5 text-[#4721DF]"
                      >
                        Edit tender
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <AdditionalSuppliersSection className="mb-16" />

        <section className="w-full pb-8" aria-labelledby="concepts-heading">
          <div className="mb-6 flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-end">
            <h2 id="concepts-heading" className="text-[30px] font-normal leading-8 text-black">
              <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
                Concepts I liked
              </span>
            </h2>
            <Link
              href="/event-production/concepts"
              className="text-sm font-normal leading-5 text-black hover:underline"
            >
              <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
                For all concepts
              </span>
            </Link>
          </div>
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-2 md:gap-x-6">
            {concepts.map((c) => (
              <article
                key={c.title}
                className={`w-full max-w-[452px] justify-self-center overflow-hidden rounded-lg border border-[#4721DF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] md:max-w-none ${c.panelBg}`}
                dir="rtl"
              >
                <div className="relative h-48 w-full sm:h-52">
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 420px"
                  />
                </div>
                <div className="flex flex-col gap-2.5 p-6 text-start">
                  <h3 className="text-xl font-normal leading-7 text-[#00113A]">
                    <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
                      {c.title}
                    </span>
                  </h3>
                  <Link
                    href={c.href}
                    className="text-sm font-normal leading-5 text-[#4721DF] hover:underline"
                  >
                    <span dir="ltr" className="inline-block" style={{ unicodeBidi: "isolate" }}>
                      To view the concept
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

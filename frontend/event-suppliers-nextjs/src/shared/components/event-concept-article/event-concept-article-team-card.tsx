import Image from "next/image";
import Link from "next/link";
import type { EventConceptArticleTeamMember } from "@/shared/types/event-concept-article";

export function EventConceptArticleTeamCard({ member }: { member: EventConceptArticleTeamMember }) {
  return (
    <article className="flex w-full max-w-[min(100%,227px)] flex-col items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:max-w-[227px] sm:p-6">
      <div className="box-border flex size-20 items-center justify-center rounded-full border-2 border-[#201C44] p-0.5">
        <div className="relative size-[76px] overflow-hidden rounded-full">
          <Image src={member.imageSrc} alt={member.imageAlt} fill className="object-cover" sizes="76px" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-lg font-bold leading-7 text-[#0F172A]">{member.name}</h3>
        <p className="text-sm font-normal leading-5 text-[#201C44]">{member.specialty}</p>
        <Link href={member.profileHref} className="text-sm font-normal leading-5 text-[#0F172A] underline underline-offset-2">
          צפייה בפרופיל
        </Link>
      </div>
    </article>
  );
}

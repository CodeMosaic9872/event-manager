import { notFound } from "next/navigation";
import { EventConceptArticleView } from "@/shared/components/event-concept-article/event-concept-article-view";
import { getEventConceptArticle, getEventConceptArticleStaticParams } from "@/shared/lib/get-event-concept-article";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";

export function generateStaticParams() {
  return getEventConceptArticleStaticParams();
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventConceptArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getEventConceptArticle(slug);
  if (!article) notFound();

  return (
    <MarketingPageShell
      dir="ltr"
      lang="en"
      showBackgroundImage
      className="!bg-white"
      contentClassName="items-stretch pt-20 sm:pt-24 lg:pt-[143px]"
    >
      <EventConceptArticleView article={article} />
    </MarketingPageShell>
  );
}

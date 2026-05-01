import { SupplierSimilarCard, type SupplierSimilarCardProps } from "./supplier-similar-card";

type SupplierSimilarSuppliersSectionProps = {
  items: SupplierSimilarCardProps[];
};

export function SupplierSimilarSuppliersSection({ items }: SupplierSimilarSuppliersSectionProps) {
  const dropShadow =
    "drop-shadow(-84px 261px 110px rgba(0, 0, 0, 0.01)) drop-shadow(-47px 147px 92px rgba(0, 0, 0, 0.05)) drop-shadow(-21px 65px 68px rgba(0, 0, 0, 0.09)) drop-shadow(-5px 16px 38px rgba(0, 0, 0, 0.1))";

  return (
    <section className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-5 py-16 lg:px-20">
      <div className="flex h-8 w-full max-w-[1120px] flex-col items-end">
        <h3 className="text-right text-2xl leading-8 text-black">אולי יעניין אותך גם</h3>
      </div>
      <div
        className="flex w-full max-w-[1120px] flex-row flex-wrap justify-center gap-6 dir-ltr"
        style={{ filter: dropShadow }}
      >
        {items.map((item) => (
          <SupplierSimilarCard key={item.id} {...item} />
        ))}
      </div>
    </section>
  );
}

import { PillAction } from "@/shared/components/pill-action";

type SupplierProfileCtaRowProps = {
  onRate: () => void;
};

export function SupplierProfileCtaRow({ onRate }: SupplierProfileCtaRowProps) {
  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 pt-4 sm:gap-6">
        <PillAction
          onClick={onRate}
          variant="outline"
          className="h-[50px] w-full min-w-0 max-w-[260px] border border-black text-lg leading-6 text-black sm:min-w-[192px]"
        >
          Rate the supplier
        </PillAction>
      </div>
      <div className="mx-auto flex w-full justify-center gap-6 pt-4">
        <PillAction href="/ai-planner" variant="dark" size="lg" className="w-full max-w-[277px]">
        תכנון אירוע עם AI
        </PillAction>
      </div>
    </>
  );
}

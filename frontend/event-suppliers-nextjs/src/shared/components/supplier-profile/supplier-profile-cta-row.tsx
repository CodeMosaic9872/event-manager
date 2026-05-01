import { PillAction } from "@/shared/components/pill-action";

type SupplierProfileCtaRowProps = {
  onRate: () => void;
};

export function SupplierProfileCtaRow({ onRate }: SupplierProfileCtaRowProps) {
  return (
    <>
      <div className="flex w-full flex-row items-center justify-end gap-6 pt-4">
        <PillAction
          onClick={onRate}
          variant="outline"
          className="h-[50px] min-w-[192px] border border-black text-lg leading-6 text-black"
        >
          Rate the supplier
        </PillAction>
      </div>
      <div className="mx-auto flex w-full justify-center gap-6 pt-4">
        <PillAction href="/ai-planner" variant="dark" size="lg" className="w-[277px]">
        תכנון אירוע עם AI
        </PillAction>
      </div>
    </>
  );
}

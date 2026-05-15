import { PillAction } from "@/shared/components/pill-action";

type SupplierProfileCtaRowProps = {
  onRate: () => void;
  hasReviewed?: boolean;
  isLoggedIn?: boolean;
};

export function SupplierProfileCtaRow({ onRate, hasReviewed = false, isLoggedIn = false }: SupplierProfileCtaRowProps) {
  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-end gap-3 pt-4 sm:gap-6">
        {isLoggedIn ? (
          hasReviewed ? (
            <span className="inline-flex h-[50px] w-full max-w-[260px] items-center justify-center rounded-[99px] border border-green-400 bg-green-50 text-lg leading-6 text-green-700 sm:min-w-[192px]">
              Already reviewed
            </span>
          ) : (
            <PillAction
              onClick={onRate}
              variant="outline"
              className="h-[50px] w-full min-w-0 max-w-[260px] border border-black text-lg leading-6 text-black sm:min-w-[192px]"
            >
              דרג את הספק
            </PillAction>
          )
        ) : null}
      </div>
      <div className="mx-auto flex w-full justify-center gap-6 pt-4">
        <PillAction href="/ai-planner" variant="dark" size="lg" className="w-full max-w-[277px]">
          תכנון אירוע עם AI
        </PillAction>
      </div>
    </>
  );
}

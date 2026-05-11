export function SupplierProfileBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/background-1.png')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-[url('/images/background-2.png')] bg-cover bg-center opacity-30" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/60 to-white" />
    </div>
  );
}

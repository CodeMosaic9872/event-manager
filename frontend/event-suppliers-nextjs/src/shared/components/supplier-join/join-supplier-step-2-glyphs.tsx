export function JoinSupplierStep2LinkGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 13a5 5 0 007.07 0l1.42-1.42a5 5 0 00-7.07-7.07L9 6.5M14 11a5 5 0 00-7.07 0L5.5 12.42a5 5 0 007.07 7.07L15 17.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function JoinSupplierStep2PinGlyph({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="11" r="2.5" fill="currentColor" />
    </svg>
  );
}

import { useEffect } from "react";

/** Locks document scrolling while a modal is open (body + root html). */
export function useModalScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [locked]);
}

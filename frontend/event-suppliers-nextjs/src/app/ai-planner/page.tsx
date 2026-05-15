"use client";

import { FormEvent, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MarketingPageShell } from "@/shared/components/marketing-page-shell";
import { marketingPloniFont } from "@/shared/lib/marketing-typography";
import { addMessage, clearMessages } from "@/features/ai-planner/ai-planner-slice";
import { incrementAiMessageCount } from "@/features/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useCreateConversationMutation,
  useSendConversationMessageMutation,
} from "@/shared/api/api";
import Image from "next/image";

/** Max AI chat messages for anonymous users before login/register is required. */
const AI_FREE_MESSAGE_LIMIT = 5;

type ChipIconName = "help" | "sparkles" | "cake" | "briefcase" | "heart";

function ChipIcon({ name, className = "" }: { name: ChipIconName; className?: string }) {
  const common = `shrink-0 text-[#475569] ${className}`;
  switch (name) {
    case "help":
      return (
        <svg className={common} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M5.2 5.1c.2-.9.9-1.5 1.8-1.5 1 0 1.8.8 1.8 1.7 0 1.2-1.5 1.1-1.6 2.4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10.2" r="0.6" fill="currentColor" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={common} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 2v2M7 10v2M2 7h2M10 7h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d="M4.5 4.5l1 1M8.5 8.5l1 1M8.5 4.5l-1 1M4.5 8.5l-1 1"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <circle cx="7" cy="7" r="1.5" fill="currentColor" />
        </svg>
      );
    case "cake":
      return (
        <svg className={common} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M3 8h8v3H3V8zM4 8V6.5C4 5.7 4.7 5 5.5 5h3C9.3 5 10 5.7 10 6.5V8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path d="M5 5V4M7 5V3.5M9 5V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className={common} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="2.5" y="4.5" width="9" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M5 4.5V3.8C5 3.4 5.4 3 5.8 3h2.4c.4 0 .8.4.8.8v.7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2.5 7.5h9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "heart":
      return (
        <svg className={common} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path
            d="M7 11.5S3.5 9.2 2.5 6.5C2 5.2 2.8 3.8 4.2 3.8c.8 0 1.5.5 1.8 1.2.3-.7 1-1.2 1.8-1.2 1.4 0 2.2 1.4 1.7 2.7C10.5 9.2 7 11.5 7 11.5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

type StarterMessage = {
  id: string;
  role: "assistant";
  body: string;
  rowPaddingLeft: string;
};

const STARTER_MESSAGES: StarterMessage[] = [
  {
    id: "intro-1",
    role: "assistant",
    rowPaddingLeft: "pl-0 lg:pl-[111px]",
    body: "שלום! אני מפיק ה-AI האישי שלך לתכנון אירועים. אני כאן כדי לעזור לך להפוך כל חלום למציאות. כדי שנוכל להתחיל, איזה סוג אירוע אנחנו מתכננים היום? (חתונה, אירוע עסקי, יום הולדת וכו')",
  },
  {
    id: "intro-2",
    role: "assistant",
    rowPaddingLeft: "pl-0 lg:pl-[69.54px]",
    body: "מעולה, תקציב של 250₪ לאדם הוא בסיס מצוין לכנס השקה איכותי. האם תרצי שאציע לך רשימת אולמות במרכז שמתאימים לכמות הזו, או שנתחיל בבניית תפריט קייטרינג?",
  },
];

/** RTL visual order (reference): wedding … Help — DOM wedding-first + dir=rtl places wedding on the right. */
const QUICK_CHIPS: { label: string; prompt: string; icon: ChipIconName }[] = [
  { label: "חתונה", prompt: "חתונה", icon: "heart" },
  { label: "אירוע עסקי", prompt: "אירוע עסקי", icon: "briefcase" },
  { label: "יום הולדת", prompt: "יום הולדת", icon: "cake" },
  { label: "בר/בת מצווה", prompt: "בר/בת מצווה", icon: "sparkles" },
  { label: "עזור לי לבחור", prompt: "עזור לי לבחור", icon: "help" },
];

const RegistrationQuotaModal = dynamic(
  () => import("./registration-quota-modal").then((m) => m.RegistrationQuotaModal),
  { ssr: false },
);

export default function AiPlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [quotaModalDismissed, setQuotaModalDismissed] = useState(false);
  const dispatch = useAppDispatch();
  const [createConversation] = useCreateConversationMutation();
  const [sendConversationMessage] = useSendConversationMessageMutation();
  const messages = useAppSelector((state) => state.aiPlanner.messages);
  const aiMessageCount = useAppSelector((state) => state.auth.aiMessageCount);
  const isLoggedIn = Boolean(useAppSelector((state) => state.auth.user));
  const requiresRegistration = aiMessageCount >= AI_FREE_MESSAGE_LIMIT && !isLoggedIn;
  const showQuotaModal = requiresRegistration && !quotaModalDismissed;

  const renderedList = useMemo(() => {
    if (messages.length > 0) {
      return messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        body: msg.content.replace(/\s*\n+\s*/g, " ").trim(),
        rowPaddingLeft: msg.role === "assistant" ? "pl-0 lg:pl-4" : "pl-0",
      }));
    }
    return STARTER_MESSAGES.map((s) => ({
      id: s.id,
      role: s.role,
      body: s.body,
      rowPaddingLeft: s.rowPaddingLeft,
    }));
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requiresRegistration) {
      if (prompt.trim()) setQuotaModalDismissed(false);
      return;
    }
    if (!prompt.trim()) return;

    const now = Date.now().toString();
    dispatch(addMessage({ id: `u-${now}`, role: "user", content: prompt }));
    try {
      const ensuredConversationId =
        conversationId || (await createConversation({ eventType: "wedding" }).unwrap()).id;
      if (!conversationId) setConversationId(ensuredConversationId);
      const response = await sendConversationMessage({
        id: ensuredConversationId,
        message: prompt,
      }).unwrap();
      dispatch(
        addMessage({
          id: `a-${now}`,
          role: "assistant",
          content:
            response.reply ||
            "מצאתי עבורך ספקים רלוונטיים ונקודות תכנון. אפשר להמשיך לבחירת קטגוריה מדויקת.",
        }),
      );
    } catch {
      dispatch(
        addMessage({
          id: `a-${now}`,
          role: "assistant",
          content: "מומלץ להתחיל בבחירת קטגוריות: מוזיקה, צילום וקייטרינג בהתאם לתקציב שלך.",
        }),
      );
    }
    dispatch(incrementAiMessageCount());
    setPrompt("");
  };

  return (
    <MarketingPageShell
      showBackgroundImage={false}
      overlay={
        <RegistrationQuotaModal
          key={String(showQuotaModal)}
          open={showQuotaModal}
          onClose={() => setQuotaModalDismissed(true)}
          freeMessageLimit={AI_FREE_MESSAGE_LIMIT}
        />
      }
    >
        <h1
          className="font-bold max-w-4xl px-1 bg-[linear-gradient(180deg,#201C44_0%,#0657A2_100%)] bg-clip-text text-center text-[26px] leading-[1.15] text-transparent sm:text-[34px] sm:leading-tight md:text-[46px] lg:text-[60px] lg:leading-[60px] lg:tracking-[-1.5px]"
          style={{ fontFamily: marketingPloniFont }}
        >
          תכנון אירוע בעזרת מפיק AI
        </h1>

        <div
          dir="ltr"
          className="mt-4 box-border flex w-full max-w-[896px] flex-col items-stretch overflow-hidden rounded-2xl border border-[rgba(225,225,225,0.7)] bg-[rgba(255,255,255,0.92)] shadow-[0_25px_50px_-12px_rgba(15,23,42,0.15),-206px_35px_84px_rgba(0,0,0,0.01),-116px_20px_71px_rgba(0,0,0,0.05),-52px_9px_52px_rgba(0,0,0,0.09),-13px_2px_29px_rgba(0,0,0,0.1)] backdrop-blur-[6px] sm:mt-6 sm:rounded-[20px] lg:min-h-[773px]"
        >
          <div className="box-border flex min-h-[64px] shrink-0 items-center justify-between gap-3 border-b border-[#F1F5F9] bg-[rgba(255,255,255,0.5)] px-3 py-2 sm:h-[73px] sm:px-4 sm:py-0">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md p-2 text-[#94A3B8] transition hover:bg-black/5"
              aria-label="Clear chat"
              onClick={() => {
                dispatch(clearMessages());
                setConversationId("");
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M8 4h4M7 4V3.5A1 1 0 018.5 2h3A1 1 0 0113 3.5V4M4 6h12l-1 11H5L4 6z"
                  stroke="currentColor"
                  strokeWidth="1.67"
                  strokeLinejoin="round"
                />
                <path d="M8 9v5M12 9v5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end text-right" style={{ fontFamily: marketingPloniFont }}>
                <h3 className="font-bold text-[#1E1B4B] text-[16px] leading-6">מפיק ה-AI שלך</h3>
                <p className="text-[12px] leading-[15px] text-[#717C8C]">מחובר ומוכן לעזור</p>
              </div>
              <div className="relative isolate flex size-10 shrink-0 items-center justify-center rounded-full bg-[#201C44]">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
                  <path
                    d="M6 9.5C6 7 8 5 10.5 5h4a2.5 2.5 0 012.5 2.5V11a3 3 0 01-3 3H11l-4 2.5V14a3 3 0 01-3-3V9.5z"
                    stroke="white"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="absolute bottom-0 right-0 z-10 box-border size-3 rounded-full border-2 border-white bg-[#22C55E]" />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#e6e7e7] px-3 pt-4 pb-5 sm:px-6 sm:pt-[26px] sm:pb-6 lg:max-h-[505px]">
            <div className="flex flex-col gap-4 sm:gap-6">
              {renderedList.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-4 ${msg.rowPaddingLeft} ${
                    msg.role === "assistant" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <>
                      <div
                        className="max-w-[calc(100%-2.5rem)] rounded-[20px_20px_0px_20px] bg-white px-3 py-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:max-w-[min(601px,calc(100%-3rem))] sm:px-4 sm:py-[15px] sm:pb-[16.75px]"
                        style={{ fontFamily: marketingPloniFont }}
                      >
                        <p className="wrap-break-word text-right text-[13px] leading-snug text-[#1E293B] sm:text-[14px] sm:leading-[23px]">
                          {msg.body}
                        </p>
                      </div>
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#6AB7FF] text-[9px] font-semibold leading-none text-white sm:mt-1 sm:size-8 sm:text-[10px] sm:leading-[15px]">
                        AI
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E2E8F0] text-[#475569] sm:mt-1 sm:size-8"
                        aria-hidden
                      >
                        <svg
                          className="size-[14px] sm:size-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div
                        className="max-w-[calc(100%-2.5rem)] rounded-[20px_20px_20px_0px] bg-[#1E1B4B] px-4 py-3 text-right text-[14px] leading-[23px] text-white sm:max-w-[min(560px,calc(100%-3rem))]"
                        style={{ fontFamily: marketingPloniFont }}
                      >
                        {msg.body}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="-mx-1 box-border min-h-[52px] shrink-0 overflow-x-auto overflow-y-hidden border-t border-[#EEF2F7] bg-[#e6e7e7] px-3 py-2.5 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:min-h-[58px] sm:overflow-x-visible sm:overflow-y-visible sm:px-6 sm:py-3">
            <div
              dir="rtl"
              className="flex w-max min-w-[min(100%,896px)] flex-nowrap items-center justify-start gap-2 pb-1 sm:w-auto sm:flex-wrap sm:pb-0"
            >
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="inline-flex h-[32px] shrink-0 items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 text-[11px] leading-4 text-[#475569] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] sm:h-[34px] sm:gap-2 sm:px-4 sm:text-[12px]"
                  style={{ fontFamily: marketingPloniFont }}
                  onClick={() => setPrompt(chip.prompt)}
                >
                  <ChipIcon name={chip.icon} />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="box-border flex min-h-0 shrink-0 flex-col gap-3 border-t border-[#EEF2F7] bg-white p-4 sm:min-h-[105px] sm:gap-4 sm:p-6">
            <form onSubmit={handleSubmit} className="relative isolate w-full space-y-3 sm:space-y-0">
              <input
                className="box-border h-12 w-full rounded-full bg-[#F8FAFC] py-3 pl-4 pr-4 text-right text-[15px] leading-snug text-[#1E293B] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#6B7280] sm:h-14 sm:py-[17px] sm:pl-[96px] sm:pr-6 sm:text-[16px] sm:leading-[19px]"
                style={{ fontFamily: marketingPloniFont }}
                placeholder="הקלד הודעה כאן..."
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
              <div className="flex items-center justify-start gap-2 sm:pointer-events-none sm:absolute sm:left-2 sm:top-1/2 sm:-translate-y-1/2">
                <button
                  type="submit"
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#1E1B4B] px-4 text-[14px] leading-5 text-white sm:pointer-events-auto sm:h-10 sm:gap-2 sm:px-6 sm:text-[16px] sm:leading-6"
                  style={{ fontFamily: marketingPloniFont }}
                >
                 <Image src="/icons/left-arrow.svg" alt="שלח" width={16} height={16} className="brightness-0 invert" />
                  שלח
                </button>
                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] hover:bg-black/5 sm:pointer-events-auto sm:size-10"
                  aria-label="Attach file"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
    </MarketingPageShell>
  );
}

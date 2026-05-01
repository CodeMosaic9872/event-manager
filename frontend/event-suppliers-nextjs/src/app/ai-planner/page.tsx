"use client";

import { FormEvent, useState } from "react";
import { addMessage } from "@/features/ai-planner/ai-planner-slice";
import { incrementAiMessageCount } from "@/features/auth/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  useCreateConversationMutation,
  useSendConversationMessageMutation,
} from "@/shared/api/api";

export default function AiPlannerPage() {
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState("");
  const dispatch = useAppDispatch();
  const [createConversation] = useCreateConversationMutation();
  const [sendConversationMessage] = useSendConversationMessageMutation();
  const messages = useAppSelector((state) => state.aiPlanner.messages);
  const aiMessageCount = useAppSelector((state) => state.auth.aiMessageCount);
  const isLoggedIn = Boolean(useAppSelector((state) => state.auth.user));
  const requiresRegistration = aiMessageCount >= 10 && !isLoggedIn;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || requiresRegistration) return;

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
    <section className="mx-auto w-full max-w-[1200px] rounded-[24px] border border-[#bfdbfe] bg-[linear-gradient(180deg,#9BD3EF_0%,#FFFFFF_58%)] p-8">
      <div className="rounded-2xl border border-[#201c44] bg-white/60 p-6">
        <h1 className="text-right text-3xl text-[#201c44]">תכנון אירוע עם AI</h1>
        <p className="mt-1 text-right text-sm text-slate-600">
          הודעות חינמיות: {Math.max(10 - aiMessageCount, 0)} מתוך 10
        </p>
      </div>
      {requiresRegistration && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          הגעת למגבלת 10 הודעות חינמיות. יש להתחבר כדי להמשיך.
        </div>
      )}
      <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto rounded-2xl border border-[#4721df] bg-[rgba(198,220,255,0.30)] p-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.role === "user"
                ? "mr-auto bg-blue-700 text-white"
                : "ml-auto bg-slate-100 text-slate-900"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          className="flex-1 rounded-full border border-[#201c44] px-4 py-2"
          placeholder="לדוגמה: אני צריך DJ לחתונה בירושלים"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button className="figma-primary-btn" type="submit">
          שלח
        </button>
      </form>
    </section>
  );
}

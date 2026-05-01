import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Message = { id: string; role: "user" | "assistant"; content: string };

type AiPlannerState = {
  messages: Message[];
};

const initialState: AiPlannerState = {
  messages: [
    {
      id: "welcome",
      role: "assistant",
      content: "שלום! אני עוזר התכנון החכם שלך. איזה אירוע את/ה מתכנן/ת?",
    },
  ],
};

const aiPlannerSlice = createSlice({
  name: "aiPlanner",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
});

export const { addMessage } = aiPlannerSlice.actions;
export default aiPlannerSlice.reducer;

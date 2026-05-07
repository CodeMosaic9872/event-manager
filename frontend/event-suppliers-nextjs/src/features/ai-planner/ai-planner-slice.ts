import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Message = { id: string; role: "user" | "assistant"; content: string };

type AiPlannerState = {
  messages: Message[];
};

const initialState: AiPlannerState = {
  messages: [],
};

const aiPlannerSlice = createSlice({
  name: "aiPlanner",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = aiPlannerSlice.actions;
export default aiPlannerSlice.reducer;

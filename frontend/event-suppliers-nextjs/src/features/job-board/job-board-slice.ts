import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Job = {
  id: string;
  title: string;
  eventType: string;
  city: string;
  budget: string;
  date: string;
  description: string;
  isMine?: boolean;
};

type JobBoardState = {
  jobs: Job[];
  supplierDraft: Partial<Record<string, string>>;
};

const initialState: JobBoardState = {
  jobs: [],
  supplierDraft: {},
};

const jobBoardSlice = createSlice({
  name: "jobBoard",
  initialState,
  reducers: {
    addJob: (state, action: PayloadAction<Job>) => {
      state.jobs.unshift(action.payload);
    },
    upsertJob: (state, action: PayloadAction<Job>) => {
      const idx = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (idx >= 0) state.jobs[idx] = action.payload;
      else state.jobs.unshift(action.payload);
    },
    saveSupplierDraftField: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.supplierDraft[action.payload.key] = action.payload.value;
    },
  },
});

export const { addJob, upsertJob, saveSupplierDraftField } = jobBoardSlice.actions;
export default jobBoardSlice.reducer;

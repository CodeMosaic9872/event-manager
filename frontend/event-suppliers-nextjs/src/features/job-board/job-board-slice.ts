import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Job = {
  id: string;
  title: string;
  eventType: string;
  city: string;
  budget: string;
  date: string;
  description: string;
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
    saveSupplierDraftField: (
      state,
      action: PayloadAction<{ key: string; value: string }>,
    ) => {
      state.supplierDraft[action.payload.key] = action.payload.value;
    },
  },
});

export const { addJob, saveSupplierDraftField } = jobBoardSlice.actions;
export default jobBoardSlice.reducer;

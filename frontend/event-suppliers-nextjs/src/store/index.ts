import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "@/features/auth/auth-slice";
import marketplaceReducer from "@/features/marketplace/marketplace-slice";
import aiPlannerReducer from "@/features/ai-planner/ai-planner-slice";
import jobBoardReducer from "@/features/job-board/job-board-slice";
import { api } from "@/shared/api/api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    marketplace: marketplaceReducer,
    aiPlanner: aiPlannerReducer,
    jobBoard: jobBoardReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

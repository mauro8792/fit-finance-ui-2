import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth";
import { studentSlice } from "./studentSlice";
import { sportSlice } from "./sportSlice";
import { sportPlanSlice } from "./sportPlanSlice";
import { feeSlice } from "./feeSlice";
import { paymentSlice } from "./paymentSlice";
import { coachSlice } from "./coachSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    student: studentSlice.reducer,
    sport: sportSlice.reducer,
    sportPlan: sportPlanSlice.reducer,
    fee: feeSlice.reducer,
    payment: paymentSlice.reducer,
    coaches: coachSlice.reducer,
  },
});

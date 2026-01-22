import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendUrl } from "../url";
import type { RootState } from "./index";

const baseQuery = fetchBaseQuery({
  baseUrl: backendUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;

    const adminInfo = state.adminAuth?.adminInfo;
    const adminToken = adminInfo?.token;

    if (adminToken) {
      headers.set("Authorization", `Bearer ${adminToken}`);
    }

    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Admin", "Theater"],
  endpoints: () => ({}),
});

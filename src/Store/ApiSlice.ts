import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { backendUrl } from "../url";

const baseQuery = fetchBaseQuery({ baseUrl: backendUrl });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Admin", "Theater"],
  endpoints: (builder) => ({}),
});

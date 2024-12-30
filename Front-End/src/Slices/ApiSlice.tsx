import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({ baseUrl: 'https://tickethive.fun', credentials: 'include',  });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'], 
  endpoints: () => ({}),
});

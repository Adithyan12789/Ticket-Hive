import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({ 
  baseUrl: 'https://tickethive.fun/api/users/get-movies',
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'],
  endpoints: () => ({}),
}); 
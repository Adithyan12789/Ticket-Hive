import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ 
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://ticket-hive-twk0.onrender.com/',
  credentials: 'include',
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Admin', 'TheaterOwner'],
  endpoints: () => ({}),
});


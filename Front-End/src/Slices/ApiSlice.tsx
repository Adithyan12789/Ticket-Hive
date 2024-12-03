import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User'], 
  endpoints: () => ({}),
});


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
// import type { RootState } from '../Store';
// import { setCredentials, logout } from '../Slices/AuthSlice';

// const baseQuery = fetchBaseQuery({
//   baseUrl: '',
//   prepareHeaders: (headers, { getState }) => {
//     const token = (getState() as RootState).auth?.userInfo?.accessToken;
//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
//   args,
//   api,
//   extraOptions
// ) => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result.error && result.error.status === 401) {
//     const refreshToken = (api.getState() as RootState).auth?.userInfo?.refreshToken;

//     if (refreshToken) {
//       const refreshResult = await baseQuery(
//         {
//           url: '/users/refresh-token',
//           method: 'POST',
//           body: { refreshToken },
//         },
//         api,
//         extraOptions
//       );

//       if (refreshResult.data) {
//         api.dispatch(setCredentials(refreshResult.data as { accessToken: string; refreshToken: string }));

//         result = await baseQuery(args, api, extraOptions);
//       } else {
//         api.dispatch(logout());
//       }
//     } else {
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

// export const apiSlice = createApi({
//   baseQuery: baseQueryWithReauth,  // This ensures your refresh token logic is used across all endpoints
//   tagTypes: ['User'],
//   endpoints: () => ({}),
// });

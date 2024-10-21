import { apiSlice } from "./ApiSlice";
import { AdminResponse, AdminCredentials } from "../Types";


const ADMIN_URL = '/api/admin';

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<AdminResponse, AdminCredentials>({
      query: (data) => ({
        url: `${ADMIN_URL}/admin-login`,
        method: 'POST',
        body: data,
      }),
    }),

    getUserData:builder.mutation({
      query:()=>({
         url:`${ADMIN_URL}/get-user` ,
         method:'POST',
      })
    }),

    getTheaterOwnerData:builder.mutation({
      query:()=>({
         url:`${ADMIN_URL}/get-theaterOwners` ,
         method:'POST',
      })
    }),

    adminBlockUser: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/block-user`,
        method: 'PATCH',
        body,
      }),
    }),

    adminUnblockUser: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/unblock-user`,
        method: 'PATCH',
        body,
      }),
    }),

    adminBlockTheaterOwner: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/block-theaterOwner`,
        method: 'PATCH',
        body,
      }),
    }),

    adminUnblockTheaterOwner: builder.mutation({
      query: (body) => ({
        url: `${ADMIN_URL}/unblock-theaterOwner`,
        method: 'PATCH',
        body,
      }),
    }),

    adminLogout: builder.mutation<void, void>({
      query: () => ({
        url: `${ADMIN_URL}/admin-logout`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useGetUserDataMutation,
  useGetTheaterOwnerDataMutation,
  useAdminBlockUserMutation,
  useAdminUnblockUserMutation,
  useAdminBlockTheaterOwnerMutation,
  useAdminUnblockTheaterOwnerMutation,
  useAdminLogoutMutation,
} = adminApiSlice;

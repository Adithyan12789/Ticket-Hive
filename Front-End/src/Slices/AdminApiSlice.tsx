import { apiSlice } from "./ApiSlice";

interface AdminCredentials {
  email: string;
  password: string;
}

interface AdminResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  isAdmin: boolean;
}

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

    getUserData: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/admin-get-user`,
        method: 'POST',
        headers: {
          // Add any required headers (e.g., authorization token)
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
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
  useAdminLogoutMutation,
} = adminApiSlice;

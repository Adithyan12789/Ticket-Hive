import { apiSlice } from "./ApiSlice";
import { AdminResponse, AdminCredentials } from "../Types/AdminTypes";


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

    getVerificationData: builder.query({
      query: () => `${ADMIN_URL}/verification`,
    }),

    adminAcceptVerification: builder.mutation({
      query: (adminId) => ({
        url: `${ADMIN_URL}/verification/${adminId}/accept`,
        method: 'PUT',
      }),
    }),

    adminRejectVerification: builder.mutation({
      query: ({ adminId, reason }) => ({
        url: `${ADMIN_URL}/verification/${adminId}/reject`,
        method: 'PUT',
        body: { reason },
      }),
    }),


    addMovie: builder.mutation({
      query: (data) => ({
        url: `${ADMIN_URL}/add-movie`,
        method: 'POST',
        body: data,
      }),
    }),

    getMovies: builder.mutation({
      query: () => ({
        url: `${ADMIN_URL}/get-movies`,
        method: 'GET',
      }),
    }),

    getMovieByMovieId: builder.query({
      query: (id) => ({
        url: `${ADMIN_URL}/movie-details/${id}`,
        method: 'GET',
      }),
    }),

    updateMovie: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${ADMIN_URL}/movie-edit/${id}`,
        method: 'PUT',
        body: formData,
      }),
    }),

    deleteMovie: builder.mutation({
      query: ({ id }) => ({
        url: `${ADMIN_URL}/movie-delete/${id}`,
        method: 'DELETE',
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
  useGetVerificationDataQuery,
  useAdminAcceptVerificationMutation,
  useAdminRejectVerificationMutation,
  useAddMovieMutation,
  useGetMoviesMutation,
  useGetMovieByMovieIdQuery,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useAdminLogoutMutation,
} = adminApiSlice;

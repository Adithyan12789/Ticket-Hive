import { apiSlice } from "./ApiSlice";
import {
  TheaterResponse,
  TheaterCredentials,
  RegisterCredentials,
  OtpCredentials,
} from "../Types/TheaterTypes";

const THEATER_URL = "/api/theater";

export const theaterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginTheater: builder.mutation<TheaterResponse, TheaterCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-login`,
        method: "POST",
        body: data,
      }),
    }),

    googleLoginTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-GoogleLogin`,
        method: "POST",
        body: data,
      }),
    }),

    registerTheater: builder.mutation<TheaterResponse, RegisterCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-signup`,
        method: "POST",
        body: data,
      }),
    }),

    verifyOtpTheater: builder.mutation<TheaterResponse, OtpCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-verifyotp`,
        method: "POST",
        body: data,
      }),
    }),

    resendOtpTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-resend-otp`,
        method: "POST",
        body: data,
      }),
    }),

    logoutTheater: builder.mutation<void, void>({
      query: () => ({
        url: `${THEATER_URL}/theater-logout`,
        method: "POST",
      }),
    }),

    sendPasswordResetEmailTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPasswordTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-reset-password/${data.token}`,
        method: "PUT",
        body: { password: data.password },
      }),
    }),

    getTheaterOwnerProfile: builder.query({
      query: () => ({
        url: `${THEATER_URL}/theater-profile`,
        method: "GET",
      }),
    }),

    updateTheaterOwner: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-profile`,
        method: "PUT",
        body: data,
      }),
    }),

    uploadTheaterCertificate: builder.mutation({
      query: ({ theaterId, formData }) => ({
        url: `${THEATER_URL}/upload-certificate/${theaterId}`,
        method: "POST",
        body: formData,
      }),
    }),

    addTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/add-theaters`,
        method: "POST",
        body: data,
      }),
    }),

    getTheaters: builder.mutation({
      query: () => ({
        url: `${THEATER_URL}/get-theaters`,
        method: "GET",
      }),
    }),

    getTheaterByTheaterId: builder.query({
      query: (id) => ({
        url: `${THEATER_URL}/theaters/${id}`,
        method: "GET",
      }),
    }),

    updateTheater: builder.mutation({
      query: ({ id, data }) => ({
        url: `${THEATER_URL}/theaters/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteTheater: builder.mutation({
      query: ({ id }) => ({
        url: `${THEATER_URL}/theaters/${id}`,
        method: "DELETE",
      }),
    }),

    addScreen: builder.mutation({
      query: ({ theaterId, formData }) => ({
        url: `${THEATER_URL}/add-screen/${theaterId}`,
        method: "POST",
        body: formData,
      }),
    }),

    updateScreen: builder.mutation({
      query: ({ screenId, formData }) => ({
        url: `${THEATER_URL}/update-screen/${screenId}`,
        method: "PUT",
        body: formData,
      }),
    }),

    deleteScreen: builder.mutation({
      query: ({ screenId }) => ({
        url: `${THEATER_URL}/delete-screen/${screenId}`,
        method: "DELETE",
      }),
    }),

    getMovies: builder.mutation({
      query: () => ({
        url: `${THEATER_URL}/get-movies`,
        method: "GET",
      }),
    }),

    getScreensByTheaterId: builder.query({
      query: (id) => `${THEATER_URL}/theaters/${id}/screens`,
    }),

    getScreensById: builder.query({
      query: (screenId) => `${THEATER_URL}/screen/${screenId}`,
    }),
  }),
});

export const {
  useLoginTheaterMutation,
  useGoogleLoginTheaterMutation,
  useLogoutTheaterMutation,
  useRegisterTheaterMutation,
  useVerifyOtpTheaterMutation,
  useResendOtpTheaterMutation,
  useSendPasswordResetEmailTheaterMutation,
  useResetPasswordTheaterMutation,
  useGetTheaterOwnerProfileQuery,
  useUpdateTheaterOwnerMutation,
  useUploadTheaterCertificateMutation,
  useAddTheaterMutation,
  useGetTheatersMutation,
  useGetTheaterByTheaterIdQuery,
  useUpdateTheaterMutation,
  useAddScreenMutation,
  useUpdateScreenMutation,
  useGetMoviesMutation,
  useGetScreensByTheaterIdQuery,
  useGetScreensByIdQuery,
  useDeleteScreenMutation,
  useDeleteTheaterMutation,
} = theaterApiSlice;

import { apiSlice } from "./ApiSlice";
import { TheaterResponse, TheaterCredentials, TheaterProfile, RegisterCredentials,OtpCredentials } from "../Types";


const THEATER_URL = '/api/theater';

export const theaterApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginTheater: builder.mutation<TheaterResponse, TheaterCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-login`,
        method: 'POST',
        body: data,
      }),
    }),

    googleLoginTheater:builder.mutation({
      query:(data)=>({
         url:`${THEATER_URL}/theater-GoogleLogin`,
         method:'POST',
         body:data
      })
  }),

    registerTheater: builder.mutation<TheaterResponse, RegisterCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-signup`,
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtpTheater: builder.mutation<TheaterResponse, OtpCredentials>({
      query: (data) => ({
        url: `${THEATER_URL}/theater-verifyotp`,
        method: 'POST',
        body: data,
      }),
    }),

    
    resendOtpTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-resend-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    logoutTheater: builder.mutation<void, void>({
      query: () => ({
        url: `${THEATER_URL}/theater-logout`,
        method: 'POST',
      }),
    }),
    
    sendPasswordResetEmailTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    resetPasswordTheater: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/theater-reset-password/${data.token}`,
        method: 'PUT',
        body: { password: data.password },
      }),
    }),    

    updateTheater: builder.mutation<TheaterResponse, TheaterProfile>({
      query: (data) => ({
        url: `${THEATER_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
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
  useUpdateTheaterMutation,
} = theaterApiSlice;

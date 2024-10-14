import { apiSlice } from "./ApiSlice";

interface UserCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  phone: number;
  password: string;
}

interface otpCredentials {
  email: string;
  otp: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface UserResponse {
  isAdmin: UserResponse;
  id: string;
  name: string;
  email: string;
  token: string;
}

const USERS_URL = '/api/users';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<UserResponse, UserCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),

    register: builder.mutation<UserResponse, RegisterCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/signup`,
        method: 'POST',
        body: data,
      }),
    }),

    verifyOtp: builder.mutation<UserResponse, otpCredentials>({
      query: (data) => ({
        url: `${USERS_URL}/verifyotp`,
        method: 'POST',
        body: data,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    
    sendPasswordResetEmail: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password/${data.token}`,
        method: 'PUT',
        body: { password: data.password },
      }),
    }),

    updateUser: builder.mutation<UserResponse, UserProfile>({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useSendPasswordResetEmailMutation,
  useResetPasswordMutation,
  useUpdateUserMutation,
} = usersApiSlice;

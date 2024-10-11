import { apiSlice } from "./ApiSlice";

// Define the type for the login, register, and update user payload
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
  // Add any other fields required for the user profile
}

// Define the expected responses (optional but recommended)
interface UserResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  // Add any other fields returned by the API
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
  useUpdateUserMutation,
} = usersApiSlice;

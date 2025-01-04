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

    addOffer: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/add-offer`,
        method: "POST",
        body: data,
      }),
    }),

    updateOffer: builder.mutation({
      query: ({ offerId, data }) => ({
        url: `/api/theater/update-offer/${offerId}`,
        method: "PUT",
        body: data,
      }),
    }),  

    deleteOffer: builder.mutation({
      query: ({ offerId }) => ({
        url: `${THEATER_URL}/delete-offer/${offerId}`,
        method: "DELETE",
      }),
    }),

    getOffers: builder.query({
      query: () => ({
        url: `${THEATER_URL}/get-offers`,
        method: "GET",
      }),
    }),

    getTheaterStats: builder.mutation({
      query: (ownerId) => ({
        url: `${THEATER_URL}/stats/${ownerId}`,
        method: "GET",
      }),
    }),


    getAllBookingDetails: builder.query({
      query: () => ({
        url: `${THEATER_URL}/getAlltickets`,
        method: "GET",
      }),
    }),  


    // Chat started

    fetchUnreadNotifications: builder.query({
      query: () => `${THEATER_URL}/notifications/unread`,
    }),

    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `${THEATER_URL}/notifications/${id}/read`,
        method: 'PUT',
      }),
    }),

    getChatRooms: builder.query({
      query: () => ({
        url: `${THEATER_URL}/chatrooms`,
        method: 'GET',
      }),
    }),

    createChatRoom: builder.mutation({
      query: (data) => ({
        url: `${THEATER_URL}/chatrooms`,
        method: 'POST',
        body: data,
      }),
    }),

    getMessages: builder.query({
      query: (chatRoomId: string) => ({
        url: `${THEATER_URL}/chatrooms/${chatRoomId}/messages`,
        method: "GET",
      }),
    }),
    
    sendMessage: builder.mutation({
      query: (data: { chatRoomId: string; content: string; senderType: string; adminId?: string; file?: File }) => {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('senderType', data.senderType);
        if (data.file) {
          formData.append('file', data.file);
        }
        if (data.adminId) {
          formData.append('adminId', data.adminId);
        }
    
        return {
          url: `${THEATER_URL}/chatrooms/${data.chatRoomId}/messages`,
          method: 'POST',
          body: formData,
        };
      },
    }),      

    fetchUnreadMessagesTheaterOwner: builder.query({
      query: () => ({
        url: `${THEATER_URL}/unread-messages`,
        method: 'GET'
      })
    }),
    
    markMessagesAsReadTheaterOwner: builder.mutation({
      query: (chatRoomId) => ({
        url: `${THEATER_URL}/mark-messages-read`,
        method: 'POST',
        body: { chatRoomId }
      })
    }),

    getAdmins: builder.query({
      query: () => ({
        url: `${THEATER_URL}/get-admins`,
        method: "GET",
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
  useGetOffersQuery,
  useAddOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetTheaterStatsMutation,
  useGetAllBookingDetailsQuery,
  useFetchUnreadNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetChatRoomsQuery, 
  useCreateChatRoomMutation, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useFetchUnreadMessagesTheaterOwnerQuery,
  useMarkMessagesAsReadTheaterOwnerMutation,
  useGetAdminsQuery,

} = theaterApiSlice;

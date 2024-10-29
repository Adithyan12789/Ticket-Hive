import { JwtPayload } from "jwt-decode";

/** User Informations */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: number;
  isBlocked?: boolean;
}

/** Auth State */
export interface AuthState {
  userInfo: UserInfo | null;
}

/** Movie */
export interface Movie {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
  release_date: string;
  poster_path?: string;
  backdrop_path?: string;
}

/** Google authentication */
export interface GoogleJwtPayload extends JwtPayload {
  name: string;
  email: string;
  picture?: string;
}

/** General user information */
export interface UserInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  id: string;
  profileImage?: string;
  name: string;
  email: string;
}

/**  user login Credentials */
export interface UserCredentials {
  email: string;
  password: string;
}

/**  user registration Credentials */
export interface RegisterCredentials {
  name: string;
  email: string;
  phone: number;
  password: string;
}

/** OTP-based verification Credentials */
export interface OtpCredentials {
  email: string;
  otp: string;
}

/**  user authentication Response */
export interface UserResponse {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  token: string;
}







/**  Theater Information */
export interface Theater {
  _id: string;
  name: string;
  email: string;
  phone: number;
  isBlocked?: boolean;
}

export interface TheaterManagement {
  isVerified: boolean;
  images: string[];
  _id: string;
  id: string;
  name: string;
  city: string;
  address: string;
  showTimes: string[];
  description: string;
  amenities: string[];
  latitude: string;
  longitude: string;
  verificationStatus: string;
}

export interface TheaterInfo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  email: string;
  id: string;
  name: string;
  location: string;
  capacity: number;
}

/** Theater information State */
export interface TheaterState {
  theaterInfo: TheaterInfo | null;
}

/**  Theater login Credentials */
export interface TheaterCredentials {
  email: string;
  password: string;
}

/** General theater profile information */
export interface TheaterProfile {
  id: string;
  name: string;
  email: string;
}

/** theater authentication Response */
export interface TheaterResponse {
  isAdmin: boolean;
  id: string;
  name: string;
  email: string;
  token: string;
}
export interface TheaterVerification {
  _id: string;
  name: string;
  verificationStatus: string;
  certificate?: string;
}


/** Screens Types*/
export interface Screen {
  _id: string;
  screenNumber: number; // Assuming screenNumber is a number
  capacity: number;
  layout: string[][]; // Assuming layout is a 2D array of strings
  showTimes: string[];
}




/** admin login Credentials */
export interface AdminCredentials {
  email: string;
  password: string;
}

/** admin authentication Response */
export interface AdminResponse {
  id: string;
  name: string;
  email: string;
  token: string; 
  isAdmin: boolean;
}

/** admin Information */
export interface AdminInfo {
  data: unknown;
  id: string;
  name: string;
  email: string;
  token: string;
}

/**  admin authentication information State */
export interface AdminAuthState {
  adminInfo: AdminInfo | null;
}

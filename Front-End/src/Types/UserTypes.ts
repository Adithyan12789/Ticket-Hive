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
    posters: string;
    _id: string;
    title: string;
    genres: string[];
    images: string[];
    description: string;
    vote_average: number;
    releaseDate: string;
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

  export interface UsersTableProps {
    users: User[];
    refetchData: () => void;
  }
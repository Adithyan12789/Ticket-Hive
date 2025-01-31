
export interface googleAuth {
  name: string;
  email: string;
  otp: string;
  phone: string;
  password: string;
}

export interface resetPassword {
  password: string
  resetPasswordToken: undefined ;
  resetPasswordExpires: undefined ;
}
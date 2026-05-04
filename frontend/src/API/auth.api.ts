import { AxiosInstance } from "axios";
import { axiosPublic } from "./axiosInstance";

export const authAPI = (axiosPrivate: AxiosInstance) => ({
  login: (email: string, password: string) => {
    return axiosPublic.post("/auth/login", { email, password });
  },

  verifyLogin: (userId: string, otp: string) => {
    return axiosPublic.post("/auth/verify", { userId, otp });
  },

  initSignup: (email: string) => {
    return axiosPublic.post("/auth/signup/init", { email });
  },

  verifySignupOtp: (email: string, otp: string, token: string) => {
    return axiosPublic.post("/auth/signup/verify-otp", { email, otp, token });
  },

  completeSignup: (
    verificationToken: string,
    password: string,
    username: string,
    fullName: string,
    birthday: string,
  ) => {
    return axiosPublic.post("/auth/signup/complete", {
      verificationToken,
      password,
      username,
      fullName,
      birthday,
    });
  },

  initForgotPassword: (email: string) => {
    return axiosPublic.post("/auth/forgot-password/init", { email });
  },

  verifyForgotPasswordOtp: (email: string, otp: string, token: string) => {
    return axiosPublic.post("/auth/forgot-password/verify-otp", {
      email,
      otp,
      token,
    });
  },

  resetPassword: (resetToken: string, newPassword: string) => {
    return axiosPublic.post("/auth/forgot-password/reset", {
      resetToken,
      newPassword,
    });
  },

  refreshToken: () => {
    return axiosPublic.post("/auth/refresh-token");
  },

  logout: () => {
    return axiosPublic.post("/auth/logout");
  },

  resendOTP: (email: string, type: string) => {
    return axiosPublic.post("/auth/resend-otp", { email, type });
  },

  getStatus: () => {
    return axiosPrivate.get("auth/status");
  },

  checkUserExists: (email: string) => {
    return axiosPrivate.post("/auth/check-email", { email });
  },

  updateProfile: (payload: { full_name: string; avatar_url?: string }) => {
    return axiosPrivate.patch("/auth/profile", payload);
  },

  changePassword: (payload: {
    current_password: string;
    new_password: string;
  }) => {
    return axiosPrivate.patch("/auth/password", payload);
  },
  initChangePassword: (payload: {
    current_password: string;
    new_password: string;
  }) => {
    return axiosPrivate.post("/auth/password/init", payload); // Dùng POST cho init
  },

  verifyChangePasswordOtp: (payload: { otp: string; token: string }) => {
    return axiosPrivate.patch("/auth/password/verify", payload); // Dùng PATCH cho verify update
  },
});

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
    return axiosPublic.post("/auth/init-signup", { email });
  },

  verifySignupOtp: (email: string, otp: string) => {
    return axiosPublic.post("/auth/verify-signup-otp", { email, otp });
  },

  refreshToken: () => {
    return axiosPublic.post("/auth/refresh-token");
  },

  logout: () => {
    return axiosPublic.post("/auth/logout");
  },

  getStatus: () => {
    return axiosPrivate.get("auth/status");
  },
});

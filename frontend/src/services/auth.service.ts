import { useAPI } from "@/API/useAPI";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type LoginCredentials = {
  email: string;
  password: string;
};

export const useAuthService = () => {
  const api = useAPI();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const handleLogin = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      api.auth.login(email, password),

    onSuccess: (res) => {
      const { id, email } = res.data;
      const rawString = `${id}:${email}`;
      const encodedString = btoa(rawString);
      router.push(`/verify-code?token=${encodedString}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to login";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleVerfiyLoginOtp = useMutation({
    mutationFn: ({ userId, otp }: { userId: string; otp: string }) =>
      api.auth.verifyLogin(userId, otp),
    onSuccess: (res) => {
      const { user, accessToken } = res.data;
      setAuth(user, accessToken);
      router.push("/for-you");
      toast.success("Login Successfully");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to verify OTP";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleGetStatus = useMutation({
    mutationFn: () => api.auth.getStatus(),
    onSuccess: (res) => {
      const user = res.data;
      setUser(user);
    },
    onError: (error: any) => {
      const msg = "Session has expired";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  return {
    login: handleLogin.mutateAsync,
    loginStatus: handleLogin.isPending,

    verifyLogin: handleVerfiyLoginOtp.mutateAsync,
    verifyLoginPending: handleVerfiyLoginOtp.isPending,

    getStatus: handleGetStatus.mutateAsync,
  };
};

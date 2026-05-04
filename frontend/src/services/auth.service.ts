import { useAPI } from "@/API/useAPI";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

  const handleInitSignup = useMutation({
    mutationFn: (email: string) => api.auth.initSignup(email),
    onSuccess: (res, variables) => {
      if (res.data?.success) {
        const emailEncoded = encodeURIComponent(variables);
        router.push(
          `/verify-code?type=1&token=${res.data?.token}&email=${emailEncoded}`,
        );
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Sign up failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleVerifySignupOtp = useMutation({
    mutationFn: ({
      email,
      otp,
      token,
    }: {
      email: string;
      otp: string;
      token: string;
    }) => api.auth.verifySignupOtp(email, otp, token),
    onSuccess: (res, variables) => {
      const emailEncoded = encodeURIComponent(variables.email);
      if (res.data?.success) {
        router.push(
          `create-account?token=${res.data.verificationToken || ""}&email=${emailEncoded}`,
        );
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Verify sign up failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleCompleteSignup = useMutation({
    mutationFn: ({
      verificationToken,
      password,
      username,
      fullName,
      birthday,
    }: {
      verificationToken: string;
      password: string;
      username: string;
      fullName: string;
      birthday: string;
    }) =>
      api.auth.completeSignup(
        verificationToken,
        password,
        username,
        fullName,
        birthday,
      ),
    onSuccess: (res) => {
      if (res.data?.success) {
        toast.success("Create account successfully");
        window.location.href = "/login";
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Create account failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleInitForgotPassword = useMutation({
    mutationFn: (email: string) => api.auth.initForgotPassword(email),
    onSuccess: (res, variables) => {
      if (res.data?.success) {
        const emailEncoded = encodeURIComponent(variables);
        router.push(
          `/verify-code?type=2&token=${res.data?.token}&email=${emailEncoded}`,
        );
      }
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "Failed to initialize password reset";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleVerifyForgotPasswordOtp = useMutation({
    mutationFn: ({
      email,
      otp,
      token,
    }: {
      email: string;
      otp: string;
      token: string;
    }) => api.auth.verifyForgotPasswordOtp(email, otp, token),
    onSuccess: (res, variables) => {
      const emailEncoded = encodeURIComponent(variables.email);
      if (res.data?.success) {
        router.push(
          `/reset-password?token=${res.data.resetToken || ""}&email=${emailEncoded}`,
        );
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Verify OTP failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleResetPassword = useMutation({
    mutationFn: ({
      resetToken,
      newPassword,
    }: {
      resetToken: string;
      newPassword: string;
    }) => api.auth.resetPassword(resetToken, newPassword),
    onSuccess: (res) => {
      if (res.data?.success) {
        toast.success("Password reset successfully. You can now login.");
        window.location.href = "/login";
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Password reset failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleResendOTP = useMutation({
    mutationFn: ({ email, type }: { email: string; type: string }) =>
      api.auth.resendOTP(email, type),
    onSuccess: (res) => {
      if (res.data?.success) {
        toast.success("Resend OTP successfully");
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Resend OTP failed";

      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    },
  });

  const handleCheckUserExists = useMutation({
    mutationFn: (email: string) => api.auth.checkUserExists(email),
  });

  const handleUpdateProfile = useMutation({
    mutationFn: (payload: { full_name: string; avatar_url?: string }) =>
      api.auth.updateProfile(payload), // Gọi API update profile của ông
    onSuccess: (res) => {
      // Nhớ cập nhật lại User trong Zustand Store sau khi lưu thành công nhé
      setUser(res.data);
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to update profile";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  // 2. Mutation Đổi mật khẩu
  const handleChangePassword = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      api.auth.changePassword(payload), // Gọi API change password
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to change password";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleInitChangePassword = useMutation({
    mutationFn: (payload: { current_password: string; new_password: string }) =>
      api.auth.initChangePassword(payload),
    onSuccess: (res) => {
      toast.success("OTP has been sent to your email.");
      // Có thể trả về token ở đây nếu cần thiết lập state bên UI
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message || "Failed to initiate password change";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  const handleVerifyChangePasswordOtp = useMutation({
    mutationFn: (payload: { otp: string; token: string }) =>
      api.auth.verifyChangePasswordOtp(payload),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to verify OTP";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    },
  });

  return {
    login: handleLogin.mutateAsync,
    loginStatus: handleLogin.isPending,

    verifyLogin: handleVerfiyLoginOtp.mutateAsync,
    verifyLoginPending: handleVerfiyLoginOtp.isPending,

    getStatus: handleGetStatus.mutateAsync,

    initSignup: handleInitSignup.mutateAsync,
    pendingInitSignup: handleInitSignup.isPending,

    verifySignup: handleVerifySignupOtp.mutateAsync,
    pendingVerifySignup: handleVerifySignupOtp.isPending,

    completeSignup: handleCompleteSignup.mutateAsync,
    pendingCompleteSignup: handleCompleteSignup.isPending,

    initForgotPassword: handleInitForgotPassword.mutateAsync,
    pendingInitForgotPassword: handleInitForgotPassword.isPending,

    verifyForgotPasswordOtp: handleVerifyForgotPasswordOtp.mutateAsync,
    pendingVerifyForgotPasswordOtp: handleVerifyForgotPasswordOtp.isPending,

    resetPassword: handleResetPassword.mutateAsync,
    pendingResetPassword: handleResetPassword.isPending,

    resendOTP: handleResendOTP.mutateAsync,
    pendingResetOTP: handleResendOTP.isPending,

    checkUserExists: handleCheckUserExists.mutateAsync,
    isCheckingEmail: handleCheckUserExists.isPending,

    updateProfile: handleUpdateProfile.mutateAsync,
    isUpdatingProfile: handleUpdateProfile.isPending,
    changePassword: handleChangePassword.mutateAsync,
    isChangingPassword: handleChangePassword.isPending,

    initChangePassword: handleInitChangePassword.mutateAsync,
    isInitPassword: handleInitChangePassword.isPending,

    verifyChangePasswordOtp: handleVerifyChangePasswordOtp.mutateAsync,
    isVerifyingPassword: handleVerifyChangePasswordOtp.isPending,
  };
};

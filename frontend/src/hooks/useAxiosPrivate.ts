"use client";
import { useContext, useEffect } from "react";
import { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { axiosPrivate } from "@/API/axiosInstance";
import { MyContext, useMyContext } from "@/contexts/MyContext";

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token),
  );
  failedQueue = [];
};

const useAxiosPrivate = () => {
  const refreshToken = useAuthStore((s) => s.handleRefreshToken);
  const { persist } = useMyContext();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().accessToken;

        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as CustomAxiosConfig;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          persist
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosPrivate(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const newToken = await refreshToken();

            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return axiosPrivate(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        // else if (error.response?.status === 401 && !persist) {
        //   window.location.href = "/login";
        // }

        return Promise.reject(error);
      },
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [refreshToken, persist]);

  return axiosPrivate;
};

export { useAxiosPrivate };

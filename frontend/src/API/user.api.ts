import { AxiosInstance } from "axios";

export const userApi = (axiosPrivate: AxiosInstance) => ({
  getUserById: (userId: string) => {
    return axiosPrivate.get(`/users/${userId}`);
  },
});

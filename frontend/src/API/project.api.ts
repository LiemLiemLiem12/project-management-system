import { AxiosInstance } from "axios";

export const projectAPI = (axiosPrivate: AxiosInstance) => ({
  getProjects: (id: string) => {
    return axiosPrivate.get(`/project/${id}`);
  },
});

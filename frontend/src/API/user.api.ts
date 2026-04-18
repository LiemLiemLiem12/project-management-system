export const userApi = (axiosPrivate: any) => ({
  getUserById: (userId: string) => {
    return axiosPrivate.get(`/users/${userId}`);
  },
});

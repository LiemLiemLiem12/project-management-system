import { useAPI } from "@/API/useAPI";
import { useQueries, useQuery } from "@tanstack/react-query";

export const useGetUsersById = (userIds: string[]) => {
  const { user } = useAPI();

  const queries = useQueries({
    queries: userIds.map((id) => ({
      queryKey: ["user", id],
      queryFn: () => user.getUserById(id),
      staleTime: 0,
      gcTime: 0,
    })),
  });

  return {
    data: queries.flatMap((q) => q.data?.data.data || null),
    isPending: queries.some((q) => q.isPending),
  };
};

export const useGetUserById = (userId: string) => {
  const { user } = useAPI();

  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: () => user.getUserById(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return {
    data: query?.data?.data.data || null,
    isPending: query.isPending,
  };
};

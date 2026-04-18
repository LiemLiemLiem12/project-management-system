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

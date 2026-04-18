"use client";
import { useAPI } from "@/API/useAPI";
import { useProjectStore } from "@/store/project.store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const RESERVED_ROUTES = ["for-you", "favourite"];

export const useGetCurrentProject = (projectId?: string) => {
  const api = useAPI();
  const router = useRouter();
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  const isRealProject = !!projectId && !RESERVED_ROUTES.includes(projectId);

  const query = useQuery({
    queryKey: ["currentProject", projectId],
    queryFn: async () => {
      const res = await api.project.getProjects(projectId!);
      return res.data;
    },
    enabled: isRealProject,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) setCurrentProject(query.data);
    if (query.isError) router.push("/not-found");
  }, [query.data, query.isError, router, setCurrentProject]);

  return query;
};

export const useGetProjectMembers = (projectId?: string, myUserId?: string) => {
  const api = useAPI();
  const setMembers = useProjectStore((s) => s.setMembers);

  const isRealProject = !!projectId && !RESERVED_ROUTES.includes(projectId);

  const query = useQuery({
    queryKey: ["projectMembers", projectId, myUserId],
    queryFn: async () => {
      const res = await api.project.getMembers(projectId!);
      const membersList = res.data;

      const myInfo = membersList.find((m: any) => m.user_id === myUserId);
      const myRole = myInfo?.role || null;

      setMembers(membersList, myRole);

      return membersList;
    },
    enabled: isRealProject && !!myUserId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });

  return query;
};

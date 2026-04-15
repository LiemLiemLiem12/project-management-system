"use client";
import { useAPI } from "@/API/useAPI";
import { useProjectStore } from "@/store/project.store";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const RESERVED_ROUTES = ["for-you", "favourite"];
export const useGetCurrentProject = (projectId?: string) => {
  const api = useAPI();
  const router = useRouter();
  const setCurrentProject = useProjectStore((s: any) => s.setCurrentProject);

  const isRealProject = !!projectId && !RESERVED_ROUTES.includes(projectId);

  const query = useQuery({
    queryKey: ["currentProject", projectId],
    queryFn: async () => {
      // 1. Thực hiện gọi API
      const res = await api.project.getProjects(projectId!);

      return res.data;
    },
    enabled: isRealProject,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentProject(query.data);
    }

    if (query.isError) {
      const error: any = query.error;
      const msg = error.response?.data?.message || error.message;

      // toast.error("Project not found: " + msg);

      router.push("/not-found");
    }
  }, [query.data, query.isError, query.error, setCurrentProject, router]);

  return query;
};

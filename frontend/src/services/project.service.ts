import { useAPI } from "@/API/useAPI";
import { useProjectStore } from "@/store/project.store";
import { useMutation } from "@tanstack/react-query";
// Xóa bỏ: import { useRouter } from "next/router";
import { notFound, redirect, useRouter } from "next/navigation"; // <-- Gộp chung vào đây
import { toast } from "react-hot-toast";

export const useProjectService = () => {
  const api = useAPI();
  const setCurrentProject = useProjectStore((s: any) => s.setCurrentProject);

  // Bây giờ useRouter này đã là của App Router
  const router = useRouter();

  const handleGetProjects = useMutation({
    mutationFn: (id: string) => api.project.getProjects(id),
    onSuccess: (res) => {
      const project = res.data;
      setCurrentProject(project);
      return project;
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to fetch projects";
      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }

      redirect("/not-found");
    },
  });

  return {
    getProject: handleGetProjects.mutate,
    pendingGetProject: handleGetProjects.isPending,
  };
};

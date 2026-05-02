import { useGetProjectMembers } from "@/services/project.service";
import { useAuthStore } from "@/store/auth.store";
import { useProjectStore } from "@/store/project.store";
import { useEffect } from "react";

export default function useGetProjectRole() {
  const projectId = useProjectStore((s) => s.currentProject?.id);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: membersData } = useGetProjectMembers(projectId);
  const { setMembers, currentUserRole } = useProjectStore();

  useEffect(() => {
    if (membersData) {
      const currentUser = userId
        ? membersData.find((m: any) => m.user_id === userId)
        : null;
      const role = currentUser?.role || null;

      setMembers(membersData, role);
    }
  }, [membersData, userId, setMembers]);

  return {
    currentUserRole,
  };
}

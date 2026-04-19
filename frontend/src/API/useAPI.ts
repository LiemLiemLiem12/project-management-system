import { useAxiosPrivate } from "@/hooks";
import { authAPI } from "./auth.api";
import { useMemo } from "react";
import { projectAPI } from "./project.api";
import { taskApi } from "./task.api";
import { userApi } from "./user.api";
import { checklistApi } from "./checklist.api";

export const useAPI = () => {
  const api = useAxiosPrivate();

  return useMemo(
    () => ({
      auth: authAPI(api),
      project: projectAPI(api),
      task: taskApi(api),
      user: userApi(api),
      checklist: checklistApi(api),
    }),
    [api],
  );
};

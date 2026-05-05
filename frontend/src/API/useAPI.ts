import { useAxiosPrivate } from "@/hooks";
import { authAPI } from "./auth.api";
import { useMemo } from "react";
import { projectAPI } from "./project.api";
import { taskApi } from "./task.api";
import { userApi } from "./user.api";
import { checklistApi } from "./checklist.api";
import { labelApi } from "./label.api";
import { auditApi } from "./audit.api";
import { commentApi } from "./comment.api";
import { storageApi } from "./storage.api";
import { NotificationAPI } from "./notification.api";

export const useAPI = () => {
  const api = useAxiosPrivate();

  return useMemo(
    () => ({
      auth: authAPI(api),
      project: projectAPI(api),
      task: taskApi(api),
      user: userApi(api),
      checklist: checklistApi(api),
      label: labelApi(api),
      audit: auditApi(api),
      comment: commentApi(api),
      storage: storageApi(api),
      notification: NotificationAPI(api),
    }),
    [api],
  );
};

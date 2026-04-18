import { useState, useEffect, useRef } from "react";
import { useUpdateTask } from "@/services/task.service"; // Hook useUpdateTask đã viết ở bước trước

export function useAutoSaveTaskField({
  projectId,
  taskId,
  field,
  initialValue,
}: {
  projectId: string;
  taskId: string;
  field: "title" | "description";
  initialValue: string;
}) {
  const [localValue, setLocalValue] = useState(initialValue || "");
  const { updateTask } = useUpdateTask();
  const isFirstRender = useRef(true);

  useEffect(() => {
    setLocalValue(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (localValue === initialValue) return;

    const handler = setTimeout(() => {
      updateTask({
        projectId,
        taskId,
        payload: { [field]: localValue },
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [localValue, projectId, taskId, field, initialValue, updateTask]);

  return [localValue, setLocalValue] as const;
}

import {
  useAddExistingSubtask,
  useSearchTaskForSubtask,
} from "@/services/task.service";
import { useTaskStore } from "@/store/task.store";
import { useEffect, useState } from "react";
import { TaskSearchItem } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "@/store/project.store";

export function useTaskSubtask() {
  const currentProject = useProjectStore(
    (state: any) => state.currentProject?.id,
  );
  const currentTask = useTaskStore((state: any) => state.currentTask);

  const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);
  const [isAdding, setIsAdding] = useState(true);
  const [mode, setMode] = useState<"create" | "search">("create");

  // State 1: Cập nhật ngay lập tức khi user gõ (để UI mượt)
  const [inputValue, setInputValue] = useState("");

  // State 2: Chỉ cập nhật sau khi user đã ngừng gõ 500ms
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const { addExistingSubtask, isPending: isPendingAddExistingSubtask } =
    useAddExistingSubtask();

  const handleAddSubtask = (id: string, title: string) => {
    setSubtasks([...subtasks, { id, title }]);
    setInputValue("");
    setDebouncedKeyword("");
    setMode("create");
    setIsAdding(false);
  };

  const handleAddExistingSubtask = (subtaskId: string) => {
    // setSubtasks([...subtasks, { id, title }]);
    setInputValue("");
    setDebouncedKeyword("");
    setMode("create");
    setIsAdding(false);
    addExistingSubtask({ taskId: currentTask?.id, subtaskId: subtaskId });
  };

  useEffect(() => {
    if (mode !== "search") return;

    const delayDebounceFn = setTimeout(() => {
      setDebouncedKeyword(inputValue.trim());
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, mode]);

  const { data: matchedTasks = [], isPending: isSearching } =
    useSearchTaskForSubtask(debouncedKeyword, currentProject, currentTask?.id);

  useEffect(() => {
    if (!currentTask || currentTask.subtasks?.length === 0) {
      setIsAdding(false);
      return;
    }
    setSubtasks(currentTask.subtasks || []);
  }, [currentTask]);

  return {
    subtasks,
    isAdding,
    setIsAdding,
    mode,
    setMode,
    inputValue,
    setInputValue,
    matchedTasks, // Data lấy trực tiếp từ API hook
    isSearching, // Trạng thái loading lấy trực tiếp từ API hook
    handleAddSubtask,
    handleAddExistingSubtask,
    isPendingAddExistingSubtask,
  };
}

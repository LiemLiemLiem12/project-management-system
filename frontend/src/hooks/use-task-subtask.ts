import {
  useAddExistingSubtask,
  useCreateTask,
  useGetGroupTaskByProjectId,
  useSearchTaskForSubtask,
  useUpdateTask,
  useUpdateTaskGroupTask,
} from "@/services/task.service";
import { useTaskStore } from "@/store/task.store";
import { useEffect, useState } from "react";
import { TaskBase, TaskSearchItem } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectStore } from "@/store/project.store";
import { useGetUsersById } from "@/services/user.service";

const mockGroupTask = [
  {
    id: "group-1",
    project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "To Do",
    order: 1,
    isSuccess: false,
  },
  {
    id: "group-2",
    project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "In Progress",
    order: 2,
    isSuccess: false,
  },
  {
    id: "group-3",
    project_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Done",
    order: 3,
    isSuccess: true,
  },
];

export function useTaskSubtask() {
  const currentProject = useProjectStore(
    (state: any) => state.currentProject?.id,
  );
  const currentTask = useTaskStore((state: any) => state.currentTask);

  const [isAdding, setIsAdding] = useState(true);
  const [mode, setMode] = useState<"create" | "search">("create");
  const [activeStatus, setActiveStatus] = useState("");

  // State 1: Cập nhật ngay lập tức khi user gõ (để UI mượt)
  const [inputValue, setInputValue] = useState("");

  // State 2: Chỉ cập nhật sau khi user đã ngừng gõ 500ms
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const subtasks = currentTask?.subtasks || [];

  const { addExistingSubtask, isPending: isPendingAddExistingSubtask } =
    useAddExistingSubtask();

  const { updateTaskGroupTask, isPending: isPendingUpdateTaskGroupTask } =
    useUpdateTaskGroupTask();

  const { mutate: createTask, isPending: isPendingCreatingTask } =
    useCreateTask(currentProject);

  const { updateTask, isPending: isUpdatingTask } = useUpdateTask();

  const handleRemoveSubtask = (subtaskId: string) => {
    updateTask({
      projectId: currentProject?.id as string,
      taskId: subtaskId,
      payload: { parent_id: null },
    });
  };

  const handleAddSubtask = (id: string, title: string) => {
    setInputValue("");
    setDebouncedKeyword("");
    setMode("create");
    setIsAdding(false);
    createTask({
      title: inputValue,
      group_task_id: currentTask?.group_task_id,
      description: "",
      parent_id: currentTask?.id,
    });
  };

  const handleAddExistingSubtask = (subtaskId: string) => {
    // setSubtasks([...subtasks, {  id, title }]);
    setInputValue("");
    setDebouncedKeyword("");
    setMode("create");
    setIsAdding(false);
    addExistingSubtask({ taskId: currentTask?.id, subtaskId: subtaskId });
  };

  const handleGroupTaskChange = (taskId: string, groupTaskId: string) => {
    updateTaskGroupTask({ taskId, groupTaskId });
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

  const { data: groupTaskData, isPending: isGroupTasksPending } =
    useGetGroupTaskByProjectId(currentProject);

  const { data: assigneeData, isPending: isAssigneesPending } = useGetUsersById(
    currentTask?.subtasks?.map((s: any) => s.assignee_id) || [],
  );

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
    activeStatus,
    setActiveStatus,
    groupTaskData,
    isGroupTasksPending,
    handleGroupTaskChange,
    isPendingUpdateTaskGroupTask,
    assigneeData,
    isAssigneesPending,
    isPendingCreatingTask,
    handleRemoveSubtask,
    isUpdatingTask,
  };
}

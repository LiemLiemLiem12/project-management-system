import FilterButton from "@/components/Kanban/FilterButton";
import KanbanBoard from "@/components/Dashboard/KanbanBoard";

import GroupButton from "@/components/Kanban/GroupButton";

// 1. Khai báo hàm async và params là một Promise
export default async function KanbanPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  // 2. Dùng await để lấy projectId ra khỏi Promise
  const { projectId } = await params;

  return (
    <>
      <div className="size-full gap-3 flex flex-col">
        <div className="flex px-10 pt-10"></div>
        <div className="flex-1 h-full overflow-auto px-10 pb-10">
          {/* 3. Truyền ID xuống bình thường */}
          <KanbanBoard projectId={projectId} />
        </div>
      </div>
    </>
  );
}

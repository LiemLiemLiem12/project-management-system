import FilterButton from "@/components/Kanban/FilterButton";
import KanbanBoard from "@/components/Dashboard/KanbanBoard";
import { Search } from "lucide-react";
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
        <div className="flex px-10 pt-10">
          <div className="flex  gap-3 flex-1 flex-start">
            <div className="relative w-1/2 shadow">
              <input
                type="text"
                placeholder="Searching..."
                className="px-10 py-2 w-full rounded-lg border-gray-300 bg-white"
              />
              <Search
                className="absolute top-1/6 left-1"
                width={24}
                height={24}
              />
            </div>
            <FilterButton />
          </div>
          <div className="flex-1 justify-end flex">
            <GroupButton />
          </div>
        </div>
        <div className="flex-1 h-full overflow-auto px-10 pb-10">
          {/* 3. Truyền ID xuống bình thường */}
          <KanbanBoard projectId={projectId} />
        </div>
      </div>
    </>
  );
}

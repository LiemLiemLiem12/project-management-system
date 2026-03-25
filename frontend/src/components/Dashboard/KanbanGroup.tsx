import { Draggable, Droppable } from "@hello-pangea/dnd";
import KanbanItem from "./KanbanItem";
import { Dispatch, SetStateAction, useState } from "react";

const KanbanGroup = ({ column, index }: { column: any; index: number }) => {
  const [hoverCreate, setHoverCreate]: [
    boolean,
    Dispatch<SetStateAction<boolean>>,
  ] = useState(false);
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex flex-col bg-[#F1F2F4] rounded-xl w-[320px] shrink-0 h-full transition-colors ${
            snapshot.isDragging
              ? "shadow-2xl ring-2 ring-blue-500 z-40 opacity-90"
              : ""
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          <div
            className="p-4 flex items-center gap-3"
            {...provided.dragHandleProps}
          >
            <h3 className="font-bold text-gray-800 text-sm">{column.title}</h3>
            <span className="bg-gray-200 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </div>

          <div
            onMouseEnter={() => setHoverCreate(true)}
            onMouseLeave={() => setHoverCreate(false)}
            className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-3"
          >
            <Droppable droppableId={column.id} type="TASK">
              {(provided: any, snapshot: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto  flex flex-col gap-3 transition-colors ${
                    snapshot.isDraggingOver ? "bg-gray-200/50" : ""
                  } [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400`}
                >
                  {column.tasks.map((task: any, index: number) => (
                    <KanbanItem key={task.id} task={task} index={index} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {hoverCreate && (
              <button className="w-full rounded-lg text-left  cursor-pointer py-2 px-4 text-sm font-regular hover:bg-gray-200">
                Create Task
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanGroup;

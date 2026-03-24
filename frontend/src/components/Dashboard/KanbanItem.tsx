import { Draggable } from "@hello-pangea/dnd";

const KanbanItem = ({ task, index }: { task: any; index: number }) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg border border-gray-100 cursor-grab active:cursor-grabbing shrink-0 transition-shadow ${
            snapshot.isDragging
              ? "shadow-xl ring-2 ring-blue-400 rotate-2"
              : "shadow-sm hover:shadow-md"
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-sm text-gray-800 leading-tight pr-4">
              {task.title}
            </h4>
            <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          {/* Labels */}
          <div className="flex gap-2 mb-4">
            {task.labels.map((label: string, idx: number) => (
              <span
                key={idx}
                className="bg-[#7FF736] text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-sm"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end text-[11px] text-gray-500 font-medium">
            <div className="flex gap-3 items-center">
              <span>#{task.id}</span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {task.date}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <img
                src={task.avatar}
                alt="Assignee"
                className="w-6 h-6 rounded-full object-cover border border-gray-200"
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanItem;

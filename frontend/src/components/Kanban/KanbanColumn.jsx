import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { FiPlus, FiMoreHorizontal } from "react-icons/fi";

const COLUMN_STYLES = {
  todo: {
    header: "bg-slate-100 dark:bg-slate-800",
    dot: "bg-slate-400",
    count: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    droppable: "bg-slate-50 dark:bg-slate-800/50",
  },
  in_progress: {
    header: "bg-blue-50 dark:bg-blue-900/20",
    dot: "bg-blue-500",
    count: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    droppable: "bg-blue-50/50 dark:bg-blue-900/10",
  },
  review: {
    header: "bg-amber-50 dark:bg-amber-900/20",
    dot: "bg-amber-500",
    count:
      "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    droppable: "bg-amber-50/50 dark:bg-amber-900/10",
  },
  done: {
    header: "bg-emerald-50 dark:bg-emerald-900/20",
    dot: "bg-emerald-500",
    count:
      "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    droppable: "bg-emerald-50/50 dark:bg-emerald-900/10",
  },
};

const COLUMN_LABELS = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Done",
};

export default function KanbanColumn({
  columnId,
  tasks = [],
  onAddTask,
  onTaskClick,
  onEditTask,
  onDeleteTask,
}) {
  const style = COLUMN_STYLES[columnId] || COLUMN_STYLES.todo;
  const label = COLUMN_LABELS[columnId] || columnId;

  return (
    <div
      className={`flex flex-col rounded-2xl border ${style.border} bg-white dark:bg-slate-900 shadow-sm min-w-70 max-w-80 w-full`}
    >
      {/* Column Header */}
      <div
        className={`${style.header} rounded-t-2xl px-4 py-3 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
          <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 tracking-wide">
            {label}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.count}`}
          >
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask && onAddTask(columnId)}
            className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
            title="Add task"
          >
            <FiPlus size={15} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
            <FiMoreHorizontal size={15} />
          </button>
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2.5 p-3 min-h-30 transition-colors duration-150 rounded-b-2xl ${
              snapshot.isDraggingOver ? style.droppable : ""
            }`}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                  <FiPlus size={18} className="text-slate-400" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  No tasks yet
                </p>
                <button
                  onClick={() => onAddTask && onAddTask(columnId)}
                  className="mt-2 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 font-medium hover:underline transition-all"
                >
                  Add a task
                </button>
              </div>
            )}

            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id || task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick && onTaskClick(task)}
                onEdit={() => onEditTask && onEditTask(task)}
                onDelete={() => onDeleteTask && onDeleteTask(task)}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

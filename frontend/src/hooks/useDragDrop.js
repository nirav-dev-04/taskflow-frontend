import { useState, useCallback } from "react";

const DEFAULT_COLUMNS = ["todo", "in_progress", "review", "done"];

/**
 * Manages Kanban board columns + drag-and-drop reordering.
 *
 * @param {object[]} initialTasks  - flat list of tasks, each with { id, status, order? }
 * @param {Function} onTaskMove    - optional async callback(taskId, newStatus, newOrder)
 *
 * Usage:
 *   const { columns, onDragEnd, moveTask, addTask, updateTask, deleteTask } = useDragDrop(tasks, onMove);
 *   <DragDropContext onDragEnd={onDragEnd}>
 *     {Object.entries(columns).map(([colId, tasks]) => (
 *       <KanbanColumn columnId={colId} tasks={tasks} />
 *     ))}
 *   </DragDropContext>
 */
export function useDragDrop(initialTasks = [], onTaskMove) {
  // Build column map: { todo: [...], in_progress: [...], review: [...], done: [...] }
  const buildColumns = (tasks) => {
    const cols = Object.fromEntries(DEFAULT_COLUMNS.map((c) => [c, []]));
    tasks.forEach((task) => {
      const col = task.status || "todo";
      if (cols[col]) cols[col].push(task);
      else cols["todo"].push(task);
    });
    // Sort by order field if present
    Object.keys(cols).forEach((k) => {
      cols[k].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
    return cols;
  };

  const [columns, setColumns] = useState(() => buildColumns(initialTasks));

  /** Sync columns when external tasks prop changes */
  const resetColumns = useCallback((tasks) => {
    setColumns(buildColumns(tasks));
  }, []);

  /**
   * Main drag-end handler — pass directly to <DragDropContext onDragEnd={onDragEnd}>
   */
  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const srcCol = source.droppableId;
      const destCol = destination.droppableId;

      setColumns((prev) => {
        const next = { ...prev };
        const srcItems = [...(next[srcCol] || [])];
        const destItems =
          srcCol === destCol ? srcItems : [...(next[destCol] || [])];

        const [moved] = srcItems.splice(source.index, 1);
        const updatedTask = {
          ...moved,
          status: destCol,
          order: destination.index,
        };

        if (srcCol === destCol) {
          srcItems.splice(destination.index, 0, updatedTask);
          next[srcCol] = srcItems;
        } else {
          destItems.splice(destination.index, 0, updatedTask);
          next[srcCol] = srcItems;
          next[destCol] = destItems;
        }

        // Re-assign order values
        next[srcCol] = next[srcCol].map((t, i) => ({ ...t, order: i }));
        if (srcCol !== destCol)
          next[destCol] = next[destCol].map((t, i) => ({ ...t, order: i }));

        return next;
      });

      // Notify parent (e.g. API call)
      onTaskMove?.(draggableId, destCol, destination.index);
    },
    [onTaskMove],
  );

  /** Add a new task to a column */
  const addTask = useCallback((task) => {
    const col = task.status || "todo";
    setColumns((prev) => {
      const colTasks = [...(prev[col] || [])];
      const newTask = { ...task, order: colTasks.length };
      return { ...prev, [col]: [...colTasks, newTask] };
    });
  }, []);

  /** Update a task in-place (same column) */
  const updateTask = useCallback((updatedTask) => {
    setColumns((prev) => {
      const next = { ...prev };
      const oldCol = Object.keys(next).find((col) =>
        next[col].some(
          (t) => (t.id || t._id) === (updatedTask.id || updatedTask._id),
        ),
      );
      if (!oldCol) return prev;

      const newCol = updatedTask.status || oldCol;

      if (oldCol === newCol) {
        next[oldCol] = next[oldCol].map((t) =>
          (t.id || t._id) === (updatedTask.id || updatedTask._id)
            ? { ...t, ...updatedTask }
            : t,
        );
      } else {
        // Task moved to a different column via edit
        next[oldCol] = next[oldCol].filter(
          (t) => (t.id || t._id) !== (updatedTask.id || updatedTask._id),
        );
        next[newCol] = [
          ...(next[newCol] || []),
          { ...updatedTask, order: next[newCol]?.length || 0 },
        ];
      }
      return next;
    });
  }, []);

  /** Delete a task from whichever column it lives in */
  const deleteTask = useCallback((taskId) => {
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((col) => {
        next[col] = next[col].filter((t) => (t.id || t._id) !== taskId);
      });
      return next;
    });
  }, []);

  /** Move a task programmatically (without drag) */
  const moveTask = useCallback(
    (taskId, newStatus) => {
      setColumns((prev) => {
        const next = { ...prev };
        let task = null;
        Object.keys(next).forEach((col) => {
          const idx = next[col].findIndex((t) => (t.id || t._id) === taskId);
          if (idx !== -1) {
            [task] = next[col].splice(idx, 1);
          }
        });
        if (!task) return prev;
        task = {
          ...task,
          status: newStatus,
          order: next[newStatus]?.length || 0,
        };
        next[newStatus] = [...(next[newStatus] || []), task];
        return next;
      });
      onTaskMove?.(taskId, newStatus, -1);
    },
    [onTaskMove],
  );

  /** Flat list of all tasks across columns */
  const allTasks = Object.values(columns).flat();

  /** Count per column */
  const columnCounts = Object.fromEntries(
    Object.entries(columns).map(([k, v]) => [k, v.length]),
  );

  return {
    columns,
    allTasks,
    columnCounts,
    onDragEnd,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    resetColumns,
  };
}

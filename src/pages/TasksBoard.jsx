import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchUserQueue, optimisticReorder, reorderQueue, optimisticUpdateStatus, updateTaskStatus } from '../features/tasksSlice';
import { Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react';

const statusIcons = {
  PENDING: <Circle size={16} className="text-slate-400" />,
  IN_PROGRESS: <PlayCircle size={16} className="text-blue-500" />,
  REVIEW: <Clock size={16} className="text-amber-500" />,
  DONE: <CheckCircle size={16} className="text-green-500" />
};

const TasksBoard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: tasks, loading } = useSelector(state => state.tasks);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserQueue(user.id));
    }
  }, [dispatch, user]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Create a new array and move the item
    const newTasks = Array.from(tasks);
    const [movedTask] = newTasks.splice(sourceIndex, 1);
    newTasks.splice(destIndex, 0, movedTask);

    // Update positions sequentially
    const updatedTasks = newTasks.map((task, index) => ({
      ...task,
      position: index
    }));

    // Optimistic UI update
    dispatch(optimisticReorder(updatedTasks));

    // Send to backend
    dispatch(reorderQueue(updatedTasks));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(optimisticUpdateStatus({ taskId, status: newStatus }));
    dispatch(updateTaskStatus({ taskId, status: newStatus }));
  };

  if (loading && tasks.length === 0) {
    return <div className="p-8 text-slate-500">Loading your queue...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">My Task Queue</h1>
        <p className="text-slate-500 dark:text-slate-400">Drag and drop tasks to prioritize your execution order.</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="developer-queue">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {tasks.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                  Your queue is currently empty.
                </div>
              ) : (
                tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center justify-between transition-shadow ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary border-transparent z-50' : 'shadow-sm hover:border-slate-300 dark:hover:border-slate-700'}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 transition-colors">
                            {/* Grip icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">#{index + 1}</span>
                              <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                            </div>
                            {task.project && (
                              <p className="text-xs text-primary font-medium">{task.project.name}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">In Review</option>
                            <option value="DONE">Completed</option>
                          </select>
                          <div className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                            {statusIcons[task.status]}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TasksBoard;

import { useEffect, useMemo } from 'react';
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

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const projectId = task.project?.id || 'unassigned';
      if (!acc[projectId]) {
        acc[projectId] = {
          project: task.project || { id: 'unassigned', name: 'Other Tasks' },
          tasks: []
        };
      }
      acc[projectId].tasks.push(task);
      return acc;
    }, {});
  }, [tasks]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceDroppableId = result.source.droppableId;
    const destDroppableId = result.destination.droppableId;

    // Disallow dragging between different projects
    if (sourceDroppableId !== destDroppableId) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Filter tasks for this project
    const projectTasks = tasks.filter(t => (t.project?.id || 'unassigned') === sourceDroppableId);

    // Create a new array and move the item
    const newProjectTasks = Array.from(projectTasks);
    const [movedTask] = newProjectTasks.splice(sourceIndex, 1);
    newProjectTasks.splice(destIndex, 0, movedTask);

    // Preserve original positions order
    const originalPositions = projectTasks.map(t => t.position).sort((a, b) => a - b);

    const updatedProjectTasks = newProjectTasks.map((task, index) => ({
      ...task,
      position: originalPositions[index]
    }));

    // Update global state
    const updatedMap = new Map(updatedProjectTasks.map(t => [t.id, t]));
    const overallUpdatedTasks = tasks.map(task =>
      updatedMap.has(task.id) ? updatedMap.get(task.id) : task
    );

    overallUpdatedTasks.sort((a, b) => a.position - b.position);

    // Optimistic UI update
    dispatch(optimisticReorder(overallUpdatedTasks));

    // Send to backend
    dispatch(reorderQueue(overallUpdatedTasks));
  };

  const handleStatusChange = (taskId, newStatus) => {
    dispatch(optimisticUpdateStatus({ taskId, status: newStatus }));
    dispatch(updateTaskStatus({ taskId, status: newStatus }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">My Task Queue</h1>
        <p className="text-slate-500 dark:text-slate-400">Drag and drop tasks to prioritize your execution order.</p>
      </div>

      {
        loading ? (
          <div className="p-8 text-slate-500">Loading your queue...</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            {tasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                Your queue is currently empty.
              </div>
            ) : (
              Object.values(groupedTasks).map((group) => (
                <div key={group.project.id} className="mb-10">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 px-1 flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    {group.project.name}
                  </h2>
                  <Droppable droppableId={group.project.id} type={group.project.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 p-2 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200 dark:bg-slate-800/50' : ''}`}
                      >
                        {group.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => {
                              const isDraggingOutside = snapshot.isDragging && !snapshot.draggingOver;

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white dark:bg-slate-900 border rounded-xl p-5 flex items-center justify-between transition-all ${isDraggingOutside
                                    ? 'border-red-500 shadow-2xl ring-2 ring-red-500/30 z-50 bg-red-50 dark:bg-red-900/20'
                                    : snapshot.isDragging
                                      ? 'shadow-xl ring-2 ring-primary border-transparent z-50'
                                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                                    }`}
                                >
                                  <div className="flex items-center gap-4 flex-1">
                                    <div className="text-slate-400 cursor-grab active:cursor-grabbing hover:text-slate-600 transition-colors">
                                      {/* Grip icon */}
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="12" r="1" /><circle cx="9" cy="5" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="15" cy="19" r="1" /></svg>
                                    </div>

                                    <div className="flex items-center gap-5">
                                      <span className="text-2xl font-bold text-slate-400 uppercase tracking-wide">#{index + 1}</span>
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <h3 className="font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                                          <div className={`rounded-full w-2 h-2 cursor-help ${task.priority === 1 ? 'bg-red-500' : task.priority === 2 ? 'bg-yellow-500' : 'bg-green-500'}`} title={task.priority === 1 ? 'High Priority task' : task.priority === 2 ? 'Medium Priority task' : 'Low Priority task'} />
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-1">{task.description}</p>
                                      </div>
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
                              );
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))
            )}
          </DragDropContext>
        )
      }
    </div>
  );
};

export default TasksBoard;

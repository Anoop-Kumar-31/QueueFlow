import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTasks, optimisticUpdateStatus, updateTaskStatus } from '../features/tasksSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchProjects } from '../features/projectSlice';
import { Plus, Users, Clock, CheckCircle, Circle, PlayCircle, Settings, LogOut, BarChart2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import GenerateInviteModal from '../components/GenerateInviteModal';
import ActivityTimeline from '../components/ActivityTimeline';
import TaskDetailsModal from '../components/TaskDetailsModal';
import ManageAccessModal from '../components/ManageAccessModal';
import { removeProjectMemberAPI, deleteTaskAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const TASKS_PER_PAGE = 30;

const statusIcons = {
  PENDING: <Circle size={16} className="text-slate-400" />,
  IN_PROGRESS: <PlayCircle size={16} className="text-blue-500" />,
  REVIEW: <Clock size={16} className="text-amber-500" />,
  DONE: <CheckCircle size={16} className="text-green-500" />
};

const ProjectBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: tasks, loading } = useSelector(state => state.tasks);
  const { items: projects } = useSelector(state => state.projects);
  const { onlineUsers } = useSelector(state => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isManageAccessOpen, setIsManageAccessOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { pagination } = useSelector(state => state.tasks);
  const project = projects.find(p => p.id === projectId);
  const [isLeaving, startLeaveTransition] = useTransition();

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    // Only update if moving to a different status column
    if (source.droppableId === destination.droppableId) return;

    // Safety guard: only allow the task owner to trigger status changes
    const draggedTask = tasks.find(t => t.id === draggableId);
    if (!draggedTask || draggedTask.assigned_to !== user?.id) return;

    const newStatus = destination.droppableId;

    // Optimistically update the status in local Redux state
    dispatch(optimisticUpdateStatus({ taskId: draggableId, status: newStatus }));

    // Request status update on the server
    dispatch(updateTaskStatus({ taskId: draggableId, status: newStatus }));
  };

  useEffect(() => {
    dispatch(fetchProjectTasks({ projectId, page, limit: TASKS_PER_PAGE }));
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projectId, page, projects.length]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <div>
          <Link to={`/`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">{project?.name || 'Project Board'}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">All tasks assigned within this workspace.</p>
        </div>
        {project?.userRole === 'PM' ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/project/${projectId}/analytics`}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              <BarChart2 size={16} /> <span className="hidden sm:block">Analytics</span>
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
              onClick={() => setIsManageAccessOpen(true)}
            >
              <Settings size={16} /> <span className="hidden sm:block">Manage Access</span>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Users size={16} /> <span>Invite</span>
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} /> <span >Assign Task</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={`/project/${projectId}/analytics`}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              <BarChart2 size={16} /> Analytics
            </Link>
            <button
              disabled={isLeaving}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => {
                if (window.confirm("Are you sure you want to leave this workspace?")) {
                  startLeaveTransition(async () => {
                    try {
                      await removeProjectMemberAPI(projectId, user?.id);
                      navigate('/');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to leave workspace');
                    }
                  });
                }
              }}
            >
              <LogOut size={16} /> Leave Team
            </button>
          </div>
        )}
      </div>

      {loading && tasks.length === 0 ? (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Kanban Columns Skeleton */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['PENDING', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
                <div key={status} className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                  {/* Column Header Skeleton */}
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-5 w-8 bg-white dark:bg-slate-800 rounded-full animate-pulse" />
                  </div>

                  {/* Task Card Skeletons */}
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        {/* Title Skeleton */}
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-3 animate-pulse" />
                        {/* Description Skeleton */}
                        <div className="space-y-2 mb-4">
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                          <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800/50 rounded animate-pulse" />
                        </div>
                        {/* Footer Skeleton */}
                        <div className="flex items-center justify-between">
                          <div className="h-6 w-20 bg-slate-50 dark:bg-slate-800 rounded-md animate-pulse" />
                          <div className="h-3 w-8 bg-slate-50 dark:bg-slate-800 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline Skeleton */}
          <div className="w-full xl:w-[320px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-125 xl:h-[calc(100vh-200px)]">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['PENDING', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(statusGroup => {
                  const groupTasks = tasks.filter(t => t.status === statusGroup);
                  return (
                    <div key={statusGroup} className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col min-h-75">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm tracking-wide">
                          {statusIcons[statusGroup]} {statusGroup.replace('_', ' ')}
                        </h3>
                        <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs py-1 px-2.5 rounded-full font-bold shadow-sm">{groupTasks.length}</span>
                      </div>

                      <Droppable droppableId={statusGroup}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`space-y-3 flex-1 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/25' : ''}`}
                          >
                            {groupTasks.map((task, index) => {
                              const isOwn = task.assigned_to === user?.id;
                              return (
                                <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={!isOwn}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...(isOwn ? provided.dragHandleProps : {})}
                                      onClick={() => {
                                        if (!snapshot.isDragging) {
                                          setViewingTask(task);
                                        }
                                      }}
                                      className={`bg-white dark:bg-slate-900 p-4 rounded-xl border relative group transition-all ${snapshot.isDragging
                                        ? 'shadow-xl border-primary ring-2 ring-primary bg-slate-50 dark:bg-slate-800 z-50 cursor-grabbing'
                                        : 'border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary cursor-grab hover:shadow-md'
                                        }`}
                                    >
                                      {task._count?.sticky_notes > 0 && (
                                        <div className="absolute -top-2 -left-2 bg-amber-400 text-amber-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                                          {task._count.sticky_notes}
                                        </div>
                                      )}
                                      {/* Lock badge for tasks not assigned to current user */}
                                      {!isOwn && (
                                        <div className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" title="Only the assignee can move this task">
                                          🔒
                                        </div>
                                      )}
                                      <div className={`absolute top-1 right-1 rounded-tr-lg w-3 h-3 ${task.priority === 1 ? 'bg-red-500/70' : task.priority === 2 ? 'bg-yellow-500/70' : 'bg-green-500/70'}`} />
                                      <h4 className={`font-semibold mb-2 transition-colors text-sm text-slate-900 dark:text-white group-hover:text-primary`}>{task.title}</h4>
                                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
                                      <div className="flex items-center justify-between text-xs font-semibold">
                                        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md relative cursor-help" title={onlineUsers.includes(task.assigned_to) ? "Online" : "Offline"}>
                                          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${onlineUsers.includes(task.assigned_to) ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                          <Users size={14} /> {task.assignee?.name?.split(' ')[0] || 'Unknown'}
                                        </div>
                                        <div className="text-slate-400">#{task.position}</div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                            {groupTasks.length === 0 && !snapshot.isDraggingOver && (
                              <div className="p-6 text-center text-sm font-medium text-slate-400/60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                No tasks
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="absolute flex items-center justify-center gap-3 mt-6 bottom-5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm font-medium text-slate-500">
                Page {page} of {pagination.totalPages}
                <span className="ml-2 text-slate-400">({pagination.total} tasks)</span>
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}

          <div className="w-full xl:w-[320px] shrink-0 h-100 xl:h-[calc(100vh-200px)] xl:sticky xl:top-6">
            <ActivityTimeline projectId={projectId} />
          </div>
        </div>
      )}

      <TaskDetailsModal
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        task={tasks.find(t => t.id === viewingTask?.id) || viewingTask}
        projectId={projectId}
        isPM={project?.userRole === 'PM'}
        onEditClick={() => {
          setEditingTask(viewingTask);
          setViewingTask(null);
          setIsModalOpen(true);
        }}
        onDeleteClick={() => {
          if (window.confirm("Are you sure you want to delete this task?")) {
            deleteTaskAPI(viewingTask.id);
            setViewingTask(null);
          }
        }}
      />

      {project?.userRole === 'PM' && (
        <>
          <CreateTaskModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            projectId={projectId}
            editingTask={editingTask}
          />
          <GenerateInviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            projectId={projectId}
          />
          <ManageAccessModal
            isOpen={isManageAccessOpen}
            onClose={() => setIsManageAccessOpen(false)}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
};

export default ProjectBoard;

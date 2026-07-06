import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAPI, fetchProjectTasksAPI, fetchUserQueueAPI } from '../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchUserQueue = createAsyncThunk(
  'tasks/fetchUserQueue',
  async ({ userId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      return await fetchUserQueueAPI(userId, { page, limit });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  'tasks/fetchProjectTasks',
  async ({ projectId, page = 1, limit = 30 }, { rejectWithValue }) => {
    try {
      return await fetchProjectTasksAPI(projectId, { page, limit });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      return await fetchAPI(`/tasks/project/${projectId}`, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      return await fetchAPI(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskData = createAsyncThunk(
  'tasks/updateTaskData',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      return await fetchAPI(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(taskData)
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reorderQueue = createAsyncThunk(
  'tasks/reorderQueue',
  async (tasks, { rejectWithValue }) => {
    try {
      await fetchAPI('/tasks/reorder', {
        method: 'PUT',
        body: JSON.stringify({ tasks: tasks.map(t => ({ id: t.id, position: t.position })) })
      });
      return tasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null,
    // Pagination state
    pagination: {
      page: 1,
      limit: 30,
      total: 0,
      totalPages: 1,
      hasNextPage: false
    }
  },
  reducers: {
    clearTasks: (state) => {
      state.items = [];
      state.pagination = { page: 1, limit: 30, total: 0, totalPages: 1, hasNextPage: false };
    },
    optimisticReorder: (state, action) => {
      state.items = action.payload; // temporary UI update before server confirms
    },
    optimisticUpdateStatus: (state, action) => {
      const task = state.items.find(t => t.id === action.payload.taskId);
      if (task) task.status = action.payload.status;
    },
    socketTaskCreated: (state, action) => {
      // Prevent duplicates safely since Pro. Manager and user events fire asynchronously
      if (!state.items.find(t => t.id === action.payload.id)) {
        state.items.push(action.payload);
        state.pagination.total += 1;
      }
    },
    socketTaskUpdated: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    socketTaskDeleted: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      if (state.pagination.total > 0) state.pagination.total -= 1;
    },
    socketQueueReordered: (state, action) => {
       // Only process non-local updates in background
       action.payload.forEach(taskUpdate => {
         const task = state.items.find(t => t.id === taskUpdate.id);
         if (task) task.position = taskUpdate.position;
       });
       state.items.sort((a, b) => a.position - b.position);
    },
    // Note socket events — update _count.sticky_notes on the task card
    socketNewStickyNote: (state, action) => {
      const note = action.payload;
      const task = state.items.find(t => t.id === note.task_id);
      if (task) {
        if (!task._count) task._count = { sticky_notes: 0 };
        task._count.sticky_notes += 1;
      }
    },
    socketNoteDeleted: (state, action) => {
      const { taskId } = action.payload;
      const task = state.items.find(t => t.id === taskId);
      if (task && task._count?.sticky_notes > 0) {
        task._count.sticky_notes -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUserQueue
      .addCase(fetchUserQueue.pending, (state) => { state.loading = true; state.error = null; state.items = []; })
      .addCase(fetchUserQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? action.payload;
        state.pagination = action.payload.pagination ?? state.pagination;
      })
      .addCase(fetchUserQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchProjectTasks
      .addCase(fetchProjectTasks.pending, (state) => { state.loading = true; state.error = null; state.items = []; })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? action.payload;
        state.pagination = action.payload.pagination ?? state.pagination;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTask — server broadcasts via socket; no manual push needed but keep for safety
      .addCase(createTask.fulfilled, (state, action) => {
        if (!state.items.find(t => t.id === action.payload.id)) {
          state.items.push(action.payload);
          state.pagination.total += 1;
        }
      });
  }
});

export const {
  clearTasks,
  optimisticReorder,
  optimisticUpdateStatus,
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskDeleted,
  socketQueueReordered,
  socketNewStickyNote,
  socketNoteDeleted
} = tasksSlice.actions;

export default tasksSlice.reducer;

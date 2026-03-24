import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAPI } from '../services/api';

export const fetchUserQueue = createAsyncThunk(
  'tasks/fetchUserQueue',
  async (userId, { rejectWithValue }) => {
    try {
      return await fetchAPI(`/tasks/queue/${userId}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  'tasks/fetchProjectTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      return await fetchAPI(`/tasks/project/${projectId}`);
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

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
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
      }
    },
    socketTaskUpdated: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    socketTaskDeleted: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
    socketQueueReordered: (state, action) => {
       // Only process non-local updates in background
       action.payload.forEach(taskUpdate => {
         const task = state.items.find(t => t.id === taskUpdate.id);
         if (task) task.position = taskUpdate.position;
       });
       state.items.sort((a,b) => a.position - b.position);
    },
    socketNewStickyNote: (state, action) => {
      const note = action.payload;
      const idx = state.items.findIndex(t => t.id === note.task_id);
      if (idx !== -1) {
        if (!state.items[idx].sticky_notes) {
          state.items[idx].sticky_notes = [];
        }
        state.items[idx].sticky_notes.push(note);
      }
    },
    socketNoteUpdated: (state, action) => {
      const updatedNote = action.payload;
      const taskIndex = state.items.findIndex(t => t.id === updatedNote.task_id);
      if (taskIndex !== -1 && state.items[taskIndex].sticky_notes) {
        const noteIndex = state.items[taskIndex].sticky_notes.findIndex(n => n.id === updatedNote.id);
        if (noteIndex !== -1) {
          state.items[taskIndex].sticky_notes[noteIndex] = updatedNote;
        }
      }
    },
    socketNoteDeleted: (state, action) => {
      const { noteId, taskId } = action.payload;
      const taskIndex = state.items.findIndex(t => t.id === taskId);
      if (taskIndex !== -1 && state.items[taskIndex].sticky_notes) {
        state.items[taskIndex].sticky_notes = state.items[taskIndex].sticky_notes.filter(n => n.id !== noteId);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserQueue.pending, (state) => { state.loading = true; state.error = null; state.items = []; })
      .addCase(fetchUserQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUserQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectTasks.pending, (state) => { state.loading = true; state.error = null; state.items = []; })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  }
});

export const { optimisticReorder, optimisticUpdateStatus, socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketQueueReordered, socketNewStickyNote, socketNoteUpdated, socketNoteDeleted } = tasksSlice.actions;
export default tasksSlice.reducer;

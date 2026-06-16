import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authAPI from "../services/authApi";



// ========================
// LOGIN
// ========================
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      const res = await authAPI.login(data);

      const { access, refresh, user } = res.data;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      return user;
    } catch (err) {

      console.log ("FULL ERROR:", err.response?.data);

      const errorData = err.response?.data;
      
      return thunkAPI.rejectWithValue(
        typeof errorData === "object"
        ? errorData
        : {detail: errorData || "Login failed"}
      );
    }
  }
);


// ========================
// REGISTER
// ========================
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, thunkAPI) => {
    try {
      const res = await authAPI.register(data);

      // backend only returns user (no tokens yet)
      return res.data;
    } catch (err) {
      console.log ("FULL ERROR:", err.response?.data);

      const errorData = err.response?.data;

      return thunkAPI.rejectWithValue(
      typeof errorData === "object"
      ? errorData
      :{detail:errorData || "Registration failed"}
      );
    }
  }
);

// ========================
// FETCH USER (SESSION RESTORE)
// ========================
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, thunkAPI) => {
    try {
      const res = await authAPI.getCurrentUser();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);


// ========================
// LOGOUT
// ========================
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {

      const refresh = localStorage.getItem("refresh");

      await authAPI.logout(refresh);

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      return null;
    } catch (err) {
      
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      
      return thunkAPI.rejectWithValue(
        err.response?.data || {detail: "Logout failed"}
      );
    }
  }
);


// ========================
// SLICE
// ========================
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    isAuthenticated: false,
    error: null,
    registrationSuccess:false,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    hydrateAuth: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    
    // 🧠 NEW: restore session from token existence
    restoreSession: (state) => {
      const token = localStorage.getItem("access");
      if (token) {
        state.isAuthenticated = true;
      }
    },

    clearSuccess:(state) => {
      state.registrationSuccess = false;
    },
  },
  
  extraReducers: (builder) => {
    builder

      // ================= LOGIN =================
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ================= REGISTER =================
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;

        // DO NOT auto-authenticate
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registrationSuccess = false;
      })

      // ================= FETCH USER =================
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchUser.rejected, (state,action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload || null;

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      })

      // ================= LOGOUT =================
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })

  },
});

export const { clearError, restoreSession, hydrateAuth, clearSuccess } = authSlice.actions;
export default authSlice.reducer;
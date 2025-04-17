import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import api from "../../services/api";

const BASE_URL = import.meta.env.VITE_BASE_URL_BACKEND;

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
};

export const registerUser = createAsyncThunk(
  "/auth/register",

  async (formData) => {
    const response = await axios.post(`${BASE_URL}/auth/register`, formData, {
      withCredentials: true,
    });

    return response.data;
  }
);

export const loginUser = createAsyncThunk("/auth/login", async (formData,thunkAPI) => {
  try {
    const response = await api.post("/auth/login", formData);
    const { success, user, token, status, message } = response.data;

    if (!success && status == 0) {
      // 🚨 User is not verified - OTP flow
      return thunkAPI.rejectWithValue({
        type: "UNVERIFIED_USER",
        message,
        userId: response.data.id,
      });
    }

    if (success && user?.id) {
      const userId = user.id || user._id;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", userId);
      return response.data;
    }

    return thunkAPI.rejectWithValue({
      type: "INVALID_CREDENTIALS",
      message: "Login failed. Invalid credentials.",
    });
  } catch (error) {
    return thunkAPI.rejectWithValue({
      type: "SERVER_ERROR",
      message: error?.response?.data?.message || "Server error",
    });
  }



  // const response = await api.post("/auth/login", formData);
  // const user = response.data?.user;
  // console.log("res is",response);
  // // ✅ Check both `id` and `_id`
  // const userId = user?.id || user?._id;

  // // if(response.data.)

  // if (response.data.success && userId) {
  //   localStorage.setItem("token", response.data.token);
  //   localStorage.setItem("user", JSON.stringify(user));
  //   localStorage.setItem("userId", userId); // ✅ Correct value stored
  //   console.log("✅ Stored userId:", userId);
  // } else {
  //   console.error("❌ Could not store userId. User object:", user);
  // }

  // return response.data;
});

export const logoutUser = createAsyncThunk(
  "/auth/logout",

  async () => {
    const response = await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );

    return response.data;
  }
);

export const checkAuth = createAsyncThunk(
  "/auth/checkauth",

  async (token) => {
    const response = await axios.get(`${BASE_URL}/auth/check-auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });

    return response.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {},
    resetTokenAndCredentials: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // .addCase(registerUser.pending, (state) => {
      //   state.isLoading = true;
      // })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // .addCase(loginUser.pending, (state) => {
      //   state.isLoading = true;
      // })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log(action);

        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
        state.token = action.payload.token;
        sessionStorage.setItem("token", JSON.stringify(action.payload.token));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, resetTokenAndCredentials } = authSlice.actions;
export default authSlice.reducer;

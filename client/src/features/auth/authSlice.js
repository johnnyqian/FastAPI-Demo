import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8000';

// 异步操作：用户登录
export const login = createAsyncThunk('auth/login', async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/token`, credentials);
    // 保存token到localStorage
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：用户注册
export const register = createAsyncThunk('auth/register', async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：用户登出
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    // 清除localStorage中的token
    localStorage.removeItem('token');
    return;
  } catch (error) {
    throw error;
  }
});

// 创建认证Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
    isAuthenticated: localStorage.getItem('token') ? true : false
  },
  reducers: {
    // 手动设置认证状态
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    // 手动清除认证状态
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    // 处理login
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        // 解析用户信息（假设token包含用户信息）
        try {
          const payload = JSON.parse(atob(action.payload.access_token.split('.')[1]));
          state.user = { username: payload.sub };
        } catch (error) {
          state.user = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.isAuthenticated = false;
      });

    // 处理register
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 注册成功后自动登录
        // 这里假设注册后会返回token
        if (action.payload.access_token) {
          state.token = action.payload.access_token;
          state.isAuthenticated = true;
          localStorage.setItem('token', action.payload.access_token);
          try {
            const payload = JSON.parse(atob(action.payload.access_token.split('.')[1]));
            state.user = { username: payload.sub };
          } catch (error) {
            state.user = null;
          }
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
        state.isAuthenticated = false;
      });

    // 处理logout
    builder
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'succeeded';
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

// 导出reducer
export default authSlice.reducer;

// 导出actions
export const { setCredentials, clearCredentials } = authSlice.actions;

// 导出选择器
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

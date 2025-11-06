import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8000/api/cars';

// 异步操作：获取行程列表
export const fetchTrips = createAsyncThunk('trips/fetchTrips', async () => {
  try {
    // 先获取所有汽车，再提取行程
    const response = await axios.get(API_BASE_URL);
    const cars = response.data;
    const trips = cars.flatMap(car => car.trips.map(trip => ({ ...trip, carId: car.id, carModel: car.model })));
    return trips;
  } catch (error) {
    throw error;
  }
});

// 异步操作：为汽车添加行程
export const addTrip = createAsyncThunk('trips/addTrip', async ({ carId, tripData }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${carId}/trips`, tripData);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：更新行程
export const updateTrip = createAsyncThunk('trips/updateTrip', async ({ tripId, tripData }) => {
  try {
    // 注意：后端API可能需要不同的端点来更新行程
    // 这里假设使用PUT /api/trips/{id}，但需要根据实际后端API调整
    const response = await axios.put(`http://localhost:8000/api/trips/${tripId}`, tripData);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：删除行程
export const deleteTrip = createAsyncThunk('trips/deleteTrip', async (tripId) => {
  try {
    // 注意：后端API可能需要不同的端点来删除行程
    // 这里假设使用DELETE /api/trips/{id}，但需要根据实际后端API调整
    await axios.delete(`http://localhost:8000/api/trips/${tripId}`);
    return tripId;
  } catch (error) {
    throw error;
  }
});

// 创建行程Slice
const tripsSlice = createSlice({
  name: 'trips',
  initialState: {
    trips: [],
    status: 'idle', // idle, loading, succeeded, failed
    error: null,
    filters: {},
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0
    }
  },
  reducers: {
    setTripFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.currentPage = 1;
    },
    setTripPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setTripPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    // 处理fetchTrips
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trips = action.payload;
        state.pagination.totalItems = action.payload.length;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理addTrip
    builder
      .addCase(addTrip.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addTrip.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trips.push(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(addTrip.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理updateTrip
    builder
      .addCase(updateTrip.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理deleteTrip
    builder
      .addCase(deleteTrip.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
        state.pagination.totalItems -= 1;
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

// 导出reducer
export default tripsSlice.reducer;

// 导出actions
export const { setTripFilters, setTripPage, setTripPageSize } = tripsSlice.actions;

// 导出选择器
export const selectAllTrips = (state) => state.trips.trips;
export const selectTripsStatus = (state) => state.trips.status;
export const selectTripsError = (state) => state.trips.error;
export const selectTripsFilters = (state) => state.trips.filters;
export const selectTripsPagination = (state) => state.trips.pagination;

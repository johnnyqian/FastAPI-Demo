import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 定义API基础URL
const API_BASE_URL = 'http://localhost:8000/api/cars';

// 异步操作：获取汽车列表
export const fetchCars = createAsyncThunk('cars/fetchCars', async (filters = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：获取单个汽车
export const fetchCarById = createAsyncThunk('cars/fetchCarById', async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：添加汽车
export const addCar = createAsyncThunk('cars/addCar', async (carData) => {
  try {
    const response = await axios.post(API_BASE_URL, carData);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：更新汽车
export const updateCar = createAsyncThunk('cars/updateCar', async ({ id, carData }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, carData);
    return response.data;
  } catch (error) {
    throw error;
  }
});

// 异步操作：删除汽车
export const deleteCar = createAsyncThunk('cars/deleteCar', async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return id;
  } catch (error) {
    throw error;
  }
});

// 异步操作：批量删除汽车
export const deleteCars = createAsyncThunk('cars/deleteCars', async (ids) => {
  try {
    await Promise.all(ids.map(id => axios.delete(`${API_BASE_URL}/${id}`)));
    return ids;
  } catch (error) {
    throw error;
  }
});

// 创建汽车Slice
const carsSlice = createSlice({
  name: 'cars',
  initialState: {
    cars: [],
    currentCar: null,
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
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.currentPage = 1;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1;
    },
    clearCurrentCar: (state) => {
      state.currentCar = null;
    }
  },
  extraReducers: (builder) => {
    // 处理fetchCars
    builder
      .addCase(fetchCars.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cars = action.payload;
        state.pagination.totalItems = action.payload.length;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理fetchCarById
    builder
      .addCase(fetchCarById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCar = action.payload;
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理addCar
    builder
      .addCase(addCar.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cars.push(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(addCar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理updateCar
    builder
      .addCase(updateCar.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.cars.findIndex(car => car.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        }
        if (state.currentCar?.id === action.payload.id) {
          state.currentCar = action.payload;
        }
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理deleteCar
    builder
      .addCase(deleteCar.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cars = state.cars.filter(car => car.id !== action.payload);
        state.pagination.totalItems -= 1;
        if (state.currentCar?.id === action.payload) {
          state.currentCar = null;
        }
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });

    // 处理deleteCars
    builder
      .addCase(deleteCars.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCars.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cars = state.cars.filter(car => !action.payload.includes(car.id));
        state.pagination.totalItems -= action.payload.length;
      })
      .addCase(deleteCars.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

// 导出reducer
export default carsSlice.reducer;

// 导出actions
export const { setFilters, setPage, setPageSize, clearCurrentCar } = carsSlice.actions;

// 导出选择器
export const selectAllCars = (state) => state.cars.cars;
export const selectCurrentCar = (state) => state.cars.currentCar;
export const selectCarsStatus = (state) => state.cars.status;
export const selectCarsError = (state) => state.cars.error;
export const selectCarsFilters = (state) => state.cars.filters;
export const selectCarsPagination = (state) => state.cars.pagination;

import { configureStore } from '@reduxjs/toolkit';
import carsReducer from '../features/cars/carsSlice';
import tripsReducer from '../features/trips/tripsSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    cars: carsReducer,
    trips: tripsReducer,
    auth: authReducer,
  },
});

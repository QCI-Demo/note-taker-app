import { configureStore, createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: { placeholder: true as boolean },
  reducers: {},
})

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

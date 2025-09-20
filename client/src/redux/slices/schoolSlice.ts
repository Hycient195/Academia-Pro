import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SchoolState {
  activeSchoolId: string | null;
}

const loadInitialState = (): SchoolState => {
  if (typeof window === 'undefined') {
    return { activeSchoolId: null };
  }
  try {
    const stored = localStorage.getItem('activeSchoolId');
    return { activeSchoolId: stored || null };
  } catch {
    return { activeSchoolId: null };
  }
};

const initialState: SchoolState = loadInitialState();

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setActiveSchoolId: (state, action: PayloadAction<string | null>) => {
      state.activeSchoolId = action.payload;
      if (typeof window !== 'undefined') {
        try {
          if (action.payload) {
            localStorage.setItem('activeSchoolId', action.payload);
          } else {
            localStorage.removeItem('activeSchoolId');
          }
        } catch {
          // ignore storage errors
        }
      }
    },
  },
});

export const { setActiveSchoolId } = schoolSlice.actions;
export default schoolSlice.reducer;
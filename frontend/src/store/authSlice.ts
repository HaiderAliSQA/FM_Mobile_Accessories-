// frontend/src/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Admin } from '../types';

const TOKEN_KEY = 'km_admin_token';
const ADMIN_KEY = 'km_admin_info';

const loadAuthFromStorage = (): { token: string | null; admin: Admin | null } => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const adminStr = localStorage.getItem(ADMIN_KEY);
    const admin = adminStr ? (JSON.parse(adminStr) as Admin) : null;
    return { token, admin };
  } catch {
    return { token: null, admin: null };
  }
};

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
}

const stored = loadAuthFromStorage();

const initialState: AuthState = {
  token: stored.token,
  admin: stored.admin,
  isAuthenticated: Boolean(stored.token && stored.admin),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; admin: Admin }>
    ) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;

      try {
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(action.payload.admin));
      } catch {
        // ignore storage errors
      }
    },

    logout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;

      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
      } catch {
        // ignore storage errors
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const selectToken = (state: { auth: AuthState }): string | null =>
  state.auth.token;

export const selectAdmin = (state: { auth: AuthState }): Admin | null =>
  state.auth.admin;

export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.isAuthenticated;

export default authSlice.reducer;

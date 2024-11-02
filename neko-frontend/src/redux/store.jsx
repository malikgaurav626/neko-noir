import { createSlice, configureStore } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const initialUser = storedUser ? JSON.parse(storedUser) : null;
const initialState = {
  currentUserState: "main-menu",
  currentScore: 0,
  winStreak: 0,
  ambientMusicStatus: true,
  leaderboard: [],
  users: [],
  user: initialUser || {
    id: "0",
    username: "_placeholder",
    defuseCount: 0,
    highScore: 0,
  },
  playStatus: false,
  settingUser: false,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setCurrentUserState(state, action) {
      state.currentUserState = action.payload;
    },
    setCurrentScore(state, action) {
      state.currentScore = action.payload;
    },
    setAmbientMusicStatus(state, action) {
      state.ambientMusicStatus = action.payload;
    },
    setWinStreak(state, action) {
      state.winStreak = action.payload;
    },
    setLeaderboard(state, action) {
      state.leaderboard = action.payload;
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    setPlayStatus(state, action) {
      state.playStatus = action.payload;
    },
    setSettingUser(state, action) {
      state.settingUser = action.payload;
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
  },
});

const store = configureStore({
  reducer: counterSlice.reducer,
});

export const counterActions = counterSlice.actions;

export default store;

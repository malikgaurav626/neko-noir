import { counterActions } from "./redux/store";

export const fetchUsers = async () => {
  try {
    const response = await fetch("https://neko-backend.onrender.com/api/users");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (e) {
    console.error("Failed to fetch users:", e);
    return [];
  }
};

export const fetchUser = async (username) => {
  try {
    const response = await fetch(
      `https://neko-backend.onrender.com/api/user?username=${username}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(`Failed to fetch user ${username}:`, e);
    return null;
  }
};

export const fetchAndSetUser = async (dispatch, username) => {
  try {
    const user = await fetchUser(username);
    const users = await fetchUsers();
    if (users.length === 0) {
      console.error("No users found");
    } else {
      dispatch(counterActions.setUsers(users));
    }
    if (user) {
      dispatch(counterActions.setUser(user));
      dispatch(counterActions.setPlayStatus(true));
      dispatch(counterActions.setSettingUser(false));

      // Save user to local storage
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      console.error("User not found");
    }
  } catch (e) {
    console.error("Failed to fetch and set user:", e);
  }
};

export const updateUser = async (dispatch, user) => {
  try {
    const response = await fetch(
      `https://neko-backend.onrender.com/api/updateUser?id=${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    dispatch(counterActions.setUser(data));
  } catch (e) {
    console.error("Failed to update user:", e);
  }
};

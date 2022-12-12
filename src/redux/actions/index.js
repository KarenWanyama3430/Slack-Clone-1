import {
  SET_USER,
  LOADING_START,
  LOADING_STOP,
  CLEAR_USER,
  SET_CURRENT_CHANNEL,
  SET_PRIVATE_CHANNEL,
  SET_USER_POSTS,
  SET_COLORS,
} from "./utils/actionTypes";

export const loadingStart = () => {
  return {
    type: LOADING_START,
  };
};

export const loadingStop = () => {
  return {
    type: LOADING_STOP,
  };
};

export const setUser = (user) => (dispatch) => {
  dispatch({
    type: SET_USER,
    payload: user,
  });
};

export const clearUser = () => {
  return {
    type: CLEAR_USER,
  };
};

export const setCurrentChannel = (channel) => {
  return {
    type: SET_CURRENT_CHANNEL,
    payload: channel,
  };
};

export const setPrivateChannel = (isPrivateChannel) => {
  return {
    type: SET_PRIVATE_CHANNEL,
    payload: isPrivateChannel,
  };
};

export const setUserPosts = (userPosts) => {
  return {
    type: SET_USER_POSTS,
    payload: userPosts,
  };
};

export const setColors = (primaryColor, secondaryColor) => {
  return {
    type: SET_COLORS,
    payload: {
      primaryColor,
      secondaryColor,
    },
  };
};

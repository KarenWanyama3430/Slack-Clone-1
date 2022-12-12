import {
  SET_USER,
  LOADING_START,
  LOADING_STOP,
  CLEAR_USER,
  SET_USER_POSTS,
} from "../actions/utils/actionTypes";

const INITIAL_STATE = {
  currentUser: null,
  loading: true,
  userPosts: null,
};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, currentUser: action.payload, loading: false };
    case CLEAR_USER:
      return { ...state, loading: false };
    case LOADING_START:
      return { ...state, loading: true };
    case LOADING_STOP:
      return { ...state, loading: false };
    case SET_USER_POSTS:
      return { ...state, userPosts: action.payload };
    default:
      return state;
  }
};

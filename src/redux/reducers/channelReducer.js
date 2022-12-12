import {
  SET_CURRENT_CHANNEL,
  SET_PRIVATE_CHANNEL,
} from "../actions/utils/actionTypes";

const INITIAL_STATE = {
  currentChannel: null,
  isPrivateChannel: false,
};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_CURRENT_CHANNEL:
      return { ...state, currentChannel: action.payload };
    case SET_PRIVATE_CHANNEL:
      return { ...state, isPrivateChannel: action.payload };
    default:
      return state;
  }
};

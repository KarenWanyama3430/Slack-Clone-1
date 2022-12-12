import { SET_COLORS } from "../actions/utils/actionTypes";

const INITIAL_STATE = {
  primaryColor: "#4c3c4c",
  secondaryColor: "#eee",
};
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_COLORS:
      return {
        ...state,
        primaryColor: action.payload.primaryColor,
        secondaryColor: action.payload.secondaryColor,
      };
    default:
      return state;
  }
};

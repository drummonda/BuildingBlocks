import axios from 'axios'

/**
 * ACTION TYPES
 */
export const UPDATE_STATUS = 'UPDATE_STATUS'

/**
 * INITIAL STATE
 */
const defaultMessageBoard = {
  status: [],
};

/**
 * ACTION CREATORS
 */
export const updateStatus = status => ({
  type: UPDATE_STATUS,
  status
});

/**
 * REDUCER
 */
export default function(state = defaultMessageBoard, action) {
  switch (action.type) {

    case UPDATE_STATUS:
      return {...state, status: [...state.status, action.status] };

    default:
      return state;

  }
}

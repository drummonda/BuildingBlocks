import axios from 'axios'

/**
 * ACTION TYPES
 */
export const UPDATE_STATUS = 'UPDATE_STATUS'

/**
 * INITIAL STATE
 */
const defaultMessageBoard = {
  status: 'No connected nodes',
};

/**
 * ACTION CREATORS
 */
export const updateStatus = status => ({
  type: UPDATE_STATUS,
  status
});

/**
 * THUNK CREATORS
 */
export const fetchPeers = () => async dispatch => {
  const { data } = await axios.get('/api/peers/');
  const message = `Connected nodes: ${data.nodes}`
  console.log('nodes', message);
  dispatch(updateStatus(message));
}

/**
 * REDUCER
 */
export default function(state = defaultMessageBoard, action) {
  switch (action.type) {

    case UPDATE_STATUS:
      return {...state, status: action.status };

    default:
      return state;

  }
}

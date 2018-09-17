import axios from 'axios'
import { write, broadcast, responseLatestMsg } from '../socket'

/**
 * ACTION TYPES
 */
export const GET_BLOCKCHAIN = 'GET_BLOCKCHAIN';
export const SET_BLOCKCHAIN = 'SET_BLOCKCHAIN';
export const ADD_BLOCK = 'ADD_BLOCK';

/**
 * INITIAL STATE
 */
const defaultBlockchain = [];

/**
 * ACTION CREATORS
 */
export const getBlockchain = blockchain => ({
  type: GET_BLOCKCHAIN,
  blockchain
});

export const setBlockchain = blockchain => ({
  type: SET_BLOCKCHAIN,
  blockchain
})

// THUNK CREATORS
export const fetchBlockchain = () => async dispatch => {
  const { data } = await axios.get('/api/blockchain');

  dispatch(setBlockchain(data));
}

export const mineBlock = blockData => async dispatch => {
  try {
    const { data } = await axios.post('/api/blockchain/mineBlock', { blockData } )
    dispatch(setBlockchain(data));
  } catch (err) {
    console.error(err);
  }
}


/**
 * REDUCER
 */
export default function(state = defaultBlockchain, action) {
  switch (action.type) {

    case GET_BLOCKCHAIN:
      return action.blockchain;

    case SET_BLOCKCHAIN:
      return action.blockchain;

    default:
      return state;

  }
}

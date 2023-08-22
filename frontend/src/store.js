import { createStore } from 'redux'

const initialState = {
  sidebarShow: false,
  pcStats: {}
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'STORE_OBJECT':
      return {
        ...state,
        pcStats: [state.pcStats, rest]
      };
    case 'GET_STORED_OBJECTS':
      return state.pcStats;
    default:
      return state
  }
}

const store = createStore(changeState)
export default store

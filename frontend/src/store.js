import { createStore } from 'redux'

const initialState = {
  alert_hidden: true,
  alert_message: "",
  modal_visible: false,
  api_endpoint: "",
  is_spinning: false,
  saved_endpoints: ['https://trashtrackr.com:1337/all', 'https://jordanbrinkman.dev:1337/all', 'https://jordanbrinkman.dev:1338/all', 'https://jordanbrinkman.dev:1339/all'],
  sidebarShow: false,
  pcStats: {
    "Hostname": "PC_Name",
    "HDDs": [
      {
        "_filesystem": "Example",
        "_blocks": "0",
        "_used": "0",
        "_available": "0",
        "_capacity": "0%",
        "_mounted": "/"
      },
      {
        "_filesystem": "Example 2",
        "_blocks": "0",
        "_used": "0",
        "_available": "0",
        "_capacity": "0%",
        "_mounted": "/example"
      }
    ],
    "Memory": {
      "Free": "0",
      "Used": "0",
      "Total": "0",
      "PercentUsed": "0%"
    },
    "CPU": {
      "Used": "0%"
    }
  }    
  
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'GET_STORED_OBJECTS':
      return state.pcStats;
    default:
      return state
  }
}

const store = createStore(changeState)
export default store

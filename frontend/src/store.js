import { createStore } from 'redux'

const initialState = {
  alert_hidden: true,
  alert_message: "",
  modal_visible: false,
  api_endpoint: "",
  sidebarShow: false,
  pcStats: {
    "PC_Name": {
      "CPU": {
        "User": "0%",
        "System": "0%",
        "Used": "0%",
        "Free": "0%"
      },
      "Memory": {
        "Free": "0 GB",
        "Total": "0 GB",
        "PercentUsed": "0%"
      },
      "HDDs": [
        {
          "_filesystem": "Example",
          "_blocks": 0,
          "_used": 0,
          "_available": 0,
          "_capacity": "0%",
          "_mounted": "/mnt/example"
        },
        {
          "_filesystem": "Example2",
          "_blocks": 0,
          "_used": 0,
          "_available": 0,
          "_capacity": "0%",
          "_mounted": "/mnt/example2"
        }
      ]
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

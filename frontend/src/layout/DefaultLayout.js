import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

const setState = (payload) => ({
  type: 'set',
  ...payload
});

//const [visible, setVisible] = useState(false);

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
  CTooltip,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
  CFormLabel,
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilStorage,
  cilReload,
  cilCog,
  cilPlus,
  cilMinus,
  cilListRich
} from '@coreui/icons'

const DefaultLayout = () => {

  // Redux dispatch
  const dispatch = useDispatch();

  // Retrieving state with redux
  const pcStatsObj = useSelector((state) => state.pcStats);
  const alertHidden = useSelector((state) => state.alert_hidden);
  const alertMsgObj = useSelector((state) => state.alert_message);
  const modalVisible = useSelector((state) => state.modal_visible);
  const isSpinning = useSelector((state) => state.is_spinning);
  const savedEndpoints = useSelector((state) => state.saved_endpoints);

  var pcStatKey = Object.keys(pcStatsObj)[0]; // The computer name that is stored in the first key in the JSON.
  const retryMaxCount = 2; // Max amount of retries to try fetching API after failure.
  var retryCount = 0; // Counter for retrying failed fetches
  var refreshInterval; // Stores the setInterval id for future clearing.
  const refreshTimeMS = 5000; // 5sec API stat refresh

  // I think this is the best route for updating the API IP on the fly
  // as the node API should always be hosted on the same machine.
  const localApiEndpoint = "http://"+window.location.hostname+":1337/all";

  useEffect(() => {// useEffect is ran once at load

    // Load any saved_endpoints from localStorage into redux state
    const currEndpoints = window.localStorage.getItem("savedEndpoints");
    if (savedEndpoints == "") {
      if (process.env.REACT_APP_DEBUG_MODE) console.debug("No localStorage savedEndpoints.")

      if (currEndpoints) {
        if (currEndpoints.length > 0) {
          if (process.env.REACT_APP_DEBUG_MODE) console.debug("Loading found localStorage savedEndpoints into redux.");
          dispatch(setState({saved_endpoints: JSON.parse(currEndpoints)}));
        }
      }
    }

    prepIntervalAndRefresh(); // Start first stat refresh and start the setInterval

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      // Cleanup and clear intervals and eventlisteners
      clearInterval(refreshInterval);
      refreshInterval = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, []);

  const handleVisibilityChange = () => {
    // Used to clear the setInterval when the page is hidden from the screen
    // and restart it upon being viewed again.

    if (document.hidden) {
      // Page is not visible (e.g., user switched tabs or minimized the window)
      if (process.env.REACT_APP_DEBUG_MODE) console.debug("Window has been hidden. Clearing refresh interval.");
      clearInterval(refreshInterval);
      refreshInterval = null;
    } else {
      // Page is visible (e.g., user switched back to the tab)
      if (process.env.REACT_APP_DEBUG_MODE) console.debug("Window has been shown. Starting refresh interval.");
      prepIntervalAndRefresh();
    }
  }

  const prepIntervalAndRefresh = () => {
    // Refresh the PC stats and setInterval if none is active.
    updatePCStats();

    if (refreshInterval == null) {
      refreshInterval = setInterval(() => {
        updatePCStats();
      }, refreshTimeMS);
    }
  }
  const saveSettings = () => {
    const inputEndpoint = document.getElementById('textBoxApiEndpoint').value;
    if (inputEndpoint) {
      dispatch(setState({ api_endpoint: inputEndpoint }));
      window.localStorage.setItem('apiEndPoint', inputEndpoint);
    }
    dispatch(setState({modal_visible: false}));
  }

  const manualRefresh = () => { // Mostly used to spin the refresh icon and then call refresh function.

    if (process.env.REACT_APP_DEBUG_MODE) console.debug("Manual Refresh");
    dispatch(setState({is_spinning: true}));
    prepIntervalAndRefresh();
  }
  const showAlert = (errMsg) => {
    dispatch(setState({alert_message: errMsg}));
    dispatch(setState({alert_hidden: false}));
  }
  const hideAlert = () => {
    dispatch(setState({alert_hidden: true}));
  }
  const showSettings = () => {
    dispatch(setState({modal_visible: true}));
  }
  const hideSettings = () => {
    dispatch(setState({modal_visible: false}));
  }
  // eslint-disable-next-line no-unused-vars
  const addEndpoint = () => { // Add the API endpoint from the settings textbox into redux and localStorage.

    const inputEndpoint = document.getElementById('textBoxApiEndpoint').value;
    let currEndpoints = JSON.parse(window.localStorage.getItem("savedEndpoints"));

    if (process.env.REACT_APP_DEBUG_MODE) console.debug(`Adding host: ${JSON.stringify(inputEndpoint)}`)

    if (!inputEndpoint) return; // Return if nothing in textbox
    if (currEndpoints) {
      if (!currEndpoints.includes(inputEndpoint)) {
        currEndpoints.push(inputEndpoint);
      }
    } else {
      currEndpoints = [inputEndpoint];
    }

    window.localStorage.setItem("savedEndpoints", JSON.stringify(currEndpoints));
    dispatch(setState({saved_endpoints: currEndpoints}));
  }
  const removeEndpoint = () => {
    const inputEndpoint = document.getElementById('textBoxApiEndpoint').value;
    let currEndpoints = JSON.parse(window.localStorage.getItem("savedEndpoints"));

    if (!inputEndpoint) return; // Return if nothing in textbox
    if (currEndpoints) {
      if (currEndpoints.includes(inputEndpoint)) {
        currEndpoints = currEndpoints.filter(item => item !== inputEndpoint);
      }
    }
    window.localStorage.setItem("savedEndpoints", JSON.stringify(currEndpoints));
    dispatch(setState({saved_endpoints: currEndpoints}));
  }
  const clickHostDropdown = (event) => {
    document.getElementById('textBoxApiEndpoint').value = event.target.innerText;
  }

  const updatePCStats = async () => {
    const updatePCEndpoint = window.localStorage.getItem("apiEndPoint") || localApiEndpoint;

    if (process.env.REACT_APP_DEBUG_MODE) console.debug("Fetching:", updatePCEndpoint);

    try {
      const response = await fetch(updatePCEndpoint);
      const apiResponse = await response.json();

      if (process.env.REACT_APP_DEBUG_MODE) console.debug("Fetched:", apiResponse);
        
      //addEndpoint(updatePCEndpoint); // On successful fetch, try adding the host to the storage.

      dispatch(setState({ pcStats: apiResponse }));
      dispatch(setState({is_spinning: false}));
      dispatch(setState({alert_hidden: true}));
      retryCount = 0;

    } catch (err) {
      console.error('Error fetching data:', err.message);

      console.error(`${retryCount} out of ${retryMaxCount} retries before stopping.`);

      if(retryCount >= retryMaxCount) {
        console.error("Max retries hit, stopping refresh interval.");
        clearInterval(refreshInterval);
        refreshInterval = null;
        dispatch(setState({is_spinning: false}));
      }
      retryCount++;

      showAlert(err.message);
    }
  }

  return (
    <React.Fragment>
    <div>
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <div className="body flex-grow-1 px-3 mt-4">
          
          <CModal alignment="center" id="settingsModal" visible={modalVisible} onClose={hideSettings}>
            <CModalHeader>
              <CModalTitle>Settings</CModalTitle>
            </CModalHeader>
            <CModalBody>
            <CFormLabel htmlFor="textBoxApiEndpoint">Backend API URL:</CFormLabel>
            <CInputGroup className="mb-3">
              <CDropdown variant="input-group">

                <CDropdownToggle color="secondary" variant="outline">Hosts</CDropdownToggle>

                <CDropdownMenu>

                  {savedEndpoints.map((item,key) => (
                  <CDropdownItem href="#" key={parseInt(key)} onClick={clickHostDropdown}>{item}</CDropdownItem>
                  ))}
                </CDropdownMenu>
                <CButton type="button" color="success" variant="outline" onClick={addEndpoint}><CIcon icon={cilPlus}/></CButton>
                <CButton type="button" color="danger" variant="outline" onClick={removeEndpoint}><CIcon icon={cilMinus}/></CButton>
              </CDropdown>
              <CFormInput id="textBoxApiEndpoint" placeholder={window.localStorage.getItem('apiEndPoint')}/>
            </CInputGroup>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={hideSettings}>
                Close
              </CButton>
              <CButton color="primary" onClick={saveSettings}>Save changes</CButton>
            </CModalFooter>
          </CModal>
          
          <CAlert dismissible color="danger" id='alert_section' visible={!alertHidden} onClose={hideAlert}>
          {alertMsgObj}
          </CAlert>
          <CRow>
            <CCol xs>
              <CCard className="mb-4">
                <CCardHeader>{Object.keys(pcStatsObj)[0]}
                  <div className='float-right'>
                    <CTooltip content="Settings">
                      <CIcon icon={cilCog} id='settingsIcon' className='mr-10' onClick={showSettings} />
                    </CTooltip>
                    <CTooltip content="Refresh">
                      <CIcon icon={cilReload} id='refreshIcon' onClick={manualRefresh} className={isSpinning ? 'rotate360' : ''}/>
                    </CTooltip>
                  </div></CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs={12} md={12} xl={12}>

                      <h2>CPU</h2>
                      <hr className="mt-0" />
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilListRich} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU ? pcStatsObj[pcStatKey].CPU.Used : 0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="success" value={parseInt(pcStatsObj[pcStatKey].CPU ? pcStatsObj[pcStatKey].CPU.Used : 0)} />
                        </div>
                      </div>

                      {/* <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilMonitor} size="lg" />
                          <span>System</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.System ? pcStatsObj[pcStatKey].CPU.System : 0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="success" value={parseInt(pcStatsObj[pcStatKey].CPU.System ? pcStatsObj[pcStatKey].CPU.System : 0)} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilUser} size="lg" />
                          <span>User</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.User ? pcStatsObj[pcStatKey].CPU.User : 0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="info" value={parseInt(pcStatsObj[pcStatKey].CPU.User ? pcStatsObj[pcStatKey].CPU.User : 0)} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilListRich} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.Used ? pcStatsObj[pcStatKey].CPU.Used : 0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgressStacked>
                            <CProgress color="success" value={parseInt(pcStatsObj[pcStatKey].CPU.System ? pcStatsObj[pcStatKey].CPU.System : 0)} />
                            <CProgress color="info" value={parseInt(pcStatsObj[pcStatKey].CPU.User ? pcStatsObj[pcStatKey].CPU.User : 0)} />
                          </CProgressStacked>
                        </div>
                      </div> */}

                      <h2>RAM</h2>
                      <hr className="mt-0" />
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilStorage} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">
                            <span className="text-medium-emphasis small mr-10">({pcStatsObj[pcStatKey].Memory.Used} / {pcStatsObj[pcStatKey].Memory.Total})</span>
                            {pcStatsObj[pcStatKey].Memory.PercentUsed}
                          </span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="warning" value={parseInt(pcStatsObj[pcStatKey].Memory.PercentUsed.replace(/%/g, ''))} />
                        </div>
                      </div>
                    </CCol>
                  </CRow>

                  <br />
                  <h2>HDDs</h2>
                  <hr className="mt-0" />

                  <CTable align="middle" className="mb-0 border" hover responsive>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>FileSystem</CTableHeaderCell>
                        <CTableHeaderCell>Blocks</CTableHeaderCell>
                        <CTableHeaderCell>Capacity</CTableHeaderCell>
                        <CTableHeaderCell>Available</CTableHeaderCell>
                        <CTableHeaderCell>Used</CTableHeaderCell>
                        <CTableHeaderCell>Mountpoint</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>

                    <CTableBody>
                      {pcStatsObj[pcStatKey].HDDs.map((item, index) => (
                        <CTableRow v-for="item in tableItems" key={index}>
                          <CTableDataCell>
                            <div className="small text-medium-emphasis">{item._filesystem}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-medium-emphasis">{item._blocks}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CProgress thin color='success' value={parseInt(item._capacity.replace(/%/g, ''))} />
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-medium-emphasis">{item._available}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-medium-emphasis">{item._used}</div>
                          </CTableDataCell>
                          <CTableDataCell>
                            <div className="small text-medium-emphasis">{item._mounted}</div>
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                  
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </div>
      </div>
    </div>
    </React.Fragment>
  )
}

export default DefaultLayout

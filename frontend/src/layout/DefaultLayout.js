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
  CProgressStacked,
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
  CFormInput
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMonitor,
  cilStorage,
  cilReload,
  cilUser,
  cilListRich,
  cilCog
} from '@coreui/icons'

const DefaultLayout = () => {

  const dispatch = useDispatch();
  var pcStatsObj = useSelector((state) => state.pcStats);
  var alertHiddenObj = useSelector((state) => state.alert_hidden);
  var alertMsgObj = useSelector((state) => state.alert_message);
  var modalVisible = useSelector((state) => state.modal_visible);
  var pcStatKey = Object.keys(pcStatsObj)[0];
  const retryMaxCount = 2;
  var retryCount = 0;
  var refreshInterval;
  var updatePCEndpoint;

  // I think this is the best route for updating the API IP on the fly, as it will always be hosted locally.
  const localApiEndpoint = "http://"+window.location.hostname+":1337/all";

  useEffect(() => {
    updatePCStats();

    refreshInterval = setInterval(() => {
      updatePCStats();
    }, 5000);
  }, []);

  const saveSettings = () => {
    dispatch(setState({api_endpoint: document.getElementById('textBoxApiEndpoint').value}));
    window.sessionStorage.setItem('apiEndPoint', document.getElementById('textBoxApiEndpoint').value);
    dispatch(setState({modal_visible: false}));
  }

  const manualRefresh = () => {

    if (process.env.REACT_APP_DEBUG_MODE)
      console.log("Manual Refresh");
    document.getElementById('refreshIcon').classList.add('rotate360');
  }
  const showAlert = (errMsg) => {
    dispatch(setState({alert_message: errMsg}));
    dispatch(setState({alert_hidden: false}));
  }
  const showSettings = () => {
    dispatch(setState({modal_visible: true}));
  }
  const hideSettings = () => {
    dispatch(setState({modal_visible: false}));
  }

  const updatePCStats = async () => {
    updatePCEndpoint = window.sessionStorage.getItem("apiEndPoint") || localApiEndpoint;

    if (process.env.REACT_APP_DEBUG_MODE)
      console.log("Fetching:", updatePCEndpoint);

    //fetch(process.env.REACT_APP_API_URL || 'http://localhost:1337/all')
    fetch(updatePCEndpoint)
      .then(response => response.json())
      .then((apiResponse) => {

        dispatch(setState({pcStats:apiResponse}));
        document.getElementById('refreshIcon').classList.remove('rotate360');
        dispatch(setState({alert_hidden: true}));
        retryCount = 0;

      if (process.env.REACT_APP_DEBUG_MODE) 
        console.log("Fetched:", apiResponse);

      })
      .catch(err => {
        console.error('Error fetching data:', err);
        
        if(retryCount >= retryMaxCount) {
          console.log("Max retries hit, stopping refresh.");
          clearInterval(refreshInterval);
        }
        console.log(retryCount, "out of", retryMaxCount, "retries before stopping.");
        retryCount++;

        showAlert(err.message);
      });
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
            <CFormLabel htmlFor="basic-url">Backend API URL:</CFormLabel>
            <CInputGroup>
              <CFormInput id="textBoxApiEndpoint" placeholder={window.sessionStorage.getItem('apiEndPoint')} aria-describedby="basic-addon3"/>
            </CInputGroup>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={hideSettings}>
                Close
              </CButton>
              <CButton color="primary" onClick={saveSettings}>Save changes</CButton>
            </CModalFooter>
          </CModal>
          
          <CAlert color="danger" id='alert_section' hidden={alertHiddenObj}>
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
                      <CIcon icon={cilReload} id='refreshIcon' onClick={manualRefresh} />
                    </CTooltip>
                  </div></CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol xs={12} md={12} xl={12}>

                      <h2>CPU</h2>
                      <hr className="mt-0" />
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilMonitor} size="lg" />
                          <span>System</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.System?pcStatsObj[pcStatKey].CPU.System:0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="success" value={parseInt(pcStatsObj[pcStatKey].CPU.System?pcStatsObj[pcStatKey].CPU.System:0)} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilUser} size="lg" />
                          <span>User</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.User?pcStatsObj[pcStatKey].CPU.User:0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="info" value={parseInt(pcStatsObj[pcStatKey].CPU.User?pcStatsObj[pcStatKey].CPU.User:0)} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilListRich} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj[pcStatKey].CPU.Used?pcStatsObj[pcStatKey].CPU.Used:0}</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgressStacked>
                            <CProgress color="success" value={parseInt(pcStatsObj[pcStatKey].CPU.System?pcStatsObj[pcStatKey].CPU.System:0)} />
                            <CProgress color="info" value={parseInt(pcStatsObj[pcStatKey].CPU.User?pcStatsObj[pcStatKey].CPU.User:0)} />
                          </CProgressStacked>
                        </div>
                      </div>

                      <br />
                      <h2>RAM</h2>
                      <hr className="mt-0" />
                      <div className="progress-group">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilStorage} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">
                            <span className="text-medium-emphasis small mr-10">({pcStatsObj[pcStatKey].Memory.Free} / {pcStatsObj[pcStatKey].Memory.Total})</span>
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

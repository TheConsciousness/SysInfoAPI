import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

/*
const setState = (payload) => ({
  type: 'set',
  pcStats: payload
});
*/
const setState2 = (payload) => ({
  type: 'set',
  ...payload
});

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
  CPopover,
  CProgressStacked,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMonitor,
  cilStorage,
  cilReload,
  cilUser,
  cilListRich
} from '@coreui/icons'

const DefaultLayout = () => {

  const dispatch = useDispatch();
  var pcStatsObj = useSelector((state) => state.pcStats);
  var alertHiddenObj = useSelector((state) => state.alert_hidden);
  var alertMsgObj = useSelector((state) => state.alert_message);

  useEffect(() => {
    updatePCStats();
    setInterval(() => {
      updatePCStats();
    }, 5000);
  }, []);

  const manualRefresh = () => {

    if (process.env.REACT_APP_DEBUG_MODE)
      console.log("Manual Refresh");
    document.getElementById('refreshIcon').classList.add('rotate360');
  }
  const showAlert = (errMsg) => {
    dispatch(setState2({alert_message: errMsg}));
    dispatch(setState2({alert_hidden: false}));
  }

  const updatePCStats = async () => {
    if (process.env.REACT_APP_DEBUG_MODE)
      console.log("Fetching:", process.env.REACT_APP_API_URL);

    fetch(process.env.REACT_APP_API_URL || 'http://localhost:1337/all')
      .then(response => response.json())
      .then((apiResponse) => {
        //dispatch(setState(apiResponse));

        dispatch(setState2({pcStats:apiResponse}));
        document.getElementById('refreshIcon').classList.remove('rotate360');

      if (process.env.REACT_APP_DEBUG_MODE) 
        console.log("Fetched:", apiResponse);

      })
      .catch(err => {
        console.error('Error fetching data:', err);
        showAlert(err.message);
      });
  }

  return (
    <React.Fragment>
    <div>
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <div className="body flex-grow-1 px-3 mt-4">
          <CAlert color="danger" id='alert_section' hidden={alertHiddenObj}>
          {alertMsgObj}
          </CAlert>
          <CRow>
            <CCol xs>
              <CCard className="mb-4">
                <CCardHeader>{Object.keys(pcStatsObj)[0]}
                  <div className='float-right'>
                    <CPopover content="Refresh Data" placement="bottom" trigger={['hover', 'focus']}>
                      <CIcon icon={cilReload} id='refreshIcon' onClick={manualRefresh} />
                    </CPopover>
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
                          <span className="ms-auto fw-semibold">{pcStatsObj['Big-Mac.local'].CPU.System.replace(/%/g, '')}%</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="success" value={parseInt(pcStatsObj['Big-Mac.local'].CPU.System.replace(/%/g, ''))} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilUser} size="lg" />
                          <span>User</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj['Big-Mac.local'].CPU.User.replace(/%/g, '')}%</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="info" value={parseInt(pcStatsObj['Big-Mac.local'].CPU.User.replace(/%/g, ''))} />
                        </div>
                      </div>
                      <div className="progress-group mb-4">
                        <div className="progress-group-header">
                          <CIcon className="me-2" icon={cilListRich} size="lg" />
                          <span>Used</span>
                          <span className="ms-auto fw-semibold">{pcStatsObj['Big-Mac.local'].CPU.Used.replace(/%/g, '')}%</span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgressStacked>
                            <CProgress color="success" value={parseInt(pcStatsObj['Big-Mac.local'].CPU.System.replace(/%/g, ''))} />
                            <CProgress color="info" value={parseInt(pcStatsObj['Big-Mac.local'].CPU.User.replace(/%/g, ''))} />
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
                            <span className="text-medium-emphasis small mr-10">({pcStatsObj['Big-Mac.local'].Memory.Free} / {pcStatsObj['Big-Mac.local'].Memory.Total})</span>
                            {pcStatsObj['Big-Mac.local'].Memory.PercentUsed}
                          </span>
                        </div>
                        <div className="progress-group-bars">
                          <CProgress color="warning" value={parseInt(pcStatsObj['Big-Mac.local'].Memory.PercentUsed.replace(/%/g, ''))} />
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
                      {pcStatsObj['Big-Mac.local'].HDDs.map((item, index) => (
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

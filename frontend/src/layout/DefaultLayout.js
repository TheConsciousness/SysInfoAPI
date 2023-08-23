import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';

const setState = (newStats) => ({
  type: 'set',
  pcStats: newStats
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
  CPopover
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMonitor,
  cilStorage,
  cilReload
} from '@coreui/icons'

const DefaultLayout = () => {
  
  // eslint-disable-next-line
  const dispatch = useDispatch();
  var pcStatsObj = useSelector((state) => state.pcStats);
  
  useEffect(() => {
    updatePCStats();
    setInterval(() => {

      /*
      var pcStatsObj2 = {...pcStatsObj};

      pcStatsObj2['Big-Mac.local'].HDDs.map(disk => {
          disk._capacity = (Math.floor(Math.random() * (100 - 1 + 1)) + 1) + "%"
      });
      
      pcStatsObj2['Big-Mac.local'] = {};
      pcStatsObj2['Big-Mac.local'].CPU = {};
      pcStatsObj2['Big-Mac.local'].Memory = {};

      pcStatsObj2['Big-Mac.local'].CPU.Used = (Math.floor(Math.random() * (100 - 1 + 1)) + 1) + "%";

      pcStatsObj2['Big-Mac.local'].Memory.Free = (Math.floor(Math.random() * (50 - 1 + 1)) + 1) +" GB";
      pcStatsObj2['Big-Mac.local'].Memory.Total = (Math.floor(Math.random() * (100 - 50 + 1)) + 50)+" GB";
      console.log('Mem.total', pcStatsObj2['Big-Mac.local'].Memory.Total);
      console.log('Mem.free', pcStatsObj2['Big-Mac.local'].Memory.Free);
      console.log('Mem.math', Math.round((pcStatsObj2['Big-Mac.local'].Memory.Free / pcStatsObj2['Big-Mac.local'].Memory.Total)*100));

      console.log();
      pcStatsObj2['Big-Mac.local'].Memory.PercentUsed = Math.round((pcStatsObj2['Big-Mac.local'].Memory.Free.replace(/GB/g, '') / pcStatsObj2['Big-Mac.local'].Memory.Total.replace(/GB/g, ''))*100)+"%";
      pcStatsObj2['Big-Mac.local'].HDDs = pcStatsObj['Big-Mac.local'].HDDs;
      console.log("setting cpu.used to: " + pcStatsObj2['Big-Mac.local'].CPU.Used);
      dispatch(setState(pcStatsObj2));
      */

      updatePCStats();
      
    }, 5000);
  }, []);

  // eslint-disable-next-line
  const startRotate = () => {
    document.getElementById('refreshIcon').classList.add('rotate360');
  }

  const updatePCStats = async () => {
    if (process.env.REACT_APP_DEBUG_MODE) 
      console.log("Fetching:", process.env.REACT_APP_API_URL);
      
    fetch(process.env.REACT_APP_API_URL || 'http://localhost:1337/all')
    .then(response => response.json())
    .then((apiReturn) => {
      pcStatsObj = apiReturn;
      dispatch(setState(apiReturn));
      document.getElementById('refreshIcon').classList.remove('rotate360');
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }
  
  return (
      <div>
        <div className="wrapper d-flex flex-column min-vh-100 bg-light">
          <div className="body flex-grow-1 px-3 mt-4">
            <CRow>
              <CCol xs>
                <CCard className="mb-4">
                  <CCardHeader>{Object.keys(pcStatsObj)[0]}<div className='float-right'><CPopover
  content="Refresh Data"
  placement="bottom"
  trigger={['hover', 'focus']}
><CIcon icon={cilReload} id='refreshIcon' onClick={startRotate} />
</CPopover></div></CCardHeader>
                  <CCardBody>
                    <CRow>
                      <CCol xs={12} md={12} xl={12}>

                        <h2>CPU</h2>
                        <hr className="mt-0" />
                        <div className="progress-group mb-4">
                          <div className="progress-group-header">
                            <CIcon className="me-2" icon={cilMonitor} size="lg" />
                            <span>Used</span>
                            <span className="ms-auto fw-semibold">{pcStatsObj['Big-Mac.local'].CPU.Used.replace(/%/g, '')}%</span>
                          </div>
                          <div className="progress-group-bars">
                            <CProgress thin color="warning" value={parseInt(pcStatsObj['Big-Mac.local'].CPU.Used.replace(/%/g, ''))} />
                          </div>
                        </div>

                        <br/>
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
                            <CProgress thin color="success" value={parseInt(pcStatsObj['Big-Mac.local'].Memory.PercentUsed.replace(/%/g, ''))} />
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
                              <CProgress thin color='red' value={parseInt(item._capacity.replace(/%/g, ''))} />
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
  )
}

export default DefaultLayout

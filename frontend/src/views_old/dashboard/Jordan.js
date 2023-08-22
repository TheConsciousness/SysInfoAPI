import React from 'react'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMonitor,
  cilStorage
} from '@coreui/icons'

const Jordan = () => {

  const apiReturn = {
    "Big-Mac.local": {
      "CPU": {
        "User": "4.60%",
        "System": "12.48%",
        "Used": "17%",
        "Free": "82.90%"
      },
      "Memory": {
        "Free": "6.86 GB",
        "Total": "16 GB",
        "PercentUsed": "43%"
      },
      "HDDs": [
        {
          "_filesystem": "/dev/disk1s7s1",
          "_blocks": 489825072,
          "_used": 29925800,
          "_available": 284273552,
          "_capacity": "10%",
          "_mounted": "/"
        },
        {
          "_filesystem": "devfs",
          "_blocks": 383,
          "_used": 383,
          "_available": 0,
          "_capacity": "100%",
          "_mounted": "/dev"
        },
        {
          "_filesystem": "/dev/disk1s5",
          "_blocks": 489825072,
          "_used": 8390696,
          "_available": 284273552,
          "_capacity": "3%",
          "_mounted": "/System/Volumes/VM"
        },
        {
          "_filesystem": "/dev/disk1s3",
          "_blocks": 489825072,
          "_used": 605136,
          "_available": 284273552,
          "_capacity": "1%",
          "_mounted": "/System/Volumes/Preboot"
        },
        {
          "_filesystem": "/dev/disk1s6",
          "_blocks": 489825072,
          "_used": 2592,
          "_available": 284273552,
          "_capacity": "1%",
          "_mounted": "/System/Volumes/Update"
        },
        {
          "_filesystem": "/dev/disk1s1",
          "_blocks": 489825072,
          "_used": 165139656,
          "_available": 284273552,
          "_capacity": "37%",
          "_mounted": "/System/Volumes/Data"
        },
        {
          "_filesystem": "map",
          "_blocks": 0,
          "_used": 0,
          "_available": 0,
          "_capacity": "0%",
          "_mounted": "100%"
        }
      ]
    }
  };
  
  const progressGroupExample3 = [
    { title: 'Used', icon: cilStorage, percent: 56, value: '9GB / 16GB' }
  ]

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>{Object.keys(apiReturn)[0]}</CCardHeader>
            <CCardBody>
              <CRow>
                

                <CCol xs={12} md={12} xl={12}>

                  <h2>CPU</h2>
                  <hr className="mt-0" />

                    <div className="progress-group mb-4">
                    <div className="progress-group-header">
                      <CIcon className="me-2" icon={cilMonitor} size="lg" />
                      <span>User</span>
                      <span className="ms-auto fw-semibold">{apiReturn['Big-Mac.local'].CPU.Used.replace(/%/g, '')}%</span>
                    </div>
                    <div className="progress-group-bars">
                      <CProgress thin color="warning" value={apiReturn['Big-Mac.local'].CPU.Used.replace(/%/g, '')} />
                    </div>
                  </div>
                  

                  <div className="mb-5"></div>
                  <h2>RAM</h2>
                  <hr className="mt-0" />

                    <div className="progress-group">
                      <div className="progress-group-header">
                        <CIcon className="me-2" icon={cilStorage} size="lg" />
                        <span>Used</span>
                        <span className="ms-auto fw-semibold">
                          {apiReturn['Big-Mac.local'].Memory.Free} / {apiReturn['Big-Mac.local'].Memory.Total}
                          <span className="text-medium-emphasis small">({apiReturn['Big-Mac.local'].Memory.PercentUsed})</span>
                        </span>
                      </div>
                      <div className="progress-group-bars">
                        <CProgress thin color="success" value={apiReturn['Big-Mac.local'].Memory.PercentUsed.replace(/%/g,'')} />
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
                  {apiReturn['Big-Mac.local'].HDDs.map((item, index) => (
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
    </>
  )
}

export default Jordan

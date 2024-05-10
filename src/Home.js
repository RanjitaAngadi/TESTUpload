import React, { useState, useContext, useEffect, useMemo } from "react";
import ReactGA from 'react-ga';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Charts from "./components/mainComponent/charts/chart";
import { toast } from "react-toastify";
import axios from "axios";
import {
  ConstVariable,
  DEFAULT_BASE_URL,
  GET_PUMPS_AGING_CHART,
  GET_PUMPS_PART_WISE_CHART,
  GET_PUMPS_RECEIVED_CHART,
  GET_PUMP_READYFORPICKUP_CHART,
  GET_WORKORDER_INPROGRESS_CHART,
  GET_SERVICE_CERTER_LOCATION,
  GET_PUMPS_PROCESS_CHART,
  VERSION,
} from "./components/common/const";
import { useAccessState } from "./utils/AppContext/loginContext";

const Home = () => {
  const context = useAccessState();
  // removing the session to avoid redundancy with ajaxWorkOrderSearch and ajaxReceivingSearch
  const [workOrderInprogressChartData, setWorkOrderInprogressChartData] =
    useState([]);
  const [pumpReadyForPickupChartData, setPumpReadyForPickupChartData] =
    useState([]);
  const [pumpReceivedChartData, setPumpReceivedChartData] = useState([]);
  const [pumpPartTypeWiseChartData, setPumpPartTypeWiseChartData] = useState(
    []
  );
  const [pumpAgingChartData, setPumpAgingChartData] = useState([]);
  // const [pumpProcessChartData, setPumpProcessChartData] = useState([]);
  const [pumpProcessChartData, setPumpProcessChartData] = useState({
    series: [],
    maxValue: 0
  });

  const [loader, setLoader] = useState(false);
  useEffect(() => {
    window.sessionStorage.removeItem("ajaxReceivingSearch");
    window.sessionStorage.removeItem("ajaxWorkOrderSearch");
    window.sessionStorage.removeItem("ajaxPickUpSearch");
    window.sessionStorage.removeItem("ajaxInventorySearch");
    window.sessionStorage.removeItem("ajaxBillingSearch");
  }, []);
  // For google analytics purpose
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [])
  // const [sendNotification, receiveNotification] = useSignalrNotificationConnection()

  // useEffect(() => {
  //   if(receiveNotification){
  //     toast(receiveNotification?.message, {
  //       position: toast.POSITION.BOTTOM_RIGHT,
  //       autoClose:10000
  //     });
  //   }
  //   return () => {

  //   }
  // }, [receiveNotification])

  var [toggle, setToggle] = useState(true);

  useEffect(() => {
    if (context?.userType === ConstVariable?.INRNL) {
      let timer1 = setTimeout(() => setToggle(false), 10000);

      return () => {
        clearTimeout(timer1);
      };
    }
  }, []);
  const getPumpInProgress = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_WORKORDER_INPROGRESS_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);

        if (!response?.status) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const chartData = [["Service Center", "Count"]];
            for (let i = 0; i < response?.data?.content?.length; i += 1) {
              chartData.push([
                response?.data?.content[i]?.serviceCenterName,
                response?.data?.content[i]?.count,
              ]);
            }
            setWorkOrderInprogressChartData(chartData);
          } else {
            const chartData = [["Service Center", "Count"]];
            setWorkOrderInprogressChartData(chartData);
          }
        }
      });
  };
  const getPumpsReadyForPickup = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_PUMP_READYFORPICKUP_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);
        if (response?.status !== 200) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const chartData = [["Service Center", "Count"]];
            for (let i = 0; i < response?.data?.content?.length; i += 1) {
              chartData.push([
                response?.data?.content[i]?.serviceCenter,
                response?.data?.content[i]?.count,
              ]);
            }
            setPumpReadyForPickupChartData(chartData);
          } else {
            const chartData = [["Service Center", "Count"]];
            setPumpReadyForPickupChartData(chartData);
          }
        }
      });
  };
  const getPumpsReceived = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_PUMPS_RECEIVED_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);
        if (response?.status !== 200) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const chartData = [["Service Center", "Count"]];
            for (let i = 0; i < response?.data?.content?.length; i += 1) {
              chartData.push([
                response?.data?.content[i]?.serviceCenterName,
                response?.data?.content[i]?.count,
              ]);
            }
            setPumpReceivedChartData(chartData);
          } else {
            const chartData = [["Service Center", "Count"]];
            setPumpReceivedChartData(chartData);
          }
        }
      });
  };

  const getPumpsPartWise = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_PUMPS_PART_WISE_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);
        if (response?.status !== 200) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const chartData = [["Part Name", "Count"]];
            for (let i = 0; i < response?.data?.content?.length; i += 1) {
              chartData.push([
                response?.data?.content[i]?.partTypeName,
                response?.data?.content[i]?.count,
              ]);
            }
            setPumpPartTypeWiseChartData(chartData);
          } else {
            const chartData = [["Part Name", "Count"]];
            setPumpPartTypeWiseChartData(chartData);
          }
        }
      });
  };
  const getPumpsAging = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_PUMPS_AGING_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);
        if (response?.status !== 200) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const chartData = [["Service Center", "Average Age"]];
            for (let i = 0; i < response?.data?.content?.length; i += 1) {
              chartData.push([
                response?.data?.content[i]?.serviceCenterName,
                response?.data?.content[i]?.averageAge,
              ]);
            }
            setPumpAgingChartData(chartData);
          } else {
            const chartData = [["Service Center", "Average Age"]];
            setPumpAgingChartData(chartData);
          }
        }
      });
  };
  const getPumpsProcess = (headers) => {
    axios
      .get(DEFAULT_BASE_URL + VERSION + GET_PUMPS_PROCESS_CHART, {
        headers,
      })
      .then((response) => {
        setLoader(false);
        if (response?.status !== 200) {
          toast.error(response?.response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        } else {
          if (response?.data?.content?.length > 0) {
            const localLocations = JSON.parse(window.localStorage.getItem('cachedLocations')) || []

            let maxValueArray = response?.data?.content?.map((item, idx) => {
              let { locationId, sequence, ...temp } = item;
              let max = 0;
              Object.values(temp).map(value => {
                if (value > max) max = value
              })
              return max
            })
            const maxValue = Math.max.apply(null, maxValueArray)

            const incrValue = Math.round((maxValue * 25) / 100)            

            let filteredData = response?.data?.content?.map((item, index) => {
              let { locationId, sequence, ...temp } = item
              return {
                name: item?.locationId,
                data: Object.entries(temp).map(([key, value]) => {
                  if (key === "vis") return { x: "Visual", y: value, z: value ? value + incrValue : value }
                  if (key === "dis1") return { x: "Disassembly", y: value, z: value ? value + incrValue : value }
                  if (key === "asm1") return { x: "Assembly", y: value, z: value ? value + incrValue : value }
                  if (key === "fn1") return { x: "Final 1", y: value, z: value ? value + incrValue : value }
                  if (key === "pw") return { x: "Pressure Wash", y: value, z: value ? value + incrValue : value }
                  if (key === "tr") return { x: "Truck Removal", y: value, z: value ? value + incrValue : value }
                  if (key === "dis2") return { x: "Level II- Disassembly", y: value, z: value ? value + incrValue : value }
                  if (key === "asm2") return { x: "Level II- Assembly", y: value, z: value ? value + incrValue : value }
                  if (key === "air1") return { x: "Air Test 1", y: value, z: value ? value + incrValue : value }
                  if (key === "pr") return { x: "Performance Test", y: value, z: value ? value + incrValue : value }
                  if (key === "air2") return { x: "Air Test 2", y: value, z: value ? value + incrValue : value }
                  if (key === "pt1") return { x: "Paint 1", y: value, z: value ? value + incrValue : value }
                  if (key === "dt") return { x: "Data Tag", y: value, z: value ? value + incrValue : value }
                  if (key === "ti") return { x: "Truck Install", y: value, z: value ? value + incrValue : value }
                  if (key === "fn2") return { x: "Level II- Final", y: value, z: value ? value + incrValue : value }
                })
              }
            })
            const headers = { Authorization: `Bearer ${context?.token}`, };
            let requestBody = filteredData?.map((item) => item?.name?.toString())
            if (localLocations?.length === requestBody?.length
              && localLocations.every(({ id: id1 }) => requestBody?.includes(id1.toString()))) {
              let mainFilteredData = filteredData?.map((item) => {
                let foundValue = localLocations?.find(obj => obj?.id === item?.name)
                if (foundValue?.id === item?.name) {
                  return {
                    ...item,
                    name: foundValue?.name
                  }
                } else {
                  return item
                }
              })
              setPumpProcessChartData({
                series: mainFilteredData,
                maxValue: maxValue + 5
              })
            } else {
              getServiceCenterLocation({ body: requestBody, headers, filteredData, maxValue })
            }
          } else {
            setPumpProcessChartData({
              series: [],
              maxValue: 0
            })
          }
        }
      });
  };

  // to access service center location
  const getServiceCenterLocation = ({ body, headers, filteredData, maxValue }) => {
    axios
      .post(DEFAULT_BASE_URL + VERSION + GET_SERVICE_CERTER_LOCATION,
        body,
        {
          headers,
        })
      .then(response => {
        let mainFilteredData = filteredData?.map((item) => {
          let foundValue = response?.data?.content?.find(obj => obj?.id === item?.name)
          if (foundValue?.id === item?.name) {
            return {
              ...item,
              name: foundValue?.name
            }
          } else {
            return item
          }
        })
        setPumpProcessChartData({
          series: mainFilteredData,
          maxValue: maxValue + 5
        })
        const localLocations = response?.data?.content
        window.localStorage.setItem('cachedLocations', JSON.stringify(localLocations))
      })
      .catch(error => {
        console.log("Fetch Locations Response Error:", error)
      })
  }

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${context?.token}`,
    };
    setLoader(false);
    getPumpInProgress(headers);
    getPumpsReadyForPickup(headers);
    getPumpsReceived(headers);
    getPumpsPartWise(headers);
    getPumpsAging(headers);
    getPumpsProcess(headers)
  }, []);


  return (
    <div className="py-2">
      {context?.userType === ConstVariable?.INRNL && (
        <div className="text-center btn-control-action-icons-group mb-1">
          <div onClick={() => setToggle((toggle) => !toggle)}>
            {toggle ? (
              <i className="fa fa-chevron-up" aria-hidden="true"></i>
            ) : (
              <i className="fa fa-chevron-down" aria-hidden="true"></i>
            )}
          </div>
        </div>
      )}

      {toggle && (
        <div className="carousel-wrapper">
          <Carousel
            infiniteLoop
            useKeyboardArrows
            autoPlay
            showThumbs={false}
            showStatus={false}
          >
            <div>
              <img
                src={
                  // window.location.origin +
                  // "/Pump" +
                  "src/styles/images/HomeImage1.png"
                }
              />
            </div>

            <div>
              <img
                src={
                  // window.location.origin +
                  // "/Pump" +
                  "src/styles/images/HomeImage2.png"
                }
              />
            </div>
            <div>
              <img
                src={
                  // window.location.origin +
                  // "/Pump" +
                  "src/styles/images/HomeImage3.png"
                }
              />
            </div>
          </Carousel>
        </div>
      )}
      {context?.userType === ConstVariable?.INRNL && (
        <>
          <Charts
            workOrderInprogressChartData={workOrderInprogressChartData}
            pumpReadyForPickupChartData={pumpReadyForPickupChartData}
            pumpReceivedChartData={pumpReceivedChartData}
            pumpPartTypeWiseChartData={pumpPartTypeWiseChartData}
            pumpAgingChartData={pumpAgingChartData}
            pumpProcessChartData={pumpProcessChartData}
            loader={loader}
          />
        </>
      )}
    </div>
  );
};

export default Home;

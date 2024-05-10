import React from "react";
import { Col, Row } from "react-bootstrap";
import { Chart } from "react-google-charts";
import AMPLoader from "../../common/AMPLoader";
import AMPAuthorization from "../../common/AMPAuthorization/AMPAuthorization";
import { useAccessState } from "../../../utils/AppContext/loginContext";
import PumpStatusWiseChart from "./BubbleChart";

const Charts = (props) => {
  const context = useAccessState();
  const {
    workOrderInprogressChartData,
    pumpReadyForPickupChartData,
    pumpReceivedChartData,
    pumpPartTypeWiseChartData,
    pumpAgingChartData,
    pumpProcessChartData,
    loader,
  } = props;

  const colors = ["#0060af", "#8093a3", "#cedeeb", "#808080", "#631d1d"];

  return (
    <div className="charts">
      <Col>
        <AMPLoader isLoading={loader} />
        <Row>
          <Col xs="12" sm="12" lg="12" md="12">
            <div className="chart-style mb-2">
              <div className="text-font-family border">Pumps - Process Wise Chart</div>
              <div className="border">
                <PumpStatusWiseChart
                  pumpProcessChartData={pumpProcessChartData}
                />
                <div className="fn-12 text-info mx-0 pb-2">
                  (Chart uses data from top 5 locations)
                </div>
              </div>
            </div>
          </Col>
          <AMPAuthorization hasToken={context?.features?.includes("CHT-P-REC")}>
            <Col xs="12" sm="12" lg="12" md="12">
              <div className="chart-style mb-2">
                <div className="text-font-family border">Pumps - Received</div>
                <div className="border">
                  <Chart
                    chartType="PieChart"
                    data={pumpReceivedChartData}
                    options={{
                      chartArea: { width: "100%" },
                      is3D: "true",
                      colors: colors,
                      legend: { position: "bottom", alignment: "center" },
                    }}
                    graph_id="PieChartRecieved"
                    width="100%"
                    height="400px"
                  />
                  <div
                    className="fn-12 text-info mx-0 pb-2"
                  >
                    (Chart uses data from the current month)
                  </div>
                </div>
              </div>
            </Col>
          </AMPAuthorization>
          <AMPAuthorization hasToken={context?.features?.includes("CHT-P-WIP")}>
            <Col xs="12" sm="12" lg="6" md="6">
              <div className="chart-style mb-2">
                <div className="text-font-family border">
                  Pumps - In Progress
                </div>
                <div className="border">
                  <Chart
                    chartType="PieChart"
                    data={workOrderInprogressChartData}
                    options={{
                      chartArea: { width: "100%" },
                      legend: { position: "bottom", alignment: "center" },
                      colors: colors,
                      is3D: "true",
                    }}
                    graph_id="PieChartInprogress"
                    width="100%"
                    height="400px"
                  />
                  <div
                    className="fn-12 text-info mx-0 pb-2"
                  >
                    (Chart uses data from the current month)
                  </div>
                </div>
              </div>
            </Col>
          </AMPAuthorization>

          <AMPAuthorization hasToken={context?.features?.includes("CHT-P-AGE")}>
            <Col xs="12" sm="12" lg="6" md="6">
              <div className="chart-style">
                <div className="text-font-family border">
                  Pumps - Aging (days)
                </div>
                <div className="border">
                  <Chart
                    chartType="PieChart"
                    data={pumpAgingChartData}
                    options={{
                      chartArea: { width: "100%" },
                      legend: { position: "bottom", alignment: "center" },
                      colors: colors,
                      is3D: "true",
                    }}
                    graph_id="PieChartAging"
                    width="100%"
                    height="400px"
                  />
                  <div className="fn-12 text-info mx-0 pb-2">
                    (Chart uses data from the last 90 days)
                  </div>
                </div>
              </div>

            </Col>
          </AMPAuthorization>
          <AMPAuthorization
            hasToken={context?.features?.includes("CHT-WO-PICKUP")}
          >
            <Col xs="12" sm="12" lg="6" md="6">
              <div className="chart-style">
                <div className="text-font-family border">
                  Pumps - Ready for Pickup
                </div>
                <div className="border">
                  <Chart
                    chartType="PieChart"
                    data={pumpReadyForPickupChartData}
                    options={{
                      chartArea: { width: "100%" },
                      is3D: "true",
                      colors: colors,
                      legend: { position: "bottom", alignment: "center" },
                    }}
                    graph_id="PieChartPickup"
                    width="100%"
                    height="400px"
                  />
                  <div className="fn-12 text-info mx-0 pb-2">
                    (Chart uses data from the current month)
                  </div>
                </div>
              </div>
            </Col>
          </AMPAuthorization>
          <AMPAuthorization hasToken={context?.features?.includes("CHT-P-PT")}>
            <Col xs="12" sm="12" lg="6" md="6">
              <div className="chart-style mb-5">
                <div className="text-font-family border">Pumps - Part Wise</div>
                <div className="border">
                  <Chart
                    chartType="PieChart"
                    data={pumpPartTypeWiseChartData}
                    options={{
                      chartArea: { width: "100%" },
                      is3D: "true",
                      colors: colors,
                      legend: { position: "bottom", alignment: "center" },
                    }}
                    graph_id="PieChartPartWise"
                    width="100%"
                    height="400px"
                  />
                  <div className="fn-12 text-info mx-0 pb-2">
                    (Chart uses data from the current month)
                  </div>
                </div>
              </div>
            </Col>
          </AMPAuthorization>
        </Row>
      </Col>
    </div>
  );
};

export default Charts;

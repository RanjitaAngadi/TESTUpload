import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { Row, Col, Button} from "react-bootstrap";
import {
  GET_LOCATION_TO_MOVE_IN_WORKORDER,
  DEFAULT_BASE_URL,
  VERSION,
  MOVE_IN_WORKORDER,
} from "../common/const";
import { AMPFormLayout } from "../common/AMPFormLayout";

import AMPLoader from "../common/AMPLoader";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";

import Select, { components } from "react-select";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { useAccessState } from "../../utils/AppContext/loginContext";

const getAllLocationListToMoveAjaxObs$ = () =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.get(DEFAULT_BASE_URL + VERSION + GET_LOCATION_TO_MOVE_IN_WORKORDER + params?.serviceCenterId
        + "/" + params?.locationHierarchyLevelId).pipe(
          map((xhrResponse) => {
            const filteredData = xhrResponse.response.content.map((item) => {
              return {
                label: item.name.toUpperCase(),
                value: item.id,
                locationHierarchyLevelId: item.locationHierarchyLevelId
              };
            });
            return filteredData;
          }),
          catchError((error) => {
            return throwError(error);
          })
        )
    )
  );

const moveWorkOrderAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.put(URL, params).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          console.error("Error in update Receiving Form", error);
          errorHandler(error.response);
          return [];
        })
      )
    )
  ); // ENd of line
export const TransferToWOrkOrderModal = ({
  isCheck,
  closeWOrkOrderRegionModel,
  modalName,
  checkedData,
  setShowTransferToWorkOrderModal,
  offset,
  perPage,
  ajaxParams,
  ajaxSearchParams,
  searchPumpObs$,
  setIsCheck,
  setCheckedData,
  ...props
}) => {
  const context = useAccessState()
 
  const { handleSubmit, reset, watch, control, register,errors } = useForm({
     hub:{label:"",value:""}
  });
  const [loader, setLoader] = useState(false)
  const [destinationLocation, setDestinationLocation] = useState([])
  const [showHubRequiredError,setShowHubRequiredError]= useState(false);
  const ajaxLocationToMoveObsv$ = useMemo(() => {
    return getAllLocationListToMoveAjaxObs$();
  }, []);
  useObservableCallback(ajaxLocationToMoveObsv$, (response) => {
    setLoader(false);
    setDestinationLocation(response?.filter((elem) => {
      return parseInt(checkedData[0]?.serviceCenterId) !== elem?.value
    }));
  });
  // Move Work Order
  const moveWorkOrder$ = useMemo(() => {
    return moveWorkOrderAjax$(
      DEFAULT_BASE_URL + VERSION + MOVE_IN_WORKORDER,
      {
        errorHandler: (error) => {
          toast.error(response?.message, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);
  /* Observer for update response from ajax request */
  useObservableCallback(moveWorkOrder$, (response) => {
    if (!response?.status) {
      toast.error(response.message, {
        position: toast.POSITION.TOP_CENTER,
      });

    } else {
      setShowTransferToWorkOrderModal(false);
      if (ajaxParams && offset) {
        searchPumpObs$.next({
          index: offset,
          pageSize: perPage,
          ajaxParams: ajaxParams,
          ajaxSearchParams: ajaxSearchParams,
        });
        setLoader(true);
      }
      setIsCheck([]);
      setCheckedData([]);
      setShowHubRequiredError(false)
      toast.success(response?.message, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }, [])

  useEffect(() => {
    const ajaxParams = {
      serviceCenterId: checkedData[0]?.serviceCenterId,
      locationHierarchyLevelId: checkedData[0]?.locationHierarchyLevelId
    }
    setLoader(true)
    ajaxLocationToMoveObsv$.next(ajaxParams);
  }, [])
  const handleMoveWorkOrder = (formData) => {
    const ajaxParams = {
      locationHierarchyLevelId: destinationLocation[0]?.locationHierarchyLevelId,
      sourceServiceCentreId: parseInt(checkedData[0]?.serviceCenterId),
      destinationServiceCentreId: checkedData[0]?.locationHierarchyLevelId === 4 ? formData?.hub?.value : destinationLocation[0]?.value,
      DestinationServiceCentreName: checkedData[0]?.locationHierarchyLevelId === 4 ? formData?.hub?.label : destinationLocation[0]?.label,
      workorderIds: isCheck,
      requestedById: parseInt(context?.userId)
    }
    if(!formData?.hub?.value &&  checkedData[0]?.locationHierarchyLevelId === 4 )
    {
      setShowHubRequiredError(true)
    }
    else{
    moveWorkOrder$.next(ajaxParams);
    }
  };
  // For service center multiple option type
  const colourStyles = {
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      return {
        ...styles,
        backgroundColor: isFocused ? "#999999" : null,
        color: data?.locationHierarchyLevelId === 4 ? "blue" : null,
      };
    },
  };
  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      {props.data.label} <span className="text-info">{props.data?.locationHierarchyLevelId === 4 && "(Hub)"}</span>
    </Option>
  );
 
  return (
    <>
      <AMPLoader isLoading={loader} />
      <AMPModal
        show
        onHide={closeWOrkOrderRegionModel}
        size="md"
        backdrop="static"
        centered
      >
        <AMPModalHeader>{modalName}</AMPModalHeader>


        <form onSubmit={handleSubmit(handleMoveWorkOrder)}>
          {checkedData?.length > 0 && checkedData[0]?.locationHierarchyLevelId === 5 ?
            (destinationLocation?.length > 0 && <div className="text-center"><div className="text-info text-bold">Following work orders can be moved to <h8 className="text-primary">{destinationLocation[0]?.label}</h8> hub</div>
              <div>
                {checkedData?.map((item) => {
                  return (<div className="font-weight-bold">{item?.workorderNumber}</div>)
                })}
              </div>
            </div>) :
            <div>
              <AMPModalBody>
                <div className="text-center"><div className="text-info text-bold">Following work orders are selected to transfer</div>
                  {checkedData?.map((item) => {
                    return (<div className="font-weight-bold">{item?.workorderNumber}</div>)
                  })}
                </div>
                <Row>
                  <Col className="mb-2">
                    <AMPFormLayout>
                      <AMPFieldWrapper
                        colProps={{ md: 12, sm: 12, lg: 12, xs: 12 }}
                        label="Select Hub to transfer"
                        controlId="hub"
                        name="hub"
                        styles={colourStyles}
                        components={{ Option: IconOption }}
                        required="true"
                  fieldValidation={showHubRequiredError}
                        
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={destinationLocation}
                          onChange={([selected]) => {
                            return { value: selected };
                          }}
                        />
                      </AMPFieldWrapper>
                    </AMPFormLayout>
                  </Col>
                </Row>
              </AMPModalBody>
            </div>}
          <AMPModalFooter>
            <Button type="submit" variant="secondary" className="px-5">
              Submit
            </Button>
          </AMPModalFooter>

        </form>

      </AMPModal>
    </>
  );
};

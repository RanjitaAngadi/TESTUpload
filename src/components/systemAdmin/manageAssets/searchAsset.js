import React, { useState, useEffect, useMemo } from "react";
import AMPFieldSet from "../../common/AMPFieldSet";
import { AMPFormLayout } from "../../common/AMPFormLayout";
import { useForm } from "react-hook-form";
import { AMPFieldWrapper } from "../../common/AMPFieldWrapper";
import { AMPTextBox } from "../../common";
import { Row, Col, Button } from "react-bootstrap";
import AMPTooltip from "../../common/AMPTooltip";
import { withRouter, useLocation } from "react-router-dom";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import {
  useObservable,
  useObservableCallback,
} from "../../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  ADD_OR_UPDATE_MANUFACTURE_NUMBER,
  GET_MANUFACTURE_COMPONENTS,
  ConstVariable,
  SEARCH_MANUFACTURE_COMPONENTS,
} from "../../common/const";
import { useAccessState } from "../../../utils/AppContext/loginContext";
import AMPLoader from "../../common/AMPLoader";
import { Link } from "react-router-dom";
import ReactGA from "react-ga";
//import { ManufactureComponentList } from './manufactureComponntList';
import { AMPAccordion } from "../../common/AMPAccordion";

const SearchAsset = (props) => {
  const {
    handleSubmit,
    reset,
    watch,
    control,
    register,
    getValues,
    setValue,
    errors,
  } = useForm({});

  const {
    title,
    formName,
    searchResult,
    offset,
    perPage,
    searchAssetObs$,
    ajaxParams,
    isLoading,
    errorMessage,
    ajaxSearchParams,
    onSearch,
  } = props;

  const context = useAccessState();
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (ajaxParams && offset) {
      searchAssetObs$.next({
        PageIndex: offset,
        PageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      setLoader(true);
    }
  }, [offset]);

  const onClear = () => {
    reset({
      status:
        formName === ConstVariable.ASSET
          ? { label: "All", value: "1,2,4" }
          : { label: "All", value: "1,2,3,4" },
    });
    // setLoader(true)
    if (formName === ConstVariable.ASSET) {
      window.sessionStorage.removeItem("ajaxAssetSearch");
    }
  };

  return (
    <div id="results" className="form-container p-0">
      <AMPLoader isLoading={loader} />
      <AMPFieldSet title="Search Asset">
        <form onSubmit={handleSubmit(onSearch)}>
          <AMPAccordion
            title={title}
            contentClassName="p-0"
            isOpen={!searchResult?.assets}
          >
            <Row className="m-2">
              <Col xs={12} md={12} lg={12} sm={12}>
                <AMPFormLayout className="pb-2">
                  {formName === ConstVariable?.ASSET || (
                    <AMPFieldWrapper
                      colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                      label="Manufacturer Serial Number"
                      controlId="manufacturerSerialNumber"
                      name="manufacturerSerialNumber"
                      placeholder="Enter Manufacturer Serial Number"
                    >
                      <AMPTextBox
                        //className="text-uppercase"
                        ref={register}
                        size="sm"
                      />
                    </AMPFieldWrapper>
                  )}
                  <div colProps={{ md: 12, sm: 12, lg: 8, xs: 12 }}>
                    <Row>
                      <Col md={3} sm={3} lg={3} xs={3}>
                        <Button
                          type="button"
                          variant="secondary"
                          className="form-button1"
                          onClick={onClear}
                          block
                        >
                          Clear
                        </Button>
                      </Col>
                      <Col md={9} sm={9} lg={4} xs={9}>
                        <Button
                          type="submit"
                          variant="primary"
                          className="form-button1"
                          block
                        >
                          Search
                        </Button>
                      </Col>
                    </Row>
                  </div>
                </AMPFormLayout>
              </Col>
            </Row>
          </AMPAccordion>
        </form>
      </AMPFieldSet>
      {/* <div className="float-right btn-control-action-icons-group mb-1">
                <Link to={{
                    pathname: '/Pump/manageAssets/assetDetails'
                }}>
                    <button
                        aria-label="Add"
                        name="Add"
                        type="button"
                        className="amp-button button-mini mt-2 icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                    // onClick={}
                    >
                        <AMPTooltip text="Add New">
                            <svg
                                fill="rgb(11, 26, 88)"
                                viewBox="0 0 510 510"
                                xmlns="http://www.w3.org/2000/svg"
                                className="svg-inline--fa amp-svg-icon amp-svg-add fa-w-16 amp-icon"
                            >
                                <path
                                    d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                  z"
                                ></path>
                                <path
                                    d="M394.667,245.333h-128v-128c0-5.896-4.771-10.667-10.667-10.667s-10.667,4.771-10.667,10.667v128h-128
                                  c-5.896,0-10.667,4.771-10.667,10.667s4.771,10.667,10.667,10.667h128v128c0,5.896,4.771,10.667,10.667,10.667
                                s10.667-4.771,10.667-10.667v-128h128c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333z"
                                ></path>
                            </svg>
                        </AMPTooltip>
                    </button>
                </Link>
            </div> */}
      {/* <ManufactureComponentList/> */}
    </div>
  );
};

export default SearchAsset;

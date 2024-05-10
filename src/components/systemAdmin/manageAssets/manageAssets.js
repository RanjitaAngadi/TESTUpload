import React, { useEffect, useState, useMemo } from "react";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import SearchAsset from "./searchAsset";
import { toast } from "react-toastify";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../../common/AMPModal";
import AMPLoader from "../../common/AMPLoader";
import { useAccessState } from "../../../utils/AppContext/loginContext";
import {
  useObservable,
  useObservableCallback,
} from "../../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  ADD_OR_UPDATE_MANUFACTURE_NUMBER,
  SEARCH_ASSET,
  ConstVariable,
} from "../../common/const";
import { AMPMessage } from "../../common/const/AMPMessage";
//import AddOrEditAsset from './addOrEditAsset';
import SearchResultTableForManageAsset from "./searchResultTableForManageAsset";
import AMPAuthorization from "../../common/AMPAuthorization/AMPAuthorization";

const searchManufactureSerialNumFormAjax$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((params) =>
      ampJsonAjax.post(URL, params.ajaxParams).pipe(
        map((xhrResponse) => {
          return { ...xhrResponse.response, params };
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );

// const getAssetListAjaxObs$ = () =>
// new Subject().pipe(
//   mergeMap((param) =>
//     ampJsonAjax
//       .get(
//         DEFAULT_BASE_URL +
//         VERSION +
//         GET_ASSET_LIST +
//         `${param.index}/${param.pageSize}/${param.assetId}`
//       )
//       .pipe(
//         map((xhrResponse) => {
//           return xhrResponse.response;
//         }),
//         catchError((error) => {
//           return throwError(error);
//         })
//       )
//   )
// );

const ManageAssets = (props) => {
  const {
    closeDefaultModal,
    onAddToReplacement,
    showManageComponents,
    setShowManageComponents,
  } = props;
  // const [loader, setLoader] = useState(false)

  const [ajaxParams, setAjaxParams] = useState();
  const [showDeleteModal, setShowDeleteModal] = useState();
  const context = useAccessState();
  const [ajaxSearchParams, setAjaxSearchParams] = useState();
  const [searchResult, setSearchResult] = useState("initial");

  // pagination related constants
  const [offset, setOffset] = useState(1);
  const [perPage] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setLoader] = useState();

  const editForm = (assetId) => {};
  const addNewFields = () => {};

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1);
  };

  const searchManufactureSerialNumObs$ = useMemo(() => {
    return searchManufactureSerialNumFormAjax$(
      DEFAULT_BASE_URL + VERSION + SEARCH_ASSET,
      {
        errorHandler: (error) => {
          toast.error(AMPToastConsts.MANAGE_ASSET_SEARCH_ERROR, {
            position: toast.POSITION.TOP_CENTER,
          });
        },
      }
    );
  }, []);

  /* Observer for save response from ajax request */
  useObservableCallback(searchManufactureSerialNumObs$, (response) => {
    setAjaxSearchParams(response?.params?.ajaxSearchParams);

    // session creation
    window.sessionStorage.setItem(
      "ajaxAssetSearch",
      JSON.stringify({
        ...response?.params?.ajaxSearchParams,
        PageIndex: 1,
      })
    );
    setSearchResult({
      ...response?.content,
      isApplied: false,
      sortType: "",
    });
    setPageCount(Math.ceil(response?.content?.totalAssetCount / perPage));
    setLoader(false);
  },[]);

  const [errorMessage, setError] = useState("");
  const onSearch = (formData) => {
    console.log("FormData", formData);
    let ajaxParams = {};
    let ajaxSearchParams = {};
    ajaxParams = {
      manufacturerSerialNumber: formData?.manufacturerSerialNumber,
      PageIndex: formData?.PageIndex || 1,
      PageSize: perPage,
    };

    ajaxSearchParams = {
      manufacturerSerialNumber: formData?.manufacturerSerialNumber,
    };

    setAjaxParams(ajaxParams);
    searchManufactureSerialNumObs$.next({
      ajaxParams: ajaxParams,
      ajaxSearchParams: ajaxSearchParams,
      PageIndex: formData?.PageIndex || 1,
      PageSize: perPage,
    });
    setLoader(true);
  };

  useEffect(() => {
    let searchItems;
    searchItems = JSON.parse(window.sessionStorage.getItem("ajaxAssetSearch"));
    if (searchItems) {
      onSearch(searchItems);
    }
  }, []);

  return (
    <div>
      <p>
        <span className="receiving-tag">Manage Assets</span>
      </p>

      <AMPAuthorization
        showError={true}
        hasToken={context?.features?.includes("RE-SEACHVIEW")}
      >
        <SearchAsset
          title="Search Asset Data"
          formName={ConstVariable.ASEET}
          searchAssetObs$={searchManufactureSerialNumObs$}
          onSearch={onSearch}
          setLoader={setLoader}
          perPage={perPage}
          offset={offset}
          ajaxParams={ajaxParams}
          isLoading={isLoading}
          isAssetSearch={true}
          ajaxSearchParams={ajaxSearchParams}
          searchResult={searchResult}
          errorMessage={errorMessage}
        />

        <SearchResultTableForManageAsset
          formName={ConstVariable.ASSET}
          editForm={editForm}
          addNewFields={addNewFields}
          context={context}
          searchResult={searchResult}
          setSearchResult={setSearchResult}
          isLoading={isLoading}
          offset={offset}
          perPage={perPage}
          pageCount={pageCount}
          handlePageClick={handlePageClick}
        />
      </AMPAuthorization>
    </div>
  );
};

export default ManageAssets;

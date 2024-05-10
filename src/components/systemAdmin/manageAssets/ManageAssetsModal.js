import React ,{useEffect,useMemo,useState}from  "react";
import {Link,Redirect,useLocation} from "react-router-dom";
import ReactGA from 'react-ga';
import {
    AMPModal,
    AMPModalHeader,
    AMPModalBody,
    AMPModalFooter,
} from '../../common/AMPModal';
import{
    Row,
    Col,
    Table,
    Container,
} from "react-bootstrap";
import AMPFlexStart from "../../common/AMPFlex/AMPFlexStart";
import AMPAuthorization from "../../common/AMPAuthorization/AMPAuthorization";
import AMPLoader from "../../common/AMPLoader";
import {toast} from 'react-toastify';
import { useAccessState } from "../../../utils/AppContext/loginContext";
import { mergeMap,map,catchError } from "rxjs/operators";
import {Subject,throwError} from "rxjs";
import{
    useObservable,
    useObservableCallback,
} from "../../common/hooks/useObservable";
import {
    DEFAULT_BASE_URL,
    VERSION,
    GET_TEMP_SERIAL_NUMBER,
    GET_ASSET,
    DELETE_ASSET_BY_SERIAL_NUMBER,
    ConstVariable,
  } from "../common/const";
import{ AMPMessage } from "../../common/const";
import { ampJsonAjax } from "../../common/utils/ampAjax";
import { AMPToastConsts } from "../../common/const/AMPToastConst";
import AMPTooltip from "../../common/AMPTooltip";
import { AMPMessage } from "../../common/const/AMPMessage";
import AddOrEditAsset from "./addOrEditAsset";


const getAssetListAjaxObs$ = (URL, { errorHandler }) =>
    new Subject().pipe(
        mergeMap((params) =>
            ampJsonAjax
            .get(DEFAULT_BASE_URL +
                VERSION +
                GET_ASSET , params.ajaxParams).pipe(
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


const ManageAssetsModal =(props)=>{

    const context = useAccessState();

    const params= new window.URLSearchParams(window.location.search);
    const locationRef=useLocation();
    const status = locationRef?.state?.status || params.get("status");
    const isAsset = locationRef.state?.isAsset;

    const [showAddOrEditAssetModal,setShowAddOrEditAssetModal]=useState({
       isAdd:false,
       isEdit:"",   
    });

    const [showAssetStatusModal,setShowAssetStatusModal]=useState({
        data:'',
        showModal:false,
    });

    const openAddAssetModal1=()=>{
        setShowAddOrEditAssetModal({
            isAdd:true,
            isEdit:"",
        });
    };

    const openEditAssetModal1 = (id)=>{
        setShowAddOrEditAssetModal({
            isAdd: false,
            isEdit:id,
        });
    };

    const closeAddOrEditAssetModal=()=>{
        setShowAddOrEditAssetModal({
            isAdd:false,
            isEdit:"",
        });
    };

    const closeStatusModal =()=>{
        setShowAssetStatusModal({
            showModal:false,
        });
    };

    //delete modal
    const[showDeleteModal,setShowDeleteModal]=useState();

    //pagination constants
    const [offset,setOffset] = useState(1);
    const [perPage] = useState(10);
    const [pageCount,setPageCount] = useState(0);
    const [assetList,setAssetList] = useState({});
    const[loader,setLoader]=useState(false);
    const [isAssetLoading,setIsAssetLoading]=useState(true);

    const ajaxAssetListObsv$=useMemo(()=>{
        return getAssetListAjaxObs$();
    },[])

    useObservableCallback(ajaxAssetListObsv$,(response)=>{
        if(response?.status){
            setAssetList(response?.content);
            setIsAssetLoading(false);
            setPageCount(Math.ceil(response?.content?.totalAssetCount/perPage));
        }else{
            setIsAssetLoading(false);
            toast.error(AMPToastConsts.ASSET_RETRIEVING_FAILURE,{
                position: toast.POSITION.TOP_CENTER,
            });

        }
    });

    const handlePageClick =(e)=>{
        const selectedPage=e.selected;
        setOffset(selectedPage+1);
        setIsAssetLoading(true);
    };

    useEffect(()=>{
       
    },[offset]);

    const closeDeleteModal = () => {
        setShowDeleteModal("");
      };
      const onDelete = (id) => {
        setShowDeleteModal(id);
      };

      const onConfirmDelete = (id) =>{
        deleteAsset$.next({id:id});
      };

      //For google analytics purpose
      useEffect(()=>{
           ReactGA.pageview(window.location.pathname + window.location.search);
       },[])


    return(
        <>
          {props.state && (
            <Redirect
             to={{
                 pathname :`/Pump/manageAssets`,
                 state: { isAssetEdit: false, status: status },
             }}
            />
           )}
           {(showAddOrEditAssetModal.isAdd || showAddOrEditAssetModal.isEdit)&&(
             <ManageAddOrEditAssetModal
              modalName={
                showAddOrEditAssetModal.isEdit ? `EditAsset` : `Add Asset`
              }
              openAddAssetModal={openAddAssetModal1}
              closeAssetModal={closeAddOrEditAssetModal}
              offset={offset}
              perPage={perPage}
              setIsAssetLoading={setIsAssetLoading}
              ajaxAssetListObsv$={ajaxAssetListObsv$}
              isAssetEdit={showAddOrEditAssetModal.isEdit}
              isAsset={isAsset}

             />
           )}
           <Container fluid>
             <div
               id="results"
               className="form-container mx-0 px-0 pt-2 bg-form pb-0 fn-13"
             >
              <AMPLoader isLoading={isAssetLoading}/>
              <AMPAuthorization
                hasToken={
                    isAsset
                   
                }
              >
                <Row>
                    <Col>
                      {isAsset && (
                        <div>
                            <button
                            aria-label="Add"
                            name="Add"
                            type="button"
                            className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                            onClick={openAddAssetModal1}
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
                        </div>
                      )}
                    </Col>
                </Row>
              </AMPAuthorization>
              {assetList?.totalAssetCount>0 &&
                  <Table
                    striped
                    bordered
                    hover
                    responsive
                    size="sm"
                    className="bg-light m-0"
                  >
                    <thead>
                        <tr>
                            <th>AssetId</th>
                            <th>Manufacturer</th>
                            <th>Part Type</th>
                            <th>Description</th>
                            <th>On Hold</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                     {assetList?.totalAssetCount>0 && 
                        <tbody>
                            {assetList?.data?.map((al)=>(
                                <tr key={al.assetId}>
                                    <td>{al?.manufacturerSerialNumber}</td>
                                    <td>{al?.manufacturerName}</td>
                                    <td>{al?.partTypeName}</td>
                                    <td>{al?.description}</td>
                                    <td>{al?.isOnHold === "True" ? "Yes" : "No"}</td>
                                    <td>{al?.status}</td>
                                    <td>
                                        <AMPFlexStart>
                                          {status !== ConstVariable?.RJCT && (
                                                <>
                                                <button
                                                    aria-label="Edit"
                                                    name="Edit"
                                                    type="button"
                                                    className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                                    onClick={() => openEditAssetModal1(al.assetId)}
                                                >
                                                    <AMPTooltip text="Edit/View">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="19"
                                                        height="19"
                                                        fill="currentColor"
                                                        viewBox="0 0 16 16"
                                                        className="bi bi-pencil-square"
                                                    >
                                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                        <path
                                                        fillRule="evenodd"
                                                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                                                        />
                                                    </svg>
                                                    </AMPTooltip>
                                                </button>
                                                </>
                                            )}
                                            {!isAsset && (
                                                <>
                                                  { al?.isOnHold === "False" && (
                                                      <button
                                                      aria-label="View"
                                                      name="View"
                                                      type="button"
                                                      className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-md"
                                                      onClick={() => openStatusModal(al)}
                                                    >
                                                      <AMPTooltip text="View Inspection Status">
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          width="21"
                                                          height="21"
                                                          fill="currentColor"
                                                          className="bi bi-eye"
                                                          viewBox="0 0 16 16"
                                                        >
                                                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                        </svg>
                                                      </AMPTooltip>
                                                    </button>
                                                  )}
                                                </>
                                              )}
                                        </AMPFlexStart>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                     }
                  </Table>
              }

              {!isAssetLoading && assetList?.totalCount === 0 && (
                <Row>
                  <Col className="text-center text-danger pb-1">No Data Found</Col>
                </Row>
              )}
              
              {showDeleteModal && (
                <DeleteModal
                  confirmationMessage={AMPMessage.DEL_ASSET_CONFIRM}
                  showDeleteModal={showDeleteModal}
                  onConfirmDelete={onConfirmDelete}
                  closeModal={closeDeleteModal}
                />
              )}
             </div>
           </Container>
        </>
    );
};

export default ManageAssetsModal;

//Add Asset modal
export const ManageAddOrEditAssetModal=(props)=>{

    const context = useAccessState();
   
    //close Asset modal
    const closeAddAssetModal = () => props.closeAddAssetModal();
    return(
        <>
           <AMPModal
                show
                onHide={closeAddAssetModal}
                size="xl"
                backdrop="static"
                centered
            >
             <AMPModalHeader>{props.modalName}</AMPModalHeader>
             <AMPModalBody>
                <Container fluid>
                    <AddOrEditAsset
                     
                    />
                </Container>
             </AMPModalBody>    
            </AMPModal>
        </>
    );
}
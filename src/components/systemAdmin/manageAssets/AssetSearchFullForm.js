import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ManageAssetsModal from './ManageAssetsModal';


const AssetSearchFullForm = () => {
  
   const locationRef= useLocation();
   const status = locationRef?.state?.status || params?.get("status");
   const [showSearch,setMoveToSearch]=useState(false);
   const backForm = locationRef?.state?.backForm;
   const params = new window.URLSearchParams(window.location.search);

   const showAssetForBack =
    locationRef?.state?.showAssetForBack;

   const [showAssetModal,setShowAssetModal]=useState();
   const isAssetEdit = locationRef?.state?.isAssetEdit;
   
   const [showUpdateCall, setUpdateCall] = useState(false);
   const [state, setState] = useState(false);


   const moveToBack=()=>{
      if(showAssetForBack){
        setMoveToSearch("Asset");
        setShowAssetModal("");
      }
   };

    // for receiving asset modal
   const openAssetModal = (id) => {
    setState(false);
    setShowAssetModal(id);
    setShowReceivingForm(isCreate);
    };
   const closeAssetModal = () => {
    setUpdateCall(true);
    setShowAssetModal("");
    };
    // For google analytics purpose
   useEffect(()=>{
       ReactGA.pageview(window.location.pathname + window.location.search);
   },[])
       
   return(
        <>
         <div className="mb-5">
           {showSearch==="Asset" && (
            <Redirect
              to={{
                  pathname: `/Pump/manageAssets`,
              }}
            />
           )}
           <p>
             <div className='mb-1 ml-2'>
                <button
                  aria-label="Back"
                  name="Back"
                  type="button"
                  className="amp-button button-mini icon-mini btn-transition btn-transparent m-0 ml-2 btn btn-amp-monochrome-amp-brand btn-lg"
                  onClick={moveToBack}
                >
                    <AMPTooltip text="Back">
                            <svg
                                fill="currentColor"
                                viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg"
                                className="svg-inline--fa ifx-svg-icon ifx-svg-back fa-w-16 ifx-icon"
                            >
                                <path
                                d="M256,0C114.844,0,0,114.844,0,256s114.844,256,256,256s256-114.844,256-256S397.156,0,256,0z M256,490.667
                                   C126.604,490.667,21.333,385.396,21.333,256S126.604,21.333,256,21.333S490.667,126.604,490.667,256S385.396,490.667,256,490.667
                                   z"
                                ></path>
                                <path
                                d="M394.667,245.333H143.083l77.792-77.792c4.167-4.167,4.167-10.917,0-15.083c-4.167-4.167-10.917-4.167-15.083,0l-96,96
                                   c-4.167,4.167-4.167,10.917,0,15.083l96,96c2.083,2.083,4.813,3.125,7.542,3.125c2.729,0,5.458-1.042,7.542-3.125
                                   c4.167-4.167,4.167-10.917,0-15.083l-77.792-77.792h251.583c5.896,0,10.667-4.771,10.667-10.667S400.563,245.333,394.667,245.333
                                   z"
                                ></path>
                            </svg>
                    </AMPTooltip>
                </button>
                {isAssetEdit && !showAssetForBack &&(
                   <span className="receiving-tag mx-1" > Edit Asset</span>
                )}
                {!isAssetEdit && !showAssetForBack && (
                   <span className="receiving-tag mx-1" > Add Asset</span>
                )}
             </div>
           </p>
           {showAssetForBack && (
              <ManageAssetsModal
              modalName="Asset"
              location={location}
              closeAssetModal={closeAssetModal}
              state={state}
              setState={setState}
              isAssetEdit={isAssetEdit}
              showAssetModal={showAssetModal}
              setShowAssetModal={setShowAssetModal}
              setMoveToSearch={setMoveToSearch}
           />
           )}
            
         </div>
        </>
    );
}

export default AssetSearchFullForm;
import React , { useEffect,useState, useMemo }from 'react'
import AMPFieldSet from '../../common/AMPFieldSet';
import { AMPTab } from '../../common/AMPTab';
import AddStudent from './AddStudent';
import AMPTooltip from '../../common/AMPTooltip';
import { Link, withRouter, Redirect, useLocation } from "react-router-dom";
import Studentlist from './studentlist';

const ManageStudent =(props) =>{
//const {isId}=props;
const [showForBack,setShowForBack]=useState(false);  
const locationRef = useLocation();
  const isId = locationRef?.state?.id;
const moveToBack =()=>{
  setShowForBack(true);
}

return (
    <>
      <div>
                {showForBack && (
                            <Redirect
                              to={{
                                  pathname: `/Pump/studentDetails`,
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
                          
                            {!isId ?(
                                    <span className="receiving-tag mx-1" > Add Student</span>
                                 ): (
                                    <span className="receiving-tag mx-1" > Edit Student</span>
                                 )
                               }
                        </div>
                    </p>
                </div>
           
      <div className="form-container bg-form GeeksforGeeks pt-1 pb-3">
         <AMPFieldSet fieldBgColor="bg_lightGrey pl-0 pr-0 pt-0">
             
                <div className='Student Details'>
                     <AddStudent/>
                </div>
             
         </AMPFieldSet>
      </div>
      
      
    </>
);
}

export default ManageStudent
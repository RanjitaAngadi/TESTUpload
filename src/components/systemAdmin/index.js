import React, { useState, useContext,useEffect } from "react";
import ReactGA from 'react-ga';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
} from "react-router-dom";
import { AMPFormValidation } from "../common/AMPFormValidation";
import QuestionnaireForm from "./QuestionnaireForm";

const defaultQuestionnaireFieldValues = {};
const Questionaire = () => {
  
  const [index, setIndex] = useState(0);
  const QuestionaireId = "";
  const [stateData, setStateData] = useState(
    !QuestionaireId ? defaultQuestionnaireFieldValues : null
  );
  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };
  // For google analytics purpose
  useEffect(()=>{
    ReactGA.pageview(window.location.pathname + window.location.search);
  },[])
  const addQuestionnaireColumn = () => {};
  const nextOrSaveOrUpdateSubmit = () => {};
  return (
    <>
      {QuestionaireId && <Redirect to="#" />}

      <QuestionnaireForm
        stateData={stateData}
        addQuestionnaireColumn={addQuestionnaireColumn}
      />
    </>
  );
};

export default Questionaire;

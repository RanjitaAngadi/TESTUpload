import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import Modal from "react-bootstrap/Modal";
import { Row, Col, Button } from "react-bootstrap";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPTextArea } from "../common";
import { toast } from "react-toastify";
import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import {
  useObservable,
  useObservableCallback,
} from "../common/hooks/useObservable";
import {
  DEFAULT_BASE_URL,
  VERSION,
  REJECT_WORK_ORDER_BY_ID,
} from "../common/const";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";
import AMPLoader from "../common/AMPLoader";

export const DefaultModal = ({
  offset,
  pageCount,
  perPage,
  ajaxParams,
  ajaxSearchParams,
  searchPumpObs$,
  showManageComponents,
  closeDefaultModal,
  onAddToReplacement,
  children
}) => {
  const { handleSubmit, reset, watch, control, register } = useForm({});
  const [loader, setLoader] = useState(false);
  
  
  return (
    <>
    
      <Modal
        show
        onHide={closeDefaultModal}
        //backdrop="static"
        size="lg"
        // isScroll
        
        //className="delete-modal-bg"
      >
        <Modal.Header className="bg-blue" closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <AMPLoader isLoading={loader} />
        {/* <form onSubmit={handleSubmit(onAddToReplacement)}> */}
        <Modal.Body style={{
          height: "calc(70vh)",
    overflowY: 'auto',
          
        }}>
          {children}
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeDefaultModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              onClick={onAddToReplacement}
            >
              Add to Replacement Component
            </Button>
          </Modal.Footer>
        {/* </form> */}
      </Modal>
    </>
  );
};

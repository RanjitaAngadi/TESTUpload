import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Row,
  Col,
  Form,
  Card,
  Header,
  Button,
  Collapse,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import {
  IMAGE_COMPRESSION_TYPE,
} from "../common/const/limits";
import SignatureCanvas from "react-signature-canvas";

import { mergeMap, map, catchError, tap } from "rxjs/operators";
import { Subject, empty, throwError } from "rxjs";
import { ampJsonAjax } from "../common/utils/ampAjax";
import { AMPToastConsts } from "../common/const/AMPToastConst";

// view Signature fetching start
const getSignatureByIdAjaxObs$ = (URL, { errorHandler }) =>
  new Subject().pipe(
    mergeMap((param) =>
      ampJsonAjax.get(URL + param.id).pipe(
        map((xhrResponse) => {
          return xhrResponse?.response;
        }),
        catchError((error) => {
          errorHandler(error.response);
          return [];
        })
      )
    )
  );
// Signature Pad Component
export const SignatureModal = (props) => {
  const { workId, setSignUrl, uploadSignatureAjaxObsv$, pickupId, isPickup } = props;

  const signCanvas = useRef({});
  const clearSign = () => signCanvas.current.clear();
  const saveSign = () => {
    saveSignature(signCanvas.current.getTrimmedCanvas().toDataURL("image/png"));
    props.closeSignatureModal();
  };
  const closeSignatureModal = () => {
    props.closeSignatureModal();
  };

  // method for storing sign image
  const saveSignature = React.useCallback(async (sign) => {
    setSignUrl(sign);
    const blob = await fetch(sign).then((res) => res.blob());
    var imageFile = new File([blob], `sign${new Date().getTime()}.jpeg`, {
      lastModified: new Date().getTime(),
      type: blob.type,
    });
    const body = new FormData();
    if (isPickup) {
      body.append("PickUpId", [pickupId]);
    } else {
      body.append("workOrderId", workId);
    }

    body.append("image", imageFile);
    body.append("description", "");
    body.append("isSignature", true);
    body.append("isCompressed", true);
    body.append("compressionType", IMAGE_COMPRESSION_TYPE);

    const uploadSubscribe = uploadSignatureAjaxObsv$(body).subscribe(
      (response) => {
        toast.success(AMPToastConsts.SIGNATURE_ADD_SUCCESS, {
          position: toast.POSITION.TOP_CENTER,
        });
        closeAddPictureModal();
      },
      () => {
        uploadSubscribe.unsubscribe();
      }
    );
  });
  return (
    <>
      <AMPModal
        show
        onHide={closeSignatureModal}
        size="xs"
        backdrop="static"
        centered
      >
        <AMPModalHeader>{props.modalName}</AMPModalHeader>
        <AMPModalBody
          style={{
            overflowY: "auto",
          }}
          className="text-center"
        >
          <SignatureCanvas
            ref={signCanvas}
            canvasProps={{
              width: 440,
              height: 200,
              className: 'signatureCanvas',
            }}
            penColor='black'
          />
        </AMPModalBody>
        <AMPModalFooter>
          <Button variant="secondary" onClick={clearSign}>
            Clear
          </Button>
          <Button variant="primary" onClick={saveSign}>
            Save
          </Button>
        </AMPModalFooter>
      </AMPModal>
    </>
  );
};

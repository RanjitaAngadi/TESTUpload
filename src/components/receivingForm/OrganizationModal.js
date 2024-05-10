import React, { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  AMPModal,
  AMPModalHeader,
  AMPModalBody,
  AMPModalFooter,
} from "../common/AMPModal";
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Header,
  Container,
} from "react-bootstrap";
import {
  ConstVariable,
} from "../common/const";
import { OrganizationalDetailsForm } from "../workOrders/OrganizationalDetails";
import { OrganizationalDetailForCustomer } from "../workOrders/OrganizationalDetailForCustomer";
import { useAccessState } from "../../utils/AppContext/loginContext";

// Organization Modal
export const OrganizationModal = (props) => {
  const { handleSubmit, reset, watch, control, register, setValue, errors } =
    useForm({});
  const context = useAccessState();
  const {
    setOrganizationGroupId,
    setCustomerId,
    setOrganizationData,
    setOrganizationGroup,
    organizationGroup,
  } = props;
  
  const [errorOrganizationMessage, setErrorOrganizationMessage] = useState();

  // close Organization modal
  const closeOrganizationModal = () => props.closeOrganizationModal();

  // organization level watch
  const org = watch("organization");
  const cust = watch("customer");
  const organizationArea = watch("area");
  const organizationRegion = watch("region");
  const organizationDistrict = watch("district");
  
  const onSubmit = (formData) => {
    if (formData?.customer?.value || organizationGroup?.customer_name) {
      setErrorOrganizationMessage(false);
      const organizationGroupId =
        parseInt(formData?.groupUnit?.value) ||
        parseInt(organizationGroup?.group_unit_id) ||
        parseInt(formData?.district?.value) ||
        parseInt(organizationGroup?.district_id) ||
        parseInt(formData?.region?.value) ||
        parseInt(organizationGroup?.region_id) ||
        parseInt(formData?.area?.value) ||
        parseInt(organizationGroup?.area_id) ||
        parseInt(formData?.customer?.value) ||
        parseInt(organizationGroup?.customer_id) ||
        parseInt(formData?.organization?.value) ||
        parseInt(organizationGroup?.organization_id);
      setOrganizationData({
        organizationName:
          formData?.organization?.label || organizationGroup?.organization_name,
        customerName:
          formData?.customer?.label || organizationGroup?.customer_name,
        areaName: formData?.area?.label || organizationGroup?.area_name,
        districtName:
          formData?.district?.label || organizationGroup?.district_name,
        regionName: formData?.region?.label || organizationGroup?.region_name,
        groupName:
          formData?.groupUnit?.label || organizationGroup?.group_unit_name,
      });
      setOrganizationGroupId(organizationGroupId);
      setCustomerId(formData?.customer?.value);
      closeOrganizationModal();
    } else {
      setErrorOrganizationMessage(true);
    }
  };
  return (
    <>
      <AMPModal
        show
        onHide={closeOrganizationModal}
        size="lg"
        className="delete-modal-bg"
      >
        <AMPModalHeader>{props.modalName}</AMPModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AMPModalBody>
            {context?.userType === ConstVariable?.INRNL && (
              <OrganizationalDetailsForm
                org={org}
                cust={cust}
                organizationArea={organizationArea}
                organizationRegion={organizationRegion}
                organizationDistrict={organizationDistrict}
                control={control}
                setValue={setValue}
                errors={errors}
                errorOrganizationMessage={errorOrganizationMessage}
              />
            )}
            {context?.userType === ConstVariable?.CST && (
              <OrganizationalDetailForCustomer
                org={org}
                cust={cust}
                organizationArea={organizationArea}
                organizationRegion={organizationRegion}
                organizationDistrict={organizationDistrict}
                control={control}
                setValue={setValue}
                register={register}
                setOrganizationGroup={setOrganizationGroup}
                organizationGroup={organizationGroup}
                userType={context?.userType === ConstVariable?.CST}
                errorOrganizationMessage={errorOrganizationMessage}
              />
            )}
          </AMPModalBody>
          <AMPModalFooter>
            <Row>
              <Col className="text-right my-1">
                <Button type="submit" variant="secondary" className="px-5">
                  Ok
                </Button>
              </Col>
              <Col className="text-right my-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-5"
                  onClick={closeOrganizationModal}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </AMPModalFooter>
        </form>
      </AMPModal>
    </>
  );
};

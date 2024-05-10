import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { Form, Row, Col, Button } from "react-bootstrap";
import { AMPFieldWrapper } from "../common/AMPFieldWrapper";
import { AMPFormLayout } from "../common/AMPFormLayout";
import { toast } from "react-toastify";
import { ConstVariable } from "../common/const";
import AMPLoader from "../common/AMPLoader";
import { AMPAccordion } from "../common/AMPAccordion";
import { useAccessState } from "../../utils/AppContext/loginContext";
import { OrganizationalDetailForCustomer } from "../workOrders/OrganizationalDetailForCustomer";
import { AMPTextBox } from "../common";
import { OrganizationalDetailsForm } from "../workOrders/OrganizationalDetails";

toast.configure();

const SearchPumpForm = (props) => {
  const context = useAccessState();
  const { handleSubmit, reset, watch, control, register, setValue, getValues } =
    useForm({});

  const {
    title,
    setLoader,
    searchResult,
    offset,
    perPage,
    formName,
    searchPumpObs$,
    ajaxParams,
    isLoading,
    isReceivingSearch,
    onSearch,
    organizationGroup,
    setOrganizationGroup,
    errorMessage,
    ajaxSearchParams,
  } = props;

  const woStatus = [
    { label: "All", value: "1,2,4" },
    { label: "InProgress", value: "1" },
    { label: "Closed", value: "2" },
    { label: "Rejected", value: "4" },
  ];
  const woStatus1 = [
    { label: "All", value: "1,2" },
    { label: "InProgress", value: "1" },
    { label: "Closed", value: "2" },
  ];
  const recStatus = [
    { label: "All", value: "1,2,3,4" },
    { label: "InProgress", value: "1" },
    { label: "Closed", value: "2" },
    { label: "Receiving", value: "3" },
    { label: "Rejected", value: "4" },
  ];
  const org = watch("organization");
  const cust = watch("customer");
  const organizationArea = watch("area");
  const organizationRegion = watch("region");
  const organizationDistrict = watch("district");

  useEffect(() => {
    const fields = ["workOrderNo", "from", "to", "organization", "status"];

    let searchItems;
    if (formName === ConstVariable.REC) {
      searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxReceivingSearch")
      );
      if (searchItems) {
        fields?.forEach((field) => {
          setValue(field, searchItems[field]);
        });
        setValue("manufacturerSerialNumber", searchItems?.manufacturerSerialNumber)
      }
    } else if (formName === ConstVariable.WO) {
      searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxWorkOrderSearch")
      );
      if (searchItems) {
        if (searchItems?.status?.value) {
          let currentStatus = woStatus?.filter((item) => {
            if (item.value === searchItems?.status?.value) {
              return item;
            } else return null;
          });
          setValue("status", currentStatus[0]);
        }
        fields.forEach((field) => setValue(field, searchItems?.[field]));
        setValue("manufacturerSerialNumber", searchItems?.manufacturerSerialNumber)
      }
    } else if (formName === ConstVariable.PICK) {
      searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxPickUpSearch")
      );
      if (searchItems) {
        fields?.forEach((field) => {
          setValue(field, searchItems[field]);
        });
      }
    }
    else if (formName === ConstVariable.BILL) {
      searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxBillingSearch")
      );

      if (searchItems) {
        if (searchItems?.status?.value) {
          let currentStatus = recStatus?.filter((item) => {
            if (item.value === searchItems?.status?.value) {
              return item;
            } else return null;
          });
          setValue("status", currentStatus[0]);
        }
        fields?.forEach((field) => {
          setValue(field, searchItems[field]);
        });
      }

    } else {
      searchItems = JSON.parse(
        window.sessionStorage.getItem("ajaxInventorySearch")
      );
      if (searchItems) {
        if (searchItems?.status?.value) {
          let currentStatus = woStatus1?.filter((item) => {
            if (item.value === searchItems?.status?.value) {
              return item;
            } else return null;
          });
          setValue("status", currentStatus[0]);
        }
        fields.forEach((field) => setValue(field, searchItems?.[field]));
      }
    }
  }, []);

  useEffect(() => {
    if (ajaxParams && offset) {
      searchPumpObs$.next({
        index: offset,
        pageSize: perPage,
        ajaxParams: ajaxParams,
        ajaxSearchParams: ajaxSearchParams,
      });
      setLoader(true);
    }
  }, [offset]);
  const onClear = () => {
    if (!organizationGroup?.organization_id) {
      reset({
        organization: { label: "", value: "" },
      });
    }
    if (!organizationGroup?.customer_id) {
      reset({
        customer: { label: "", value: "" },
      });
    }
    if (!organizationGroup?.area_id) {
      reset({ area: { label: "", value: "" } });
    }
    if (!organizationGroup?.region_id) {
      reset({ region: { label: "", value: "" } });
    }
    if (!organizationGroup?.district_id) {
      reset({ district: { label: "", value: "" } });
    }
    if (!organizationGroup?.group_unit_id) {
      reset({ groupUnit: { label: "", value: "" } });
    }
    reset({
      from: "",
      to: "",
      region: { label: "", value: "" },
      organization: !organizationGroup?.organization_id && {
        label: "",
        value: "",
      },

      status: formName === ConstVariable.WO ? { label: "All", value: "1,2,4" } :
        formName === ConstVariable.INV ? { label: "All", value: "1,2,4" } : { label: "All", value: "1,2,3,4" },
    });
    if (formName === ConstVariable.REC) {
      window.sessionStorage.removeItem("ajaxReceivingSearch");
    } else if (formName === ConstVariable.WO) {
      window.sessionStorage.removeItem("ajaxWorkOrderSearch");
    } else if (formName === ConstVariable.PICK) {
      window.sessionStorage.removeItem("ajaxPickUpSearch");
    }

    else if (formName === ConstVariable.BILL) {
      window.sessionStorage.removeItem("ajaxBillingSearch");
    }
    else {
      window.sessionStorage.removeItem("ajaxInventorySearch");
    }
  };

  return (
    <div id="results" className="form-container p-0">
      <AMPLoader isLoading={isLoading} />
      <form className="pt-1" onSubmit={handleSubmit(onSearch)}>
        <AMPAccordion
          title={title}
          contentClassName="p-0"
          isOpen={!searchResult?.searchData}
        >
          <Row className="m-2">
            <Col xs={12} md={12} lg={12} sm={12}>
              <AMPFormLayout>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="From"
                  controlId="dateRange"
                  name="from"
                  // required="true"
                  fieldValidationCustom={errorMessage}
                >
                  <Form.Control size="sm" type="date" ref={register} />
                </AMPFieldWrapper>

                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="To"
                  controlId="dateRange"
                  name="to"
                  // required="true"
                  fieldValidationCustom={errorMessage}
                >
                  <Form.Control size="sm" type="date" ref={register} />
                </AMPFieldWrapper>
                <AMPFieldWrapper
                  colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                  label="Work Order Number"
                  controlId="workOrderNo"
                  name="workOrderNo"
                >
                  <AMPTextBox
                    className="text-uppercase"
                    ref={register}
                    size="sm"
                  />
                </AMPFieldWrapper>
              </AMPFormLayout>

              {context?.userType === ConstVariable?.INRNL && (
                <OrganizationalDetailsForm
                  org={org}
                  cust={cust}
                  organizationArea={organizationArea}
                  organizationRegion={organizationRegion}
                  organizationDistrict={organizationDistrict}
                  control={control}
                  setValue={setValue}
                  type="search"
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
                  setOrganizationGroup={setOrganizationGroup}
                  organizationGroup={organizationGroup}
                  type="search"
                  userType={context?.userType === ConstVariable?.CST}
                />
              )}
              <Row>
                <Col>
                  <AMPFormLayout>
                    {(formName === ConstVariable.WO) && (
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Status"
                        controlId="status"
                        name="status"
                        marginClassName="mb-2"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={woStatus}
                          defaultValue={{ label: "All", value: "1,2,4" }}
                          onChange={([selected]) => {
                            return { value: selected };
                          }}
                          size="sm"
                        />
                      </AMPFieldWrapper>
                    )}
                    {(formName === ConstVariable.REC || formName === ConstVariable.BILL) && (
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Status"
                        controlId="status"
                        name="status"
                        marginClassName="mb-2"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={recStatus}
                          defaultValue={{ label: "All", value: "1,2,3,4" }}
                          onChange={([selected]) => {
                            return { value: selected };
                          }}
                          size="sm"
                        />
                      </AMPFieldWrapper>
                    )}
                    {formName === ConstVariable.INV && (
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        label="Status"
                        controlId="status"
                        name="status"
                        marginClassName="mb-2"
                      >
                        <Controller
                          as={Select}
                          control={control}
                          options={woStatus1}
                          defaultValue={{ label: "All", value: "1,2" }}
                          onChange={([selected]) => {
                            return { value: selected };
                          }}
                          size="sm"
                        />
                      </AMPFieldWrapper>
                    )}
                    {(formName === ConstVariable?.REC ||
                      formName === ConstVariable?.WO) && (
                        <AMPFieldWrapper
                          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                          label="Manufacturer Serial Number"
                          controlId="manufacturerSerialNumber"
                          name="manufacturerSerialNumber"
                        >
                          <AMPTextBox
                            className="text-uppercase"
                            ref={register}
                            size="sm"
                          />
                        </AMPFieldWrapper>
                      )
                    }
                    {(

                      formName === ConstVariable.PICK ||
                      formName === ConstVariable.INV || formName === ConstVariable.BILL) && (
                        <AMPFieldWrapper
                          colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                          marginClassName="mb-2"
                        >
                          <input type="hidden" />
                        </AMPFieldWrapper>
                      )}
                    {formName === ConstVariable.PICK &&
                      <AMPFieldWrapper
                        colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}
                        marginClassName="mb-2"
                      >
                        <input type="hidden" />
                      </AMPFieldWrapper>
                    }
                    <div colProps={{ md: 6, sm: 12, lg: 4, xs: 12 }}>
                      <Row>
                        <Col md={3} sm={3} lg={3} xs={3}>
                          <Button
                            type="button"
                            variant="secondary"
                            className="form-button mb-2"
                            onClick={onClear}
                            block
                          >
                            Clear
                          </Button>
                        </Col>
                        <Col md={9} sm={9} lg={9} xs={9}>
                          <Button
                            type="submit"
                            variant="primary"
                            className="form-button float-right mb-2"
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
            </Col>
          </Row>
        </AMPAccordion>
      </form>
    </div>
  );
};

export default SearchPumpForm;

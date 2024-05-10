// export const DEFAULT_BASE_URL = window.location.origin;
//export const DEFAULT_BASE_URL = "http://fw-ampdev-01";
// export const DEFAULT_BASE_URL = "https://amp.weirinaction.com";
export const DEFAULT_BASE_URL = "http://us007-ampqa01";
//export const DEFAULT_BASE_URL ="https://amp.weirinaction.com";
export const VERSION = "/";
export const secondaryURL = "pumpapi/1";
//Notification
export const GET_PUSH_NOTIFICATION = "NotificationApi/Hubs";

// Organization Hierarchy
export const GET_SERVICE_CERTER_LOCATION = secondaryURL + "/location/names";

// Receiving api start
export const GET_WORK_ORDER_SERIAL_NUMBER =
  secondaryURL + "/Workorder/WONumber";
export const GET_OPM_WORK_ORDER_SERIAL_NUMBER =
  secondaryURL + "/Workorder/OPM/WONumber";
export const GET_WORK_ORDER_TYPES = secondaryURL + "/Workorder/Type";
export const CREATE_OR_UPDATE_RECEIVING = secondaryURL + "/Workorder/Receiving";
export const SEARCH_RECEIVING = secondaryURL + "/Workorder/Receiving/Search";
export const GET_RECEIVING_BY_ID = secondaryURL + "/Workorder/1/";
export const GET_WORK_ORDER_BY_ID = secondaryURL + "/Workorder/0/";
export const GET_LOCATION_TO_MOVE_IN_WORKORDER =
  secondaryURL + "/Location/Transfer/";
export const MOVE_IN_WORKORDER = secondaryURL + "/Workorder/SubmitTransfer";
export const RETRIEVAL_VIEW_SINATURE_BY_ID_URL =
  secondaryURL + "/Image/Signature/";
// Receiving api end
// WOrk Order Api start
export const CREATE_OR_UPDATE_WORKODRER = secondaryURL + "/Workorder";
export const SEARCH_WORKORDER = secondaryURL + "/Workorder/Search";
export const DELETE_RECEIVING_WORKORDER =
  secondaryURL + "/Workorder/Receiving/";
// Asset Api start
export const GET_ALL_LOCATION = secondaryURL + "/location/value";
export const GET_ALL_MANUFACTURER = secondaryURL + "/manufacturer/value";
export const GET_ALL_ORGANIZATION = secondaryURL + "/organization/value/1/0";
export const GET_ORGANIZATION_FOR_CUSTOMER =
  secondaryURL + "/Organization/Group";

export const GET_COMPANY = secondaryURL + "/organization/value/2/";
export const GET_AREA = secondaryURL + "/organization/value/4/";
export const GET_REGION = secondaryURL + "/organization/value/5/";
export const GET_DISTRICT = secondaryURL + "/organization/value/6/";
export const GET_GROUP_UNIT = secondaryURL + "/organization/value/7/";

export const GET_TEMP_SERIAL_NUMBER = secondaryURL + "/asset/TempSerialNumber";
export const GET_PART_NUMBER_DETAILS = secondaryURL + "/Part/Value/";
export const GET_ALL_PART_TYPE = secondaryURL + "/Part/all";
export const GET_ALL_PART_ATTRIBUTES = secondaryURL + "/Part/config/";
export const ADD_ASSET_URL = secondaryURL + "/Asset";
export const GET_ASSET_LIST = secondaryURL + "/Asset/List/";
export const GET_ASSET_DETAIL_BY_ID = secondaryURL + "/Asset/Detail/";
export const UPDATE_ASSET_DETAILS = secondaryURL + "/Asset";
export const DELETE_ASSET_BY_SERIAL_NUMBER = secondaryURL + "/Asset/";
export const CHECK_ASSET_API = secondaryURL + "/Asset/Check/";

// Asset Api end

// picture receiving api start
export const ADD_PICTURE_URL = secondaryURL + "/Image/Receiving";
export const GET_RECEIVING_PICTURE_LIST =
  secondaryURL + "/Image/Receiving/List/";
export const GET_RECEIVING_PICTURE = secondaryURL + "/Image/Picture/";
export const DELETE_RECEIVING_PICTURE = secondaryURL + "/Image/Receiving/";
// picture receiving api end

// picture workorder api start
export const GET_WORKORDER_PICTURE_LIST =
  secondaryURL + "/Image/Workorder/List/";
export const GET_WORKORDER_PICTURE = secondaryURL + "/Image/Picture/Workorder/";
export const POST_WORKORDER_PICTURE = secondaryURL + "/Image/Workorder";
export const DELETE_WORKORDER_PICTURE = secondaryURL + "/Image/Workorder/";
// picture workorder api end

// inspection picture api start
export const RETRIEVAL_INSPECTION_PICTURE =
  secondaryURL + "/Image/Questionnaire/List/";
export const ADD_INSPECTION_PICTURE_URL = secondaryURL + "/Image/Questionnaire";
export const DELETE_INSPECTION_PICTURE_BY_ID_URL =
  secondaryURL + "/Image/Questionnaire/";
export const RETRIEVAL_VIEW_INSPECTION_PICTURE_BY_ID_URL =
  secondaryURL + "/Image/Download/";
export const GET_COMMENT_INSPECTION = secondaryURL + "/Inspection/Comment/";
export const GET_INSPECTION_PICTURE_BY_ID_URL_FOR_REPORT =
  secondaryURL + "/Image/Inspection/";
// inspection picture api end

// Document receiving api start
export const UPLOAD_DOCUMENT_URL = secondaryURL + "/Document/Upload";
export const GET_DOCUMENT_LIST_BY_WORKORDER = secondaryURL + "/Document/List/";
export const DOWNLOAD_DOCUMENT_BY_ID = secondaryURL + "/Document/download/";
export const DELETE_DOCUMENT_BY_ID = secondaryURL + "/Document/Receiving/";
// Document receiving  api end

// document workorder api start
export const GET_WORKORDER_DOCUMENT =
  secondaryURL + "/Document/List/Workorder/";
export const GET_WORKORDER_DOCUMENT_BY_CATEGORYID =
  secondaryURL + "/Document/Workorder/DocumentCategory/Value";
export const POST_WORKORDER_DOCUMENT =
  secondaryURL + "/Document/Workorder/Upload";
export const DELETE_WORKORDER_DOCUMENT = secondaryURL + "/Document/Workorder/";
export const DOWNLOAD_WORKORDER_DOCUMENT =
  secondaryURL + "/Document/download/Workorder/";
// document workorder api end

// document billing api start
export const GET_BILLING_DOCUMENT_LIST =
  secondaryURL + "/Document/Billing/List";
export const GET_BILLING_DOCUMENT = secondaryURL + "/Document/Billing/List";
export const POST_BILLING_DOCUMENT = secondaryURL + "/Document/Billing/Upload";
export const DELETE_BILLING_DOCUMENT = secondaryURL + "/Document/Billing/";
export const DOWNLOAD_BILLING_DOCUMENT =
  secondaryURL + "/Document/Billing/Download/";
// document billing api end

// QUestionnaire api starts
export const GET_ALL_QUESTIONNAIRE = secondaryURL + "/Questionnaire/Value/";
export const GET_INSPECTION_TYPE = secondaryURL + "/Inspection/Value";
export const GET_PART_TYPE = secondaryURL + "/Part/all";
export const GET_QUESTIONNAIRE_BY_PART_INSPECTION_OR_SAVE_QUESTIONNAIRE =
  secondaryURL + "/Questionnaire";
export const UPDATE_QUESTIONNAIRE_SEQUENCE =
  secondaryURL + "/Questionnaire/EditQuestionnaireSequence";
export const CLONE_ALL_QUESTIONNAIRE =
  secondaryURL + "/Questionnaire/CloneQuestionnaire";
export const GET_QUESTIONNAIRE_VERSION =
  secondaryURL + "/Questionnaire/Version/";
export const ACTIVATE_QUESTIONNAIRE = secondaryURL + "/Questionnaire/Activate/";

// Questionnaire api ends

// Replacement component traceability api start
export const GET_PART_TYPE_COMPONENT_TRACEABILITY =
  secondaryURL + "/PartTypeComponent/";
export const UPDATE_PART_TYPE_COMPONENT_TRACEABILITY =
  secondaryURL + "/PartTypeComponent";
export const SAVE_TRACEABILITY_COMPONENT =
  secondaryURL + "/TraceabilityComponent/Components";
export const DELETE_REPLACEMENT_COMPONENT_PART_TYPE =
  secondaryURL + "/TraceabilityComponent/Delete/";
// Replacement component traceability api end

// Visual Inspection Replacement component api start
export const GET_PART_TYPE_VISUAL_COMPONENT_TRACEABILITY =
  secondaryURL + "/TraceabilityComponent/Traceability/";
export const SAVE_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY =
  secondaryURL + "/TraceabilityComponent";
export const SUBMIT_VISUAL_INSPECTION_REPLACEMENT_TRACEABILITY =
  secondaryURL + "/TraceabilityComponent/Submit";
// Visual Inspection Replacement component api end

// Clearance range component api start
export const GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE =
  secondaryURL + "/PartTypeComponent/Clearance/";
export const UPDATE_PART_TYPE_COMPONENT_CLEARANCE_RANGE =
  secondaryURL + "/PartTypeComponent/Clearance";
// Clearance range component api end

// Torque range component api start
export const GET_PART_TYPE_COMPONENT_TORQUE_RANGE =
  secondaryURL + "/PartTypeComponent/Torque/";
export const UPDATE_PART_TYPE_COMPONENT_TORQUE_RANGE =
  secondaryURL + "/PartTypeComponent/Torque";
// Torque range component api end

// Lead time configuration api start
export const GET_LEAD_TIME_COMPONENT =
  secondaryURL + "/ComponentStock/PartTypeComponentIds";
export const POST_LEAD_TIME_COMPONENT = secondaryURL + "/ComponentStock/Add";
export const PUT_LEAD_TIME_COMPONENT = secondaryURL + "/ComponentStock/Edit";
// Lead time configuration api end

// Reject  Work Order api start
export const REJECT_WORK_ORDER_BY_ID = secondaryURL + "/Workorder/Reject";
// Reject  Work Order api end
//Undo Reject  Work Order api start
export const UNDO_REJECT_WORK_ORDER_BY_ID =
  secondaryURL + "/Workorder/UndoReject";
// Reject  Work Order api end

//Inspection Related Api start
export const GET_INSPECTION_STATUS =
  secondaryURL + "/Inspection/InspectionStatus/";
export const SUBMIT_INSPECTION = secondaryURL + "/Inspection/Complete";
export const INSPECTION_SUBCOMPONENT_CLERANCE_RANGE =
  secondaryURL + "/PartTypeComponent/Inspection/Clearance/";
export const INSPECTION_SUBCOMPONENT_TORQUE_RANGE =
  secondaryURL + "/PartTypeComponent/Inspection/Torque/";
export const GET_INSPECTION_QUESTIONNAIRE =
  secondaryURL + "/Inspection/Questions/";
export const SAVE_INSPECTION_QUESTIONNAIRE =
  secondaryURL + "/Inspection/QuestionResponse/";

export const SAVE_INSPECTION_SUBCOMPONENT_POST_CLERANCE_RANGE =
  secondaryURL + "/PartTypeComponent/Inspection/Clearance/Reading";
export const SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE =
  secondaryURL + "/PartTypeComponent/Inspection/Torque/Reading";
export const SERVICE_CENTER_GAUGE = secondaryURL + "/gauge/";
export const GET_PREVIEW_INSPECTION_QUESTIONNAIRE =
  secondaryURL + "/Inspection/QuestionnaireSummary/";
export const GET_PARTTYPE_IMAGE = secondaryURL + "/Image/";
export const SUBMIT_COMMENT = secondaryURL + "/Inspection/Comment";
export const SAVE_FINAL_QUESTIONNAIRE = secondaryURL + "/Inspection/Submit/";
//Inspection Related Api start end

// Level2- Assembly Inspection PartDetails api start
export const GET_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT =
  secondaryURL + "/PartTypeComponent/PartDetails/";
export const POST_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT =
  secondaryURL + "/PartTypeComponent";
export const UPDATE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT =
  secondaryURL + "/PartTypeComponent/PartDetails";
export const DELETE_LEVELII_ASS_INSP_PART_DETAIL_SUBCOMPONENT =
  secondaryURL + "/PartTypeComponent/";

export const GET_PART_DETAILS_LIST =
  secondaryURL + "/PartTypeComponent/GetPartDetails";
export const CHANGE_TO_NOTAPPLICABLE_STATUS =
  secondaryURL + "/Inspection/Notapplicable/";
export const CHANGE_TO_APPLICABLE_STATUS =
  secondaryURL + "/Inspection/Applicable/";
// Level2- Assembly Inspection PartDetails api end

// Inspection document api start
export const GET_INSPECTION_DOCUMENT_LIST =
  secondaryURL + "/InspectionDocument/List/";
export const UPLOAD_INSPECTION_DOCUMENT =
  secondaryURL + "/InspectionDocument/Upload";
export const DOWNLOAD_INSPECTION_DOCUMENT =
  secondaryURL + "/InspectionDocument/Download/";
export const DELETE_INSPECTION_DOCUMENT = secondaryURL + "/InspectionDocument/";
// Inspection document api end

//Pick Up Api starts
export const DELETE_PICKUP = "";
export const SEARCH_PICKUP = secondaryURL + "/Pickup/Search";
export const GET_PICKUP_BY_ID = secondaryURL + "/PickUp/Shipping";
export const INITIATE_PICKUP = secondaryURL + "/PickUp";
export const RETRIEVAL_PICKUP_IMAGE_URL = secondaryURL + "/Image/PickUp/List";
export const ADD_PICKUP_PICTURE_URL = secondaryURL + "/Image/PickUp/Upload";
export const DELETE_PICKUP_BY_ID_URL = secondaryURL + "/Image/PickUp/";
export const RETRIEVAL_VIEW_PICKUP_PICTURE_BY_ID_URL =
  secondaryURL + "/Image/PickUp/";
export const DELETE_PICKUP_DOCUMENT_BY_WORKORDERASSETID =
  secondaryURL + "/Document/PickUp/";
export const GET_PICKUP_DOCUMENT_LIST_BY_WORKORDERASSETID =
  secondaryURL + "/Document/PickUp/List";
export const DOWNLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID =
  secondaryURL + "/Document/PickUp/download/";
export const UPLOAD_PICKUP_DOCUMENT_BY_WORKORDERASSETID =
  secondaryURL + "/Document/PickUp/Upload";
export const RETRIEVAL_VIEW_PICKUP_SINATURE_BY_WORKORDERASSETID =
  secondaryURL + "/Image/PickUp/Signature";
export const GENERATE_PICKUP_NUMBER = secondaryURL + "/PickUp/PickupNumber";
//Pick Up Api ends

// Inventory Api start
export const SEARCH_INVENTORY = secondaryURL + "/Workorder/Inventory/Search/";
export const GET_REPLACEMENT_COMPONENT_FOR_INVENTORY =
  secondaryURL + "/Inventory/Replacement/PartDetails/";
export const SAVE_REPLACEMENT_COMPONENT_FOR_INVENTORY =
  secondaryURL + "/Inventory/PartEntry";
export const SUBMIT_PART_INVENTORY_ENTRY =
  secondaryURL + "/Inventory/PartEntry/Submit";
// Inventory Api end

// Inspection Report Api start
export const GET_INSPECTION_REPORT = secondaryURL + "/Asset/InspectionReport/";
// Inspection Report Api end
// Receiving Report Api start
export const GET_RECEIVING_REPORT = secondaryURL + "/Asset/ReceivingReport/";
export const GET_DOWNLOAD__RECEIVINGREPORT_FROM_PUMPSSR =
  "/PumpSSR/ReceivingReport?id=";
export const GET_DOWNLOAD__INSPECTIONREPORT_FROM_PUMPSSR =
  "/PumpSSR/InspectionReport?id=";
// Receiving Report Api end
// Home Page charts APi starts
export const GET_WORKORDER_INPROGRESS_CHART =
  secondaryURL + "/workorder/Chart/PumpsInprogress";
export const GET_PUMP_READYFORPICKUP_CHART =
  secondaryURL + "/Workorder/Chart/PumpsReadyforPickup";
export const GET_PUMPS_RECEIVED_CHART =
  secondaryURL + "/Workorder/Chart/PumpsReceived";
export const GET_PUMPS_PART_WISE_CHART =
  secondaryURL + "/workorder/Chart/PumpsPartTypeWise";
export const GET_PUMPS_AGING_CHART =
  secondaryURL + "/Workorder/Chart/PumpsAgeing";
export const GET_PUMPS_PROCESS_CHART =
  secondaryURL + "/workorder/Chart/PumpsProcess";

// Bearing Bore Diameter Details api start
export const GET_BEARING_BORE_DIAMETER_DETAILS =
  secondaryURL + "/BearingBoreDiameter/Inspection/";
export const POST_BEARING_BORE_DIAMETER_DETAILS =
  secondaryURL + "/BearingBoreDiameter/Inspection";
export const PUT_BEARING_BORE_DIAMETER_DETAILS =
  secondaryURL + "/BearingBoreDiameter/Inspection";
// Bearing Bore Diameter Details api end

// Line Bore Details api start
export const GET_LINE_BORE_DETAILS =
  secondaryURL + "/LineBoreReading/Inspection/";
export const POST_LINE_BORE_DETAILS =
  secondaryURL + "/LineBoreReading/Inspection";
export const PUT_LINE_BORE_DETAILS =
  secondaryURL + "/LineBoreReading/Inspection";
// Line Bore Details api end

// Cylinder Details api start
export const GET_CENTER_LINE_DETAILS =
  secondaryURL + "/CenterLines/Inspection/";
export const POST_CENTER_LINE_DETAILS =
  secondaryURL + "/CenterLines/Inspection";
export const PUT_CENTER_LINE_DETAILS = secondaryURL + "/CenterLines/Inspection";
// Cylinder Details api end

// Center Line Details api start
export const GET_CYLINDER_DETAILS =
  secondaryURL + "/CylinderReading/Inspection/";
export const POST_CYLINDER_DETAILS =
  secondaryURL + "/CylinderReading/Inspection";
export const PUT_CYLINDER_DETAILS =
  secondaryURL + "/CylinderReading/Inspection";
// Center Line Details api end
//Move to WOrk order and Asset
export const MOVE_TO_WO_AND_ASSET = secondaryURL + "/Workorder/Migrate";
// Billing Api starts
export const CHANGE_PO_STATUS =
  secondaryURL + "/WorkorderBilling/POStatusUpdate";
export const SUBMIT_BILLING_PO_NUMBER = secondaryURL + "/workorderbilling";

// manage part type component api start
export const GET_PART_COMPONENTS = secondaryURL + "/Component/Components";
export const SEARCH_PART_COMPONENT = secondaryURL + "/Component/Components/";
export const ADD_OR_UPDATE_PART_COMPONENT =
  secondaryURL + "/Component/Component";
export const DELETE_PART_COMPONENT = secondaryURL + "/Component/Delete/";
// manage part type component api end

// inventory api start
export const PUT_INVENTORY_REPLACEMENT =
  secondaryURL + "/TraceabilityComponent/Traceability/";
export const DELETE_INVENTORY_REPLACEMENT =
  secondaryURL + "/TraceabilityComponent/Traceability/";
export const APPROVE_INVENTORY_REPLACEMENT_LIST =
  secondaryURL + "/Inventory/Traceability/";

// inventory api end

//Asset Api search start
export const SEARCH_ASSET = secondaryURL + "/Asset/Search";
export const GET_ASSET_BY_ID = secondaryURL + "/Asset/Detail/";
//export const  ADD_OR_UPDATE_MANUFACTURE_NUMBER = secondaryURL + "/Asset/Search"
export const ADD_OR_UPDATE_ASSET_DETAILS = secondaryURL + "/Asset/Search";
export const ADD_ASSET_DETAIL_URL = secondaryURL + "/Asset/Asset";
export const UPDATE_ASSET = secondaryURL + "/Asset/Asset";

//partDetails in manage asset tab
export const GET_OR_POST_OR_UPDATE_FOR_MANAGE_ASSET =
  secondaryURL + "/PartTypeComponent/PartDetails";
export const GET_PART_DETAILS_FOR_MANAGE_ASSET =
  secondaryURL + "/PartTypeComponent/PartDetails";

//clearnceDetails in manage asset tab
export const SAVE_INSPECTION_SUBCOMPONENT_POST_CLERANCE_RANGE_IN_ASSET =
  secondaryURL + "/PartTypeComponent/Asset/Clearance/Reading";
export const GET_PART_TYPE_COMPONENT_CLEARANCE_RANGE_IN_ASSET =
  secondaryURL + "/PartTypeComponent/Asset/Clearance";
export const SERVICE_CENTER_GAUGE_IN_ASSET =
  secondaryURL + "/gauge/ServiceCenterIds/Value";

//torque detils in asst tab
export const GET_PART_TYPE_COMPONENT_TORQUE_RANGE_IN_ASSET =
  secondaryURL + "/PartTypeComponent/Asset/Torque";
export const SAVE_INSPECTION_SUBCOMPONENT_POST_TORQUE_RANGE_IN_ASSET =
  secondaryURL + "/PartTypeComponent/Asset/Torque/Reading";

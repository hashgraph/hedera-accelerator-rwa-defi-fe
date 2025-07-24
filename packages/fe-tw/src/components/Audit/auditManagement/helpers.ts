import * as Yup from "yup";

export interface AuditFormValues {
   companyName: string;
   auditorName: string;
   auditDate: string;
   auditType: string;
   auditReferenceId: string;
   auditValidityFrom: string;
   auditValidityTo: string;
   overallConditionRating: string;
   immediateActionRequired: string;
   nextRecommendedAuditDate: string;
   auditReportFile?: File | null;
   auditReportIpfsId?: string;
   notes: string;
}

export const validationSchema = Yup.object({
   companyName: Yup.string().required("Company name is required"),
   auditorName: Yup.string().required("Auditor name is required"),
   auditDate: Yup.string().required("Audit date is required"),
   auditType: Yup.string().required("Audit type is required"),
   auditReferenceId: Yup.string().required("Audit reference ID is required"),
   auditValidityFrom: Yup.string().required("Audit validity start date is required"),
   auditValidityTo: Yup.string().required("Audit validity end date is required"),
   overallConditionRating: Yup.string().required("Overall condition rating is required"),
   immediateActionRequired: Yup.string().required("Please specify if immediate action is required"),
   nextRecommendedAuditDate: Yup.string().required("Next recommended audit date is required"),
   auditReportIpfsId: Yup.string().when("auditReportFile", {
      is: (val: File | undefined) => !val,
      then: (schema) => schema.required("Either IPFS ID or file upload is required"),
      otherwise: (schema) => schema,
   }),
   auditReportFile: Yup.mixed().nullable(),
   notes: Yup.string(),
});

export const initialValues: AuditFormValues = {
   companyName: "",
   auditorName: "",
   auditDate: "",
   auditType: "",
   auditReferenceId: "",
   auditValidityFrom: "",
   auditValidityTo: "",
   overallConditionRating: "",
   immediateActionRequired: "",
   nextRecommendedAuditDate: "",
   auditReportFile: null,
   auditReportIpfsId: "",
   notes: "",
};

export const auditTypeOptions = [
   { value: "structural", label: "Structural" },
   { value: "energy", label: "Energy" },
   { value: "safety", label: "Safety" },
   { value: "comprehensive", label: "Comprehensive" },
   { value: "electrical", label: "Electrical" },
   { value: "plumbing", label: "Plumbing" },
   { value: "fire_safety", label: "Fire Safety" },
   { value: "accessibility", label: "Accessibility" },
   { value: "environmental", label: "Environmental" },
];

export const conditionRatingOptions = [
   { value: "excellent", label: "Excellent" },
   { value: "good", label: "Good" },
   { value: "fair", label: "Fair" },
   { value: "poor", label: "Poor" },
   { value: "critical", label: "Critical" },
];

export const immediateActionOptions = [
   { value: "yes", label: "Yes" },
   { value: "no", label: "No" },
];

export const getInitialValues = (audit: AuditFormValues) => ({
   companyName: audit?.companyName || "",
   auditorName: audit?.auditorName || "",
   auditDate: audit?.auditDate || "",
   auditType: audit?.auditType || "",
   auditReferenceId: audit?.auditReferenceId || "",
   auditValidityFrom: audit?.auditValidityFrom || "",
   auditValidityTo: audit?.auditValidityTo || "",
   overallConditionRating: audit?.overallConditionRating || "",
   immediateActionRequired: audit?.immediateActionRequired || "no",
   nextRecommendedAuditDate: audit?.nextRecommendedAuditDate || "",
   auditReportFile: null,
   auditReportIpfsId: audit?.auditReportIpfsId || "",
   notes: audit?.notes || "",
});

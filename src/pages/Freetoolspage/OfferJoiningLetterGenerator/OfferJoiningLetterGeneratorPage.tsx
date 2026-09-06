import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, PointerEvent, SyntheticEvent } from "react";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import "./OfferJoiningLetterGeneratorPage.css";

type TemplateType =
  | "offer"
  | "appointment"
  | "joining"
  | "internship";

type LetterStyle =
  | "classic"
  | "modern"
  | "minimal"
  | "elegant";

type LetterColor =
  | "navy"
  | "green"
  | "burgundy"
  | "purple"
  | "black";

type PageMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const DEFAULT_PAGE_MARGINS: PageMargins = {
  top: 15,
  right: 15,
  bottom: 15,
  left: 15,
};

type Paragraph = {
  id: string;
  text: string;
};

type LetterTemplate = {
  subject: string;
  salutation: string;
  closing: string;
  showSignature: boolean;
  paragraphs: Paragraph[];
  termsConditions: string[];
  showTermsConditions: boolean;
};

type CompanyDetails = {
  name: string;
  website: string;
  addressLine: string;
  cityLine: string;
  letterDate: string;
  hrName: string;
  hrDesignation: string;
  logo: string;
  logoAlign: "center";
  signatureImage: string;
};

type Candidate = {
  id: string;
  name: string;
  designation: string;
  department: string;
  salary: string;
  joiningDate: string;
  location: string;
  employmentType: string;
  reportingManager: string;
  letterType: TemplateType;
  selected: boolean;
};

type CandidateForm = Omit<
  Candidate,
  "id" | "selected"
>;

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const emptyCandidateForm: CandidateForm = {
  name: "",
  designation: "",
  department: "",
  salary: "",
  joiningDate: "",
  location: "",
  employmentType: "Full-time",
  reportingManager: "",
  letterType: "offer",
};

const defaultCompany: CompanyDetails = {
  name: "Noorado Technologies Pvt. Ltd.",
  website: "www.noorado.com",
  addressLine:
    "4th Floor, Orion Tech Park, Whitefield",
  cityLine: "Bengaluru, Karnataka",
  letterDate: getToday(),
  hrName: "Priya Sharma",
  hrDesignation: "Head of Human Resources",
  logo: "",
  logoAlign: "center",
  signatureImage: "",
};

const defaultTemplates: Record<
  TemplateType,
  LetterTemplate
> = {
  offer: {
    subject: "Offer of Employment",
    salutation: "Dear {{candidate_name}},",
    closing: "Sincerely,",
    showSignature: true,
    paragraphs: [
      {
        id: "offer-1",
        text: `We are pleased to offer you the position of {{designation}} in the {{department}} department at {{company_name}}.`,
      },
      {
        id: "offer-2",
        text: `Your employment will be based at {{location}} and your expected joining date will be {{joining_date}}.`,
      },
      {
        id: "offer-3",
        text: `You will be employed on a {{employment_type}} basis and will report to {{reporting_manager}}.`,
      },
      {
        id: "offer-4",
        text: `Your annual compensation will be {{salary}}. Further details regarding your compensation and terms of employment will be provided as part of your employment documentation.`,
      },
      {
        id: "offer-5",
        text: `We look forward to having you join our team and wish you a successful career with {{company_name}}.`,
      },
    ],
    termsConditions: [
      `This offer is subject to satisfactory verification of the information and documents provided by you.`,
      `Your employment will be governed by the policies, rules, code of conduct and procedures of {{company_name}} as amended from time to time.`,
      `You are expected to maintain confidentiality of company information, records, intellectual property and business data during and after your employment.`,
      `Your duties, responsibilities, reporting structure and place of work may be reasonably modified in accordance with business requirements.`,
      `Your employment will be subject to applicable statutory requirements and the terms contained in the final employment documentation issued by {{company_name}}.`,
      `This offer may be withdrawn or revised if any information or document submitted by you is found to be false, incomplete or misleading.`,
    ],
    showTermsConditions: true,
  },

  appointment: {
    subject: "Appointment Letter",
    salutation: "Dear {{candidate_name}},",
    closing: "Sincerely,",
    showSignature: true,
    paragraphs: [
      {
        id: "appointment-1",
        text: `We are pleased to confirm your appointment as {{designation}} in the {{department}} department at {{company_name}}.`,
      },
      {
        id: "appointment-2",
        text: `Your place of work will be {{location}}, and your date of joining will be {{joining_date}}.`,
      },
      {
        id: "appointment-3",
        text: `You will be employed on a {{employment_type}} basis and will report to {{reporting_manager}}.`,
      },
      {
        id: "appointment-4",
        text: `Your annual compensation will be {{salary}}, subject to the applicable company policies and terms of employment.`,
      },
      {
        id: "appointment-5",
        text: `We welcome you to {{company_name}} and look forward to your valuable contribution to the organization.`,
      },
    ],
    termsConditions: [
      `Your appointment is subject to satisfactory completion of applicable background, identity and document verification requirements.`,
      `You will comply with all company policies, procedures, workplace rules, information-security requirements and the code of conduct applicable to your role.`,
      `All confidential information, intellectual property, records and business information accessed during employment must be protected and must not be disclosed without authorization.`,
      `You may be required to perform additional duties reasonably related to your role and business requirements, and your reporting arrangements may be changed when necessary.`,
      `Any probation period, notice period, leave entitlement and other employment conditions will be governed by the applicable employment documentation and company policy.`,
      `The company reserves the right to take appropriate action, including termination of employment, for misconduct, serious policy violations or other grounds permitted by applicable law.`,
    ],
    showTermsConditions: true,
  },

  joining: {
    subject: "Joining Confirmation",
    salutation: "Dear {{candidate_name}},",
    closing: "Sincerely,",
    showSignature: true,
    paragraphs: [
      {
        id: "joining-1",
        text: `This letter confirms your joining with {{company_name}} as {{designation}} in the {{department}} department.`,
      },
      {
        id: "joining-2",
        text: `Your joining date is {{joining_date}} and your assigned work location is {{location}}.`,
      },
      {
        id: "joining-3",
        text: `You will be employed on a {{employment_type}} basis and will report to {{reporting_manager}}.`,
      },
      {
        id: "joining-4",
        text: `Your annual compensation is {{salary}} and will be administered in accordance with the applicable company policies.`,
      },
      {
        id: "joining-5",
        text: `We are pleased to welcome you to {{company_name}} and wish you every success in your new role.`,
      },
    ],
    termsConditions: [
      `Your joining and continued employment are subject to compliance with the applicable employment terms and company policies.`,
      `You are required to provide and maintain accurate employment, identity, banking and other documents required by the company or applicable law.`,
      `You must maintain confidentiality and protect company information, intellectual property, systems, records and customer or business data.`,
      `You are expected to follow the company's code of conduct, attendance requirements, workplace rules and information-security practices.`,
      `Your role, responsibilities, reporting manager or work location may be reasonably changed based on organizational or business requirements.`,
      `All statutory deductions, benefits and employment conditions will be administered in accordance with applicable law and company policy.`,
    ],
    showTermsConditions: true,
  },

  internship: {
    subject: "Internship Offer Letter",
    salutation: "Dear {{candidate_name}},",
    closing: "Sincerely,",
    showSignature: true,
    paragraphs: [
      {
        id: "internship-1",
        text: `We are pleased to offer you an internship opportunity as {{designation}} with the {{department}} department at {{company_name}}.`,
      },
      {
        id: "internship-2",
        text: `Your internship will be based at {{location}} and is scheduled to commence on {{joining_date}}.`,
      },
      {
        id: "internship-3",
        text: `You will work under the guidance of {{reporting_manager}} on a {{employment_type}} basis.`,
      },
      {
        id: "internship-4",
        text: `The compensation applicable to your internship will be {{salary}}, subject to the terms communicated by the company.`,
      },
      {
        id: "internship-5",
        text: `We look forward to having you as part of {{company_name}} and hope this internship provides you with valuable professional experience.`,
      },
    ],
    termsConditions: [
      `The internship is for learning and professional development and does not by itself guarantee future employment with {{company_name}}.`,
      `You are expected to follow the company's workplace rules, code of conduct, confidentiality requirements and instructions of your assigned supervisor.`,
      `Confidential information, documents, systems, source materials and intellectual property accessed during the internship must be kept confidential.`,
      `Your internship schedule, duties and assigned work may be adjusted reasonably according to the company's business and learning requirements.`,
      `Any stipend or other benefit will be provided only as communicated by {{company_name}} and subject to applicable policy and statutory requirements.`,
      `The internship may be concluded early by either party in accordance with the applicable internship terms and company policy.`,
    ],
    showTermsConditions: true,
  },
};

const demoCandidates: Candidate[] = [
  {
    id: "candidate-1",
    name: "Rahul Verma",
    designation: "Software Engineer",
    department: "Engineering",
    salary: "₹9,00,000 per annum",
    joiningDate: "2026-09-15",
    location: "Bengaluru",
    employmentType: "Full-time",
    reportingManager: "Ananya Rao",
    letterType: "offer",
    selected: true,
  },
  {
    id: "candidate-2",
    name: "Sneha Iyer",
    designation: "Product Designer",
    department: "Design",
    salary: "₹8,50,000 per annum",
    joiningDate: "2026-09-15",
    location: "Remote",
    employmentType: "Full-time",
    reportingManager: "Vikram Nair",
    letterType: "appointment",
    selected: true,
  },
];

const formatDate = (date: string) => {
  if (!date) return "";

  const parsedDate = new Date(
    `${date}T00:00:00`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
};

const formatSalary = (salary: string) => {
  const value = salary.trim();
  if (!value) return "";

  const match = value.match(/^₹?\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(.*)$/);

  if (!match) return value;

  const numericValue = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) return value;

  const formattedNumber = numericValue.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

  const suffix = match[2].trim();
  return suffix
    ? `₹${formattedNumber} ${suffix}`
    : `₹${formattedNumber}`;
};

const replaceTokens = (
  text: string,
  candidate: Candidate,
  company: CompanyDetails
) => {
  return text
    .replace(
      /{{candidate_name}}/g,
      candidate.name || "Candidate Name"
    )
    .replace(
      /{{designation}}/g,
      candidate.designation || "Designation"
    )
    .replace(
      /{{department}}/g,
      candidate.department || "Department"
    )
    .replace(
      /{{salary}}/g,
      formatSalary(candidate.salary) || "Compensation"
    )
    .replace(
      /{{joining_date}}/g,
      formatDate(candidate.joiningDate) ||
        "Joining Date"
    )
    .replace(
      /{{location}}/g,
      candidate.location || "Work Location"
    )
    .replace(
      /{{employment_type}}/g,
      candidate.employmentType ||
        "Employment Type"
    )
    .replace(
      /{{reporting_manager}}/g,
      candidate.reportingManager ||
        "Reporting Manager"
    )
    .replace(
      /{{company_name}}/g,
      company.name || "Company Name"
    );
};

const hasCandidateFormData = (
  form: CandidateForm
) => {
  return Object.values(form).some((value) =>
    value.trim()
  );
};

function OfferJoiningLetterGeneratorPage() {
  const [templateType, setTemplateType] =
    useState<TemplateType>("offer");

  const [letterStyle, setLetterStyle] =
    useState<LetterStyle>("modern");

  const [isNooradoDefault, setIsNooradoDefault] =
    useState(true);

  const [letterColor, setLetterColor] =
    useState<LetterColor>("navy");
  const [pageMargins, setPageMargins] =
    useState<PageMargins>(DEFAULT_PAGE_MARGINS);

  const [company, setCompany] =
    useState<CompanyDetails>(defaultCompany);

  const [templates, setTemplates] =
    useState<Record<
      TemplateType,
      LetterTemplate
    >>(defaultTemplates);

  const [candidates, setCandidates] =
    useState<Candidate[]>(demoCandidates);

  const [candidateTab, setCandidateTab] =
    useState<"single">("single");

  const [candidateForm, setCandidateForm] =
    useState<CandidateForm>(
      emptyCandidateForm
    );

  const [editingCandidateId, setEditingCandidateId] =
    useState<string | null>(null);

  const [previewCandidateId, setPreviewCandidateId] =
    useState<string | null>(
      demoCandidates[0]?.id || null
    );

  const [candidateSearch, setCandidateSearch] =
    useState("");

  const [termsMinimized, setTermsMinimized] =
    useState(false);

  const [previewAll, setPreviewAll] =
    useState(false);

  const [warningMessage, setWarningMessage] =
    useState<string | null>(null);

  const [warningConfirmAction, setWarningConfirmAction] =
    useState<(() => void) | null>(null);
  useEffect(() => {
    showWarning(
      "Before adding candidate details, carefully review the company details, logo position and size, letter template/style/color, terms & conditions, authorized signature position and size, A4 preview, and PDF layout."
    );
  }, []);
  const [signatureEditorOpen, setSignatureEditorOpen] = useState(false);
  const [logoEditorOpen, setLogoEditorOpen] = useState(false);
  const [logoPlacement, setLogoPlacement] = useState<"center" | "left">("center");
  const [logoXmm, setLogoXmm] = useState(0);
  const [logoYmm, setLogoYmm] = useState(0);
  const [logoWidthMm, setLogoWidthMm] = useState(0);
  const [logoAspectRatio, setLogoAspectRatio] = useState(3);
  const logoDragRef = useRef<{ pointerId: number; startClientX: number; startClientY: number; startXmm: number; startYmm: number } | null>(null);
  const [signatureXmm, setSignatureXmm] = useState(0);
  const [signatureYmm, setSignatureYmm] = useState(0);
  const [signatureWidthMm, setSignatureWidthMm] = useState(48);
  const [signatureAspectRatio, setSignatureAspectRatio] = useState(3);
  const signatureDragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startXmm: number;
    startYmm: number;
  } | null>(null);

  const showWarning = (message: string) => {
    setWarningMessage(message);
    setWarningConfirmAction(null);
  };

  const showConfirmation = (
    message: string,
    onConfirm: () => void
  ) => {
    setWarningMessage(message);
    setWarningConfirmAction(() => onConfirm);
  };

  const closeWarning = () => {
    setWarningMessage(null);
    setWarningConfirmAction(null);
  };

  const currentTemplate =
    templates[templateType];

  const selectedCandidates =
    candidates.filter(
      (candidate) => candidate.selected
    );

  const filteredCandidates =
    candidates.filter((candidate) => {
      const search =
        candidateSearch.trim().toLowerCase();

      if (!search) return true;

      return [
        candidate.name,
        candidate.designation,
        candidate.department,
        candidate.location,
        candidate.employmentType,
        candidate.reportingManager,
      ].some((value) =>
        value.toLowerCase().includes(search)
      );
    });

  /*
   * LIVE DRAFT CANDIDATE
   *
   * If the user is typing candidate information,
   * the A4 preview immediately uses those values.
   */
  const liveDraftCandidate: Candidate = {
    id: editingCandidateId || "draft-candidate",
    ...candidateForm,
    selected: true,
  };

  const hasLiveDraft =
    hasCandidateFormData(candidateForm);

  /*
   * Preview candidate priority:
   *
   * 1. An explicitly previewed saved candidate.
   * 2. The live draft, but only when there is no explicit saved candidate
   *    selected for preview.
   * 3. The first selected candidate.
   * 4. The first candidate.
   *
   * This is intentionally candidate-id driven. Clicking Preview must never
   * be overridden by the candidate form or by the selection checkboxes.
   */
  const explicitPreviewCandidate = candidates.find(
    (candidate) => candidate.id === previewCandidateId
  );

  const previewCandidate =
    explicitPreviewCandidate ||
    (hasLiveDraft && !previewCandidateId
      ? liveDraftCandidate
      : null) ||
    selectedCandidates[0] ||
    candidates[0];

  const updateCompany = (
    field: keyof CompanyDetails,
    value: string
  ) => {
    setCompany((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateTemplate = (
    field: keyof LetterTemplate,
    value: string | boolean
  ) => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        [field]: value,
      },
    }));
  };

  const updateParagraph = (
    paragraphId: string,
    value: string
  ) => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        paragraphs:
          current[templateType].paragraphs.map(
            (paragraph) =>
              paragraph.id === paragraphId
                ? {
                    ...paragraph,
                    text: value,
                  }
                : paragraph
          ),
      },
    }));
  };

  const resetLetterParagraphsToDefault = () => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        paragraphs: defaultTemplates[templateType].paragraphs.map(
          (paragraph) => ({ ...paragraph })
        ),
      },
    }));
  };

  const resetTermsToDefault = () => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        termsConditions: defaultTemplates[templateType].termsConditions.slice(),
        showTermsConditions: true,
      },
    }));
  };

  const updateTerm = (index: number, value: string) => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        termsConditions: current[templateType].termsConditions.map(
          (term, termIndex) =>
            termIndex === index ? value : term
        ),
      },
    }));
  };

  const addTerm = () => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        termsConditions: [
          ...current[templateType].termsConditions,
          "",
        ],
        showTermsConditions: true,
      },
    }));
  };

  const removeTerm = (index: number) => {
    setTemplates((current) => {
      const terms = current[templateType].termsConditions.filter(
        (_, termIndex) => termIndex !== index
      );

      return {
        ...current,
        [templateType]: {
          ...current[templateType],
          termsConditions: terms,
          showTermsConditions: terms.length > 0,
        },
      };
    });
  };

  const updateCandidateForm = (
    field: keyof CandidateForm,
    value: string
  ) => {
    setCandidateForm((current) => ({
      ...current,
      [field]: value,
    }));

    // A brand-new candidate should use the live draft preview.
    // While editing an existing candidate, keep its explicit preview id so
    // the draft stays tied to that candidate only.
    if (!editingCandidateId) {
      setPreviewCandidateId(null);
    }
  };

  const resetCandidateForm = (
    nextLetterType: TemplateType = templateType
  ) => {
    setCandidateForm({
      ...emptyCandidateForm,
      letterType: nextLetterType,
    });
  };

  const addCandidate = () => {
    if (!candidateForm.name.trim()) {
      showWarning(
        "Please enter the candidate's full name."
      );
      return;
    }

    if (editingCandidateId) {
      setCandidates((current) =>
        current.map((candidate) =>
          candidate.id ===
          editingCandidateId
            ? {
                ...candidateForm,
                id: editingCandidateId,
                name: candidateForm.name.trim(),
                selected:
                  candidate.selected,
              }
            : candidate
        )
      );

      setPreviewCandidateId(
        editingCandidateId
      );

      setEditingCandidateId(null);
      resetCandidateForm();

      return;
    }

    const newCandidate: Candidate = {
      id: `candidate-${Date.now()}`,
      ...candidateForm,
      name: candidateForm.name.trim(),
      letterType: templateType,
      selected: true,
    };

    setCandidates((current) => [
      ...current,
      newCandidate,
    ]);

    setPreviewCandidateId(
      newCandidate.id
    );

    resetCandidateForm();
  };

  const cancelCandidateEdit = () => {
    setEditingCandidateId(null);
    resetCandidateForm();
  };

  const editCandidate = (
    candidate: Candidate
  ) => {
    setTemplateType(candidate.letterType);

    setCandidateForm({
      name: candidate.name,
      designation: candidate.designation,
      department: candidate.department,
      salary: candidate.salary,
      joiningDate: candidate.joiningDate,
      location: candidate.location,
      employmentType:
        candidate.employmentType,
      reportingManager:
        candidate.reportingManager,
      letterType: candidate.letterType,
    });

    setEditingCandidateId(
      candidate.id
    );

    setPreviewCandidateId(
      candidate.id
    );

    setPreviewAll(false);
  };

  const previewSingleCandidate = (
    candidate: Candidate
  ) => {
    setPreviewCandidateId(
      candidate.id
    );

    setPreviewAll(false);
  };

  const toggleCandidate = (
    id: string
  ) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              selected:
                !candidate.selected,
            }
          : candidate
      )
    );
  };

  const selectAllCandidates = () => {
    setCandidates((current) =>
      current.map((candidate) => ({
        ...candidate,
        selected: true,
      }))
    );
  };

  const deselectAllCandidates = () => {
    setCandidates((current) =>
      current.map((candidate) => ({
        ...candidate,
        selected: false,
      }))
    );
  };

  const removeCandidate = (
    id: string
  ) => {
    const candidate =
      candidates.find(
        (item) => item.id === id
      );

    if (!candidate) return;

    const confirmed =
      window.confirm(
        `Remove ${candidate.name} from the candidate list?`
      );

    if (!confirmed) return;

    setCandidates((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );

    if (editingCandidateId === id) {
      cancelCandidateEdit();
    }

    if (previewCandidateId === id) {
      const remaining =
        candidates.filter(
          (item) => item.id !== id
        );

      setPreviewCandidateId(
        remaining[0]?.id || null
      );
    }
  };

 const handleLogoUpload = (
  event: ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
  ];

  if (!allowedTypes.includes(file.type)) {
    showWarning(
      "Please upload a PNG, JPG, JPEG, or SVG logo."
    );
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const result = reader.result;

    if (typeof result !== "string") {
      return;
    }

    const image = new Image();
    image.onload = () => {
      const ratio = image.naturalWidth > 0 && image.naturalHeight > 0
        ? image.naturalWidth / image.naturalHeight
        : 3;
      const defaultHeightMm = 52 * (25.4 / 96);
      const defaultWidthMm = Math.min(200 * (25.4 / 96), defaultHeightMm * ratio);
      setLogoAspectRatio(ratio);
      setLogoWidthMm(Math.max(10, defaultWidthMm));
      setLogoXmm(0);
      setLogoYmm(0);
    };
    image.src = result;

    setCompany((current) => ({
      ...current,
      logo: result,
    }));
  };

  reader.readAsDataURL(file);
};

  /*
   * LETTER TYPE CHANGE
   *
   * Changing the letter can change the meaning
   * of the generated document, so warn first.
   */
  const changeTemplateType = (
    nextType: TemplateType
  ) => {
    if (nextType === templateType) {
      return;
    }

    showConfirmation(
      `You are changing the letter type from "${getTemplateLabel(
        templateType
      )}" to "${getTemplateLabel(
        nextType
      )}".\n\nThe letter subject, salutation and content will change to the selected template.\n\nYour company details and candidate information will be kept.\n\nDo you want to continue?`,
      () => {
        setTemplateType(nextType);

        setCandidateForm((current) => ({
          ...current,
          letterType: nextType,
          employmentType:
            nextType === "internship"
              ? current.employmentType === "Full-time" ||
                !current.employmentType
                ? "Internship"
                : current.employmentType
              : current.employmentType === "Internship"
                ? "Full-time"
                : current.employmentType,
        }));

        closeWarning();
      }
    );
  };

  const updatePageMargin = (
    side: keyof PageMargins,
    value: string
  ) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    setPageMargins((current) => ({
      ...current,
      [side]: Math.min(40, Math.max(10, parsed)),
    }));
  };

  const applyPageMarginPreset = (value: number) => {
    setPageMargins({
      top: value,
      right: value,
      bottom: value,
      left: value,
    });
  };
  const logoHeightMm = logoWidthMm > 0
    ? logoWidthMm / Math.max(0.5, logoAspectRatio)
    : 52 * (25.4 / 96);

  const resetLogoPosition = () => {
    setLogoPlacement("center");
    setLogoXmm(0);
    setLogoYmm(0);
    if (logoWidthMm <= 0 && company.logo) {
      const defaultHeightMm = 52 * (25.4 / 96);
      setLogoWidthMm(Math.min(200 * (25.4 / 96), defaultHeightMm * logoAspectRatio));
    }
  };

  const updateLogoPosition = (axis: "x" | "y", value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    if (axis === "x") {
      const printableWidthMm = 210 - pageMargins.left - pageMargins.right;
      const maxXmm = Math.max(0, printableWidthMm - Math.max(1, logoWidthMm));
      setLogoXmm(Math.min(maxXmm, Math.max(-20, parsed)));
    } else {
      setLogoYmm(Math.max(-20, Math.min(50, parsed)));
    }
  };

  const updateLogoWidth = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    const nextWidth = Math.min(80, Math.max(10, parsed));
    const printableWidthMm = 210 - pageMargins.left - pageMargins.right;
    const maxXmm = Math.max(0, printableWidthMm - nextWidth);
    setLogoWidthMm(nextWidth);
    setLogoXmm((current) => Math.min(current, maxXmm));
  };

  const handleLogoPointerDown = (event: PointerEvent<HTMLImageElement>) => {
    const container = event.currentTarget.parentElement;
    if (!container) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    logoDragRef.current = { pointerId: event.pointerId, startClientX: event.clientX, startClientY: event.clientY, startXmm: logoXmm, startYmm: logoYmm };
  };

  const handleLogoPointerMove = (event: PointerEvent<HTMLImageElement>) => {
    const drag = logoDragRef.current;
    const container = event.currentTarget.parentElement;
    if (!drag || !container || drag.pointerId !== event.pointerId) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const mmPerPixel = 210 / rect.width;
    const deltaXmm = (event.clientX - drag.startClientX) * mmPerPixel;
    const deltaYmm = (event.clientY - drag.startClientY) * mmPerPixel;
    const printableWidthMm = 210 - pageMargins.left - pageMargins.right;
    const maxXmm = Math.max(0, printableWidthMm - Math.max(1, logoWidthMm));
    setLogoXmm(Math.min(maxXmm, Math.max(-20, drag.startXmm + deltaXmm)));
    setLogoYmm(Math.max(-20, Math.min(50, drag.startYmm + deltaYmm)));
  };

  const handleLogoPointerUp = (event: PointerEvent<HTMLImageElement>) => {
    if (logoDragRef.current?.pointerId === event.pointerId) logoDragRef.current = null;
  };

  const signatureHeightMm = Math.max(
    1,
    signatureWidthMm / Math.max(0.5, signatureAspectRatio)
  );

  const signatureSpaceHeightMm = company.signatureImage
    ? Math.max(12, signatureYmm + signatureHeightMm + 6)
    : 0;

  const resetSignaturePosition = () => {
    setSignatureXmm(0);
    setSignatureYmm(0);
    setSignatureWidthMm(48);
  };

  const updateSignaturePosition = (
    axis: "x" | "y",
    value: string
  ) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    if (axis === "x") {
      const printableWidthMm =
        210 - pageMargins.left - pageMargins.right;
      const maxXmm = Math.max(
        0,
        printableWidthMm - signatureWidthMm
      );
      setSignatureXmm(
        Math.min(maxXmm, Math.max(-7, parsed))
      );
    } else {
      setSignatureYmm(Math.max(0, parsed));
    }
  };

  const updateSignatureWidth = (value: string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    const nextWidth = Math.min(80, Math.max(20, parsed));
    const printableWidthMm =
      210 - pageMargins.left - pageMargins.right;
    const maxXmm = Math.max(
      0,
      printableWidthMm - nextWidth
    );

    setSignatureWidthMm(nextWidth);
    setSignatureXmm((current) =>
      Math.min(current, maxXmm)
    );
  };

  const handleSignaturePointerDown = (
    event: PointerEvent<HTMLImageElement>
  ) => {
    const container = event.currentTarget.parentElement;
    if (!container) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    signatureDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startXmm: signatureXmm,
      startYmm: signatureYmm,
    };
  };

  const handleSignaturePointerMove = (
    event: PointerEvent<HTMLImageElement>
  ) => {
    const drag = signatureDragRef.current;
    const container = event.currentTarget.parentElement;
    if (!drag || !container || drag.pointerId !== event.pointerId) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const mmPerPixel = 210 / rect.width;
    const deltaXmm =
      (event.clientX - drag.startClientX) * mmPerPixel;
    const deltaYmm =
      (event.clientY - drag.startClientY) * mmPerPixel;

    const printableWidthMm =
      210 - pageMargins.left - pageMargins.right;

    const maxXmm = Math.max(
      0,
      printableWidthMm - signatureWidthMm
    );

    setSignatureXmm(
      Math.min(
        maxXmm,
        Math.max(-15, drag.startXmm + deltaXmm)
      )
    );

    setSignatureYmm(
      Math.max(0, drag.startYmm + deltaYmm)
    );
  };

  const handleSignaturePointerUp = (
    event: PointerEvent<HTMLImageElement>
  ) => {
    if (
      signatureDragRef.current?.pointerId ===
      event.pointerId
    ) {
      signatureDragRef.current = null;
    }
  };

  /*
   * VECTOR / TEXT PDF ENGINE
   * ------------------------
   * This renderer intentionally does not inspect or capture the HTML preview.
   * Text is written directly into the PDF with jsPDF text primitives; only
   * the uploaded logo and signature remain image content.
   */
  /*
   * PDF / PREVIEW SHARED LAYOUT MODEL
   * ---------------------------------
   * The browser preview is the source of truth for the letter geometry.
   * The vector PDF uses the same typography, margins and spacing values in
   * physical units. Nothing below uses fixed page coordinates for content.
   * Every block measures its own wrapped height and page-breaks are calculated
   * from the measured height.
   */
  const generateVectorPdf = async (candidate: Candidate): Promise<jsPDF> => {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const left = pageMargins.left;
    const right = pageMargins.right;
    const top = pageMargins.top;
    const bottom = pageMargins.bottom;
    const contentWidth = pageWidth - left - right;

    if (contentWidth <= 0 || pageHeight - bottom <= top) {
      throw new Error("Page margins leave no printable area.");
    }

    const candidateTemplate = templates[candidate.letterType];
    if (!candidateTemplate) {
      throw new Error("Unable to find the selected letter template.");
    }

    const accentByColor: Record<LetterColor, [number, number, number]> = {
      navy: [31, 53, 87],
      green: [23, 107, 82],
      burgundy: [122, 38, 58],
      purple: [91, 63, 140],
      black: [34, 34, 34],
    };
    const accent = accentByColor[letterColor];

    // -----------------------------------------------------------------------
    // These values mirror the FINAL printable A4 CSS above.
    // Keep them together so PDF spacing is easy to tune without hunting
    // through the renderer. Values expressed in px are converted to mm once.
    // -----------------------------------------------------------------------
    const PX_TO_MM = 25.4 / 96;
    const PT_PER_PX = 0.75;
    const PREVIEW = {
      pageBreakSafetyMm: 0.8,

      page: {
        top,
        right,
        bottom,
        left,
      },

      pageStyle: {
        fontSizePx: 13,
        lineHeightRatio: letterStyle === "minimal" ? 1.7 : 1.65,
      },

      header: {
        gapPx: 16,
        logoHeightPx: 52,
        logoMaxWidthPx: 200,
        companyTitleFontPx: 21,
        companyTitleLineRatio: 1.2,
        companyTitleBottomGapPx: 4,
        companyMetaFontPx: 12,
        companyMetaLineRatio: 1.5,
        dividerTopPx: 16,
        dividerHeightPx:
          letterStyle === "modern"
            ? 4
            : letterStyle === "minimal"
              ? 1
              : 2,
        dividerBottomPx: 20,
      },

      date: {
        fontPx: 12.5,
        bottomGapPx: 10,
      },

      recipient: {
        fontPx: 14,
        bottomGapPx: 12,
      },

      subject: {
        fontPx: 13.5,
        lineHeightRatio: 1.65,
        bottomGapPx: 35,
      },

      salutation: {
        fontPx: 13,
        lineHeightRatio: letterStyle === "minimal" ? 1.7 : 1.65,
        bottomGapPx: 14,
      },

      body: {
        fontPx: 13,
        lineHeightRatio: letterStyle === "minimal" ? 1.7 : 1.65,
        paragraphGapPx: 14,
      },

      terms: {
        topGapPx: 12,
        headingFontPx: 13,
        headingLineRatio: letterStyle === "minimal" ? 1.7 : 1.65,
        headingBottomGapPx: 7,
        itemFontPx: 13,
        itemLineRatio: 1.55,
        itemBottomGapPx: 6,
        bottomGapPx: 4,
        listIndentPx: 22,
      },

      closing: {
        topGapPx: 10,
        fontPx: 13,
        lineHeightRatio: letterStyle === "minimal" ? 1.7 : 1.65,
      },

      signature: {
        topGapPx: 8,
        minimumSpaceMm: 10,
        extraBottomMm: 2,
        spaceBottomPx: 4,
        hrNameFontPx: 13,
        hrDesignationFontPx: 12,
        detailTopGapPx: 2,
      },
    };

    const mm = (px: number) => px * PX_TO_MM;
    const pt = (px: number) => px * PT_PER_PX;
    const printableBottom =
      pageHeight - PREVIEW.page.bottom - PREVIEW.pageBreakSafetyMm;

    // Match the actual preview font sizes and line-height ratios.
    const lineHeight = (fontPx: number, ratio = PREVIEW.pageStyle.lineHeightRatio) =>
      mm(fontPx * ratio);

    const setFont = (bold = false, fontPx = PREVIEW.pageStyle.fontSizePx) => {
      // jsPDF's standard fonts are used so the PDF remains real/selectable text.
      // They approximate the browser preview's system/Georgia font families.
      const font =
        letterStyle === "classic" || letterStyle === "elegant"
          ? "times"
          : "helvetica";
      pdf.setFont(font, bold ? "bold" : "normal");
      pdf.setFontSize(pt(fontPx));
      pdf.setTextColor(34, 34, 34);
    };

    const normalizePdfText = (value: string) =>
      value
        .replace(/₹/g, "Rs.")
        .replace(/\u00a0/g, " ")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\u2026/g, "...");

    let currentY = top;

    const addPage = () => {
      pdf.addPage("a4", "portrait");
      currentY = top;
    };

    const ensureSpace = (height: number) => {
      if (currentY + height > printableBottom) {
        addPage();
      }
    };

    const drawWrapped = (
      text: string,
      options: {
        fontPx?: number;
        bold?: boolean;
        color?: [number, number, number];
        gapAfter?: number;
        justify?: boolean;
        width?: number;
        indentMm?: number;
        bullet?: string;
        lineRatio?: number;
      } = {}
    ) => {
      const fontPx = options.fontPx ?? PREVIEW.pageStyle.fontSizePx;
      const width = options.width ?? contentWidth - (options.indentMm ?? 0);
      const gapAfter = options.gapAfter ?? 0;
      const safeText = normalizePdfText(text).trim();

      if (!safeText) {
        currentY += gapAfter;
        return;
      }

      setFont(options.bold ?? false, fontPx);
      pdf.setTextColor(...(options.color ?? [34, 34, 34]));

      const lines = pdf.splitTextToSize(
        safeText,
        Math.max(1, width)
      ) as string[];
      const lh = lineHeight(fontPx, options.lineRatio);
      const x = left + (options.indentMm ?? 0);
      const bullet = options.bullet
        ? normalizePdfText(options.bullet)
        : "";
      const bulletGap = bullet ? mm(PREVIEW.terms.listIndentPx) : 0;
      const textWidth = Math.max(1, width - bulletGap);
      const lineX = x + bulletGap;
      let lineIndex = 0;

      while (lineIndex < lines.length) {
        const availableLines = Math.floor(
          (printableBottom - currentY) / Math.max(0.1, lh)
        );

        if (availableLines <= 0) {
          addPage();
          continue;
        }

        const pageLines = Math.min(
          availableLines,
          lines.length - lineIndex
        );

        if (bullet) {
          pdf.text(bullet, x, currentY);
        }

        for (let localIndex = 0; localIndex < pageLines; localIndex += 1) {
          const globalIndex = lineIndex + localIndex;
          const line = lines[globalIndex];
          const isLastLineOfText = globalIndex === lines.length - 1;
          const isLastLineOfPage = localIndex === pageLines - 1;

          if (
            options.justify &&
            !isLastLineOfText &&
            !isLastLineOfPage &&
            line.includes(" ")
          ) {
            const words = line.trim().split(/\s+/);
            const naturalWidth = pdf.getTextWidth(words.join(" "));
            const extra = Math.max(0, textWidth - naturalWidth);
            const spaces = Math.max(1, words.length - 1);
            const extraPerSpace = extra / spaces;
            let cursorX = lineX;

            words.forEach((word, wordIndex) => {
              pdf.text(word, cursorX, currentY + localIndex * lh);
              cursorX += pdf.getTextWidth(word);
              if (wordIndex < words.length - 1) {
                cursorX += pdf.getTextWidth(" ") + extraPerSpace;
              }
            });
          } else {
            pdf.text(line, lineX, currentY + localIndex * lh);
          }
        }

        currentY += pageLines * lh;
        lineIndex += pageLines;

        if (lineIndex < lines.length) {
          addPage();
        }
      }

      currentY += gapAfter;
    };

    const loadImageDimensions = async (dataUrl: string) => {
      const image = new Image();
      image.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Unable to load uploaded image."));
      });
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      };
    };

    const getImageFormat = (dataUrl: string) => {
      const match = dataUrl.match(/^data:image\/([^;,]+)/i);
      return (match?.[1] || "png").toUpperCase();
    };

    const drawImage = async (
      dataUrl: string,
      x: number,
      y: number,
      width: number,
      height?: number
    ) => {
      if (!dataUrl) return;
      const dimensions = await loadImageDimensions(dataUrl);
      const ratio = dimensions.width / Math.max(1, dimensions.height);
      const finalWidth = Math.max(1, width);
      const finalHeight =
        height && height > 0 ? height : finalWidth / ratio;
      const format = getImageFormat(dataUrl);

      if (
        format === "SVG" &&
        typeof (pdf as jsPDF & { addSvgAsImage?: unknown }).addSvgAsImage ===
          "function"
      ) {
        const addSvg = (pdf as jsPDF & {
          addSvgAsImage: (
            svgData: string,
            x: number,
            y: number,
            w: number,
            h: number,
            alias?: string,
            compression?: string
          ) => void;
        }).addSvgAsImage;
        addSvg(dataUrl, x, y, finalWidth, finalHeight, undefined, "FAST");
      } else {
        pdf.addImage(
          dataUrl,
          format === "JPG" ? "JPEG" : format,
          x,
          y,
          finalWidth,
          finalHeight,
          undefined,
          "FAST"
        );
      }
    };

    // HEADER ---------------------------------------------------------------
    const logoHeight = company.logo ? Math.max(1, logoHeightMm) : 0;
    const headerGap = mm(PREVIEW.header.gapPx);
    const logoMaxWidth = mm(PREVIEW.header.logoMaxWidthPx);
    const companyTitleLine = lineHeight(
      PREVIEW.header.companyTitleFontPx,
      PREVIEW.header.companyTitleLineRatio
    );
    const companyTitleBottomGap = mm(PREVIEW.header.companyTitleBottomGapPx);
    const companyMetaLine = lineHeight(
      PREVIEW.header.companyMetaFontPx,
      PREVIEW.header.companyMetaLineRatio
    );

    const drawCompanyText = async (
      startX: number,
      startY: number,
      width: number,
      align: "left" | "center" | "right"
    ) => {
      const textOptions =
        align === "center"
          ? { align: "center" as const }
          : align === "right"
            ? { align: "right" as const }
            : undefined;
      setFont(true, PREVIEW.header.companyTitleFontPx);
      pdf.setTextColor(...accent);
      const companyName = normalizePdfText(company.name || "Company Name");
      const titleLines = pdf.splitTextToSize(companyName, width) as string[];
      pdf.text(titleLines, startX, startY, textOptions);

      let metaY =
        startY + titleLines.length * companyTitleLine + companyTitleBottomGap;
      setFont(false, PREVIEW.header.companyMetaFontPx);
      pdf.setTextColor(107, 100, 85);

      for (const value of [company.website, company.addressLine, company.cityLine].filter(Boolean)) {
        const lines = pdf.splitTextToSize(normalizePdfText(value), width) as string[];
        pdf.text(lines, startX, metaY, textOptions);
        metaY += lines.length * companyMetaLine;
      }

      return metaY - startY;
    };

    if (company.logo) {
      try {
        const dimensions = await loadImageDimensions(company.logo);
        const ratio = dimensions.width / Math.max(1, dimensions.height);
        const logoW = Math.min(logoMaxWidth, logoHeight * ratio);

        if (logoPlacement === "left") {
          // Logo is anchored to the absolute left edge of the printable area.
          // Company heading/content remains centered across the full page width.
          const logoX = left + logoXmm;
          const logoY = currentY + logoYmm;
          await drawImage(company.logo, logoX, logoY, logoW, logoHeight);
          const textHeight = await drawCompanyText(
            pageWidth / 2,
            currentY + mm(0.5),
            contentWidth,
            "center"
          );
          currentY += Math.max(logoHeight, textHeight);
        } else {
          const logoX = left + (contentWidth - logoW) / 2 + logoXmm;
          await drawImage(company.logo, logoX, currentY + logoYmm, logoW, logoHeight);
          currentY += logoHeight + headerGap;

          const headerX = pageWidth / 2;
          const textHeight = await drawCompanyText(
            headerX,
            currentY + mm(0.5),
            contentWidth,
            "center"
          );
          currentY += textHeight;
        }
      } catch (error) {
        console.warn("Unable to embed company logo in vector PDF:", error);
        currentY += logoHeight + headerGap;
        const fallbackHeight = await drawCompanyText(
          pageWidth / 2,
          currentY,
          contentWidth,
          "center"
        );
        currentY += fallbackHeight;
      }
    } else {
      // Keep the PDF header aligned with the preview even when no logo exists.
      // Keep the vector PDF header centered like the on-screen preview.
      const headerX = pageWidth / 2;
      const textHeight = await drawCompanyText(
        headerX,
        currentY,
        contentWidth,
        "center"
      );
      currentY += textHeight;
    }

    // Divider: margin 16px 0 20px; height depends on the selected preview style.
    currentY += mm(PREVIEW.header.dividerTopPx);
    pdf.setDrawColor(...accent);
    pdf.setLineWidth(mm(PREVIEW.header.dividerHeightPx));
    pdf.line(left, currentY, pageWidth - right, currentY);
    currentY += mm(PREVIEW.header.dividerHeightPx + PREVIEW.header.dividerBottomPx);

    // DATE / RECIPIENT / SUBJECT / SALUTATION -----------------------------
    drawWrapped(formatDate(company.letterDate), {
      fontPx: PREVIEW.date.fontPx,
      bold: true,
      gapAfter: mm(PREVIEW.date.bottomGapPx),
    });

    drawWrapped(candidate.name || "Candidate Name", {
      fontPx: PREVIEW.recipient.fontPx,
      bold: true,
      color: accent,
      gapAfter: mm(PREVIEW.recipient.bottomGapPx - 15),
    });

    const subjectValue = normalizePdfText(
      replaceTokens(candidateTemplate.subject, candidate, company)
    );
    const subjectLabel = "Subject:";
    const subjectLineHeight = lineHeight(
      PREVIEW.subject.fontPx,
      PREVIEW.subject.lineHeightRatio
    );
    const subjectLabelWidth = (() => {
      setFont(true, PREVIEW.subject.fontPx);
      return pdf.getTextWidth(`${subjectLabel} `);
    })();
    const subjectValueLines = pdf.splitTextToSize(
      subjectValue,
      Math.max(1, contentWidth - subjectLabelWidth)
    ) as string[];
    const subjectHeight = Math.max(1, subjectValueLines.length) * subjectLineHeight;
    const subjectGap = mm(PREVIEW.subject.bottomGapPx);
    ensureSpace(subjectHeight + subjectGap);
    const subjectBaselineY = currentY + pt(PREVIEW.subject.fontPx) * 0.3528;

    // Keep the Subject label and value on the same line, with the label bold.
    // Both begin from the exact same left X position as the date and candidate name.
    setFont(true, PREVIEW.subject.fontPx);
    pdf.setTextColor(34, 34, 34);
    pdf.text(subjectLabel, left, subjectBaselineY);

    setFont(false, PREVIEW.subject.fontPx);
    pdf.setTextColor(34, 34, 34);
    pdf.text(
      subjectValueLines,
      left + subjectLabelWidth,
      subjectBaselineY
    );

    currentY += subjectHeight + subjectGap;

    drawWrapped(
      replaceTokens(candidateTemplate.salutation, candidate, company),
      {
        fontPx: PREVIEW.salutation.fontPx,
        bold: true,
        gapAfter: mm(PREVIEW.salutation.bottomGapPx),
        lineRatio: PREVIEW.salutation.lineHeightRatio,
      }
    );

    // BODY -----------------------------------------------------------------
    for (const paragraph of candidateTemplate.paragraphs) {
      drawWrapped(replaceTokens(paragraph.text, candidate, company), {
        fontPx: PREVIEW.body.fontPx,
        gapAfter: mm(PREVIEW.body.paragraphGapPx),
        justify: true,
        lineRatio: PREVIEW.body.lineHeightRatio,
      });
    }

    // TERMS ----------------------------------------------------------------
    if (
      candidateTemplate.showTermsConditions &&
      candidateTemplate.termsConditions.length > 0
    ) {
      currentY += mm(PREVIEW.terms.topGapPx);

      const headingLineHeight = lineHeight(
        PREVIEW.terms.headingFontPx,
        PREVIEW.terms.headingLineRatio
      );
      const itemLineHeight = lineHeight(
        PREVIEW.terms.itemFontPx,
        PREVIEW.terms.itemLineRatio
      );
      const itemTextIndentMm = mm(PREVIEW.terms.listIndentPx);
      const itemWidth = Math.max(1, contentWidth - itemTextIndentMm);
      const firstTerm =
        candidateTemplate.termsConditions.find((term) => term.trim()) || "";
      const firstTermLines = firstTerm
        ? (pdf.splitTextToSize(
            normalizePdfText(
              replaceTokens(firstTerm, candidate, company)
            ),
            itemWidth
          ) as string[])
        : [];
      const firstTermHeight =
        firstTermLines.length * itemLineHeight +
        mm(PREVIEW.terms.itemBottomGapPx);
      const headingAndFirstTermHeight =
        headingLineHeight +
        mm(PREVIEW.terms.headingBottomGapPx) +
        firstTermHeight;

      if (currentY + headingAndFirstTermHeight > printableBottom) {
        addPage();
      }

      drawWrapped("Terms & Conditions", {
        fontPx: PREVIEW.terms.headingFontPx,
        bold: true,
        color: accent,
        gapAfter: mm(PREVIEW.terms.headingBottomGapPx),
        lineRatio: PREVIEW.terms.headingLineRatio,
      });

      let conditionNumber = 0;
      for (const term of candidateTemplate.termsConditions) {
        const safeTerm = term.trim();
        if (!safeTerm) continue;
        conditionNumber += 1;

        const normalized = normalizePdfText(
          replaceTokens(safeTerm, candidate, company)
        );
        const lines = pdf.splitTextToSize(normalized, itemWidth) as string[];
        const height =
          lines.length * itemLineHeight +
          mm(PREVIEW.terms.itemBottomGapPx);

        if (currentY + height > printableBottom) {
          addPage();
        }

        drawWrapped(normalized, {
          fontPx: PREVIEW.terms.itemFontPx,
          width: itemWidth,
          gapAfter: mm(PREVIEW.terms.itemBottomGapPx),
          bullet: `${conditionNumber}.`,
          lineRatio: PREVIEW.terms.itemLineRatio,
        });
      }

      currentY += mm(PREVIEW.terms.bottomGapPx);
    }

    // CLOSING + SIGNATURE --------------------------------------------------
    const closingText = replaceTokens(
      candidateTemplate.closing,
      candidate,
      company
    );
    const closingLines = pdf.splitTextToSize(
      normalizePdfText(closingText),
      contentWidth
    ) as string[];
    const closingLineHeight = lineHeight(
      PREVIEW.closing.fontPx,
      PREVIEW.closing.lineHeightRatio
    );

    const hrNameLines = pdf.splitTextToSize(
      normalizePdfText(company.hrName || "HR Name"),
      contentWidth
    ) as string[];
    const hrDesignationLines = pdf.splitTextToSize(
      normalizePdfText(company.hrDesignation || "HR Designation"),
      contentWidth
    ) as string[];
    const companyNameLines = pdf.splitTextToSize(
      normalizePdfText(company.name || "Company Name"),
      contentWidth
    ) as string[];

    const hrNameLineHeight = lineHeight(PREVIEW.signature.hrNameFontPx);
    const hrDesignationLineHeight = lineHeight(
      PREVIEW.signature.hrDesignationFontPx
    );
    const hrNameHeight =
      hrNameLines.length * hrNameLineHeight + mm(PREVIEW.signature.detailTopGapPx);
    const hrDesignationHeight =
      hrDesignationLines.length * hrDesignationLineHeight +
      mm(PREVIEW.signature.detailTopGapPx);
    const companyNameHeight = companyNameLines.length * hrDesignationLineHeight;

    let actualSignatureWidth = 0;
    let actualSignatureHeight = 0;
    let signatureSpaceHeight = 0;
    let signatureImageAvailable = false;

    if (candidateTemplate.showSignature && company.signatureImage) {
      const availableSignatureWidth = Math.max(
        mm(20),
        contentWidth - Math.max(-mm(1), signatureXmm)
      );
      actualSignatureWidth = Math.min(
        signatureWidthMm,
        availableSignatureWidth
      );

      try {
        const dimensions = await loadImageDimensions(company.signatureImage);
        const ratio = dimensions.width / Math.max(1, dimensions.height);
        actualSignatureHeight = actualSignatureWidth / ratio;
        signatureImageAvailable = true;
      } catch (error) {
        console.warn(
          "Unable to read signature dimensions in vector PDF:",
          error
        );
        actualSignatureHeight = Math.max(12, signatureHeightMm);
      }

      signatureSpaceHeight = Math.max(
        PREVIEW.signature.minimumSpaceMm,
        signatureYmm +
          actualSignatureHeight +
          PREVIEW.signature.extraBottomMm
      );
    }

    const signatureBlockHeight = candidateTemplate.showSignature
      ? company.signatureImage
        ? mm(PREVIEW.signature.topGapPx) +
          signatureSpaceHeight +
          mm(PREVIEW.signature.spaceBottomPx)
        : mm(PREVIEW.signature.minimumSpaceMm)
      : 0;

    const completeClosingHeight =
      mm(PREVIEW.closing.topGapPx) +
      closingLines.length * closingLineHeight +
      signatureBlockHeight +
      (candidateTemplate.showSignature
        ? hrNameHeight + hrDesignationHeight + companyNameHeight
        : 0);

    // Only create a new page when the closing + signature truly cannot fit.
    // Do not reserve the old oversized spacer stack, otherwise a short letter
    // moves the signature to page 2 while there is still usable space on page 1.
    if (currentY + completeClosingHeight > printableBottom) {
      addPage();
    }

    currentY += mm(PREVIEW.closing.topGapPx);
    drawWrapped(closingText, {
      fontPx: PREVIEW.closing.fontPx,
      gapAfter: 0,
      lineRatio: PREVIEW.closing.lineHeightRatio,
    });

    if (candidateTemplate.showSignature) {
      if (company.signatureImage && signatureImageAvailable) {
        const signatureSpaceTop =
          currentY + mm(PREVIEW.signature.topGapPx);
        const signatureX = left + signatureXmm;
        const signatureY = signatureSpaceTop + signatureYmm;

        await drawImage(
          company.signatureImage,
          signatureX,
          signatureY,
          actualSignatureWidth,
          actualSignatureHeight
        );

        currentY =
          signatureSpaceTop +
          signatureSpaceHeight +
          mm(PREVIEW.signature.spaceBottomPx);
      } else if (company.signatureImage) {
        currentY +=
          mm(PREVIEW.signature.topGapPx) +
          signatureSpaceHeight +
          mm(PREVIEW.signature.spaceBottomPx);
      } else {
        currentY += mm(PREVIEW.signature.minimumSpaceMm);
      }

      drawWrapped(company.hrName || "HR Name", {
        fontPx: PREVIEW.signature.hrNameFontPx,
        bold: true,
        gapAfter: mm(PREVIEW.signature.detailTopGapPx),
      });
      drawWrapped(company.hrDesignation || "HR Designation", {
        fontPx: PREVIEW.signature.hrDesignationFontPx,
        color: [107, 100, 85],
        gapAfter: mm(PREVIEW.signature.detailTopGapPx),
      });
      drawWrapped(company.name || "Company Name", {
        fontPx: PREVIEW.signature.hrDesignationFontPx,
        color: [107, 100, 85],
      });
    }

    return pdf;
  };

  const downloadSingleLetter = async (candidate: Candidate) => {
    setPreviewAll(false);
    setPreviewCandidateId(candidate.id);

    try {
      const pdf = await generateVectorPdf(candidate);

      const safeName = candidate.name
        .trim()
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "") || "Candidate";

      const letterLabel = getTemplateLabel(candidate.letterType)
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "") || "Letter";

      pdf.save(`${safeName}_${letterLabel}.pdf`);
    } catch (error) {
      console.error("Failed to generate candidate vector PDF:", error);
      showWarning("Unable to generate the PDF. Please try again.");
    }
  };

  const previewAllSelected = () => {
    if (selectedCandidates.length === 0) {
      showWarning(
        "Please select at least one candidate before previewing all candidates."
      );
      return;
    }

    setPreviewAll(true);
  };

  const downloadAllLetters = async () => {
    if (selectedCandidates.length === 0) {
      showWarning("Please select at least one candidate before downloading letters.");
      return;
    }

    if (!previewAll) {
      setPreviewAll(true);
      showWarning("Preview All Candidates has been opened. Please click Download All Letters again to generate the ZIP.");
      return;
    }

    const zip = new JSZip();

    try {
      for (let index = 0; index < selectedCandidates.length; index += 1) {
        const candidate = selectedCandidates[index];
        const pdf = await generateVectorPdf(candidate);

        const safeName = candidate.name
          .trim()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "") || `Candidate_${index + 1}`;

        const letterLabel = getTemplateLabel(candidate.letterType)
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "");

        zip.file(
          `${safeName}_${letterLabel}.pdf`,
          pdf.output("blob")
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Noorado_Letters.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate letters:", error);
      showWarning("Something went wrong while generating the letters. Please try again.");
    }
  };

  const getTemplateLabel = (
    type: TemplateType
  ) => {
    switch (type) {
      case "offer":
        return "Offer Letter";

      case "appointment":
        return "Appointment Letter";

      case "joining":
        return "Joining Letter";

      case "internship":
        return "Internship Letter";

      default:
        return "Letter";
    }
  };

  const getCandidateFieldLabel = (
    field:
      | "salary"
      | "joiningDate"
  ) => {
    if (
      templateType ===
      "internship"
    ) {
      if (field === "salary") {
        return "Stipend / Compensation";
      }

      if (field === "joiningDate") {
        return "Internship Start Date";
      }
    }

    if (
      templateType === "joining"
    ) {
      if (field === "salary") {
        return "Annual Compensation";
      }

      if (field === "joiningDate") {
        return "Joining Date";
      }
    }

    return field === "salary"
      ? "Salary"
      : "Joining Date";
  };

  const getSalaryPlaceholder = () => {
    if (
      templateType ===
      "internship"
    ) {
      return "₹20,000 per month / Unpaid";
    }

    return "₹9,00,000 per annum";
  };

  const handleSignatureUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/svg+xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      showWarning("Please upload a PNG, JPG, JPEG, or SVG signature.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      setCompany((current) => ({
        ...current,
        signatureImage: reader.result as string,
      }));
      resetSignaturePosition();
      setSignatureEditorOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSignatureImageLoad = (
    event: SyntheticEvent<HTMLImageElement>
  ) => {
    const image = event.currentTarget;
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      setSignatureAspectRatio(
        image.naturalWidth / image.naturalHeight
      );
    }
  };

  const renderLetterPage = (
    candidate: Candidate,
    pageIndex?: number
  ) => {
    const candidateTemplate =
      templates[candidate.letterType];

    return (
      <div
        className={`offer-generator-a4-page style-${letterStyle} color-${letterColor}`}
        key={`${candidate.id}-${pageIndex ?? "single"}`}
        style={
          {
            "--letter-margin-top": `${pageMargins.top}mm`,
            "--letter-margin-right": `${pageMargins.right}mm`,
            "--letter-margin-bottom": `${pageMargins.bottom}mm`,
            "--letter-margin-left": `${pageMargins.left}mm`,
            "--logo-width": logoWidthMm > 0 ? `${logoWidthMm}mm` : undefined,
            "--logo-height": logoWidthMm > 0 ? `${logoHeightMm}mm` : undefined,
          } as CSSProperties
        }
      >
        {/* LETTER HEADER */}
        <div
          className={`offer-generator-letter-header logo-${logoPlacement}`}
        >
          {company.logo && (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="offer-generator-letter-logo"
              draggable={false}
              onPointerDown={logoEditorOpen ? handleLogoPointerDown : undefined}
              onPointerMove={logoEditorOpen ? handleLogoPointerMove : undefined}
              onPointerUp={logoEditorOpen ? handleLogoPointerUp : undefined}
              onPointerCancel={logoEditorOpen ? handleLogoPointerUp : undefined}
              style={{
                "--logo-x": `${logoXmm}mm`,
                "--logo-y": `${logoYmm}mm`,
                cursor: logoEditorOpen ? "move" : undefined,
              } as CSSProperties}
            />
          )}

          <div className="offer-generator-letter-company">
            <h1 className="offer-generator-company-name">
              {company.name ||
                "Company Name"}
            </h1>

            {company.website && (
              <div>
                {company.website}
              </div>
            )}

            {company.addressLine && (
              <div>
                {company.addressLine}
              </div>
            )}

            {company.cityLine && (
              <div>
                {company.cityLine}
              </div>
            )}
          </div>
        </div>

        <div className="offer-generator-letter-divider" />

        {/* DATE */}
        <div className="offer-generator-letter-date">
          {formatDate(
            company.letterDate
          )}
        </div>

        {/* RECIPIENT */}
        <div className="offer-generator-letter-recipient">
          <strong className="offer-generator-candidate-name">
            {candidate.name ||
              "Candidate Name"}
          </strong>

        </div>

        {/* SUBJECT */}
        <div className="offer-generator-letter-subject">
          <strong>
            Subject:{" "}
          </strong>

          {replaceTokens(
            candidateTemplate.subject,
            candidate,
            company
          )}
        </div>

        {/* SALUTATION */}
        <div className="offer-generator-letter-salutation">
          {replaceTokens(
            candidateTemplate.salutation,
            candidate,
            company
          )}
        </div>

        {/* BODY */}
        <div className="offer-generator-letter-body">
          {candidateTemplate.paragraphs.map(
            (paragraph) => (
              <p key={paragraph.id}>
                {replaceTokens(
                  paragraph.text,
                  candidate,
                  company
                )}
              </p>
            )
          )}
        </div>

        {/* TERMS & CONDITIONS */}
        {candidateTemplate.showTermsConditions && candidateTemplate.termsConditions.length > 0 && (
          <div className="offer-generator-letter-terms">
            <h3>Terms &amp; Conditions</h3>
            <ol>
              {candidateTemplate.termsConditions.map((term, index) => (
                <li key={`${candidate.letterType}-term-${index}`}>
                  {replaceTokens(
                    term,
                    candidate,
                    company
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* CLOSING */}
        <div className="offer-generator-letter-closing">
          <div>
            {replaceTokens(
              candidateTemplate.closing,
              candidate,
              company
            )}
          </div>

          {candidateTemplate.showSignature && (
            <div className="offer-generator-signature">
              {company.signatureImage && (
                <div
                  className="offer-generator-signature-space"
                  style={
                    {
                      "--signature-space-height": `${signatureSpaceHeightMm}mm`,
                    } as CSSProperties
                  }
                >
                  <img
                    src={company.signatureImage}
                    alt="Authorized signature"
                    className="offer-generator-signature-image"
                    draggable={false}
                    onLoad={handleSignatureImageLoad}
                    onPointerDown={handleSignaturePointerDown}
                    onPointerMove={handleSignaturePointerMove}
                    onPointerUp={handleSignaturePointerUp}
                    onPointerCancel={handleSignaturePointerUp}
                    style={
                      {
                        "--signature-x": `${signatureXmm}mm`,
                        "--signature-y": `${signatureYmm}mm`,
                        "--signature-width": `${signatureWidthMm}mm`,
                      } as CSSProperties
                    }
                  />
                </div>
              )}

              <strong>
                {company.hrName ||
                  "HR Name"}
              </strong>

              <span>
                {company.hrDesignation ||
                  "HR Designation"}
              </span>

              <span>
                {company.name ||
                  "Company Name"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="offer-generator-page">
      <div className="offer-generator-container">

        <a
          href="/tools"
          className="offer-generator-back-to-tools"
          aria-label="Back to Tools"
        >
          <span aria-hidden="true">←</span>
          Back to Tools
        </a>

        {/* HEADER */}
        <div className="offer-generator-header">
          <div>
            <h1>
              AI Offer &amp; Joining Letter
              Generator
            </h1>

            <p>
              Create professional offer,
              appointment, joining and
              internship letters in minutes.
            </p>
          </div>

          <div className="offer-generator-header-badge">
            <span className="offer-generator-status-dot" />
            Live Preview
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="offer-generator-layout">

          {/* LEFT SIDE */}
          <div className="offer-generator-editor">

            {/* COMPANY DETAILS */}
            <section className="offer-generator-card">
              <div className="offer-generator-section-header">
                <div>
                  <h2>
                    Company Details
                  </h2>

                  <p>
                    Enter the company
                    information that will
                    appear on the letter.
                  </p>
                </div>
              </div>

              <div className="offer-generator-form-grid">

                <div className="offer-generator-field">
                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    value={company.name}
                    onChange={(event) =>
                      updateCompany(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Company name"
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    Website
                  </label>

                  <input
                    type="text"
                    value={
                      company.website
                    }
                    onChange={(event) =>
                      updateCompany(
                        "website",
                        event.target.value
                      )
                    }
                    placeholder="www.example.com"
                  />
                </div>

                <div className="offer-generator-field offer-generator-field-full">
                  <label>
                    Address
                  </label>

                  <input
                    type="text"
                    value={
                      company.addressLine
                    }
                    onChange={(event) =>
                      updateCompany(
                        "addressLine",
                        event.target.value
                      )
                    }
                    placeholder="Office address"
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    City / State
                  </label>

                  <input
                    type="text"
                    value={
                      company.cityLine
                    }
                    onChange={(event) =>
                      updateCompany(
                        "cityLine",
                        event.target.value
                      )
                    }
                    placeholder="City, State"
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    Letter Date
                  </label>

                  <input
                    type="date"
                    value={
                      company.letterDate
                    }
                    onChange={(event) =>
                      updateCompany(
                        "letterDate",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    HR Name
                  </label>

                  <input
                    type="text"
                    value={company.hrName}
                    onChange={(event) =>
                      updateCompany(
                        "hrName",
                        event.target.value
                      )
                    }
                    placeholder="HR name"
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    HR Designation
                  </label>

                  <input
                    type="text"
                    value={
                      company.hrDesignation
                    }
                    onChange={(event) =>
                      updateCompany(
                        "hrDesignation",
                        event.target.value
                      )
                    }
                    placeholder="HR designation"
                  />
                </div>

                <div className="offer-generator-field offer-generator-field-full">
                  <label>
                    Company Logo
                  </label>

                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    onChange={
                      handleLogoUpload
                    }
                  />

                  {company.logo && (
                    <div className="offer-generator-logo-preview">
                      <img
                        src={company.logo}
                        alt="Company logo"
                      />

                      <button
                        type="button"
                        className="offer-generator-button offer-generator-button-secondary"
                        onClick={() => {
                          setCompany((current) => ({
                            ...current,
                            logo: "",
                          }));
                          setLogoEditorOpen(false);
                          resetLogoPosition();
                        }}
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}

                  {company.logo && (
                    <div className="offer-generator-logo-editor-wrap">
                      <button type="button" className="offer-generator-button offer-generator-button-secondary" onClick={() => setLogoEditorOpen((current) => !current)}>
                        {logoEditorOpen ? "Close Logo Editor" : "Logo Editor"}
                      </button>
                      {logoEditorOpen && (
                        <div className="offer-generator-logo-editor">
                          <div className="offer-generator-logo-editor-heading">
                            <div><strong>Logo Position &amp; Size</strong><p>Drag the logo on the A4 preview, or use the exact controls below.</p></div>
                            <button type="button" className="offer-generator-button offer-generator-button-secondary" onClick={resetLogoPosition}>Reset</button>
                          </div>
                          <div className="offer-generator-logo-editor-placement">
                            <span>Logo placement</span>
                            <button
                              type="button"
                              className={`offer-generator-button offer-generator-button-secondary${logoPlacement === "left" ? " is-active" : ""}`}
                              onClick={() => {
                                setLogoPlacement("left");
                                setLogoXmm(0);
                                setLogoYmm(0);
                              }}
                            >
                              Logo Left
                            </button>
                            <button
                              type="button"
                              className={`offer-generator-button offer-generator-button-secondary${logoPlacement === "center" ? " is-active" : ""}`}
                              onClick={() => {
                                setLogoPlacement("center");
                                setLogoXmm(0);
                                setLogoYmm(0);
                              }}
                            >
                              Logo Center
                            </button>
                          </div>
                          <div className="offer-generator-logo-editor-grid">
                            <div className="offer-generator-field"><label htmlFor="logo-position-x">Horizontal (mm)</label><input id="logo-position-x" type="number" min="-20" max="100" step="0.5" value={Number(logoXmm.toFixed(1))} onChange={(event) => updateLogoPosition("x", event.target.value)} /></div>
                            <div className="offer-generator-field"><label htmlFor="logo-position-y">Vertical (mm)</label><input id="logo-position-y" type="number" min="-20" max="50" step="0.5" value={Number(logoYmm.toFixed(1))} onChange={(event) => updateLogoPosition("y", event.target.value)} /></div>
                            <div className="offer-generator-field"><label htmlFor="logo-width">Logo width (mm)</label><input id="logo-width" type="number" min="10" max="80" step="0.5" value={Number(logoWidthMm.toFixed(1))} onChange={(event) => updateLogoWidth(event.target.value)} /></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                <div className="offer-generator-field offer-generator-field-full">
                  <label>Authorized Signature</label>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    onChange={handleSignatureUpload}
                  />
                  <p className="offer-generator-field-help">
                    Optional. Upload the authorized signatory's signature. PNG, JPG, JPEG or SVG.
                  </p>
                  {company.signatureImage && (
                    <div className="offer-generator-signature-upload-preview">
                      <div className="offer-generator-signature-upload-preview-box">
                        <img
                          src={company.signatureImage}
                          alt="Authorized signature preview"
                        />
                      </div>
                      <div className="offer-generator-signature-upload-actions">
                        <button
                          type="button"
                          className="offer-generator-button offer-generator-button-secondary"
                          onClick={() =>
                            setSignatureEditorOpen((current) => !current)
                          }
                        >
                          {signatureEditorOpen
                            ? "Close Editor"
                            : "Edit Signature"}
                        </button>

                        <button
                          type="button"
                          className="offer-generator-button offer-generator-button-secondary"
                          onClick={() => {
                            setCompany((current) => ({
                              ...current,
                              signatureImage: "",
                            }));
                            resetSignaturePosition();
                            setSignatureEditorOpen(false);
                          }}
                        >
                          Remove Signature
                        </button>
                      </div>

                      {signatureEditorOpen && (
                        <div className="offer-generator-signature-editor">
                          <div className="offer-generator-signature-editor-heading">
                            <div>
                              <strong>Signature Position</strong>
                              <p>
                                Drag the signature on the A4 preview, or use the exact controls below.
                              </p>
                            </div>
                            <button
                              type="button"
                              className="offer-generator-button offer-generator-button-secondary"
                              onClick={resetSignaturePosition}
                            >
                              Reset
                            </button>
                          </div>

                          <div className="offer-generator-signature-editor-grid">
                            <div className="offer-generator-field">
                              <label htmlFor="signature-position-x">
                                Horizontal (mm)
                              </label>
                              <input
                                id="signature-position-x"
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={signatureXmm}
                                onChange={(event) =>
                                  updateSignaturePosition(
                                    "x",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="offer-generator-field">
                              <label htmlFor="signature-position-y">
                                Vertical (mm)
                              </label>
                              <input
                                id="signature-position-y"
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={signatureYmm}
                                onChange={(event) =>
                                  updateSignaturePosition(
                                    "y",
                                    event.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="offer-generator-field">
                              <label htmlFor="signature-width">
                                Signature width (mm)
                              </label>
                              <input
                                id="signature-width"
                                type="number"
                                min="20"
                                max="80"
                                step="0.5"
                                value={signatureWidthMm}
                                onChange={(event) =>
                                  updateSignatureWidth(
                                    event.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* PAGE MARGINS */}
                <div className="offer-generator-page-margins-editor">
                  <div className="offer-generator-content-heading">
                    <div>
                      <h3>Page Margins</h3>
                      <p>Adjust the printable A4 margins. Default is Word-style 1 inch.</p>
                    </div>
                  </div>

                  <div className="offer-generator-margin-presets" role="group" aria-label="Margin presets">
                    <button
                      type="button"
                      className={
                        Object.values(pageMargins).every((value) => value === 25.4)
                          ? "active"
                          : ""
                      }
                      onClick={() => applyPageMarginPreset(25.4)}
                    >
                      Word Default
                    </button>
                    <button
                      type="button"
                      className={
                        Object.values(pageMargins).every((value) => value === 20)
                          ? "active"
                          : ""
                      }
                      onClick={() => applyPageMarginPreset(20)}
                    >
                      Standard
                    </button>
                    <button
                      type="button"
                      className={
                        Object.values(pageMargins).every((value) => value === 15)
                          ? "active"
                          : ""
                      }
                      onClick={() => applyPageMarginPreset(15)}
                    >
                      Compact
                    </button>
                  </div>

                  <div className="offer-generator-margin-grid">
                    {([
                      ["top", "Top"],
                      ["right", "Right"],
                      ["bottom", "Bottom"],
                      ["left", "Left"],
                    ] as const).map(([side, label]) => (
                      <div className="offer-generator-field" key={side}>
                        <label htmlFor={`letter-margin-${side}`}>
                          {label} margin (mm)
                        </label>
                        <input
                          id={`letter-margin-${side}`}
                          type="number"
                          min="10"
                          max="40"
                          step="0.1"
                          value={pageMargins[side]}
                          onChange={(event) =>
                            updatePageMargin(side, event.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <p className="offer-generator-field-help">
                    Recommended for normal office printing: 25.4 mm on all sides. Keep each margin between 10 and 40 mm.
                  </p>
                </div>

                <div className="offer-generator-terms-editor">
                  <div className="offer-generator-content-heading">
                    <div>
                      <h3>Terms &amp; Conditions</h3>
                      <p>Optional and fully editable for this letter type.</p>
                    </div>

                    <div className="offer-generator-content-heading-actions">
                      <button
                        type="button"
                        className="offer-generator-terms-minimize"
                        onClick={() => setTermsMinimized((current) => !current)}
                        aria-expanded={!termsMinimized}
                        aria-label={termsMinimized ? "Expand Terms & Conditions" : "Minimize Terms & Conditions"}
                        title={termsMinimized ? "Expand Terms & Conditions" : "Minimize Terms & Conditions"}
                      >
                        {termsMinimized ? "⌄" : "⌃"}
                      </button>
                      <button
                        type="button"
                        className="offer-generator-button"
                        onClick={resetTermsToDefault}
                      >
                        Default
                      </button>

                      <button
                        type="button"
                        className="offer-generator-terms-toggle"
                      onClick={() =>
                        updateTemplate(
                          "showTermsConditions",
                          !currentTemplate.showTermsConditions
                        )
                      }
                    >
                      {currentTemplate.showTermsConditions ? "Remove" : "Add"}
                    </button>
                  </div>
                  </div>

                  {currentTemplate.showTermsConditions && !termsMinimized && (
                    <>
                      {currentTemplate.termsConditions.map((term, index) => (
                        <div
                          key={`${templateType}-term-editor-${index}`}
                          className="offer-generator-term-field"
                        >
                          <label>Condition {index + 1}</label>
                          <div className="offer-generator-term-row">
                            <textarea
                              rows={3}
                              value={term}
                              onChange={(event) =>
                                updateTerm(index, event.target.value)
                              }
                            />
                            <button
                              type="button"
                              className="offer-generator-term-remove"
                              onClick={() => removeTerm(index)}
                              title="Remove condition"
                              aria-label={`Remove condition ${index + 1}`}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="offer-generator-term-add"
                        onClick={addTerm}
                      >
                        + Add Condition
                      </button>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* CANDIDATES */}
            <section className="offer-generator-card">

              <div className="offer-generator-section-header">
                <div>
                  <h2>
                    Candidates
                  </h2>

                  <p>
                    Add candidates
                    individually and
                    generate their
                    personalized letters.
                  </p>
                </div>

                <div className="offer-generator-candidate-count">
                  {selectedCandidates.length}{" "}
                  selected
                </div>
              </div>

              {/* TABS */}
              <div className="offer-generator-tabs">
                <button
                  type="button"
                  className={
                    candidateTab ===
                    "single"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCandidateTab(
                      "single"
                    )
                  }
                >
                  Single Candidate
                </button>

                <button
                  type="button"
                  disabled
                >
                  Bulk Import
                </button>

                <button
                  type="button"
                  disabled
                >
                  Paste Data
                </button>
              </div>

              {/* LETTER TYPE + STYLE + COLOR */}
              <div className="offer-generator-inline-template-selector">
                <div className="offer-generator-inline-template-header">
                  <h3>Letter Template</h3>
                  <p>Choose the document type, visual style and accent color.</p>
                </div>

                <div className="offer-generator-template-selector">
                  <button type="button" className={templateType === "offer" ? "active" : ""} onClick={() => changeTemplateType("offer")}>
                    <span className="offer-generator-template-icon icon-file-text" />
                    <strong>Offer Letter</strong>
                    <span>Employment offer</span>
                  </button>
                  <button type="button" className={templateType === "appointment" ? "active" : ""} onClick={() => changeTemplateType("appointment")}>
                    <span className="offer-generator-template-icon icon-file-text" />
                    <strong>Appointment Letter</strong>
                    <span>Formal appointment</span>
                  </button>
                  <button type="button" className={templateType === "joining" ? "active" : ""} onClick={() => changeTemplateType("joining")}>
                    <span className="offer-generator-template-icon icon-file-text" />
                    <strong>Joining Letter</strong>
                    <span>Joining confirmation</span>
                  </button>
                  <button type="button" className={templateType === "internship" ? "active" : ""} onClick={() => changeTemplateType("internship")}>
                    <span className="offer-generator-template-icon icon-file-text" />
                    <strong>Internship Letter</strong>
                    <span>Internship offer</span>
                  </button>
                </div>

                <div className="offer-generator-style-controls">
                  <div className="offer-generator-style-group">
                    <label>Letter Style</label>
                    <div className="offer-generator-style-options">
                      <button
                        type="button"
                        className={isNooradoDefault ? "active" : ""}
                        onClick={() => {
                          setLetterStyle("modern");
                          setLetterColor("navy");
                          setIsNooradoDefault(true);
                        }}
                      >
                        <span className="style-preview-dot style-modern" />
                        Default
                      </button>
                      {([
                        ["classic", "Classic"],
                        ["modern", "Modern"],
                        ["minimal", "Minimal"],
                        ["elegant", "Elegant"],
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          className={letterStyle === value ? "active" : ""}
                          onClick={() => {
                            setLetterStyle(value);
                            setIsNooradoDefault(false);
                          }}
                        >
                          <span className={`style-preview-dot style-${value}`} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="offer-generator-style-group">
                    <label>Accent Color</label>
                    <div className="offer-generator-color-options">
                      {([
                        ["navy", "Navy", "#1f3557"],
                        ["green", "Green", "#176b52"],
                        ["burgundy", "Burgundy", "#7a263a"],
                        ["purple", "Purple", "#5b3f8c"],
                        ["black", "Black", "#222222"],
                      ] as const).map(([value, label, hex]) => (
                        <button
                          key={value}
                          type="button"
                          className={letterColor === value ? "active" : ""}
                          onClick={() => {
                            setLetterColor(value);
                            setIsNooradoDefault(false);
                          }}
                          title={label}
                        >
                          <span className="offer-generator-color-swatch" style={{ backgroundColor: hex }} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CANDIDATE FORM */}
              <div className="offer-generator-candidate-form">

                {editingCandidateId && (
                  <div className="offer-generator-edit-banner">
                    <div>
                      <strong>
                        Editing candidate
                      </strong>

                      <span>
                        Changes are shown
                        live in the A4
                        preview.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={
                        cancelCandidateEdit
                      }
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                <div className="offer-generator-form-grid">

                  <div className="offer-generator-field">
                    <label>
                      Full Name *
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.name
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Rahul Verma"
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      Designation
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.designation
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "designation",
                          event.target.value
                        )
                      }
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      Department
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.department
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "department",
                          event.target.value
                        )
                      }
                      placeholder="Engineering"
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      {getCandidateFieldLabel(
                        "salary"
                      )}
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.salary
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "salary",
                          event.target.value
                        )
                      }
                      placeholder={
                        getSalaryPlaceholder()
                      }
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      {getCandidateFieldLabel(
                        "joiningDate"
                      )}
                    </label>

                    <input
                      type="date"
                      value={
                        candidateForm.joiningDate
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "joiningDate",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      Location
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.location
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "location",
                          event.target.value
                        )
                      }
                      placeholder="Bengaluru"
                    />
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      Employment Type
                    </label>

                    <select
                      value={
                        candidateForm.employmentType
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "employmentType",
                          event.target.value
                        )
                      }
                    >
                      <option value="Full-time">
                        Full-time
                      </option>

                      <option value="Part-time">
                        Part-time
                      </option>

                      <option value="Contract">
                        Contract
                      </option>

                      <option value="Internship">
                        Internship
                      </option>

                      <option value="Temporary">
                        Temporary
                      </option>
                    </select>
                  </div>

                  <div className="offer-generator-field">
                    <label>
                      Reporting Manager
                    </label>

                    <input
                      type="text"
                      value={
                        candidateForm.reportingManager
                      }
                      onChange={(event) =>
                        updateCandidateForm(
                          "reportingManager",
                          event.target.value
                        )
                      }
                      placeholder="Ananya Rao"
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="offer-generator-candidate-form-actions">

                  <button
                    type="button"
                    className="offer-generator-button offer-generator-button-primary offer-generator-add-candidate"
                    onClick={
                      addCandidate
                    }
                  >
                    {editingCandidateId
                      ? "Save Changes"
                      : "Add Candidate"}
                  </button>

                  {editingCandidateId && (
                    <button
                      type="button"
                      className="offer-generator-button offer-generator-button-secondary"
                      onClick={
                        cancelCandidateEdit
                      }
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* CANDIDATE LIST */}
              <div className="offer-generator-candidate-list">

                <div className="offer-generator-candidate-list-header">

                  <div>
                    <strong>
                      Candidate List
                    </strong>

                    <span>
                      {candidates.length}{" "}
                      candidate
                      {candidates.length !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>

                  <div className="offer-generator-list-actions">
                    <button
                      type="button"
                      onClick={
                        selectAllCandidates
                      }
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        deselectAllCandidates
                      }
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* SEARCH */}
                <div className="offer-generator-search">
                  <span className="offer-generator-search-icon">
                    Search
                  </span>

                  <input
                    type="search"
                    value={
                      candidateSearch
                    }
                    onChange={(event) =>
                      setCandidateSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search candidates by name, designation, department..."
                  />

                  {candidateSearch && (
                    <button
                      type="button"
                      onClick={() =>
                        setCandidateSearch(
                          ""
                        )
                      }
                      aria-label="Clear candidate search"
                    >
                      ×
                    </button>
                  )}
                </div>

                {filteredCandidates.length ===
                0 ? (
                  <div className="offer-generator-empty-state">
                    <strong>
                      No matching
                      candidates.
                    </strong>

                    <p>
                      Try a different
                      search term.
                    </p>
                  </div>
                ) : (
                  <div className="offer-generator-candidates">

                    {filteredCandidates.map(
                      (candidate) => (
                        <div
                          key={
                            candidate.id
                          }
                          className={`offer-generator-candidate-row ${
                            candidate.selected
                              ? "selected"
                              : ""
                          } ${
                            previewCandidateId ===
                            candidate.id
                              ? "previewing"
                              : ""
                          }`}
                        >

                          <div className="offer-generator-candidate-main">

                            <input
                              type="checkbox"
                              checked={
                                candidate.selected
                              }
                              onChange={() =>
                                toggleCandidate(
                                  candidate.id
                                )
                              }
                            />

                            <div className="offer-generator-candidate-info">

                              <strong>
                                {
                                  candidate.name
                                }
                              </strong>

                              <span>
                                {candidate.designation ||
                                  "Designation not added"}
                              </span>

                              <div className="offer-generator-candidate-meta">

                                {candidate.department && (
                                  <span>
                                    {
                                      candidate.department
                                    }
                                  </span>
                                )}

                                {candidate.salary && (
                                  <span>
                                    {
                                      candidate.salary
                                    }
                                  </span>
                                )}

                                {candidate.joiningDate && (
                                  <span>
                                    {formatDate(
                                      candidate.joiningDate
                                    )}
                                  </span>
                                )}

                                {candidate.location && (
                                  <span>
                                    {
                                      candidate.location
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="offer-generator-candidate-actions">

                            <button
                              type="button"
                              onClick={() =>
                                editCandidate(
                                  candidate
                                )
                              }
                            >
                              ✎ Edit
                            </button>

                            <button
                              type="button"
                              className={
                                previewCandidateId ===
                                candidate.id
                                  ? "active"
                                  : ""
                              }
                              onClick={() =>
                                previewSingleCandidate(
                                  candidate
                                )
                              }
                            >
                              👁 Preview
                            </button>

                            <button
  type="button"
  onClick={() => downloadSingleLetter(candidate)}
  title="Download"
  aria-label="Download"
>
  <span className="icon-download" />
</button>

                            <button
  type="button"
  onClick={() => removeCandidate(candidate.id)}
  title="Remove"
  aria-label="Remove"
>
  <span className="icon-trash" />
</button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* PREVIEW ALL */}
                <div className="offer-generator-preview-all-bar">

                  <div>
                    <strong>
                      {selectedCandidates.length}{" "}
                      selected candidates
                    </strong>

                    <span>
                      Preview their letters
                      together.
                    </span>
                  </div>

                  <div className="offer-generator-preview-all-actions">
                    <button
                      type="button"
                      className="offer-generator-button offer-generator-button-primary"
                      onClick={
                        previewAllSelected
                      }
                    >
                      Preview All Candidates
                    </button>

                    <button
                      type="button"
                      className="offer-generator-button"
                      onClick={
                        downloadAllLetters
                      }
                      disabled={
                        selectedCandidates.length === 0
                      }
                    >
                      Download All Letters
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* LETTER TEMPLATE */}
            <section className="offer-generator-card">

              <div className="offer-generator-section-header">
                <div>
                  <h2>
                    Letter Content
                  </h2>

                  <p>
                    Customize the content of the selected letter template.
                  </p>
                </div>
              </div>

              <div className="offer-generator-template-form">

                <div className="offer-generator-field">
                  <label>
                    Subject
                  </label>

                  <input
                    type="text"
                    value={
                      currentTemplate.subject
                    }
                    onChange={(event) =>
                      updateTemplate(
                        "subject",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    Salutation
                  </label>

                  <input
                    type="text"
                    value={
                      currentTemplate.salutation
                    }
                    onChange={(event) =>
                      updateTemplate(
                        "salutation",
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="offer-generator-field">
                  <label>
                    Closing
                  </label>

                  <input
                    type="text"
                    value={
                      currentTemplate.closing
                    }
                    onChange={(event) =>
                      updateTemplate(
                        "closing",
                        event.target.value
                      )
                    }
                  />
                </div>

                <label className="offer-generator-checkbox-field">
                  <input
                    type="checkbox"
                    checked={
                      currentTemplate.showSignature
                    }
                    onChange={(event) =>
                      updateTemplate(
                        "showSignature",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    Show HR signature
                    section
                  </span>
                </label>

                <div className="offer-generator-paragraph-editor">

                  <div className="offer-generator-content-heading">
                    <div>
                      <h3>
                        Letter Content
                      </h3>

                      <p>
                        Changes appear
                        instantly in the
                        A4 preview.
                      </p>
                    </div>

                    <div className="offer-generator-content-heading-actions">
                      <button
                        type="button"
                        className="offer-generator-button"
                        onClick={
                          resetLetterParagraphsToDefault
                        }
                      >
                        Default
                      </button>

                      <span>
                        {
                          currentTemplate
                            .paragraphs
                            .length
                        }{" "}
                        paragraphs
                      </span>
                    </div>
                  </div>

                  {currentTemplate.paragraphs.map(
                    (
                      paragraph,
                      index
                    ) => (
                      <div
                        key={
                          paragraph.id
                        }
                        className="offer-generator-paragraph-field"
                      >
                        <label>
                          Paragraph{" "}
                          {index + 1}
                        </label>

                        <textarea
                          rows={4}
                          value={
                            paragraph.text
                          }
                          onChange={(
                            event
                          ) =>
                            updateParagraph(
                              paragraph.id,
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="offer-generator-preview-column">

            <div className="offer-generator-preview-header">

              <div>
                <h2>
                  {previewAll
                    ? "All Candidate Previews"
                    : "A4 Preview"}
                </h2>

                <p>
                  {previewAll
                    ? `${selectedCandidates.length} selected candidate letters`
                    : "Live preview of the selected candidate's letter."}
                </p>
              </div>

              <div className="offer-generator-preview-header-actions">

                {previewAll && (
                  <button
                    type="button"
                    className="offer-generator-preview-mode-button"
                    onClick={() =>
                      setPreviewAll(
                        false
                      )
                    }
                  >
                    Single Preview
                  </button>
                )}

                <div className="offer-generator-preview-status">
                  {previewCandidate
                    ? "Ready"
                    : "No Candidate"}
                </div>
              </div>
            </div>

            {previewAll ? (
              <div className="offer-generator-all-preview">
                {selectedCandidates.map(
                  (
                    candidate,
                    index
                  ) =>
                    renderLetterPage(
                      candidate,
                      index
                    )
                )}
              </div>
            ) : (
              <div className="offer-generator-a4-wrapper">
                {previewCandidate ? (
                  renderLetterPage(
                    previewCandidate
                  )
                ) : (
                  <div className="offer-generator-a4-empty">
                    <strong>
                      No candidate selected
                    </strong>

                    <p>
                      Add or select a
                      candidate to
                      generate the
                      letter preview.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {warningMessage && (
        <div
          className="offer-generator-warning-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeWarning();
            }
          }}
        >
          <div
            className="offer-generator-warning-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="offer-generator-warning-title"
            aria-describedby="offer-generator-warning-message"
          >
            <div
              className="offer-generator-warning-icon"
              aria-hidden="true"
            >
              !
            </div>

            <div className="offer-generator-warning-content">
              <h3 id="offer-generator-warning-title">
                {warningConfirmAction
                  ? "Change Letter Type?"
                  : "Please check this"}
              </h3>

              <p id="offer-generator-warning-message">
                {warningMessage}
              </p>
            </div>

            <button
              type="button"
              className="offer-generator-warning-close"
              aria-label="Close warning"
              onClick={closeWarning}
            >
              ×
            </button>

            {warningConfirmAction ? (
              <div className="offer-generator-warning-actions">
                <button
                  type="button"
                  className="offer-generator-warning-cancel"
                  onClick={closeWarning}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="offer-generator-warning-button"
                  onClick={() => {
                    warningConfirmAction();
                  }}
                >
                  Continue
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="offer-generator-warning-button"
                onClick={closeWarning}
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default OfferJoiningLetterGeneratorPage;
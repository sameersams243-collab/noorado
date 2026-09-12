import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, PointerEvent, SyntheticEvent } from "react";
import JSZip from "jszip";
import "./OfferJoiningLetterGeneratorPage.css";

type TemplateType =
  | "offer"
  | "appointment"
  | "joining"
  | "internship"
  | "custom";

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
  table?: CustomTable;
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

type CustomField = {
  id: string;
  name: string;
  value: string;
};

type DynamicFieldDefinition = {
  name: string;
  label: string;
  source: "candidate" | "company" | "derived" | "custom";
  candidateField?: keyof CandidateForm;
};

type DynamicValues = Record<string, string>;

const COMMON_PLACEHOLDERS: DynamicFieldDefinition[] = [
  { name: "candidateName", label: "Full Name", source: "candidate", candidateField: "name" },
  { name: "candidateEmail", label: "Email", source: "candidate", candidateField: "email" },
  { name: "candidatePhone", label: "Phone", source: "candidate", candidateField: "phone" },
  { name: "candidateAddress", label: "Address", source: "candidate", candidateField: "address" },
  { name: "firstName", label: "First Name", source: "derived" },
  { name: "lastName", label: "Last Name", source: "derived" },
  { name: "designation", label: "Designation", source: "candidate", candidateField: "designation" },
  { name: "department", label: "Department", source: "candidate", candidateField: "department" },
  { name: "salary", label: "Salary", source: "candidate", candidateField: "salary" },
  { name: "annualCTC", label: "Annual CTC", source: "derived" },
  { name: "monthlySalary", label: "Monthly Salary", source: "derived" },
  { name: "joiningDate", label: "Joining Date", source: "candidate", candidateField: "joiningDate" },
  { name: "location", label: "Location", source: "candidate", candidateField: "location" },
  { name: "employmentType", label: "Employment Type", source: "candidate", candidateField: "employmentType" },
  { name: "reportingManager", label: "Reporting Manager", source: "candidate", candidateField: "reportingManager" },
  { name: "companyName", label: "Company Name", source: "company" },
  { name: "companyWebsite", label: "Company Website", source: "company" },
  { name: "companyAddress", label: "Company Address", source: "company" },
  { name: "companyCity", label: "Company City", source: "company" },
  { name: "companyState", label: "Company State", source: "company" },
  { name: "hrName", label: "HR Name", source: "company" },
  { name: "hrDesignation", label: "HR Designation", source: "company" },
  { name: "letterDate", label: "Letter Date", source: "company" },
  { name: "Schoo", label: "Schoo", source: "custom" },
];

const COMMON_PLACEHOLDER_ALIASES: Record<string, string> = {
  candidate_name: "candidateName",
  candidate_email: "candidateEmail",
  candidate_phone: "candidatePhone",
  candidate_address: "candidateAddress",
  joining_date: "joiningDate",
  employment_type: "employmentType",
  reporting_manager: "reportingManager",
  company_name: "companyName",
};

const normalizePlaceholderToken = (token: string) =>
  COMMON_PLACEHOLDER_ALIASES[token] || token;

const COMMON_PLACEHOLDER_MAP = new Map(
  COMMON_PLACEHOLDERS.map((field) => [field.name, field])
);

const extractPlaceholderNames = (text: string): string[] => {
  const names = new Set<string>();
  const pattern = /{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    names.add(match[1]);
  }

  return Array.from(names);
};

const humanizePlaceholder = (name: string) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

/**
 * Friendly phrase shortcuts for template authors.
 *
 * The user can type normal words in a letter instead of manually writing
 * {{...}}. On blur, phrases outside existing placeholders are converted to
 * placeholders. Any phrase that is not a predefined/common field becomes a
 * dynamic candidate field automatically.
 */
const COMMON_PHRASE_SHORTCUTS: Array<{ phrase: string; token: string }> = [
  { phrase: "annual ctc", token: "annualCTC" },
  { phrase: "monthly salary", token: "monthlySalary" },
  { phrase: "joining date", token: "joiningDate" },
  { phrase: "employment type", token: "employmentType" },
  { phrase: "reporting manager", token: "reportingManager" },
  { phrase: "full name", token: "candidateName" },
  { phrase: "first name", token: "firstName" },
  { phrase: "last name", token: "lastName" },
  { phrase: "company name", token: "companyName" },
  { phrase: "company website", token: "companyWebsite" },
  { phrase: "company address", token: "companyAddress" },
  { phrase: "hr name", token: "hrName" },
  { phrase: "hr designation", token: "hrDesignation" },
  { phrase: "school name", token: "schoolName" },
  { phrase: "probation period", token: "probationPeriod" },
  { phrase: "notice period", token: "noticePeriod" },
  { phrase: "work mode", token: "workMode" },
  { phrase: "parent name", token: "parentName" },
  { phrase: "student name", token: "studentName" },
  { phrase: "roll number", token: "rollNumber" },
  { phrase: "leave from", token: "leaveFrom" },
  { phrase: "leave to", token: "leaveTo" },
  { phrase: "reason for leave", token: "reasonForLeave" },
  { phrase: "ctc", token: "CTC" },
];

const convertCommonPhrasesToPlaceholders = (text: string) => {
  if (!text.trim()) return text;

  return text
    .split(/(\{\{[^}]*\}\})/g)
    .map((segment) => {
      if (/^\{\{.*\}\}$/.test(segment)) return segment;

      return COMMON_PHRASE_SHORTCUTS.reduce(
        (result, shortcut) => {
          const escapedPhrase = shortcut.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return result.replace(
            new RegExp(`\\b${escapedPhrase}\\b`, "gi"),
            `{{${shortcut.token}}}`
          );
        },
        segment
      );
    })
    .join("");
};

const convertTrailingCommonPhraseToPlaceholder = (text: string) => {
  if (!text.trim()) return text;

  const lastPlaceholderStart = text.lastIndexOf("{{");
  const lastPlaceholderEnd = text.lastIndexOf("}}");
  if (lastPlaceholderStart > lastPlaceholderEnd) return text;

  for (const shortcut of COMMON_PHRASE_SHORTCUTS) {
    const escapedPhrase = shortcut.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escapedPhrase}$`, "i");
    if (!pattern.test(text)) continue;

    return text.replace(pattern, (_match, prefix: string) =>
      `${prefix}{{${shortcut.token}}}`
    );
  }

  return text;
};

type CustomTableBorderStyle = "solid" | "dotted" | "dashed" | "none";

type CustomTableColor = "navy" | "blue" | "green" | "burgundy" | "purple" | "slate" | "gold";

type CustomTable = {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
  borderStyle: CustomTableBorderStyle;
  color: CustomTableColor;
  /** Browser-preview layout model. Widths are percentages and heights are px. */
  columnWidths?: number[];
  rowHeights?: number[];
};

const CUSTOM_TABLE_COLORS: Array<[CustomTableColor, string]> = [
  ["navy", "Navy"],
  ["blue", "Blue"],
  ["green", "Green"],
  ["burgundy", "Burgundy"],
  ["purple", "Purple"],
  ["slate", "Slate"],
  ["gold", "Gold"],
];


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
  email: string;
  phone: string;
  address: string;
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

const getCustomTableColorStyle = (color: CustomTableColor) => {
  const styles: Record<CustomTableColor, { header: string; headerText: string; border: string; text: string }> = {
    navy: { header: "#16233d", headerText: "#ffffff", border: "#b8c2d1", text: "#273247" },
    blue: { header: "#1d4ed8", headerText: "#ffffff", border: "#b9c7ea", text: "#24324d" },
    green: { header: "#18794e", headerText: "#ffffff", border: "#b8d9ca", text: "#234233" },
    burgundy: { header: "#7f1d3d", headerText: "#ffffff", border: "#e1bcc8", text: "#4a2733" },
    purple: { header: "#6d28d9", headerText: "#ffffff", border: "#d4c6ef", text: "#3a2d50" },
    slate: { header: "#475569", headerText: "#ffffff", border: "#cbd5e1", text: "#334155" },
    gold: { header: "#a46b16", headerText: "#ffffff", border: "#e1cfad", text: "#4b3a1d" },
  };
  return styles[color] || styles.navy;
};

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
  email: "",
  phone: "",
  address: "",
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

  custom: {
    subject: "Custom Letter",
    salutation: "Dear {{candidateName}},",
    closing: "Sincerely,",
    showSignature: true,
    paragraphs: [
      {
        id: "custom-1",
        text: "Write your custom letter content here.",
      },
    ],
    termsConditions: [],
    showTermsConditions: false,
  },
};

const demoCandidates: Candidate[] = [
  {
    id: "candidate-1",
    name: "Rahul Verma",
    email: "",
    phone: "",
    address: "",
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
    email: "",
    phone: "",
    address: "",
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





const hasCandidateFormData = (
  form: CandidateForm
) => {
  return Object.values(form).some((value) =>
    value.trim()
  );
};


const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const plainTextToRichHtml = (value: string) =>
  escapeHtml(value).replace(/\r?\n/g, "<br>");

const sanitizeRichHtml = (value: string) => {
  if (typeof window === "undefined") return plainTextToRichHtml(value);

  const parser = new DOMParser();
  const doc = parser.parseFromString(value || "", "text/html");
  const allowedTags = new Set([
    "STRONG", "B", "EM", "I", "U", "BR", "P", "DIV", "SPAN", "FONT",
    "UL", "OL", "LI"
  ]);
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  let current = walker.nextNode();
  while (current) {
    elements.push(current as Element);
    current = walker.nextNode();
  }

  for (const element of elements) {
    if (!allowedTags.has(element.tagName)) {
      const fragment = doc.createDocumentFragment();
      while (element.firstChild) fragment.appendChild(element.firstChild);
      element.parentNode?.replaceChild(fragment, element);
      continue;
    }

    const allowedAttributes = new Set(["style", "face", "size"]);
    for (const attribute of Array.from(element.attributes)) {
      if (!allowedAttributes.has(attribute.name.toLowerCase())) {
        element.removeAttribute(attribute.name);
      }
    }

    if (element.hasAttribute("style")) {
      const style = element.getAttribute("style") || "";
      const allowed = style
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .filter((part) => /^(color|background-color|font-size|font-family|text-align|font-weight|font-style|text-decoration)\s*:/i.test(part))
        .join("; ");
      if (allowed) element.setAttribute("style", allowed);
      else element.removeAttribute("style");
    }
  }

  return doc.body.innerHTML;
};

const transformRichTextNodes = (
  value: string,
  transform: (text: string) => string
) => {
  if (typeof window === "undefined") return value;
  const parser = new DOMParser();
  const doc = parser.parseFromString(value || "", "text/html");
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    node.nodeValue = transform(node.nodeValue || "");
  });

  return sanitizeRichHtml(doc.body.innerHTML);
};

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  ariaLabel?: string;
  compact?: boolean;
  selectionRef?: { current: Range | null; sync?: (() => void) | null; undo?: (() => void) | null; redo?: (() => void) | null };
};

const RICH_FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32] as const;
const RICH_FONT_FAMILIES = [
  ["Arial", "Arial, sans-serif"],
  ["Calibri", "Calibri, Arial, sans-serif"],
  ["Times New Roman", "'Times New Roman', serif"],
  ["Georgia", "Georgia, serif"],
  ["Verdana", "Verdana, sans-serif"],
  ["Trebuchet MS", "'Trebuchet MS', sans-serif"],
] as const;

const RichTextEditor = ({
  value,
  onChange,
  onBlur,
  placeholder,
  minHeight = 120,
  ariaLabel,
  compact = false,
  selectionRef,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const lastHtmlRef = useRef<string | null>(null);

  const getEditorHtml = (nextValue: string) => {
    if (!nextValue.trim()) return "";
    return /<(strong|b|em|i|u|br|p|div|span|font|ul|ol|li)(\s|>)|&(amp|lt|gt|quot|#39);/i.test(nextValue)
      ? sanitizeRichHtml(nextValue)
      : plainTextToRichHtml(nextValue);
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // The HTML model is the single source of truth. We only touch the DOM
    // when the incoming model is actually different, so typing locally keeps
    // its caret while changes from the preview side are reflected immediately.
    const nextHtml = getEditorHtml(value);
    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
    if (lastHtmlRef.current === null) lastHtmlRef.current = nextHtml;
  }, [value]);

  const emitCurrentHtml = () => {
    const editor = editorRef.current;
    if (!editor) return "";
    const html = sanitizeRichHtml(editor.innerHTML);
    if (editor.innerHTML !== html) editor.innerHTML = html;

    if (lastHtmlRef.current !== null && lastHtmlRef.current !== html) {
      undoStackRef.current.push(lastHtmlRef.current);
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();
      redoStackRef.current = [];
    }
    lastHtmlRef.current = html;
    onChange(html);
    return html;
  };

  const undo = () => {
    const editor = editorRef.current;
    if (!editor || undoStackRef.current.length === 0) return;
    const current = sanitizeRichHtml(editor.innerHTML);
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(current);
    editor.innerHTML = previous;
    lastHtmlRef.current = previous;
    onChange(previous);
  };

  const redo = () => {
    const editor = editorRef.current;
    if (!editor || redoStackRef.current.length === 0) return;
    const current = sanitizeRichHtml(editor.innerHTML);
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(current);
    editor.innerHTML = next;
    lastHtmlRef.current = next;
    onChange(next);
  };

  const restoreEditorSelection = () => {
    const editor = editorRef.current;
    const range = selectionRef?.current;
    if (!editor || !range) return false;
    if (!editor.contains(range.commonAncestorContainer)) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    try {
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch {
      return false;
    }
  };

  const runCommand = (command: string, commandValue?: string) => {
    if (command === "undo") {
      undo();
      return;
    }
    if (command === "redo") {
      redo();
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // Select controls (font, size, color, highlight) take focus and can
    // collapse the browser selection. Restore the last selection owned by
    // this editor before executing the command.
    restoreEditorSelection();
    try { document.execCommand("styleWithCSS", false, "true"); } catch { /* browser compatibility */ }
    document.execCommand(command, false, commandValue);
    emitCurrentHtml();
  };

  const applyFontSize = (px: number) => {
    const sizeMap: Record<number, string> = { 10: "1", 11: "2", 12: "3", 13: "3", 14: "4", 16: "4", 18: "5", 20: "5", 24: "6", 28: "6", 32: "7" };
    runCommand("fontSize", sizeMap[px] || "3");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
      return;
    }
    if (key === "y") {
      event.preventDefault();
      redo();
      return;
    }
    const command = key === "b" ? "bold" : key === "i" ? "italic" : key === "u" ? "underline" : null;
    if (!command) return;
    event.preventDefault();
    runCommand(command);
  };

  const toolButton = (label: string, title: string, command: string, commandValue?: string) => (
    <button type="button" className="offer-generator-rich-tool" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand(command, commandValue)} title={title} aria-label={title}>{label}</button>
  );

  const captureSelection = () => {
    if (!selectionRef || !editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return;
    selectionRef.current = range.cloneRange();
    selectionRef.sync = emitCurrentHtml;
    selectionRef.undo = undo;
    selectionRef.redo = redo;
  };

  return (
    <div className="offer-generator-rich-editor">
      <div className="offer-generator-rich-toolbar" role="toolbar" aria-label="Text formatting">
        {toolButton("B", "Bold (Ctrl+B)", "bold")}
        {toolButton("I", "Italic (Ctrl+I)", "italic")}
        {toolButton("U", "Underline (Ctrl+U)", "underline")}
        {!compact && <span className="offer-generator-rich-divider" />}
        {!compact && (
          <select className="offer-generator-rich-select offer-generator-rich-font" title="Font family" defaultValue="Arial" onMouseDown={() => captureSelection()} onChange={(event) => runCommand("fontName", event.target.value)}>
            {RICH_FONT_FAMILIES.map(([label, value]) => <option key={label} value={value}>{label}</option>)}
          </select>
        )}
        <select className="offer-generator-rich-select" title="Font size" defaultValue="13" onMouseDown={() => captureSelection()} onChange={(event) => applyFontSize(Number(event.target.value))}>
          {RICH_FONT_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
        </select>
        <label className="offer-generator-rich-color-control" title="Font color">
          <span>A</span><input type="color" defaultValue="#111827" onMouseDown={() => captureSelection()} onChange={(event) => runCommand("foreColor", event.target.value)} aria-label="Font color" />
        </label>
        {!compact && (
          <label className="offer-generator-rich-color-control" title="Text highlight">
            <span className="offer-generator-rich-highlight-icon">▰</span>
            <select
              className="offer-generator-rich-select offer-generator-rich-highlight-select"
              defaultValue=""
              onMouseDown={() => captureSelection()}
              onChange={(event) => {
                const value = event.target.value;
                if (!value) return;
                if (value === "none") {
                  runCommand("hiliteColor", "transparent");
                  try { document.execCommand("backColor", false, "transparent"); } catch { /* browser compatibility */ }
                } else {
                  runCommand("hiliteColor", value);
                }
                event.currentTarget.value = "";
              }}
              aria-label="Highlight color"
              title="Text highlight"
            >
              <option value="">Highlight</option>
              <option value="none">No Color</option>
              <option value="#fff59d">Yellow</option>
              <option value="#c8f7c5">Green</option>
              <option value="#bfe3ff">Blue</option>
              <option value="#ffd6a5">Orange</option>
              <option value="#f8c4d8">Pink</option>
              <option value="#ddd6fe">Purple</option>
              <option value="#e5e7eb">Gray</option>
            </select>
          </label>
        )}
        {!compact && <span className="offer-generator-rich-divider" />}
        {!compact && toolButton("≡", "Align left", "justifyLeft")}
        {!compact && toolButton("≣", "Center", "justifyCenter")}
        {!compact && toolButton("≡", "Align right", "justifyRight")}
        {!compact && toolButton("≋", "Justify", "justifyFull")}
        {!compact && <span className="offer-generator-rich-divider" />}
        <select
          className="offer-generator-rich-select offer-generator-rich-list-select"
          title="List type"
          defaultValue="none"
          onMouseDown={() => captureSelection()}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "bullet") runCommand("insertUnorderedList");
            if (value === "number") runCommand("insertOrderedList");
            event.currentTarget.value = "none";
          }}
        >
          <option value="none">List</option>
          <option value="bullet">• Bulleted</option>
          <option value="number">1. Numbered</option>
        </select>
        {!compact && toolButton("↶", "Undo (Ctrl+Z)", "undo")}
        {!compact && toolButton("↷", "Redo (Ctrl+Y)", "redo")}
        {toolButton("Tx", "Clear formatting", "removeFormat")}
      </div>

      <div
        ref={editorRef}
        className="offer-generator-rich-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel}
        data-placeholder={placeholder || ""}
        onInput={emitCurrentHtml}
        onKeyDown={handleKeyDown}
        onFocus={captureSelection}
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        onSelect={captureSelection}
        onBlur={() => { const html = emitCurrentHtml(); onBlur?.(html); }}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
};

const replaceCustomTokensInRichHtml = (
  text: string,
  candidate: Candidate,
  company: CompanyDetails,
  customFields: CustomField[],
  dynamicValues: DynamicValues = {}
) => {
  const escapeReplacement = (value: string) => escapeHtml(value);

  const fieldValues = new Map<string, string>();
  for (const [name, value] of Object.entries(dynamicValues)) {
    fieldValues.set(name, value);
  }

  for (const field of customFields) {
    const token = field.name.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (!token) continue;
    if (!fieldValues.has(token) && field.value) fieldValues.set(token, field.value);
  }

  let result = text;

  for (const [token, value] of fieldValues.entries()) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`{{\\s*${escapedToken}\\s*}}`, "g"),
      escapeReplacement(value)
    );
  }

  const tokenValues: Record<string, string> = {
    candidate_name: candidate.name || "Candidate Name",
    candidateName: candidate.name || "Candidate Name",
    firstName: (candidate.name || "Candidate Name").trim().split(/\s+/)[0] || "Candidate",
    lastName: (candidate.name || "").trim().split(/\s+/).slice(1).join(" "),
    designation: candidate.designation || "Designation",
    department: candidate.department || "Department",
    salary: formatSalary(candidate.salary) || "Compensation",
    annualCTC: formatSalary(candidate.salary) || "Annual CTC",
    monthlySalary: candidate.salary || "Monthly Salary",
    joining_date: formatDate(candidate.joiningDate) || "Joining Date",
    joiningDate: formatDate(candidate.joiningDate) || "Joining Date",
    location: candidate.location || "Work Location",
    employment_type: candidate.employmentType || "Employment Type",
    employmentType: candidate.employmentType || "Employment Type",
    reporting_manager: candidate.reportingManager || "Reporting Manager",
    reportingManager: candidate.reportingManager || "Reporting Manager",
    company_name: company.name || "Company Name",
    companyName: company.name || "Company Name",
    companyWebsite: company.website || "Company Website",
    companyAddress: company.addressLine || "Company Address",
    companyCity: company.cityLine || "City / State",
    companyState: company.cityLine || "State",
    hrName: company.hrName || "HR Name",
    hrDesignation: company.hrDesignation || "HR Designation",
    letterDate: formatDate(company.letterDate) || "Letter Date",
    candidateEmail: candidate.email || "Candidate Email",
    candidateAddress: candidate.address || "Candidate Address",
  };

  for (const [token, value] of Object.entries(tokenValues)) {
    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(
      new RegExp(`{{\\s*${escapedToken}\\s*}}`, "g"),
      escapeReplacement(value)
    );
  }

  return sanitizeRichHtml(result);
};

type PreviewInlineEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  selectionRef?: { current: Range | null; sync?: (() => void) | null; undo?: (() => void) | null; redo?: (() => void) | null };
  ariaLabel?: string;
};

/**
 * Preview editor = same HTML model as the left RichTextEditor, but rendered
 * directly on the A4 paper. The DOM stays mounted while typing, so the caret
 * is not reset on every React state update.
 */
const PreviewInlineEditor = ({
  value,
  onChange,
  onBlur,
  className = "",
  placeholder,
  disabled = false,
  selectionRef,
  ariaLabel,
}: PreviewInlineEditorProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const lastHtmlRef = useRef<string | null>(null);

  const normalize = (nextValue: string) => {
    if (!nextValue.trim()) return "";
    return /<(strong|b|em|i|u|br|p|div|span|font|ul|ol|li)(\s|>)|&(amp|lt|gt|quot|#39);/i.test(nextValue)
      ? sanitizeRichHtml(nextValue)
      : plainTextToRichHtml(nextValue);
  };

  useEffect(() => {
    const editor = ref.current;
    if (!editor) return;

    // Always reconcile against the shared HTML model. Because the assignment
    // happens only when the HTML differs, local typing does not reset the
    // caret, while formatting changes made in the left editor are mirrored
    // into the A4 preview immediately.
    const nextHtml = normalize(value);
    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
    if (lastHtmlRef.current === null) lastHtmlRef.current = nextHtml;
  }, [value]);

  const emit = () => {
    const editor = ref.current;
    if (!editor) return "";
    const html = sanitizeRichHtml(editor.innerHTML);
    if (editor.innerHTML !== html) editor.innerHTML = html;

    // Maintain our own history instead of relying on the browser's editing
    // history. React-controlled contenteditable + execCommand can otherwise
    // cause Undo to restore stale DOM snapshots and duplicate the header.
    if (lastHtmlRef.current !== null && lastHtmlRef.current !== html) {
      undoStackRef.current.push(lastHtmlRef.current);
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();
      redoStackRef.current = [];
    }
    lastHtmlRef.current = html;
    onChange(html);
    return html;
  };

  const undo = () => {
    const editor = ref.current;
    if (!editor || undoStackRef.current.length === 0) return;
    const current = sanitizeRichHtml(editor.innerHTML);
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(current);
    editor.innerHTML = previous;
    lastHtmlRef.current = previous;
    onChange(previous);
  };

  const redo = () => {
    const editor = ref.current;
    if (!editor || redoStackRef.current.length === 0) return;
    const current = sanitizeRichHtml(editor.innerHTML);
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(current);
    editor.innerHTML = next;
    lastHtmlRef.current = next;
    onChange(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z") {
      event.preventDefault();
      if (event.shiftKey) redo(); else undo();
      return;
    }
    if (key === "y") {
      event.preventDefault();
      redo();
    }
  };

  const captureSelection = () => {
    if (!selectionRef || !ref.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (ref.current.contains(range.commonAncestorContainer)) {
      selectionRef.current = range.cloneRange();
      // Tell the shared preview toolbar which contenteditable owns the
      // current selection. This is what makes toolbar formatting write back
      // into the same HTML model used by both editor and preview.
      selectionRef.sync = emit;
      selectionRef.undo = undo;
      selectionRef.redo = redo;
    }
  };

  return (
    <div
      ref={ref}
      className={`offer-generator-preview-inline-editor ${className}`.trim()}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      data-placeholder={placeholder || ""}
      spellCheck
      onInput={emit}
      onKeyDown={handleKeyDown}
      onFocus={captureSelection}
      onMouseUp={captureSelection}
      onKeyUp={captureSelection}
      onSelect={captureSelection}
      onBlur={() => {
        const html = emit();
        onBlur?.(html);
      }}
    />
  );
};

type PreviewFormattingToolbarProps = {
  selectionRef: {
    current: Range | null;
    sync?: (() => void) | null;
    undo?: (() => void) | null;
    redo?: (() => void) | null;
  };
  disabled?: boolean;
};

const PreviewFormattingToolbar = ({ selectionRef, disabled = false }: PreviewFormattingToolbarProps) => {
  const getSelectionEditor = () => {
    const range = selectionRef.current;
    if (!range) return null;
    const node = range.commonAncestorContainer;
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
    return element?.closest('[contenteditable="true"]') as HTMLElement | null;
  };

  const rememberCurrentSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
    const editor = element?.closest('[contenteditable="true"]');
    if (!editor) return;
    selectionRef.current = range.cloneRange();
    // The editor itself owns the sync callback; only replace the range here.
  };

  const restoreSelection = () => {
    const range = selectionRef.current;
    if (!range) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    try {
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    } catch {
      return false;
    }
  };

  const command = (name: string, value?: string) => {
    if (disabled) return;

    // Do not use document.execCommand("undo"/"redo") here. The preview is a
    // React-controlled contenteditable, so the browser's native history can
    // replay stale DOM snapshots and duplicate the company header/content.
    if (name === "undo") {
      selectionRef.undo?.();
      return;
    }
    if (name === "redo") {
      selectionRef.redo?.();
      return;
    }

    const editor = getSelectionEditor();
    if (!editor || !restoreSelection()) return;

    editor.focus();
    restoreSelection();

    try {
      document.execCommand("styleWithCSS", false, "true");
      let applied = document.execCommand(name, false, value);
      if (!applied && name === "hiliteColor") {
        applied = document.execCommand("backColor", false, value);
      }
      if (!applied && name === "fontSize") {
        // The browser normally supports fontSize; leave the selection intact
        // if an older engine declines the command.
      }
    } catch (error) {
      console.warn(`Formatting command failed: ${name}`, error);
      return;
    }

    // execCommand changed the actual contenteditable DOM. Publish that DOM
    // through the owning editor's sync callback so Editor ⇄ Preview stays
    // one shared document.
    selectionRef.sync?.();
    editor.focus();
  };

  const applyFontSize = (px: number) => {
    const sizeMap: Record<number, string> = {
      10: "1", 11: "2", 12: "3", 13: "3", 14: "4", 16: "4",
      18: "5", 20: "5", 24: "6", 28: "6", 32: "7",
    };
    command("fontSize", sizeMap[px] || "3");
  };

  const applyFontFamily = (value: string) => {
    command("fontName", value);
  };

  const applyColor = (value: string) => {
    const editor = getSelectionEditor();
    const range = selectionRef.current;
    if (!editor || !range || !editor.contains(range.commonAncestorContainer)) return;
    if (range.collapsed) return;

    // Restore the exact text selection immediately before applying the color.
    // A <select> takes focus when its option is chosen, so relying only on the
    // browser's live selection can otherwise make the command target nothing.
    const selection = window.getSelection();
    if (!selection) return;
    try {
      selection.removeAllRanges();
      selection.addRange(range);
    } catch {
      return;
    }

    editor.focus();
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch { /* browser compatibility */ }

    if (value === "none") {
      // Remove explicit color from the selected content. `inherit` is not
      // reliable across browsers because it may create a persistent inline
      // style. First use the browser command, then clean the selected fragment.
      try { document.execCommand("foreColor", false, "inherit"); } catch { /* fallback below */ }

      const selected = window.getSelection();
      if (selected && selected.rangeCount) {
        const activeRange = selected.getRangeAt(0);
        if (!activeRange.collapsed && editor.contains(activeRange.commonAncestorContainer)) {
          const fragment = activeRange.cloneContents();
          const elements = [fragment, ...Array.from(fragment.querySelectorAll?.("*") || [])] as (DocumentFragment | Element)[];
          elements.forEach((node) => {
            if (node instanceof HTMLElement || node instanceof SVGElement) {
              node.style.removeProperty("color");
              if (!node.getAttribute("style")?.trim()) node.removeAttribute("style");
            }
          });
          try {
            activeRange.deleteContents();
            activeRange.insertNode(fragment);
            activeRange.collapse(false);
            selected.removeAllRanges();
            selected.addRange(activeRange);
          } catch { /* keep execCommand result */ }
        }
      }
    } else {
      let applied = false;
      try {
        applied = document.execCommand("foreColor", false, value);
      } catch { /* fallback below */ }

      // Explicit fallback: wrap the selected content in a span when the
      // browser refuses foreColor. This makes heading color deterministic.
      if (!applied) {
        const selected = window.getSelection();
        if (selected && selected.rangeCount) {
          const activeRange = selected.getRangeAt(0);
          if (!activeRange.collapsed && editor.contains(activeRange.commonAncestorContainer)) {
            const wrapper = document.createElement("span");
            wrapper.style.color = value;
            try {
              const fragment = activeRange.extractContents();
              wrapper.appendChild(fragment);
              activeRange.insertNode(wrapper);
              activeRange.selectNodeContents(wrapper);
              selected.removeAllRanges();
              selected.addRange(activeRange);
            } catch { /* leave selection unchanged */ }
          }
        }
      }
    }

    selectionRef.sync?.();
    // Re-capture the post-format selection so another toolbar action can
    // immediately format the same heading without losing its range.
    const after = window.getSelection();
    if (after && after.rangeCount) selectionRef.current = after.getRangeAt(0).cloneRange();
    editor.focus();
  };

  const applyHighlight = (value: string) => {
    command("hiliteColor", value);
  };

  const tool = (label: string, title: string, name: string) => (
    <button
      type="button"
      className="offer-generator-preview-tool"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(event) => { rememberCurrentSelection(); event.preventDefault(); }}
      onClick={() => command(name)}
    >
      {label}
    </button>
  );

  return (
    <div className="offer-generator-preview-format-toolbar" role="toolbar" aria-label="Preview text formatting">
      <span className="offer-generator-preview-format-label">Edit</span>
      {tool("B", "Bold", "bold")}
      {tool("I", "Italic", "italic")}
      {tool("U", "Underline", "underline")}
      <span className="offer-generator-preview-format-divider" />
      <select
        className="offer-generator-preview-format-select offer-generator-preview-font-family"
        title="Font family"
        aria-label="Font family"
        defaultValue="Arial"
        disabled={disabled}
        onMouseDown={() => rememberCurrentSelection()}
        onChange={(event) => applyFontFamily(event.target.value)}
      >
        {RICH_FONT_FAMILIES.map(([label, value]) => (
          <option key={label} value={value}>{label}</option>
        ))}
      </select>
      <select
        className="offer-generator-preview-format-select offer-generator-preview-font-size"
        title="Font size"
        aria-label="Font size"
        defaultValue="13"
        disabled={disabled}
        onMouseDown={() => rememberCurrentSelection()}
        onChange={(event) => applyFontSize(Number(event.target.value))}
      >
        {RICH_FONT_SIZES.map((size) => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
      <label className="offer-generator-preview-color-control" title="Font color">
        <span className="offer-generator-preview-color-icon">A</span>
        <select
          className="offer-generator-preview-color-select"
          defaultValue=""
          disabled={disabled}
          aria-label="Font color"
          onMouseDown={(event) => { rememberCurrentSelection(); event.stopPropagation(); }}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            applyColor(value);
            event.currentTarget.value = "";
          }}
        >
          <option value="">Color</option>
          <option value="none">No Color</option>
          <option value="#000000">Black</option>
          <option value="#434343">Dark Gray</option>
          <option value="#666666">Gray</option>
          <option value="#980000">Dark Red</option>
          <option value="#ff0000">Red</option>
          <option value="#ff9900">Orange</option>
          <option value="#ffff00">Yellow</option>
          <option value="#008000">Green</option>
          <option value="#00a65a">Emerald</option>
          <option value="#0000ff">Blue</option>
          <option value="#4a86e8">Light Blue</option>
          <option value="#800080">Purple</option>
          <option value="#a64d79">Pink</option>
          <option value="#783f04">Brown</option>
          <option value="#ffffff">White</option>
        </select>
      </label>
      <label className="offer-generator-preview-color-control offer-generator-preview-highlight-control" title="Text highlight">
        <span className="offer-generator-preview-highlight-icon">▰</span>
        <select
          className="offer-generator-preview-color-select"
          defaultValue=""
          disabled={disabled}
          aria-label="Text highlight"
          onMouseDown={() => rememberCurrentSelection()}
          onChange={(event) => {
            const value = event.target.value;
            if (!value) return;
            if (value === "none") {
              applyHighlight("transparent");
            } else {
              applyHighlight(value);
            }
            event.currentTarget.value = "";
          }}
        >
          <option value="">Highlight</option>
          <option value="none">No Color</option>
          <option value="#fff59d">Yellow</option>
          <option value="#c8f7c5">Green</option>
          <option value="#bfe3ff">Blue</option>
          <option value="#ffd6a5">Orange</option>
          <option value="#f8c4d8">Pink</option>
          <option value="#ddd6fe">Purple</option>
          <option value="#e5e7eb">Gray</option>
        </select>
      </label>
      <span className="offer-generator-preview-format-divider" />
      {tool("≡", "Align left", "justifyLeft")}
      {tool("≣", "Center", "justifyCenter")}
      {tool("≡", "Align right", "justifyRight")}
      {tool("≋", "Justify", "justifyFull")}
      <span className="offer-generator-preview-format-divider" />
      {tool("•", "Bulleted list", "insertUnorderedList")}
      {tool("1.", "Numbered list", "insertOrderedList")}
      {tool("↶", "Undo", "undo")}
      {tool("↷", "Redo", "redo")}
      <span className="offer-generator-preview-format-help">Click any text on the paper to edit</span>
    </div>
  );
};

function OfferJoiningLetterGeneratorPage() {
  const [templateType, setTemplateType] =
    useState<TemplateType>("offer");

  // The document uses one clean corporate theme. Text appearance is
  // controlled from the Word-like formatting toolbar instead of a separate
  // Letter Style / Accent Color panel.
  const letterStyle: LetterStyle = "modern";
  const letterColor: LetterColor = "navy";
  const [pageMargins, setPageMargins] =
    useState<PageMargins>(DEFAULT_PAGE_MARGINS);

  const [company, setCompany] =
    useState<CompanyDetails>(defaultCompany);

  // Keep the company heading as rich HTML so the shared Word-like toolbar
  // can change its font size, font color and optional highlight without
  // losing the formatting when the preview syncs back to state.
  const [companyNameRichHtml, setCompanyNameRichHtml] = useState<string>(
    plainTextToRichHtml(defaultCompany.name || "Company Name")
  );

  const [templates, setTemplates] =
    useState<Record<
      TemplateType,
      LetterTemplate
    >>(defaultTemplates);
const [candidateTemplatesById, setCandidateTemplatesById] =
  useState<Record<string, Record<TemplateType, LetterTemplate>>>({});

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

  const [expandedCandidateDetailsId, setExpandedCandidateDetailsId] =
    useState<string | null>(null);

  const [termsMinimized, setTermsMinimized] =
    useState(false);

  const [previewAll, setPreviewAll] =
  useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
  "idle" | "downloading" | "complete"
>("idle");

type CandidateViewMode =
  | "new"
  | "edit"
  | "preview";

const [candidateViewMode, setCandidateViewMode] =
  useState<CandidateViewMode>("preview");

const isEditable =
  candidateViewMode === "new" ||
  candidateViewMode === "edit";

// Keep the existing preview-edit state temporarily.
// It will be migrated and removed in a later step.
  const previewSelectionRef = useRef<Range | null>(null);
  // Shared selection owner/callback: toolbar commands publish to the active
  // preview editor, which then updates templates[] and the left editor.

  const tableResizeRef = useRef<{
    mode: "column" | "row";
    paragraphId: string;
    index: number;
    nextIndex?: number;
    startClientX: number;
    startClientY: number;
    tableWidth: number;
    startWidths: number[];
    startHeight?: number;
  } | null>(null);

  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const [candidateDetailCustomFieldNames, setCandidateDetailCustomFieldNames] = useState<string[]>([]);
  const [candidateCustomizeOpen, setCandidateCustomizeOpen] = useState(false);
  const [candidateCustomizeDraft, setCandidateCustomizeDraft] = useState("");
  const [hiddenCandidateStandardFields, setHiddenCandidateStandardFields] = useState<string[]>([]);

  const [candidateDynamicValuesById, setCandidateDynamicValuesById] =
    useState<Record<string, DynamicValues>>({});

  const [candidateFormDynamicValues, setCandidateFormDynamicValues] =
    useState<DynamicValues>({});

  const [customFieldDraftName, setCustomFieldDraftName] = useState("");
  const [smartFieldsMinimized, setSmartFieldsMinimized] = useState(false);
  const [companyDetailsMinimized, setCompanyDetailsMinimized] = useState(false);
  const [pageMarginsMinimized, setPageMarginsMinimized] = useState(false);
  const [letterTemplateMinimized, setLetterTemplateMinimized] = useState(false);
  const [letterContentMinimized, setLetterContentMinimized] = useState(false);
  const [showCustomFieldEditor, setShowCustomFieldEditor] = useState(false);
  const [editingCustomFieldId, setEditingCustomFieldId] = useState<string | null>(null);
  const [editingCustomFieldName, setEditingCustomFieldName] = useState("");
  const [ignoredDetectedFieldTokens, setIgnoredDetectedFieldTokens] = useState<string[]>([]);

  const customKnownTokens = COMMON_PLACEHOLDERS.map((field) => field.name);

  const [warningMessage, setWarningMessage] =
    useState<string | null>(null);

  const [warningConfirmAction, setWarningConfirmAction] =
    useState<(() => void) | null>(null);
  useEffect(() => {
    showWarning(
      "Before adding candidate details, carefully review the company details, logo position and size, letter template/style/color, terms & conditions, authorized signature position and size, A4 preview, and PDF layout."
    );}, []);

    useEffect(() => {
  setCandidateTemplatesById((current) => {
    const next = { ...current };

    candidates.forEach((candidate) => {
      if (!next[candidate.id]) {
        next[candidate.id] = cloneLetterTemplates(defaultTemplates);
      }
    });

    return next;
  });
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
  const getTemplatesForCandidate = (
  candidateId: string | null
): Record<TemplateType, LetterTemplate> => {
  if (editingCandidateId && editingCandidateId === candidateId) {
    return templates;
  }

  if (candidateId && candidateTemplatesById[candidateId]) {
    return candidateTemplatesById[candidateId];
  }

  return templates;
};
const currentTemplate =
  getTemplatesForCandidate(
    editingCandidateId || previewCandidateId
  )[templateType];

  const getCustomTemplateText = (template: LetterTemplate) =>
    [
      template.subject,
      template.salutation,
      template.closing,
      ...template.paragraphs.flatMap((paragraph) => [
        paragraph.text,
        ...(paragraph.table
          ? [
              paragraph.table.title,
              ...paragraph.table.columns,
              ...paragraph.table.rows.flat(),
            ]
          : []),
      ]),
      ...template.termsConditions,
    ].join("\n");

  const getDetectedTemplateTokens = (template: LetterTemplate) =>
    extractPlaceholderNames(getCustomTemplateText(template));

  const getUnregisteredTemplateTokens = (template: LetterTemplate) => {
    return getDetectedTemplateTokens(template)
      .map(normalizePlaceholderToken)
      .filter((token, index, allTokens) => allTokens.indexOf(token) === index)
      .filter((token) => {
        const commonField = COMMON_PLACEHOLDER_MAP.get(token);
        const autoResolvedCommonField = Boolean(commonField && commonField.source !== "custom");
        return !autoResolvedCommonField && !candidateDetailCustomFieldNames.includes(token);
      });
  };
  const cloneLetterTemplates = (
  source: Record<TemplateType, LetterTemplate>
): Record<TemplateType, LetterTemplate> => {
  return JSON.parse(JSON.stringify(source));
};

  const getDynamicValuesForCandidate = (candidate: Candidate) =>
    candidateDynamicValuesById[candidate.id] || {};

  const addDetectedField = (token: string) => {
    const cleaned = normalizePlaceholderToken(token).replace(/[^a-zA-Z0-9_]/g, "");
    const commonField = COMMON_PLACEHOLDER_MAP.get(cleaned);
    if (!cleaned || (commonField && commonField.source !== "custom")) return;

    if (!customFields.some((field) => field.name === cleaned)) {
      setCustomFields((current) => [
        ...current,
        { id: `field-${Date.now()}-${cleaned}`, name: cleaned, value: "" },
      ]);
    }

    setIgnoredDetectedFieldTokens((current) => current.filter((name) => name !== cleaned));
    setCandidateDetailCustomFieldNames((current) =>
      current.includes(cleaned) ? current : [...current, cleaned]
    );
    setCandidateFormDynamicValues((current) => ({
      ...current,
      [cleaned]: current[cleaned] || "",
    }));
  };

  const removeUnregisteredPlaceholderFromCurrentLetter = (token: string) => {
    const normalized = normalizePlaceholderToken(token);
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "gi");

    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        subject: current[templateType].subject.replace(pattern, ""),
        salutation: current[templateType].salutation.replace(pattern, ""),
        closing: current[templateType].closing.replace(pattern, ""),
        paragraphs: current[templateType].paragraphs.map((paragraph) => ({
          ...paragraph,
          text: paragraph.text.replace(pattern, ""),
        })),
        termsConditions: current[templateType].termsConditions.map((term) => term.replace(pattern, "")),
      },
    }));

    setIgnoredDetectedFieldTokens((current) => current.filter((name) => name !== normalized));
  };

  const updateCandidateDynamicValue = (name: string, value: string) => {
    setCandidateFormDynamicValues((current) => ({
      ...current,
      [name]: value,
    }));

    if (!editingCandidateId) {
      setPreviewCandidateId(null);
    }
  };

  const getEffectiveDynamicValue = (
    token: string,
    candidate: Candidate,
    companyDetails: CompanyDetails,
    values: DynamicValues
  ) => {
    if (Object.prototype.hasOwnProperty.call(values, token)) {
      return values[token].trim();
    }

    switch (token) {
      case "candidateName":
      case "candidate_name":
        return candidate.name.trim();
      case "firstName":
        return candidate.name.trim().split(/\s+/)[0] || "";
      case "lastName":
        return candidate.name.trim().split(/\s+/).slice(1).join(" ");
      case "designation":
        return candidate.designation.trim();
      case "department":
        return candidate.department.trim();
      case "salary":
      case "annualCTC":
        return candidate.salary.trim();
      case "monthlySalary":
        return candidate.salary.trim();
      case "joiningDate":
      case "joining_date":
        return candidate.joiningDate.trim();
      case "location":
        return candidate.location.trim();
      case "employmentType":
      case "employment_type":
        return candidate.employmentType.trim();
      case "reportingManager":
      case "reporting_manager":
        return candidate.reportingManager.trim();
      case "companyName":
      case "company_name":
        return companyDetails.name.trim();
      case "companyWebsite":
        return companyDetails.website.trim();
      case "companyAddress":
        return companyDetails.addressLine.trim();
      case "companyCity":
        return companyDetails.cityLine.trim();
      case "companyState":
        return companyDetails.cityLine.trim();
      case "hrName":
        return companyDetails.hrName.trim();
      case "hrDesignation":
        return companyDetails.hrDesignation.trim();
      case "letterDate":
        return companyDetails.letterDate.trim();
      default:
        return customFields.find((field) => field.name === token)?.value.trim() || "";
    }
  };

  const getMissingDynamicFields = (candidate: Candidate, values: DynamicValues) => {
    const candidateTemplate = templates[candidate.letterType];

    return getDetectedTemplateTokens(candidateTemplate)
      .filter((token) => !getEffectiveDynamicValue(token, candidate, company, values));
  };

  const validateCandidateDynamicFields = (candidate: Candidate, values: DynamicValues) => {
    const missing = getMissingDynamicFields(candidate, values);
    if (!missing.length) return true;

    showWarning(
      `Please fill these fields before generating the letter: ${missing
        .map((token) => humanizePlaceholder(token))
        .join(", ")}.`
    );
    return false;
  };

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
    hasCandidateFormData(candidateForm) ||
    Object.values(candidateFormDynamicValues).some((value) => value.trim());

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

  // The preview must read from the same draft data model as the candidate form.
  // When editing a saved candidate, the saved row is not updated until Save Changes,
  // so the preview must merge candidateForm + candidateFormDynamicValues live.
  const effectivePreviewCandidate =
    previewCandidate && editingCandidateId === previewCandidate.id
      ? {
          ...previewCandidate,
          ...candidateForm,
          id: previewCandidate.id,
          selected: previewCandidate.selected,
        }
      : previewCandidate;

  const getPreviewDynamicValues = (candidate: Candidate): DynamicValues => {
    if (candidate.id === "draft-candidate") {
      return candidateFormDynamicValues;
    }

    if (editingCandidateId === candidate.id) {
      return candidateFormDynamicValues;
    }

    return getDynamicValuesForCandidate(candidate);
  };

  const updateCompany = (
    field: keyof CompanyDetails,
    value: string
  ) => {
    setCompany((current) => ({
      ...current,
      [field]: value,
    }));

    // The left-side Company Name input is intentionally plain text. When it
    // changes, rebuild the heading HTML so the preview starts from the new
    // company name while the shared toolbar can still format it afterwards.
    if (field === "name") {
      setCompanyNameRichHtml(plainTextToRichHtml(value));
    }
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

  const normalizeTemplateTextOnBlur = (
    value: string,
    apply: (nextValue: string) => void
  ) => {
    const normalized = convertCommonPhrasesToPlaceholders(value);
    if (normalized !== value) apply(normalized);
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

  const standardCandidateFieldDefinitions: Array<{
    field: keyof CandidateForm;
    label: string;
    removable: boolean;
  }> = [
    { field: "name", label: "Full Name", removable: false },
    { field: "designation", label: "Designation", removable: true },
    { field: "department", label: "Department", removable: true },
    { field: "salary", label: "Salary", removable: true },
    { field: "joiningDate", label: "Joining Date", removable: true },
    { field: "location", label: "Location", removable: true },
    { field: "employmentType", label: "Employment Type", removable: true },
    { field: "reportingManager", label: "Reporting Manager", removable: true },
  ];

  const isCandidateStandardFieldVisible = (field: keyof CandidateForm) =>
    !hiddenCandidateStandardFields.includes(field);

  const hideCandidateStandardField = (field: keyof CandidateForm) => {
    if (field === "name") return;
    setHiddenCandidateStandardFields((current) =>
      current.includes(field) ? current : [...current, field]
    );
  };

  const showCandidateStandardField = (field: keyof CandidateForm) => {
    setHiddenCandidateStandardFields((current) =>
      current.filter((item) => item !== field)
    );
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
    setCandidateFormDynamicValues({});
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

      setCandidateDynamicValuesById((current) => ({
        ...current,
        [editingCandidateId]: { ...candidateFormDynamicValues },
      }));
      setCandidateTemplatesById((current) => ({
  ...current,
  [editingCandidateId]: cloneLetterTemplates(templates),
}));

      setPreviewCandidateId(
  editingCandidateId
);

setEditingCandidateId(null);
setCandidateViewMode("preview");
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
    const newCandidateTemplates = cloneLetterTemplates(templates);

    setCandidates((current) => [
      ...current,
      newCandidate,
    ]);

    setCandidateDynamicValuesById((current) => ({
      ...current,
      [newCandidate.id]: { ...candidateFormDynamicValues },
    }));

    setCandidateTemplatesById((current) => ({
  ...current,
  [newCandidate.id]: newCandidateTemplates,
}));

    setPreviewCandidateId(
      newCandidate.id
    );
    setCandidateViewMode("preview");

    resetCandidateForm();
  };

  const cancelCandidateEdit = () => {
  setEditingCandidateId(null);
  resetCandidateForm();
  setCandidateViewMode("preview");
};

const startNewCandidate = () => {
  setEditingCandidateId(null);
  resetCandidateForm();
  setPreviewCandidateId(null);
  setPreviewAll(false);
  setCandidateViewMode("new");
};

const editCandidate = (
  candidate: Candidate
) => {
    setTemplateType(candidate.letterType);
    const candidateTemplates =
  candidateTemplatesById[candidate.id];

if (candidateTemplates) {
  setTemplates(cloneLetterTemplates(candidateTemplates));
}

    setCandidateForm({
      name: candidate.name,
      email: candidate.email || "",
      phone: candidate.phone || "",
      address: candidate.address || "",
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

    setCandidateFormDynamicValues({
      ...(candidateDynamicValuesById[candidate.id] || {}),
    });

    setEditingCandidateId(
      candidate.id
    );

    setPreviewCandidateId(
      candidate.id
    );

    setPreviewAll(false);
    setCandidateViewMode("edit");
  };

  const updateCandidateDetails = (
    candidateId: string,
    field: "email" |     "address",
    value: string
  ) => {
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              [field]: value,
            }
          : candidate
      )
    );
  };

  const previewSingleCandidate = (
    candidate: Candidate
  ) => {
    setTemplateType(candidate.letterType);
    setPreviewCandidateId(
      candidate.id
    );
    setPreviewAll(false);
    setCandidateViewMode("preview");
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

    setCandidateDynamicValuesById((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

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

  const addCustomParagraph = () => {
    setTemplates((current) => ({
      ...current,
      custom: {
        ...current.custom,
        paragraphs: [
          ...current.custom.paragraphs,
          {
            id: `custom-${Date.now()}`,
            text: "",
          },
        ],
      },
    }));
  };

  const removeCustomParagraph = (paragraphId: string) => {
    setTemplates((current) => ({
      ...current,
      custom: {
        ...current.custom,
        paragraphs: current.custom.paragraphs.filter(
          (paragraph) => paragraph.id !== paragraphId
        ),
      },
    }));
  };

  const addCandidateCustomizeField = () => {
    const cleaned = candidateCustomizeDraft
      .trim()
      .replace(/^{{|}}$/g, "")
      .replace(/[^a-zA-Z0-9_]/g, "");

    if (!cleaned) {
      showWarning("Enter a field name, for example CTC, schoolName or probationPeriod.");
      return;
    }

    if (COMMON_PLACEHOLDER_MAP.has(cleaned)) {
      showWarning(`{{${cleaned}}} is a common placeholder. Add it to the letter first and Noorado will handle the field automatically.`);
      return;
    }

    if (!customFields.some((field) => field.name === cleaned)) {
      setCustomFields((current) => [
        ...current,
        { id: `field-${Date.now()}-${cleaned}`, name: cleaned, value: "" },
      ]);
    }

    setCandidateDetailCustomFieldNames((current) =>
      current.includes(cleaned) ? current : [...current, cleaned]
    );
    setCandidateFormDynamicValues((current) => ({
      ...current,
      [cleaned]: current[cleaned] || "",
    }));
    setCandidateCustomizeDraft("");
  };

  const removeCandidateCustomizeField = (name: string) => {
    setCandidateDetailCustomFieldNames((current) => current.filter((item) => item !== name));
    setCandidateFormDynamicValues((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const addCustomField = () => {
    const cleaned = customFieldDraftName.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (!cleaned) {
      showWarning("Enter a field name, for example CTC or probationPeriod.");
      return;
    }
    if (customKnownTokens.includes(cleaned) || customFields.some((field) => field.name === cleaned)) {
      showWarning(`The placeholder {{${cleaned}}} already exists.`);
      return;
    }
    setCustomFields((current) => [...current, { id: `field-${Date.now()}`, name: cleaned, value: "" }]);
    setCustomFieldDraftName("");
    setShowCustomFieldEditor(false);
  };

  const startEditCustomField = (field: CustomField) => {
    setEditingCustomFieldId(field.id);
    setEditingCustomFieldName(field.name);
  };

  const cancelEditCustomField = () => {
    setEditingCustomFieldId(null);
    setEditingCustomFieldName("");
  };

  const saveEditCustomField = (id: string) => {
    const cleaned = editingCustomFieldName.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (!cleaned) {
      showWarning("Field name cannot be empty.");
      return;
    }
    if (customKnownTokens.includes(cleaned) || customFields.some((field) => field.id !== id && field.name === cleaned)) {
      showWarning(`The placeholder {{${cleaned}}} already exists.`);
      return;
    }
    setCustomFields((current) => current.map((field) => field.id === id ? { ...field, name: cleaned } : field));
    cancelEditCustomField();
  };

  const removeCustomField = (id: string) => {
    const field = customFields.find((item) => item.id === id);
    if (!field) return;
    const escaped = field.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tokenPattern = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, "i");
    if (tokenPattern.test(getCustomTemplateText(currentTemplate))) {
      showWarning(`{{${field.name}}} is used in this letter. Remove it from the letter first.`);
      return;
    }
    setCustomFields((current) => current.filter((item) => item.id !== id));
  };

  const updateParagraphTable = (
    paragraphId: string,
    updater: (table: CustomTable) => CustomTable
  ) => {
     if (!isEditable) return;
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        paragraphs: current[templateType].paragraphs.map((paragraph) =>
          paragraph.id === paragraphId && paragraph.table
            ? { ...paragraph, table: updater(paragraph.table) }
            : paragraph
        ),
      },
    }));
  };

  const addParagraphTable = (paragraphId: string) => {
     if (!isEditable) return;
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        paragraphs: current[templateType].paragraphs.map((paragraph) =>
          paragraph.id === paragraphId
            ? {
                ...paragraph,
                table: paragraph.table || {
                  id: `table-${Date.now()}-${paragraphId}`,
                  title: "Table",
                  columns: ["Component", "Details"],
                  rows: [["", ""], ["", ""]],
                  borderStyle: "solid",
                  color: "navy",
                  columnWidths: [50, 50],
                  rowHeights: [42, 42],
                },
              }
            : paragraph
        ),
      },
    }));
  };

  const removeParagraphTable = (paragraphId: string) => {
    setTemplates((current) => ({
      ...current,
      [templateType]: {
        ...current[templateType],
        paragraphs: current[templateType].paragraphs.map((paragraph) =>
          paragraph.id === paragraphId
            ? { ...paragraph, table: undefined }
            : paragraph
        ),
      },
    }));
  };

  const updateParagraphTableCell = (

    paragraphId: string,
    rowIndex: number,
    columnIndex: number,
    value: string
  ) => {
    if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => ({
      ...table,
      rows: table.rows.map((row, currentRowIndex) =>
        currentRowIndex === rowIndex
          ? row.map((cell, currentColumnIndex) =>
              currentColumnIndex === columnIndex ? value : cell
            )
          : row
      ),
    }));
  };

  const updateParagraphTableColumn = (
    paragraphId: string,
    columnIndex: number,
    value: string
  ) => {
    if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => ({
      ...table,
      columns: table.columns.map((column, index) =>
        index === columnIndex ? value : column
      ),
    }));
  };

  const addParagraphTableRow = (paragraphId: string) => {if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => ({
      ...table,
      rows: [...table.rows, table.columns.map(() => "")],
      rowHeights: [...getNormalizedTableRowHeights(table).map((height) => height ?? 42), 42],
    }));
  };

  const addParagraphTableColumn = (paragraphId: string) => {if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => {
      const widths = getNormalizedTableColumnWidths(table);
      const newColumnWidth = 100 / (table.columns.length + 1);
      const scaledExisting = widths.map((width) => width * (1 - newColumnWidth / 100));
      return {
        ...table,
        columns: [...table.columns, `Column ${table.columns.length + 1}`],
        rows: table.rows.map((row) => [...row, ""]),
        columnWidths: [...scaledExisting, newColumnWidth],
      };
    });
  };

  const removeParagraphTableRow = (paragraphId: string, rowIndex: number) => {if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => {
      if (table.rows.length <= 1) return table;
      const heights = getNormalizedTableRowHeights(table);
      return {
        ...table,
        rows: table.rows.filter((_, index) => index !== rowIndex),
        rowHeights: heights.filter((_, index) => index !== rowIndex).map((height) => height ?? 42),
      };
    });
  };

  const removeParagraphTableColumn = (paragraphId: string, columnIndex: number) => {if (!isEditable) return;
    updateParagraphTable(paragraphId, (table) => {
      if (table.columns.length <= 1) return table;
      const widths = getNormalizedTableColumnWidths(table);
      const removedWidth = widths[columnIndex] || 0;
      const nextWidths = widths.filter((_, index) => index !== columnIndex);
      const share = nextWidths.length ? removedWidth / nextWidths.length : 0;
      return {
        ...table,
        columns: table.columns.filter((_, index) => index !== columnIndex),
        rows: table.rows.map((row) => row.filter((_, index) => index !== columnIndex)),
        columnWidths: nextWidths.map((width) => width + share),
      };
    });
  };

  const getNormalizedTableColumnWidths = (table: CustomTable) => {
    const count = Math.max(1, table.columns.length);
    const raw = Array.from({ length: count }, (_, index) => Number(table.columnWidths?.[index]));
    const valid = raw.every((value) => Number.isFinite(value) && value > 0);
    if (!valid) return Array.from({ length: count }, () => 100 / count);
    const total = raw.reduce((sum, value) => sum + value, 0);
    if (!total) return Array.from({ length: count }, () => 100 / count);
    return raw.map((value) => (value / total) * 100);
  };

  const getNormalizedTableRowHeights = (table: CustomTable) =>
    table.rows.map((_, index) => {
      const height = Number(table.rowHeights?.[index]);
      return Number.isFinite(height) && height > 0 ? height : undefined;
    });

  const updatePreviewTable = (letterType: TemplateType, paragraphId: string, updater: (table: CustomTable) => CustomTable) => { if (!isEditable) return;
    setTemplates((current) => ({
      ...current,
      [letterType]: {
        ...current[letterType],
        paragraphs: current[letterType].paragraphs.map((paragraph) =>
          paragraph.id === paragraphId && paragraph.table
            ? { ...paragraph, table: updater(paragraph.table) }
            : paragraph
        ),
      },
    }));
  };

  const resizePreviewTableColumn = (
    letterType: TemplateType,
    paragraphId: string,
    columnIndex: number,
    nextColumnIndex: number,
    deltaPx: number,
    tableWidthPx: number,
    startWidths: number[]
  ) => {if (!isEditable) return;
    if (tableWidthPx <= 0 || columnIndex < 0 || nextColumnIndex < 0) return;
    const deltaPercent = (deltaPx / tableWidthPx) * 100;
    const minWidth = 8;
    const leftStart = startWidths[columnIndex] ?? 100 / startWidths.length;
    const rightStart = startWidths[nextColumnIndex] ?? 100 / startWidths.length;
    const maxDelta = Math.min(leftStart - minWidth, rightStart - minWidth);
    const appliedDelta = Math.max(-maxDelta, Math.min(maxDelta, deltaPercent));
    const nextWidths = [...startWidths];
    nextWidths[columnIndex] = leftStart + appliedDelta;
    nextWidths[nextColumnIndex] = rightStart - appliedDelta;
    updatePreviewTable(letterType, paragraphId, (table) => ({ ...table, columnWidths: nextWidths }));
  };

  const resizePreviewTableRow = (
    letterType: TemplateType,
    paragraphId: string,
    rowIndex: number,
    deltaPx: number,
    startHeight: number
  ) => {if (!isEditable) return;
    const nextHeight = Math.max(28, Math.min(240, startHeight + deltaPx));
    updatePreviewTable(letterType, paragraphId, (table) => {
      const heights = getNormalizedTableRowHeights(table).map((height, index) =>
        index === rowIndex ? nextHeight : height
      );
      return { ...table, rowHeights: heights.map((height) => height ?? 28) };
    });
  };

  const handlePreviewTableColumnPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    letterType: TemplateType,
    paragraphId: string,
    columnIndex: number
  ) => {
    if (!isEditable) return;

const table = event.currentTarget.closest("table");
    if (!(table instanceof HTMLElement)) return;
    const nextIndex = columnIndex + 1;
    if (nextIndex >= table.querySelectorAll("th").length) return;
    const sourceTable = templates[letterType].paragraphs.find((item) => item.id === paragraphId)?.table;
    if (!sourceTable) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    tableResizeRef.current = {
      mode: "column",
      paragraphId,
      index: columnIndex,
      nextIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      tableWidth: table.getBoundingClientRect().width,
      startWidths: getNormalizedTableColumnWidths(sourceTable),
    };
  };

  const handlePreviewTableColumnPointerMove = (event: PointerEvent<HTMLDivElement>, letterType: TemplateType) => {
    const drag = tableResizeRef.current;
    if (!drag || drag.mode !== "column" || drag.nextIndex === undefined) return;
    resizePreviewTableColumn(letterType, drag.paragraphId, drag.index, drag.nextIndex, event.clientX - drag.startClientX, drag.tableWidth, drag.startWidths);
  };

  const handlePreviewTableRowPointerDown = (
    event: PointerEvent<HTMLDivElement>,
    letterType: TemplateType,
    paragraphId: string,
    rowIndex: number
  ) => {
    if (!isEditable) return;

const row = event.currentTarget.closest("tr");
    if (!(row instanceof HTMLElement)) return;
    const sourceTable = templates[letterType].paragraphs.find((item) => item.id === paragraphId)?.table;
    if (!sourceTable) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    tableResizeRef.current = {
      mode: "row",
      paragraphId,
      index: rowIndex,
      startClientX: event.clientX,
      startClientY: event.clientY,
      tableWidth: 0,
      startWidths: getNormalizedTableColumnWidths(sourceTable),
      startHeight: row.getBoundingClientRect().height,
    };
  };

  const handlePreviewTableRowPointerMove = (event: PointerEvent<HTMLDivElement>, letterType: TemplateType) => {
    const drag = tableResizeRef.current;
    if (!drag || drag.mode !== "row" || drag.startHeight === undefined) return;
    resizePreviewTableRow(letterType, drag.paragraphId, drag.index, event.clientY - drag.startClientY, drag.startHeight);
  };

  const handlePreviewTablePointerUp = () => {
    tableResizeRef.current = null;
  };

  const resetPreviewTableWidths = (letterType: TemplateType, paragraphId: string) => {if (!isEditable) return;
    updatePreviewTable(letterType, paragraphId, (table) => ({
      ...table,
      columnWidths: Array.from({ length: Math.max(1, table.columns.length) }, () => 100 / Math.max(1, table.columns.length)),
    }));
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
   * PDF EXPORT ENGINE
   * ------------------
   * The existing A4 preview DOM is the single visual source of truth.
   * PDF generation is handled by the local Chromium/Playwright service.
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
  const generateVectorPdf = async (candidate: Candidate): Promise<Blob> => {
    const dynamicValues = getDynamicValuesForCandidate(candidate);

    /*
     * PDF-ONLY ENGINE
     * ----------------
     * The existing A4 preview DOM is the single visual source of truth.
     * We clone the already-rendered candidate page, keep its HTML/CSS,
     * and send that document to the local Chromium/Playwright service.
     *
     * This intentionally does NOT change the preview or its CSS in React.
     * The print stylesheet below only applies inside the isolated PDF document.
     */
    const getCandidatePreviewPage = () => {
      if (typeof document === "undefined") return null;

      const candidateName = (candidate.name || "Candidate Name")
        .replace(/\s+/g, " ")
        .trim();

      const pages = Array.from(
        document.querySelectorAll<HTMLElement>(".offer-generator-a4-page")
      );

      return (
        pages.find((page) => {
          const recipient = page.querySelector<HTMLElement>(
            ".offer-generator-letter-recipient"
          );
          const text = (recipient?.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
          return text === candidateName;
        }) || pages[0] || null
      );
    };

    const waitForCandidatePreviewPage = async (): Promise<HTMLElement> => {
      const timeoutMs = 2500;
      const intervalMs = 50;
      const started = Date.now();

      while (Date.now() - started < timeoutMs) {
        const page = getCandidatePreviewPage();
        if (page) return page;
        await new Promise<void>((resolve) => setTimeout(resolve, intervalMs));
      }

      throw new Error("Unable to locate the rendered A4 preview for this candidate.");
    };

    const previewPage = await waitForCandidatePreviewPage();
    const clonedPage = previewPage.cloneNode(true) as HTMLElement;

    /*
     * PDF-only cleanup. These elements are editor controls/drag handles rather
     * than letter content. They are hidden only in the isolated PDF document;
     * the real preview DOM is never modified.
     */
    clonedPage
      .querySelectorAll<HTMLElement>(
        [
          ".offer-generator-preview-table-actions",
          ".offer-generator-table-column-resize-handle",
          ".offer-generator-table-row-resize-handle",
          ".offer-generator-preview-format-toolbar",
          ".offer-generator-rich-toolbar",
        ].join(",")
      )
      .forEach((element) => element.remove());

    // Resolve custom/dynamic tokens in cloned editable content without changing
    // the application's React state or the visible preview.
    clonedPage
      .querySelectorAll<HTMLElement>("[contenteditable]")
      .forEach((element) => {
        const sourceHtml = element.innerHTML || "";
        const resolvedHtml = replaceCustomTokensInRichHtml(
          sourceHtml,
          candidate,
          company,
          customFields,
          dynamicValues
        );
        element.innerHTML = resolvedHtml;
        element.removeAttribute("contenteditable");
        element.removeAttribute("spellcheck");
        element.removeAttribute("data-placeholder");
        element.classList.remove("is-editable");
      });

    const escapeHtmlAttribute = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const sourceHead = typeof document !== "undefined"
      ? Array.from(
          document.head.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
            "style, link[rel='stylesheet']"
          )
        )
          .map((node) => {
            if (node.tagName === "STYLE") {
              return node.outerHTML;
            }
            const href = (node as HTMLLinkElement).href;
            return href
              ? `<link rel="stylesheet" href="${escapeHtmlAttribute(href)}">`
              : "";
          })
          .filter(Boolean)
          .join("\n")
      : "";

    const printCss = `
      @page {
        size: A4;
        margin: 0;
      }

      html,
      body {
        margin: 0 !important;
        padding: 0 !important;
        width: 210mm !important;
        min-width: 210mm !important;
        background: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .offer-generator-a4-page {
        width: 210mm !important;
        min-width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        box-shadow: none !important;
        border: 0 !important;
        page-break-after: always !important;
        break-after: page !important;
        position: relative !important;
      }

      .offer-generator-a4-page:last-child {
        page-break-after: auto !important;
        break-after: auto !important;
      }

      .offer-generator-preview-table-actions,
      .offer-generator-table-column-resize-handle,
      .offer-generator-table-row-resize-handle,
      .offer-generator-preview-format-toolbar,
      .offer-generator-rich-toolbar {
        display: none !important;
      }

      [contenteditable] {
        outline: none !important;
        cursor: default !important;
      }

      .offer-generator-preview-inline-editor,
      .offer-generator-preview-block-editor,
      .offer-generator-preview-table-cell-editor,
      .offer-generator-preview-table-title-editor {
        cursor: default !important;
      }
    `;

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <base href="${escapeHtmlAttribute(window.location.origin)}/">
  ${sourceHead}
  <style>${printCss}</style>
</head>
<body>
${clonedPage.outerHTML}
</body>
</html>`;

    const pdfEndpoint = import.meta.env.DEV
  ? "http://127.0.0.1:8787/generate-pdf"
  : "/api/generate-pdf";

const response = await fetch(pdfEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html,
        fileName:
          `${(candidate.name || "Candidate")
            .replace(/[^a-z0-9]+/gi, "_")
            .replace(/^_+|_+$/g, "") || "Candidate"}_${getTemplateLabel(candidate.letterType)
            .replace(/[^a-z0-9]+/gi, "_")
            .replace(/^_+|_+$/g, "") || "Letter"}.pdf`,
      }),
    });

    if (!response.ok) {
      let message = "Chromium PDF service failed.";
      try {
        const payload = (await response.json()) as { error?: string };
        if (payload.error) message = payload.error;
      } catch {
        // Keep the default message when the server response is not JSON.
      }
      throw new Error(message);
    }

    const blob = await response.blob();
    if (!blob.size) {
      throw new Error("Chromium PDF service returned an empty PDF.");
    }

    return blob;
  };

  const downloadSingleLetter = async (candidate: Candidate) => {
    setPreviewAll(false);
    setPreviewCandidateId(candidate.id);

    if (!validateCandidateDynamicFields(candidate, getDynamicValuesForCandidate(candidate))) {
      return;
    }
    setDownloadStatus("downloading");

    try {
      const pdfBlob = await generateVectorPdf(candidate);

      const safeName = candidate.name
        .trim()
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "") || "Candidate";

      const letterLabel = getTemplateLabel(candidate.letterType)
        .replace(/[^a-z0-9]+/gi, "_")
        .replace(/^_+|_+$/g, "") || "Letter";

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName}_${letterLabel}.pdf`;
      document.body.appendChild(link);
      link.click();
      setDownloadStatus("complete");
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate candidate Chromium PDF:", error);
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
    setDownloadStatus("downloading");

    const zip = new JSZip();

    try {
      for (let index = 0; index < selectedCandidates.length; index += 1) {
        const candidate = selectedCandidates[index];

        if (!validateCandidateDynamicFields(candidate, getDynamicValuesForCandidate(candidate))) {
          return;
        }

        const pdfBlob = await generateVectorPdf(candidate);

        const safeName = candidate.name
          .trim()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "") || `Candidate_${index + 1}`;

        const letterLabel = getTemplateLabel(candidate.letterType)
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_+|_+$/g, "");

        zip.file(
          `${safeName}_${letterLabel}.pdf`,
          pdfBlob
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Noorado_Letters.zip";
      document.body.appendChild(link);
      link.click();
      setDownloadStatus("complete");
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

      case "custom":
        return "Custom Letter";

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

  /*
   * PREVIEW EDITING DATA FLOW
   * -------------------------
   * User edits A4 DOM -> PreviewInlineEditor emits sanitized HTML ->
   * templates[candidate.letterType] -> left RichTextEditor receives the same
   * model -> browser preview re-renders -> vector PDF consumes that same model.
   * Tables additionally persist columnWidths/rowHeights, so drag adjustments
   * are not visual-only.
   */
  const updatePreviewTemplateField = (
    letterType: TemplateType,
    field: keyof LetterTemplate,
    value: string | boolean
  ) => {
    setTemplates((current) => ({
      ...current,
      [letterType]: { ...current[letterType], [field]: value },
    }));
  };

  const updatePreviewParagraph = (letterType: TemplateType, paragraphId: string, value: string) => {
    setTemplates((current) => ({
      ...current,
      [letterType]: {
        ...current[letterType],
        paragraphs: current[letterType].paragraphs.map((paragraph) =>
          paragraph.id === paragraphId ? { ...paragraph, text: value } : paragraph
        ),
      },
    }));
  };

  const updatePreviewTerm = (letterType: TemplateType, index: number, value: string) => {
    setTemplates((current) => ({
      ...current,
      [letterType]: {
        ...current[letterType],
        termsConditions: current[letterType].termsConditions.map((term, termIndex) =>
          termIndex === index ? value : term
        ),
      },
    }));
  };

  const updatePreviewCandidateField = (candidateId: string, field: keyof CandidateForm, value: string) => {
    setCandidates((current) => current.map((item) => item.id === candidateId ? { ...item, [field]: value } : item));
    if (editingCandidateId === candidateId) {
      setCandidateForm((current) => ({ ...current, [field]: value }));
    }
  };

  const updatePreviewCompanyField = (field: keyof CompanyDetails, value: string) => {
    if (field === "name") {
      const richHtml = sanitizeRichHtml(value);
      const doc = new DOMParser().parseFromString(richHtml, "text/html");
      const plainName = (doc.body.textContent || "").replace(/\u00a0/g, " ").trim();
      setCompany((current) => ({ ...current, name: plainName }));
      setCompanyNameRichHtml(richHtml || plainTextToRichHtml(plainName || "Company Name"));
      return;
    }

    setCompany((current) => ({ ...current, [field]: value }));
  };

const renderLetterPage = (
  candidate: Candidate,
  pageIndex?: number,
  dynamicValues?: DynamicValues
) => {
  const resolvedDynamicValues =
    dynamicValues || getDynamicValuesForCandidate(candidate);

  const candidateTemplate =
    candidate.id === editingCandidateId || candidate.id === "draft-candidate"
      ? templates[candidate.letterType]
      : candidateTemplatesById[candidate.id]?.[candidate.letterType] ||
        templates[candidate.letterType];

  const isSingleEditablePreview =
    isEditable &&
    !previewAll &&
    pageIndex === undefined;

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
        <div className={`offer-generator-letter-header logo-${logoPlacement}`}>
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
            <PreviewInlineEditor
              value={companyNameRichHtml || plainTextToRichHtml(company.name || "Company Name")}
              disabled={!isSingleEditablePreview}
              className="offer-generator-preview-company-name"
              ariaLabel="Company name"
              onChange={(value) => updatePreviewCompanyField("name", value)}
            />
            {company.website && (
              <PreviewInlineEditor value={company.website} disabled={!isSingleEditablePreview} ariaLabel="Company website" onChange={(value) => updatePreviewCompanyField("website", value.replace(/<[^>]+>/g, ""))} />
            )}
            {company.addressLine && (
              <PreviewInlineEditor value={company.addressLine} disabled={!isSingleEditablePreview} ariaLabel="Company address" onChange={(value) => updatePreviewCompanyField("addressLine", value.replace(/<[^>]+>/g, ""))} />
            )}
            {company.cityLine && (
              <PreviewInlineEditor value={company.cityLine} disabled={!isSingleEditablePreview} ariaLabel="Company city and state" onChange={(value) => updatePreviewCompanyField("cityLine", value.replace(/<[^>]+>/g, ""))} />
            )}
          </div>
        </div>

        <div className="offer-generator-letter-divider" />

        {/* DATE */}
        <div className="offer-generator-letter-date">
          {formatDate(company.letterDate)}
        </div>

        {/* RECIPIENT */}
        <div className="offer-generator-letter-recipient">
          <PreviewInlineEditor
            value={candidate.name || "Candidate Name"}
            disabled={!isSingleEditablePreview}
            className="offer-generator-preview-candidate-name"
            ariaLabel="Candidate name"
            onChange={(value) => updatePreviewCandidateField(candidate.id, "name", value.replace(/<[^>]+>/g, ""))}
          />
        </div>

        {/* SUBJECT */}
        <div className="offer-generator-letter-subject">
          <strong>Subject: </strong>
          <PreviewInlineEditor
            value={replaceCustomTokensInRichHtml(candidateTemplate.subject, candidate, company, customFields, resolvedDynamicValues)}
            disabled={!isSingleEditablePreview}
            className="offer-generator-preview-inline-subject"
            ariaLabel="Subject"
            selectionRef={previewSelectionRef}
            onChange={(value) => updatePreviewTemplateField(candidate.letterType, "subject", value)}
            onBlur={(value) => updatePreviewTemplateField(candidate.letterType, "subject", transformRichTextNodes(value, convertCommonPhrasesToPlaceholders))}
          />
        </div>

        {/* SALUTATION */}
        <PreviewInlineEditor
          value={replaceCustomTokensInRichHtml(candidateTemplate.salutation, candidate, company, customFields, resolvedDynamicValues)}
          disabled={!isSingleEditablePreview}
          className="offer-generator-letter-salutation offer-generator-preview-block-editor"
          ariaLabel="Salutation"
          selectionRef={previewSelectionRef}
          onChange={(value) => updatePreviewTemplateField(candidate.letterType, "salutation", value)}
          onBlur={(value) => updatePreviewTemplateField(candidate.letterType, "salutation", transformRichTextNodes(value, convertCommonPhrasesToPlaceholders))}
        />

        {/* BODY */}
        <div className="offer-generator-letter-body">
          {candidateTemplate.paragraphs.map((paragraph) => (
            <div key={paragraph.id} className="offer-generator-letter-paragraph-block">
              <PreviewInlineEditor
                value={replaceCustomTokensInRichHtml(paragraph.text, candidate, company, customFields, resolvedDynamicValues)}
                disabled={!isSingleEditablePreview}
                className="offer-generator-letter-rich-paragraph offer-generator-preview-block-editor"
                ariaLabel={`Paragraph ${candidateTemplate.paragraphs.indexOf(paragraph) + 1}`}
                selectionRef={previewSelectionRef}
                onChange={(value) => updatePreviewParagraph(candidate.letterType, paragraph.id, value)}
                onBlur={(value) => updatePreviewParagraph(candidate.letterType, paragraph.id, transformRichTextNodes(value, convertCommonPhrasesToPlaceholders))}
              />

              {paragraph.table && (
                <div className={`offer-generator-custom-preview-table-wrap ${isSingleEditablePreview ? "is-editable" : ""}`}>
                  <div className="offer-generator-preview-table-toolbar">
                    {isSingleEditablePreview ? (
                      <PreviewInlineEditor
                        value={replaceCustomTokensInRichHtml(paragraph.table.title || "", candidate, company, customFields, resolvedDynamicValues)}
                        disabled={!isSingleEditablePreview}
                        className="offer-generator-preview-table-title-editor"
                        placeholder="Table"
                        ariaLabel="Table title"
                        selectionRef={previewSelectionRef}
                        onChange={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, title: value }))}
                        onBlur={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, title: transformRichTextNodes(value, convertCommonPhrasesToPlaceholders) }))}
                      />
                    ) : (
                      <strong>{paragraph.table.title || "Table"}</strong>
                    )}
                    {isSingleEditablePreview && (
                      <div className="offer-generator-preview-table-actions">
                        <button type="button" onClick={() => addParagraphTableColumn(paragraph.id)}>+ Column</button>
                        <button type="button" onClick={() => addParagraphTableRow(paragraph.id)}>+ Row</button>
                        <button type="button" onClick={() => removeParagraphTableColumn(paragraph.id, paragraph.table!.columns.length - 1)} disabled={paragraph.table!.columns.length <= 1}>− Column</button>
                        <button type="button" onClick={() => removeParagraphTableRow(paragraph.id, paragraph.table!.rows.length - 1)} disabled={paragraph.table.rows.length <= 1}>− Row</button>
                        <button type="button" onClick={() => resetPreviewTableWidths(candidate.letterType, paragraph.id)}>Reset Widths</button>
                      </div>
                    )}
                  </div>
                  <table
                    className={`offer-generator-custom-preview-table border-${paragraph.table.borderStyle} color-${paragraph.table.color || "navy"}`}
                    style={{
                      "--table-header-color": getCustomTableColorStyle(paragraph.table.color || "navy").header,
                      "--table-header-text": getCustomTableColorStyle(paragraph.table.color || "navy").headerText,
                      "--table-border-color": getCustomTableColorStyle(paragraph.table.color || "navy").border,
                      "--table-text-color": getCustomTableColorStyle(paragraph.table.color || "navy").text,
                    } as CSSProperties}
                  >
                    <colgroup>
                      {getNormalizedTableColumnWidths(paragraph.table).map((width, columnIndex) => (
                        <col key={`${paragraph.table!.id}-width-${columnIndex}`} style={{ width: `${width}%` }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        {paragraph.table.columns.map((column, columnIndex) => (
                          <th key={`${paragraph.table!.id}-head-${columnIndex}`}>
                            <PreviewInlineEditor
                              value={replaceCustomTokensInRichHtml(column, candidate, company, customFields, resolvedDynamicValues)}
                              disabled={!isSingleEditablePreview}
                              className="offer-generator-preview-table-cell-editor"
                              ariaLabel={`Table column ${columnIndex + 1}`}
                              selectionRef={previewSelectionRef}
                              onChange={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, columns: table.columns.map((item, index) => index === columnIndex ? value : item) }))}
                              onBlur={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, columns: table.columns.map((item, index) => index === columnIndex ? transformRichTextNodes(value, convertCommonPhrasesToPlaceholders) : item) }))}
                            />
                            {isSingleEditablePreview && columnIndex < paragraph.table!.columns.length - 1 && (
                              <div className="offer-generator-table-column-resize-handle" onPointerDown={(event) => handlePreviewTableColumnPointerDown(event, candidate.letterType, paragraph.id, columnIndex)} onPointerMove={(event) => handlePreviewTableColumnPointerMove(event, candidate.letterType)} onPointerUp={handlePreviewTablePointerUp} onPointerCancel={handlePreviewTablePointerUp} aria-label={`Resize column ${columnIndex + 1}`} />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paragraph.table.rows.map((row, rowIndex) => (
                        <tr
                          key={`${paragraph.table!.id}-row-${rowIndex}`}
                          style={{
                            height: getNormalizedTableRowHeights(paragraph.table!)[rowIndex] !== undefined
                              ? `${getNormalizedTableRowHeights(paragraph.table!)[rowIndex]}px`
                              : undefined,
                          }}
                        >
                          {paragraph.table!.columns.map((_, columnIndex) => (
                            <td key={`${paragraph.table!.id}-cell-${rowIndex}-${columnIndex}`}>
                              <PreviewInlineEditor
                                value={replaceCustomTokensInRichHtml(row[columnIndex] || "", candidate, company, customFields, resolvedDynamicValues)}
                                disabled={!isSingleEditablePreview}
                                className="offer-generator-preview-table-cell-editor"
                                placeholder="Click to enter"
                                ariaLabel={`Table row ${rowIndex + 1}, column ${columnIndex + 1}`}
                                selectionRef={previewSelectionRef}
                                onChange={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, rows: table.rows.map((currentRow, currentRowIndex) => currentRowIndex === rowIndex ? currentRow.map((cell, currentColumnIndex) => currentColumnIndex === columnIndex ? value : cell) : currentRow) }))}
                                onBlur={(value) => updatePreviewTable(candidate.letterType, paragraph.id, (table) => ({ ...table, rows: table.rows.map((currentRow, currentRowIndex) => currentRowIndex === rowIndex ? currentRow.map((cell, currentColumnIndex) => currentColumnIndex === columnIndex ? transformRichTextNodes(value, convertCommonPhrasesToPlaceholders) : cell) : currentRow) }))}
                              />
                              {isSingleEditablePreview && columnIndex === 0 && (
                                <div className="offer-generator-table-row-resize-handle" onPointerDown={(event) => handlePreviewTableRowPointerDown(event, candidate.letterType, paragraph.id, rowIndex)} onPointerMove={(event) => handlePreviewTableRowPointerMove(event, candidate.letterType)} onPointerUp={handlePreviewTablePointerUp} onPointerCancel={handlePreviewTablePointerUp} aria-label={`Resize row ${rowIndex + 1}`} />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* TERMS & CONDITIONS */}
        {candidateTemplate.showTermsConditions && candidateTemplate.termsConditions.length > 0 && (
          <div className="offer-generator-letter-terms">
            <h3>Terms &amp; Conditions</h3>
            <ol>
              {candidateTemplate.termsConditions.map((term, index) => (
                <li key={`${candidate.letterType}-term-${index}`}>
                  <PreviewInlineEditor
                    value={replaceCustomTokensInRichHtml(term, candidate, company, customFields, resolvedDynamicValues)}
                    disabled={!isSingleEditablePreview}
                    className="offer-generator-preview-term-editor"
                    ariaLabel={`Condition ${index + 1}`}
                    selectionRef={previewSelectionRef}
                    onChange={(value) => updatePreviewTerm(candidate.letterType, index, value)}
                    onBlur={(value) => updatePreviewTerm(candidate.letterType, index, transformRichTextNodes(value, convertCommonPhrasesToPlaceholders))}
                  />
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* CLOSING */}
        <div className="offer-generator-letter-closing">
          <PreviewInlineEditor
            value={replaceCustomTokensInRichHtml(candidateTemplate.closing, candidate, company, customFields, resolvedDynamicValues)}
            disabled={!isSingleEditablePreview}
            className="offer-generator-preview-block-editor"
            ariaLabel="Closing"
            selectionRef={previewSelectionRef}
            onChange={(value) => updatePreviewTemplateField(candidate.letterType, "closing", value)}
            onBlur={(value) => updatePreviewTemplateField(candidate.letterType, "closing", transformRichTextNodes(value, convertCommonPhrasesToPlaceholders))}
          />

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
    <>
      <style>{`
      .offer-generator-rich-editor {
        border: 1px solid #d7dce5;
        border-radius: 10px;
        background: #fff;
        overflow: hidden;
      }
      .offer-generator-rich-toolbar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 7px 8px;
        border-bottom: 1px solid #e6e9ef;
        background: #f8fafc;
      }
      .offer-generator-rich-tool {
        width: 30px;
        height: 30px;
        border: 1px solid #cfd5df;
        border-radius: 6px;
        background: #fff;
        cursor: pointer;
        font-size: 15px;
      }
      .offer-generator-rich-tool:hover {
        background: #eef2f7;
      }
      .offer-generator-rich-tool:active {
        transform: translateY(1px);
      }
      .offer-generator-rich-select {
        height: 30px;
        border: 1px solid #cfd5df;
        border-radius: 6px;
        background: #fff;
        padding: 0 7px;
        font-size: 12px;
        color: #273247;
        cursor: pointer;
      }
      .offer-generator-rich-font {
        width: 145px;
      }
      .offer-generator-rich-divider {
        width: 1px;
        height: 22px;
        background: #d9dee7;
        margin: 0 2px;
      }
      .offer-generator-rich-color-control {
        width: 30px;
        height: 30px;
        border: 1px solid #cfd5df;
        border-radius: 6px;
        background: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        cursor: pointer;
        overflow: hidden;
        font-weight: 800;
        color: #111827;
      }
      .offer-generator-rich-color-control input[type="color"] {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
      .offer-generator-rich-highlight-icon {
        font-size: 16px;
      }
      .offer-generator-rich-hint {
        margin-left: 5px;
        font-size: 11px;
        color: #64748b;
        white-space: nowrap;
      }
      .offer-generator-rich-content {
        min-height: 120px;
        padding: 11px 12px;
        outline: none;
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.5;
        font: inherit;
      }
      .offer-generator-rich-content:empty::before {
        content: attr(data-placeholder);
        color: #94a3b8;
        pointer-events: none;
      }
      .offer-generator-rich-content strong,
      .offer-generator-rich-content b {
        font-weight: 700;
      }
      .offer-generator-rich-content em,
      .offer-generator-rich-content i {
        font-style: italic;
      }
      .offer-generator-rich-content u {
        text-decoration: underline;
      }
      .offer-generator-letter-rich-paragraph {
        margin: 0 0 12px;
        white-space: normal;
        overflow-wrap: anywhere;
      }
      .offer-generator-letter-rich-paragraph p,
      .offer-generator-letter-rich-paragraph div {
        margin: 0;
      }
      .offer-generator-letter-rich-paragraph br {
        display: block;
        content: "";
      }
      .offer-generator-custom-preview-table-wrap h3 span {
        font: inherit;
      }
      .offer-generator-custom-preview-table td span,
      .offer-generator-custom-preview-table th span {
        font: inherit;
      }

      /* ================================================================
         WORD-LIKE DIRECT A4 EDITING
         ================================================================ */
      .offer-generator-preview-inline-editor {
        outline: none;
        min-width: 2px;
        min-height: 1em;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        border-radius: 3px;
        transition: box-shadow .12s ease, background-color .12s ease;
      }
      .offer-generator-preview-inline-editor[contenteditable="true"]:hover {
        background: rgba(22,35,61,.025);
      }
      .offer-generator-preview-inline-editor[contenteditable="true"]:focus {
        background: rgba(255,255,255,.82);
        box-shadow: 0 0 0 2px rgba(37,99,235,.16);
      }
      .offer-generator-preview-inline-editor:empty::before {
        content: attr(data-placeholder);
        color: #94a3b8;
        pointer-events: none;
      }
      .offer-generator-preview-company-name {
        font: inherit;
        font-size: inherit;
        font-weight: inherit;
      }
      .offer-generator-preview-candidate-name {
        font: inherit;
        font-weight: inherit;
      }
      .offer-generator-preview-block-editor {
        display: block;
        width: 100%;
      }
      .offer-generator-preview-inline-subject {
        display: inline-block;
        vertical-align: top;
        width: calc(100% - 68px);
      }
      .offer-generator-preview-term-editor {
        width: 100%;
      }
      .offer-generator-preview-format-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        padding: 7px 9px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 4px 14px rgba(15,23,42,.07);
      }
      .offer-generator-preview-format-label {
        font-size: 11px;
        font-weight: 800;
        color: var(--ink);
        padding: 0 5px 0 2px;
      }
      .offer-generator-preview-format-divider {
        width: 1px;
        height: 22px;
        background: var(--line);
        margin: 0 3px;
      }
      .offer-generator-preview-tool {
        min-width: 30px;
        height: 30px;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        color: var(--ink);
        font-weight: 700;
        cursor: pointer;
      }
      .offer-generator-preview-tool:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: var(--line);
      }
      .offer-generator-preview-tool:disabled {
        opacity: .45;
        cursor: not-allowed;
      }
      .offer-generator-preview-format-help {
        margin-left: auto;
        color: #64748b;
        font-size: 11px;
      }
      .offer-generator-preview-edit-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 10px;
        font-size: 11px;
        color: #475569;
        background: #f8fafc;
        border: 1px solid var(--line);
        border-top: 0;
        border-radius: 0 0 9px 9px;
      }
      .offer-generator-preview-edit-banner button {
        border: 1px solid var(--line-strong);
        border-radius: 6px;
        background: #fff;
        padding: 4px 9px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }
      .offer-generator-preview-table-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 5px 0 6px;
        font-size: 10px;
      }
      .offer-generator-preview-table-actions {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .offer-generator-preview-table-actions button {
        border: 1px solid #cbd5e1;
        border-radius: 5px;
        background: #fff;
        padding: 3px 7px;
        font-size: 10px;
        cursor: pointer;
      }
      .offer-generator-preview-table-actions button:hover:not(:disabled) {
        background: #f8fafc;
      }
      .offer-generator-preview-table-actions button:disabled {
        opacity: .4;
        cursor: not-allowed;
      }
      .offer-generator-custom-preview-table {
        table-layout: fixed;
      }
      .offer-generator-custom-preview-table th,
      .offer-generator-custom-preview-table td {
        position: relative;
      }
      .offer-generator-preview-table-cell-editor {
        width: 100%;
        min-height: 1.1em;
      }
      .offer-generator-table-column-resize-handle {
        position: absolute;
        z-index: 5;
        top: 0;
        right: -4px;
        width: 8px;
        height: 100%;
        cursor: col-resize;
        touch-action: none;
      }
      .offer-generator-table-column-resize-handle:hover {
        background: rgba(37,99,235,.18);
      }
      .offer-generator-table-row-resize-handle {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        bottom: -4px;
        height: 8px;
        cursor: row-resize;
        touch-action: none;
      }
      .offer-generator-table-row-resize-handle:hover {
        background: rgba(37,99,235,.18);
      }
      .offer-generator-custom-preview-table-wrap.is-editable {
        outline: 1px dashed rgba(37,99,235,.18);
        outline-offset: 4px;
      }
      .offer-generator-preview-inline-editor ul,
      .offer-generator-preview-inline-editor ol {
        margin-top: 4px;
        margin-bottom: 4px;
      }
    `}</style>
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
          <h1>Letter Suite</h1>
<p className="letter-suite-tagline">Every Letter. One Suite.</p>
<p className="letter-suite-description">
  Create professional employment letters quickly, accurately, and beautifully.
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

                <button
                  type="button"
                  className="offer-generator-section-minimize"
                  onClick={() => setCompanyDetailsMinimized((current) => !current)}
                  aria-expanded={!companyDetailsMinimized}
                  aria-label={companyDetailsMinimized ? "Expand Company Details" : "Minimize Company Details"}
                  title={companyDetailsMinimized ? "Expand" : "Minimize"}
                >
                  <span aria-hidden="true">{companyDetailsMinimized ? "＋" : "−"}</span>
                </button>
              </div>

              {!companyDetailsMinimized && (
                <>

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

                    <button
                      type="button"
                      className="offer-generator-section-minimize"
                      onClick={() => setPageMarginsMinimized((current) => !current)}
                      aria-expanded={!pageMarginsMinimized}
                      aria-label={pageMarginsMinimized ? "Expand Page Margins" : "Minimize Page Margins"}
                      title={pageMarginsMinimized ? "Expand" : "Minimize"}
                    >
                      <span aria-hidden="true">{pageMarginsMinimized ? "＋" : "−"}</span>
                    </button>
                  </div>

                  {!pageMarginsMinimized && (
                    <>

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
                    </>
                  )}
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
                                updateTerm(index, convertTrailingCommonPhraseToPlaceholder(event.target.value))
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
                </>
              )}
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
                  <div>
                    <h3>Letter Template</h3>
                    <p>Choose the document type. Format text directly from the editing toolbar.</p>
                  </div>

                  <button
                    type="button"
                    className="offer-generator-section-minimize"
                    onClick={() => setLetterTemplateMinimized((current) => !current)}
                    aria-expanded={!letterTemplateMinimized}
                    aria-label={letterTemplateMinimized ? "Expand Letter Template" : "Minimize Letter Template"}
                    title={letterTemplateMinimized ? "Expand" : "Minimize"}
                  >
                    <span aria-hidden="true">{letterTemplateMinimized ? "＋" : "−"}</span>
                  </button>
                </div>

                {!letterTemplateMinimized && (
                  <>

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
                  <button type="button" className={templateType === "custom" ? "active" : ""} onClick={() => changeTemplateType("custom")}>
                    <span className="offer-generator-template-icon icon-edit" />
                    <strong>Custom Letter</strong>
                    <span>Build your own</span>
                  </button>
                </div>

                </>
              )}
              </div>

              {/* CANDIDATE FORM */}
{isEditable && (
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

                  {isCandidateStandardFieldVisible("name") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Full Name *</label>
                        <span className="offer-generator-field-status">Required</span>
                      </div>
                      <input
                        type="text"
                        value={candidateForm.name}
                        onChange={(event) => updateCandidateForm("name", event.target.value)}
                        placeholder="Rahul Verma"
                      />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("designation") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Designation</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("designation")}>Remove</button>
                      </div>
                      <input type="text" value={candidateForm.designation} onChange={(event) => updateCandidateForm("designation", event.target.value)} placeholder="Software Engineer" />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("department") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Department</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("department")}>Remove</button>
                      </div>
                      <input type="text" value={candidateForm.department} onChange={(event) => updateCandidateForm("department", event.target.value)} placeholder="Engineering" />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("salary") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>{getCandidateFieldLabel("salary")}</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("salary")}>Remove</button>
                      </div>
                      <input type="text" value={candidateForm.salary} onChange={(event) => updateCandidateForm("salary", event.target.value)} placeholder={getSalaryPlaceholder()} />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("joiningDate") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>{getCandidateFieldLabel("joiningDate")}</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("joiningDate")}>Remove</button>
                      </div>
                      <input type="date" value={candidateForm.joiningDate} onChange={(event) => updateCandidateForm("joiningDate", event.target.value)} />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("location") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Location</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("location")}>Remove</button>
                      </div>
                      <input type="text" value={candidateForm.location} onChange={(event) => updateCandidateForm("location", event.target.value)} placeholder="Bengaluru" />
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("employmentType") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Employment Type</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("employmentType")}>Remove</button>
                      </div>
                      <select value={candidateForm.employmentType} onChange={(event) => updateCandidateForm("employmentType", event.target.value)}>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                        <option value="Temporary">Temporary</option>
                      </select>
                    </div>
                  )}

                  {isCandidateStandardFieldVisible("reportingManager") && (
                    <div className="offer-generator-field">
                      <div className="offer-generator-field-label-row">
                        <label>Reporting Manager</label>
                        <button type="button" className="offer-generator-field-remove" onClick={() => hideCandidateStandardField("reportingManager")}>Remove</button>
                      </div>
                      <input type="text" value={candidateForm.reportingManager} onChange={(event) => updateCandidateForm("reportingManager", event.target.value)} placeholder="Ananya Rao" />
                    </div>
                  )}
                </div>

                {(() => {
                  const unregisteredTokens = getUnregisteredTemplateTokens(currentTemplate).filter(
                    (token) => !ignoredDetectedFieldTokens.includes(token)
                  );

                  // Only fields that the user has explicitly approved should become
                  // additional Candidate Details boxes. Standard/common fields are
                  // already connected to the existing form and must never appear here.
                  const approvedCustomFields = customFields
                    .filter((field) =>
                      candidateDetailCustomFieldNames.includes(field.name) ||
                      getDetectedTemplateTokens(currentTemplate).some((token) =>
                        normalizePlaceholderToken(token) === field.name
                      )
                    )
                    .map((field) => ({
                      name: field.name,
                      label: humanizePlaceholder(field.name),
                      source: "custom" as const,
                    }))
                    .filter((field, index, allFields) =>
                      allFields.findIndex((item) => item.name === field.name) === index
                    );

                  if (approvedCustomFields.length === 0 && unregisteredTokens.length === 0) return null;

                  return (
                    <div className="offer-generator-dynamic-fields">
                      {unregisteredTokens.length > 0 && (
                        <div className="offer-generator-dynamic-detected-panel">
                          <div className="offer-generator-dynamic-fields-header">
                            <div>
                              <strong>New field detected</strong>
                              <p>Noorado found a new field in this letter. Add it to Candidate Details before entering a value.</p>
                            </div>
                            <span>{unregisteredTokens.length} waiting</span>
                          </div>

                          <div className="offer-generator-detected-field-list">
                            {unregisteredTokens.map((token) => (
                              <div className="offer-generator-detected-field-row" key={token}>
                                <div>
                                  <strong>{humanizePlaceholder(token)}</strong>
                                  <code>{`{{${token}}}`}</code>
                                </div>
                                <div className="offer-generator-detected-field-actions">
                                  <button type="button" className="offer-generator-button offer-generator-button-primary" onClick={() => addDetectedField(token)}>
                                    + Add to Candidate Details
                                  </button>
                                  <button type="button" className="offer-generator-button" onClick={() => removeUnregisteredPlaceholderFromCurrentLetter(token)}>
                                    Remove from Letter
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {approvedCustomFields.length > 0 && (
                        <>
                          <div className="offer-generator-dynamic-fields-header">
                            <div>
                              <strong>Candidate fields added for this letter</strong>
                              <p>Only extra fields you approved are shown here. Standard fields stay in the main Candidate Details form.</p>
                            </div>
                            <span>{approvedCustomFields.length} added</span>
                          </div>

                          <div className="offer-generator-dynamic-extra-grid">
                            {approvedCustomFields.map((field) => {
                              const known = COMMON_PLACEHOLDER_MAP.get(field.name);
                              const currentValue = candidateFormDynamicValues[field.name] ??
                                (known?.name === "firstName" ? candidateForm.name.trim().split(/\s+/)[0] || "" :
                                  known?.name === "lastName" ? candidateForm.name.trim().split(/\s+/).slice(1).join(" ") :
                                    known?.name === "annualCTC" || known?.name === "monthlySalary" ? candidateForm.salary : "");
                              return (
                                <div className="offer-generator-field offer-generator-dynamic-field" key={field.name}>
                                  <div className="offer-generator-field-label-row">
                                    <label>{field.label} <code>{`{{${field.name}}}`}</code></label>
                                    <button type="button" className="offer-generator-field-remove" onClick={() => removeCandidateCustomizeField(field.name)}>Remove</button>
                                  </div>
                                  <input type="text" value={currentValue} onChange={(event) => updateCandidateDynamicValue(field.name, event.target.value)} placeholder={`Enter ${field.label.toLowerCase()}`} />
                                </div>
                              );
                            })}
                          </div>

                          {getMissingDynamicFields(liveDraftCandidate, candidateFormDynamicValues)
                            .filter((token) => approvedCustomFields.some((field) => field.name === token)).length > 0 && (
                              <div className="offer-generator-dynamic-warning">
                                <strong>Action required</strong>
                                <span>Fill the approved dynamic field boxes before generating the letter.</span>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  );
                })()}

                <div className="offer-generator-candidate-customize">
                  <button
                    type="button"
                    className="offer-generator-button offer-generator-candidate-customize-toggle"
                    onClick={() => setCandidateCustomizeOpen((value) => !value)}
                    aria-expanded={candidateCustomizeOpen}
                  >
                    {candidateCustomizeOpen ? "Customize Fields " : "Customize Fields "}
                  </button>

                  {candidateCustomizeOpen && (
                    <div className="offer-generator-candidate-customize-panel">
                      <div className="offer-generator-candidate-customize-header">
                        <div>
                          <strong>Customize Candidate Details</strong>
                          <p>Add a field manually when you need extra information for this candidate.</p>
                        </div>
                        <button
                          type="button"
                          className="offer-generator-button"
                          onClick={() => setCandidateCustomizeOpen(false)}
                        >
                          Minimize
                        </button>
                      </div>

                      <div className="offer-generator-candidate-customize-add">
                        <input
                          type="text"
                          value={candidateCustomizeDraft}
                          onChange={(event) => setCandidateCustomizeDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") addCandidateCustomizeField();
                          }}
                          placeholder="CTC / probationPeriod / schoolName"
                        />
                        <button
                          type="button"
                          className="offer-generator-button offer-generator-button-primary"
                          onClick={addCandidateCustomizeField}
                        >
                          + Add Field
                        </button>
                      </div>

                      {hiddenCandidateStandardFields.length > 0 && (
                        <div className="offer-generator-candidate-customize-standard-list">
                          <div className="offer-generator-candidate-customize-subheading">
                            <strong>Hidden standard fields</strong>
                            <span>Add any field back to Candidate Details.</span>
                          </div>
                          <div className="offer-generator-candidate-customize-available">
                            {standardCandidateFieldDefinitions
                              .filter((definition) => hiddenCandidateStandardFields.includes(definition.field))
                              .map((definition) => (
                                <div className="offer-generator-candidate-customize-available-row" key={String(definition.field)}>
                                  <span>{definition.label}</span>
                                  <button type="button" className="offer-generator-button" onClick={() => showCandidateStandardField(definition.field)}>+ Add</button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {candidateDetailCustomFieldNames.length > 0 ? (
                        <div className="offer-generator-candidate-customize-list">
                          {candidateDetailCustomFieldNames.map((name) => (
                            <div className="offer-generator-candidate-customize-row" key={name}>
                              <div>
                                <strong>{humanizePlaceholder(name)}</strong>
                                <code>{`{{${name}}}`}</code>
                              </div>
                              <button
                                type="button"
                                className="offer-generator-button offer-generator-smart-remove"
                                onClick={() => removeCandidateCustomizeField(name)}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="offer-generator-candidate-customize-empty">
                          No extra candidate fields added yet.
                        </div>
                      )}

                      <div className="offer-generator-candidate-customize-tip">
                        <strong>Tip:</strong> Common placeholders such as <code>{`{{annualCTC}}`}</code> are detected from the letter automatically. Use Customize Fields for your own extra fields.
                      </div>
                    </div>
                  )}
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
              )}

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
        {candidates.length !== 1
          ? "s"
          : ""}
      </span>
    </div>

    <div className="offer-generator-list-actions">

      <button
        type="button"
        className="offer-generator-button offer-generator-button-primary"
        onClick={startNewCandidate}
      >
        + Create New Candidate
      </button>

      <button
        type="button"
        onClick={selectAllCandidates}
      >
        Select All
      </button>

      <button
        type="button"
        onClick={deselectAllCandidates}
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

                              <button
                                type="button"
                                className="offer-generator-candidate-details-toggle"
                                onClick={() =>
                                  setExpandedCandidateDetailsId((current) =>
                                    current === candidate.id
                                      ? null
                                      : candidate.id
                                  )
                                }
                              >
                                {expandedCandidateDetailsId === candidate.id
                                  ? "Hide details"
                                  : "Add / Edit details"}
                              </button>

                              {candidate.email && (
                                <span className="offer-generator-candidate-email">
                                  {candidate.email}
                                </span>
                              )}

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

                              {expandedCandidateDetailsId === candidate.id && (
                                <div className="offer-generator-candidate-details-panel">
                                  <div className="offer-generator-form-grid">
                                    <div className="offer-generator-field">
                                      <label>Candidate Email</label>
                                      <input
                                        type="email"
                                        value={candidate.email || ""}
                                        onChange={(event) =>
                                          updateCandidateDetails(
                                            candidate.id,
                                            "email",
                                            event.target.value
                                          )
                                        }
                                        placeholder="rahul@example.com"
                                      />
                                    </div>



                                    <div className="offer-generator-field offer-generator-field-full">
                                      <label>Address</label>
                                      <textarea
                                        value={candidate.address || ""}
                                        onChange={(event) =>
                                          updateCandidateDetails(
                                            candidate.id,
                                            "address",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Candidate address"
                                        rows={2}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
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

                <button
                  type="button"
                  className="offer-generator-section-minimize"
                  onClick={() => setLetterContentMinimized((current) => !current)}
                  aria-expanded={!letterContentMinimized}
                  aria-label={letterContentMinimized ? "Expand Letter Content" : "Minimize Letter Content"}
                  title={letterContentMinimized ? "Expand" : "Minimize"}
                >
                  <span aria-hidden="true">{letterContentMinimized ? "＋" : "−"}</span>
                </button>
              </div>

              {!letterContentMinimized && (
                <>

              <div className="offer-generator-template-form">

                <div className="offer-generator-field">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={currentTemplate.subject}
                    onChange={(event) =>
                      updateTemplate("subject", convertTrailingCommonPhraseToPlaceholder(event.target.value))
                    }
                    onBlur={(event) =>
                      normalizeTemplateTextOnBlur(
                        event.target.value,
                        (value) => updateTemplate("subject", value)
                      )
                    }
                  />
                </div>

                <div className="offer-generator-field">
                  <label>Salutation</label>
                  <input
                    type="text"
                    value={currentTemplate.salutation}
                    onChange={(event) =>
                      updateTemplate("salutation", convertTrailingCommonPhraseToPlaceholder(event.target.value))
                    }
                    onBlur={(event) =>
                      normalizeTemplateTextOnBlur(
                        event.target.value,
                        (value) => updateTemplate("salutation", value)
                      )
                    }
                  />
                </div>

                <div className="offer-generator-field">
                  <label>Closing</label>
                  <input
                    type="text"
                    value={currentTemplate.closing}
                    onChange={(event) =>
                      updateTemplate("closing", convertTrailingCommonPhraseToPlaceholder(event.target.value))
                    }
                    onBlur={(event) =>
                      normalizeTemplateTextOnBlur(
                        event.target.value,
                        (value) => updateTemplate("closing", value)
                      )
                    }
                  />
                </div>

                <label className="offer-generator-checkbox-field">
                  <input
                    type="checkbox"
                    checked={currentTemplate.showSignature}
                    onChange={(event) =>
                      updateTemplate("showSignature", event.target.checked)
                    }
                  />
                  <span>Show HR signature section</span>
                </label>

                                    <div className="offer-generator-smart-fields-panel">
                      <div className="offer-generator-smart-fields-header">
                        <div>
                          <strong>Smart Fields</strong>
                          <span>Manage automatic fields without dealing with confusing placeholder code.</span>
                        </div>
                        <div className="offer-generator-smart-fields-actions">
                          <button type="button" className="offer-generator-button offer-generator-button-primary" onClick={() => setShowCustomFieldEditor((value) => !value)}>
                            {showCustomFieldEditor ? "Close" : "+ Add Field"}
                          </button>
                          <button type="button" className="offer-generator-button" onClick={() => setSmartFieldsMinimized((value) => !value)} aria-expanded={!smartFieldsMinimized}>
                            {smartFieldsMinimized ? "Expand" : "Minimize"}
                          </button>
                        </div>
                      </div>

                      {!smartFieldsMinimized && (
                        <div className="offer-generator-smart-fields-body">
                          <div className="offer-generator-smart-fields-how">
                            <div><strong>1</strong><span>Write normal words such as <b>CTC</b>.</span></div>
                            <div><strong>2</strong><span>Leave the text box and Noorado creates the placeholder.</span></div>
                            <div><strong>3</strong><span>A new <b>CTC</b> box appears in Candidate Details.</span></div>
                          </div>

                          <div className="offer-generator-smart-fields-common">
                            <div className="offer-generator-smart-fields-subhead"><strong>Common phrases</strong><span>Example conversions</span></div>
                            <div className="offer-generator-smart-fields-chip-grid">
                              {COMMON_PHRASE_SHORTCUTS.map((shortcut) => (
                                <div className="offer-generator-smart-field-chip" key={shortcut.token}>
                                  <span>{shortcut.phrase}</span>
                                  <code>{`{{${shortcut.token}}}`}</code>
                                </div>
                              ))}
                            </div>
                          </div>

                          {showCustomFieldEditor && (
                            <div className="offer-generator-smart-field-add-box">
                              <div><strong>Add a new field</strong><span>Type the field name only. Example: <b>CTC</b> → <code>{`{{CTC}}`}</code>.</span></div>
                              <div className="offer-generator-smart-field-add-row">
                                <input type="text" value={customFieldDraftName} onChange={(event) => setCustomFieldDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCustomField(); }} placeholder="CTC / probationPeriod / rollNumber" />
                                <button type="button" className="offer-generator-button offer-generator-button-primary" onClick={addCustomField}>Add</button>
                              </div>
                            </div>
                          )}

                          <div className="offer-generator-smart-fields-custom">
                            <div className="offer-generator-smart-fields-subhead"><strong>My fields</strong><span>{customFields.length ? `${customFields.length} field${customFields.length === 1 ? "" : "s"}` : "No custom fields"}</span></div>
                            {customFields.length ? (
                              <div className="offer-generator-smart-field-list">
                                {customFields.map((field) => {
                                  const isEditing = editingCustomFieldId === field.id;
                                  return isEditing ? (
                                    <div className="offer-generator-smart-field-row" key={field.id}>
                                      <input value={editingCustomFieldName} onChange={(event) => setEditingCustomFieldName(event.target.value)} />
                                      <button type="button" className="offer-generator-button" onClick={() => saveEditCustomField(field.id)}>Save</button>
                                      <button type="button" className="offer-generator-button" onClick={cancelEditCustomField}>Cancel</button>
                                    </div>
                                  ) : (
                                    <div className="offer-generator-smart-field-row" key={field.id}>
                                      <code>{`{{${field.name}}}`}</code>
                                      <span>{humanizePlaceholder(field.name)}</span>
                                      <button type="button" className="offer-generator-button" onClick={() => startEditCustomField(field)}>Edit</button>
                                      <button type="button" className="offer-generator-button offer-generator-smart-remove" onClick={() => removeCustomField(field.id)}>Remove</button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="offer-generator-smart-field-empty">No custom fields added.</div>
                            )}
                          </div>

                          <div className="offer-generator-smart-fields-note"><span className="offer-generator-smart-fields-note-icon">✓</span><span>Works for <b>Offer, Appointment, Joining, Internship and Custom</b> letters.</span></div>
                        </div>
                      )}
                    </div>

{templateType === "custom" ? (
                  <div className="offer-generator-custom-builder">
                    <div className="offer-generator-custom-help">
                      <strong>Build Your Own Letter</strong>
                      <p>
                        Use placeholders inside double curly brackets, for example
                        <code>{`{{candidateName}}`}</code>, <code>{`{{designation}}`}</code> and
                        <code>{`{{joiningDate}}`}</code>. Noorado replaces these values automatically
                        in the A4 preview and PDF.
                      </p>
                      <p>
                        You can also create your own placeholder such as
                        <code>{`{{probationPeriod}}`}</code> by adding a Custom Field below.
                      </p>
                    </div>

                    <div className="offer-generator-paragraph-editor">
                      <div className="offer-generator-content-heading">
                        <div>
                          <h3>Letter Content</h3>
                          <p>Write your own content. You can use the placeholders above.</p>
                        </div>

                        <div className="offer-generator-content-heading-actions">
                          <button
                            type="button"
                            className="offer-generator-button"
                            onClick={resetLetterParagraphsToDefault}
                          >
                            Default
                          </button>
                          <button
                            type="button"
                            className="offer-generator-button"
                            onClick={addCustomParagraph}
                          >
                            Add Paragraph
                          </button>
                          <span>{currentTemplate.paragraphs.length} paragraphs</span>
                        </div>
                      </div>

                      {currentTemplate.paragraphs.map((paragraph, index) => (
                        <div className="offer-generator-paragraph-field" key={paragraph.id}>
                          <div className="offer-generator-custom-paragraph-heading">
                            <label>Paragraph {index + 1}</label>
                            {currentTemplate.paragraphs.length > 1 && (
                              <button
                                type="button"
                                className="offer-generator-button"
                                onClick={() => removeCustomParagraph(paragraph.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <RichTextEditor
                            value={paragraph.text}
                            onChange={(value) => updateParagraph(paragraph.id, value)}
                            onBlur={(value) =>
                              updateParagraph(
                                paragraph.id,
                                transformRichTextNodes(value, convertCommonPhrasesToPlaceholders)
                              )
                            }
                            placeholder="Write your custom letter content here..."
                            minHeight={150}
                            ariaLabel={`Paragraph ${index + 1}`}
                            selectionRef={previewSelectionRef}
                          />

                          <div className="offer-generator-paragraph-table-actions">
                            <button
                              type="button"
                              className="offer-generator-button offer-generator-button-secondary"
                              onClick={() => addParagraphTable(paragraph.id)}
                              disabled={Boolean(paragraph.table)}
                            >
                              + Add Table
                            </button>
                            <button
                              type="button"
                              className="offer-generator-button"
                              onClick={() => removeParagraphTable(paragraph.id)}
                              disabled={!paragraph.table}
                            >
                              Remove Table
                            </button>
                          </div>

                          {paragraph.table && (
                            <div className="offer-generator-custom-table-editor offer-generator-paragraph-table-editor">
                              <div className="offer-generator-custom-table-toolbar">
                                <input
                                  type="text"
                                  value={paragraph.table.title}
                                  onChange={(event) =>
                                    updateParagraphTable(paragraph.id, (table) => ({ ...table, title: event.target.value }))
                                  }
                                  placeholder="Table title"
                                />
                                <button type="button" className="offer-generator-button offer-generator-table-action-add" onClick={() => addParagraphTableColumn(paragraph.id)}>+ Add Column</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-remove" onClick={() => removeParagraphTableColumn(paragraph.id, paragraph.table!.columns.length - 1)} disabled={paragraph.table!.columns.length <= 1}>− Remove Column</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-add" onClick={() => addParagraphTableRow(paragraph.id)}>+ Add Row</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-remove" onClick={() => removeParagraphTableRow(paragraph.id, paragraph.table!.rows.length - 1)} disabled={paragraph.table!.rows.length <= 1}>− Remove Row</button>
                              </div>

                              <div className="offer-generator-custom-table-style-control">
                                <span>Table Lines</span>
                                <div className="offer-generator-custom-table-style-options" role="group" aria-label="Table line style">
                                  {([["solid", "Solid"], ["dotted", "Dotted"], ["dashed", "Dashed"], ["none", "No Lines"]] as const).map(([value, label]) => (
                                    <button key={value} type="button" className={`offer-generator-table-style-button ${paragraph.table!.borderStyle === value ? "active" : ""}`} onClick={() => updateParagraphTable(paragraph.id, (table) => ({ ...table, borderStyle: value }))} aria-pressed={paragraph.table!.borderStyle === value} title={label}>
                                      <span className={`offer-generator-table-style-line style-${value}`} aria-hidden="true" />
                                      <span>{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="offer-generator-custom-table-style-control offer-generator-custom-table-color-control">
                                <span>Table Color</span>
                                <div className="offer-generator-custom-table-style-options" role="group" aria-label="Table color">
                                  {CUSTOM_TABLE_COLORS.map(([value, label]) => (
                                    <button key={value} type="button" className={`offer-generator-table-color-button ${paragraph.table!.color === value ? "active" : ""}`} onClick={() => updateParagraphTable(paragraph.id, (table) => ({ ...table, color: value }))} aria-pressed={(paragraph.table!.color || "navy") === value} title={label}>
                                      <span className="offer-generator-table-color-swatch" style={{ background: getCustomTableColorStyle(value).header }} aria-hidden="true" />
                                      <span>{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="offer-generator-custom-table-scroll">
                                <table className={`offer-generator-custom-editor-table border-${paragraph.table.borderStyle} color-${paragraph.table.color || "navy"}`} style={{
                                  "--table-header-color": getCustomTableColorStyle(paragraph.table.color || "navy").header,
                                  "--table-header-text": getCustomTableColorStyle(paragraph.table.color || "navy").headerText,
                                  "--table-border-color": getCustomTableColorStyle(paragraph.table.color || "navy").border,
                                  "--table-text-color": getCustomTableColorStyle(paragraph.table.color || "navy").text,
                                } as CSSProperties}>
                                  <colgroup>
                                    {getNormalizedTableColumnWidths(paragraph.table).map((width, columnIndex) => (
                                      <col key={`${paragraph.table!.id}-editor-width-${columnIndex}`} style={{ width: `${width}%` }} />
                                    ))}
                                  </colgroup>
                                  <thead><tr>
                                    {paragraph.table.columns.map((column, columnIndex) => (
                                      <th key={`${paragraph.table!.id}-editor-head-${columnIndex}`}>
                                        <div className="offer-generator-table-column-header">
                                          <input type="text" value={column} onChange={(event) => updateParagraphTableColumn(paragraph.id, columnIndex, convertTrailingCommonPhraseToPlaceholder(event.target.value))} placeholder={`Column ${columnIndex + 1}`} />
                                          <button type="button" className="offer-generator-table-column-remove" onClick={() => removeParagraphTableColumn(paragraph.id, columnIndex)} disabled={paragraph.table!.columns.length <= 1} title={`Remove column ${columnIndex + 1}`} aria-label={`Remove column ${columnIndex + 1}`}>×</button>
                                        </div>
                                      </th>
                                    ))}
                                    <th className="offer-generator-table-row-action-header" aria-label="Row actions" />
                                  </tr></thead>
                                  <tbody>
                                    {paragraph.table.rows.map((row, rowIndex) => (
                                      <tr
                                        key={`${paragraph.table!.id}-editor-row-${rowIndex}`}
                                        style={{ height: getNormalizedTableRowHeights(paragraph.table!)[rowIndex] !== undefined ? `${getNormalizedTableRowHeights(paragraph.table!)[rowIndex]}px` : undefined }}
                                      >
                                        {paragraph.table!.columns.map((_, columnIndex) => (
                                          <td key={`${paragraph.table!.id}-editor-cell-${rowIndex}-${columnIndex}`}>
                                            <RichTextEditor
  value={row[columnIndex] || ""}
  onChange={(value) => updateParagraphTableCell(paragraph.id, rowIndex, columnIndex, value)}
  onBlur={(value) =>
    updateParagraphTableCell(
      paragraph.id,
      rowIndex,
      columnIndex,
      transformRichTextNodes(value, convertCommonPhrasesToPlaceholders)
    )
  }
  placeholder="Enter value"
  minHeight={64}
  compact
  ariaLabel={`Table row ${rowIndex + 1}, column ${columnIndex + 1}`}

                                            selectionRef={previewSelectionRef}
                                          />
                                          </td>
                                        ))}
                                        <td className="offer-generator-table-row-actions-cell">
                                          <button type="button" className="offer-generator-table-row-remove" onClick={() => removeParagraphTableRow(paragraph.id, rowIndex)} disabled={paragraph.table!.rows.length <= 1} title={`Remove row ${rowIndex + 1}`} aria-label={`Remove row ${rowIndex + 1}`}>×</button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>


                  </div>
                ) : (
                  <>
                    <div className="offer-generator-paragraph-editor">
                      <div className="offer-generator-content-heading">
                        <div>
                          <h3>Letter Content</h3>
                          <p>Changes appear instantly in the A4 preview.</p>
                        </div>

                        <div className="offer-generator-content-heading-actions">
                          <button
                            type="button"
                            className="offer-generator-button"
                            onClick={resetLetterParagraphsToDefault}
                          >
                            Default
                          </button>
                          <span>{currentTemplate.paragraphs.length} paragraphs</span>
                        </div>
                      </div>

                      {currentTemplate.paragraphs.map((paragraph, index) => (
                        <div
                          key={paragraph.id}
                          className="offer-generator-paragraph-field"
                        >
                          <label>Paragraph {index + 1}</label>
                          <RichTextEditor
                            value={paragraph.text}
                            onChange={(value) => updateParagraph(paragraph.id, value)}
                            onBlur={(value) =>
                              updateParagraph(
                                paragraph.id,
                                transformRichTextNodes(value, convertCommonPhrasesToPlaceholders)
                              )
                            }
                            placeholder="Enter paragraph text..."
                            minHeight={120}
                            ariaLabel={`Paragraph ${index + 1}`}

                                            selectionRef={previewSelectionRef}
                                          />

                          <div className="offer-generator-paragraph-table-actions">
                            <button type="button" className="offer-generator-button offer-generator-button-secondary" onClick={() => addParagraphTable(paragraph.id)} disabled={Boolean(paragraph.table)}>+ Add Table</button>
                            <button type="button" className="offer-generator-button" onClick={() => removeParagraphTable(paragraph.id)} disabled={!paragraph.table}>Remove Table</button>
                          </div>

                          {paragraph.table && (
                            <div className="offer-generator-custom-table-editor offer-generator-paragraph-table-editor">
                              <div className="offer-generator-custom-table-toolbar">
                                <input type="text" value={paragraph.table.title} onChange={(event) => updateParagraphTable(paragraph.id, (table) => ({ ...table, title: event.target.value }))} placeholder="Table title" />
                                <button type="button" className="offer-generator-button offer-generator-table-action-add" onClick={() => addParagraphTableColumn(paragraph.id)}>+ Add Column</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-remove" onClick={() => removeParagraphTableColumn(paragraph.id, paragraph.table!.columns.length - 1)} disabled={paragraph.table!.columns.length <= 1}>− Remove Column</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-add" onClick={() => addParagraphTableRow(paragraph.id)}>+ Add Row</button>
                                <button type="button" className="offer-generator-button offer-generator-table-action-remove" onClick={() => removeParagraphTableRow(paragraph.id, paragraph.table!.rows.length - 1)} disabled={paragraph.table!.rows.length <= 1}>− Remove Row</button>
                              </div>
                              <div className="offer-generator-custom-table-style-control">
                                <span>Table Lines</span>
                                <div className="offer-generator-custom-table-style-options" role="group" aria-label="Table line style">
                                  {([["solid", "Solid"], ["dotted", "Dotted"], ["dashed", "Dashed"], ["none", "No Lines"]] as const).map(([value, label]) => (
                                    <button key={value} type="button" className={`offer-generator-table-style-button ${paragraph.table!.borderStyle === value ? "active" : ""}`} onClick={() => updateParagraphTable(paragraph.id, (table) => ({ ...table, borderStyle: value }))} aria-pressed={paragraph.table!.borderStyle === value} title={label}>
                                      <span className={`offer-generator-table-style-line style-${value}`} aria-hidden="true" /><span>{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="offer-generator-custom-table-style-control offer-generator-custom-table-color-control">
                                <span>Table Color</span>
                                <div className="offer-generator-custom-table-style-options" role="group" aria-label="Table color">
                                  {CUSTOM_TABLE_COLORS.map(([value, label]) => (
                                    <button key={value} type="button" className={`offer-generator-table-color-button ${paragraph.table!.color === value ? "active" : ""}`} onClick={() => updateParagraphTable(paragraph.id, (table) => ({ ...table, color: value }))} aria-pressed={(paragraph.table!.color || "navy") === value} title={label}>
                                      <span className="offer-generator-table-color-swatch" style={{ background: getCustomTableColorStyle(value).header }} aria-hidden="true" /><span>{label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="offer-generator-custom-table-scroll">
                                <table className={`offer-generator-custom-editor-table border-${paragraph.table.borderStyle} color-${paragraph.table.color || "navy"}`} style={{
                                  "--table-header-color": getCustomTableColorStyle(paragraph.table.color || "navy").header,
                                  "--table-header-text": getCustomTableColorStyle(paragraph.table.color || "navy").headerText,
                                  "--table-border-color": getCustomTableColorStyle(paragraph.table.color || "navy").border,
                                  "--table-text-color": getCustomTableColorStyle(paragraph.table.color || "navy").text,
                                } as CSSProperties}>
                                  <colgroup>
                                    {getNormalizedTableColumnWidths(paragraph.table).map((width, columnIndex) => (
                                      <col key={`${paragraph.table!.id}-editor-width-${columnIndex}`} style={{ width: `${width}%` }} />
                                    ))}
                                  </colgroup>
                                  <thead><tr>{paragraph.table.columns.map((column, columnIndex) => (
                                    <th key={`${paragraph.table!.id}-editor-head-${columnIndex}`}>
                                      <div className="offer-generator-table-column-header">
                                        <input type="text" value={column} onChange={(event) => updateParagraphTableColumn(paragraph.id, columnIndex, convertTrailingCommonPhraseToPlaceholder(event.target.value))} placeholder={`Column ${columnIndex + 1}`} />
                                        <button type="button" className="offer-generator-table-column-remove" onClick={() => removeParagraphTableColumn(paragraph.id, columnIndex)} disabled={paragraph.table!.columns.length <= 1} title={`Remove column ${columnIndex + 1}`} aria-label={`Remove column ${columnIndex + 1}`}>×</button>
                                      </div>
                                    </th>
                                  ))}
                                  <th className="offer-generator-table-row-action-header" aria-label="Row actions" />
                                </tr></thead>
                                  <tbody>{paragraph.table.rows.map((row, rowIndex) => (
                                    <tr
                                        key={`${paragraph.table!.id}-editor-row-${rowIndex}`}
                                        style={{ height: getNormalizedTableRowHeights(paragraph.table!)[rowIndex] !== undefined ? `${getNormalizedTableRowHeights(paragraph.table!)[rowIndex]}px` : undefined }}
                                      >{paragraph.table!.columns.map((_, columnIndex) => (
                                      <td key={`${paragraph.table!.id}-editor-cell-${rowIndex}-${columnIndex}`}><RichTextEditor
  value={row[columnIndex] || ""}
  onChange={(value) => updateParagraphTableCell(paragraph.id, rowIndex, columnIndex, value)}
  onBlur={(value) =>
    updateParagraphTableCell(
      paragraph.id,
      rowIndex,
      columnIndex,
      transformRichTextNodes(value, convertCommonPhrasesToPlaceholders)
    )
  }
  placeholder="Enter value"
  minHeight={64}
  compact
  ariaLabel={`Table row ${rowIndex + 1}, column ${columnIndex + 1}`}

                                            selectionRef={previewSelectionRef}
                                          /></td>
                                    ))}
                                    <td className="offer-generator-table-row-actions-cell">
                                      <button type="button" className="offer-generator-table-row-remove" onClick={() => removeParagraphTableRow(paragraph.id, rowIndex)} disabled={paragraph.table!.rows.length <= 1} title={`Remove row ${rowIndex + 1}`} aria-label={`Remove row ${rowIndex + 1}`}>×</button>
                                    </td>
                                  </tr>
                                  ))}</tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                    {/* Tables are attached to individual paragraphs. */}
              </div>
                </>
              )}
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
              <div className="offer-generator-preview-scroll-shell">
                <div className="offer-generator-preview-sticky-toolbar">
                  <PreviewFormattingToolbar selectionRef={previewSelectionRef} disabled={!isEditable} />
                 <div className="offer-generator-preview-edit-banner">
  <span>
    {candidateViewMode === "preview"
      ? "Viewing — read only"
      : candidateViewMode === "edit"
        ? "Editing"
        : "New candidate"}
  </span>

  {candidateViewMode === "preview" && previewCandidate && (
  <button
    type="button"
    onClick={() => editCandidate(previewCandidate)}
  >
    Edit
  </button>
)}

{candidateViewMode === "edit" && previewCandidate && (
  <button
    type="button"
    onClick={addCandidate}
  >
    Save
  </button>
)}
</div>
                </div>
                <div className="offer-generator-a4-wrapper">
                  {previewCandidate ? (
                    renderLetterPage(
                      effectivePreviewCandidate,
                      undefined,
                      getPreviewDynamicValues(effectivePreviewCandidate)
                    )
                  ) : (
                    <div className="offer-generator-a4-empty">
                      <strong>No candidate selected</strong>
                      <p>
                        Add or select a candidate to generate the letter preview.
                      </p>
                    </div>
                  )}
                </div>
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

      {downloadStatus !== "idle" && (
        <div className="offer-generator-download-overlay">
          <div className="offer-generator-download-popup">
            <div className="offer-generator-download-icon">
              {downloadStatus === "downloading" ? (
                <span className="offer-generator-download-spinner">↓</span>
              ) : (
                <span className="offer-generator-download-check">✓</span>
              )}
            </div>

            <div className="offer-generator-download-title">
              {downloadStatus === "downloading"
                ? "Downloading..."
                : "Download Complete"}
            </div>

            <div className="offer-generator-download-progress">
              <div
                className={
                  downloadStatus === "complete"
                    ? "offer-generator-download-progress-bar complete"
                    : "offer-generator-download-progress-bar"
                }
              />
            </div>

            <div className="offer-generator-download-percent">
              {downloadStatus === "downloading" ? "Processing..." : "100%"}
            </div>

            <div className="offer-generator-download-file">
              {downloadStatus === "downloading"
                ? "Preparing your PDF..."
                : "Your file is ready"}
            </div>

            <button
              type="button"
              className="offer-generator-download-cancel"
              onClick={() => setDownloadStatus("idle")}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
    </>
  );
}


export default OfferJoiningLetterGeneratorPage;

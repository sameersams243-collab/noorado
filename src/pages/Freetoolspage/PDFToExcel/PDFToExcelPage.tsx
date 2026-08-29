import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { ArrowLeft, Check, FileSpreadsheet, FileUp, LoaderCircle, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import "./PDFToExcelPage.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
type Status = "idle" | "converting" | "success";

const fileSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

function PDFToExcelPage() {
  const inputRef = useRef<HTMLInputElement>(null); const [file, setFile] = useState<File | null>(null); const [status, setStatus] = useState<Status>("idle"); const [progress, setProgress] = useState(0); const [progressLabel, setProgressLabel] = useState("Reading table structure and preparing your Excel file."); const [error, setError] = useState(""); const [downloadUrl, setDownloadUrl] = useState(""); const [isDragging, setIsDragging] = useState(false);
  const chooseFile = (next: File | undefined) => { setError(""); setDownloadUrl(""); setStatus("idle"); if (!next) return; if (!isPdf(next)) return setError("Please choose a PDF file."); if (next.size > MAX_FILE_SIZE) return setError("This file is too large. Please choose a PDF under 10 MB."); setFile(next); };
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setIsDragging(true); }; const handleDragLeave = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); }; const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); const dropped = event.dataTransfer.files?.[0]; if (dropped) chooseFile(dropped); };
const convert = async () => {
    if (!file) return;

    setStatus("converting");
    setProgress(20);
    setProgressLabel("Uploading PDF to server...");
    setError("");

    try {
        const formData = new FormData();
        formData.append("file", file);

        setProgress(40);
        setProgressLabel("Converting PDF on server...");

        const response = await fetch("http://localhost:8080/api/pdf/convert", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        setProgress(80);
        setProgressLabel("Preparing Excel file...");

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        setDownloadUrl(url);

        setProgress(100);
        setProgressLabel("Conversion completed!");

        setStatus("success");

    } catch (error) {

        console.error(error);

        setStatus("idle");

        setError(
            "PDF conversion failed. Please make sure the backend server is running."
        );
    }
};
  const reset = () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); setFile(null); setStatus("idle"); setProgress(0); setError(""); setDownloadUrl(""); if (inputRef.current) inputRef.current.value = ""; };
  return <><Navbar /><main className="pdf-tool-page"><div className="pdf-tool-shell"><Link to="/tools" className="pdf-tool-back"><ArrowLeft size={16} /> All tools</Link><header className="pdf-tool-header"><span className="pdf-tool-label">PDF TOOLS</span><h1>PDF to Excel</h1><p>Convert PDF tables into editable Excel files.</p></header><section className="pdf-tool-card" aria-live="polite">{status === "success" ? <div className="pdf-success"><span className="pdf-success-icon"><Check size={24} /></span><h2>Excel file ready</h2><p>Your editable spreadsheet has been prepared.</p><a className="pdf-primary-button" href={downloadUrl} download={`${file?.name.replace(/\.pdf$/i, "") || "converted"}.xlsx`}><FileSpreadsheet size={18} /> Download Excel</a><button className="pdf-secondary-button" type="button" onClick={reset}>Convert Another PDF</button></div> : <>{!file && <div className={`pdf-upload ${isDragging ? "is-dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inputRef.current?.click(); } }}><span className="pdf-upload-icon"><FileUp size={27} /></span><strong>Upload PDF</strong><span>Drag and drop your file here, or click to browse</span><small>PDF only · Maximum 10 MB</small></div>}<input ref={inputRef} className="pdf-hidden-input" type="file" accept="application/pdf,.pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0])} />{file && <div className="pdf-file-row"><span className="pdf-file-icon"><FileSpreadsheet size={22} /></span><span className="pdf-file-info"><strong>{file.name}</strong><small>{fileSize(file.size)}</small></span><button type="button" className="pdf-remove" onClick={reset} aria-label="Remove PDF"><X size={18} /></button></div>}{status === "converting" && <div className="pdf-progress"><div className="pdf-progress-heading"><span>Converting PDF...</span><span>{progress}%</span></div><div className="pdf-progress-track"><span style={{ width: `${progress}%` }} /></div><p>{progressLabel}</p></div>}{error && <p className="pdf-error" role="alert">{error}</p>}{file && status !== "converting" && <button className="pdf-primary-button pdf-convert-button" type="button" onClick={convert}><FileSpreadsheet size={18} /> Convert to Excel</button>}{status === "converting" && <LoaderCircle className="pdf-spinner" size={22} aria-label="Conversion in progress" />}</>}</section></div></main></>;
}
export default PDFToExcelPage;

"use client";

import { ChangeEvent, useRef } from "react";
import { Download, FileSpreadsheet, FileUp, FileDown } from "lucide-react";

interface DataActionsProps {
  onDownloadReport: () => void;
  onExport: () => void;
  onExportTranscript: () => void;
  onImportFile: (file: File) => void;
}

export function DataActions({ onDownloadReport, onExport, onExportTranscript, onImportFile }: DataActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = "";
  }

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-xs text-slate-500">
        Download your academic report or export your complete transcript in the official Excel layout.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onExportTranscript}
          className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
        >
          <FileSpreadsheet size={14} />
          Export Transcript (Excel)
        </button>
        <button
          onClick={onDownloadReport}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-navy-900 transition hover:bg-slate-50"
        >
          <Download size={14} />
          Download academic report
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-navy-900 transition hover:bg-slate-50"
        >
          <FileDown size={14} />
          Export Data
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-navy-900 transition hover:bg-slate-50"
        >
          <FileUp size={14} />
          Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </section>
  );
}

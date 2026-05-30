"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { uploadEmail } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";

interface UploadedFile {
  name: string;
  s3_key: string;
  url: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  const handleFile = (file: File) => {
    const allowed = ["text/plain", "message/rfc822", "application/octet-stream"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".eml") && !file.name.endsWith(".txt")) {
      toast.error("Only .txt and .eml files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    setSelectedFile(file);
    setUploaded(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const result = await uploadEmail(selectedFile);
      setUploaded({ name: selectedFile.name, ...result });
      toast.success("File uploaded to S3!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Email</h1>
        <p className="text-gray-500 mb-8">Upload a .txt or .eml file to store it in S3.</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`card cursor-pointer border-2 border-dashed transition-colors text-center py-12
            ${dragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"}`}
          role="button"
          aria-label="Upload email file"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          <Upload className="mx-auto text-gray-400 mb-3" size={40} aria-hidden="true" />
          <p className="text-gray-600 font-medium">
            {dragging ? "Drop your file here" : "Drag & drop or click to select"}
          </p>
          <p className="text-sm text-gray-400 mt-1">.txt or .eml — max 5 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.eml,text/plain"
            className="hidden"
            aria-hidden="true"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* Selected file preview */}
        {selectedFile && !uploaded && (
          <div className="card mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Remove selected file"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Upload button */}
        {selectedFile && !uploaded && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary w-full mt-4"
          >
            {uploading ? "Uploading..." : "Upload to S3"}
          </button>
        )}

        {/* Success state */}
        {uploaded && (
          <div className="card mt-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green-600" aria-hidden="true" />
              <span className="font-medium text-green-800">Upload successful</span>
            </div>
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">File:</span> {uploaded.name}
            </p>
            <p className="text-sm text-gray-700 break-all">
              <span className="font-medium">S3 Key:</span> {uploaded.s3_key}
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href={uploaded.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                View file ↗
              </a>
              <button
                onClick={() => { setUploaded(null); setSelectedFile(null); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Upload another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";

type UploadMode = "single" | "multiple";

export function AdminImageUpload({
  label,
  folder,
  usedIn,
  mode = "single",
  value,
  values,
  onChange,
  onChangeMany,
}: {
  label: string;
  folder: string;
  usedIn: string;
  mode?: UploadMode;
  value?: string;
  values?: string[];
  onChange?: (url: string) => void;
  onChangeMany?: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        formData.append("usedIn", usedIn);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Upload failed");
        }
        uploadedUrls.push(data.secure_url || data.url);
      }

      if (mode === "single") {
        onChange?.(uploadedUrls[0] || "");
      } else {
        onChangeMany?.([...(values || []), ...uploadedUrls]);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#0a0a0a]">{label}</label>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={mode === "multiple"}
          onChange={(e) => {
            if (e.target.files?.length) {
              void uploadFiles(e.target.files);
            }
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-[#d8a928]/25 bg-white px-3 py-2 text-sm font-medium text-[#0a0a0a] hover:bg-[#fcf5e8] disabled:opacity-60"
        >
          {uploading ? "Uploading..." : mode === "single" ? "Upload image" : "Upload images"}
        </button>
      </div>

      {mode === "single" && value ? (
        <img src={value} alt="Uploaded preview" className="h-24 w-24 rounded-lg object-cover border border-gray-200" />
      ) : null}

      {mode === "multiple" && values?.length ? (
        <div className="grid grid-cols-4 gap-2">
          {values.map((url) => (
            <img
              key={url}
              src={url}
              alt="Uploaded preview"
              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}


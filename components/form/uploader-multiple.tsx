"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { MAX_MB_UPLOAD } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function MultiUploader({
  values,
  name,
  aspectRatio,
  onChange
}: {
  values: string[] | null;
  name: "image" | "logo";
  aspectRatio?: "aspect-video" | "aspect-square";
  onChange: (files: FileList) => void
}) {
  const ratio = aspectRatio ? aspectRatio : name === "image" ? "aspect-video" : "aspect-square";
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState(values || []);

  const [dragActive, setDragActive] = useState(false);

  const handleUpload = (files: FileList | null) => {
    if (files) {
      setData([]);

      for (const file of Array.from(files)) {
        if (file.size / 1024 / 1024 > MAX_MB_UPLOAD) {
          toast.error(`File size too big (max ${MAX_MB_UPLOAD}MB)`);
          return;
        } else if (
          !file.type.includes("png") &&
          !file.type.includes("jpg") &&
          !file.type.includes("jpeg") &&
          !file.type.includes("webp")
        ) {
          toast.error("Invalid file type (must be .png, .jpg, or .jpeg)");
          return;
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            setData((prev) => (
              [...prev, e.target?.result as string]
            ));
          };
          reader.readAsDataURL(file);
        }
      }

      onChange(files);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <label
        htmlFor={`${name}-upload`}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-500 shadow-sm transition-all hover:bg-gray-50 h-28",
          ratio
        )}
      >
        <div
          className="absolute z-[5] h-full w-full rounded-xl"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            const files = e.dataTransfer.files;
            inputRef.current!.files = files;
            handleUpload(files);
          }}
        />
        <div
          className={`${
            dragActive ? "border-2 border-black" : ""
          } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-xl px-10 transition-all opacity-100 hover:bg-gray-50"}`}
        >
          <svg
            className={`${
              dragActive ? "scale-110" : "scale-100"
            } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M12 12v9"></path>
            <path d="m16 16-4-4-4 4"></path>
          </svg>
          <p className="text-center text-sm text-gray-600">
            Click to upload.
          </p>
          <span className="sr-only">Photo uploads</span>
        </div>
      </label>
      {data && data.map((src, index) => (
        <div className="flex flex-wrap rounded-xl" key={index}>
            <img
              src={src}
              alt="Preview"
              className="h-28 w-[200px] rounded-xl object-cover object-center"
            />
        </div>
       ))}
      <div className="mt-1 flex rounded-xl shadow-sm">
        <input
          id={`${name}-upload`}
          ref={inputRef}
          name={name}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = e.currentTarget.files;
            handleUpload(files);
          }}
        />
      </div>
    </div>
  );
}
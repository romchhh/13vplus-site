"use client";
import React from "react";
import ComponentCard from "@/components/admin/ComponentCard";
import { useDropzone } from "react-dropzone";

interface DropzoneComponentProps {
  onDrop?: (acceptedFiles: File[]) => void;
}

const DropzoneComponent: React.FC<DropzoneComponentProps> = ({
  onDrop = (acceptedFiles: File[]) => {
    console.log("Files dropped:", acceptedFiles);
    // Default handler
  },
}) => {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      console.log("[Dropzone] Accepted files:", acceptedFiles);
      console.log("[Dropzone] Rejected files:", fileRejections);
      
      if (fileRejections && fileRejections.length > 0) {
        console.error("[Dropzone] File rejection errors:", fileRejections);
      }
      
      onDrop(acceptedFiles);
    },
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      "image/svg+xml": [".svg"],
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogg"],
      "video/quicktime": [".mov"],
      "video/x-msvideo": [".avi"],
      "video/x-matroska": [".mkv"],
      "video/x-flv": [".flv"],
      "video/x-ms-wmv": [".wmv"],
    },
    maxSize: 15 * 1024 * 1024, // 15MB
  });

  return (
    <ComponentCard title="Фото й Відео">
      {/* Error messages */}
      {fileRejections && fileRejections.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-700">
          <p className="font-semibold">Помилка завантаження файлів:</p>
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="mt-2">
              <p className="font-medium">{file.name}:</p>
              <ul className="list-disc ml-4">
                {errors.map((error) => (
                  <li key={error.code}>{error.message}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      
      <div className="transition border border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-blue-500">
        <div
          {...getRootProps()}
          className={`dropzone rounded-xl border-dashed border-gray-300 p-7 lg:p-10
        ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white"
        }
      `}
          id="demo-upload"
        >
          {/* Hidden Input */}
          <input {...getInputProps()} />

          <div className="dz-message flex flex-col items-center m-0!">
            {/* Icon Container */}
            <div className="mb-[22px] flex justify-center">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700">
                <svg
                  className="fill-current"
                  width="29"
                  height="28"
                  viewBox="0 0 29 28"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                  />
                </svg>
              </div>
            </div>

            {/* Text Content */}
            <h4 className="mb-3 font-semibold text-gray-900 text-theme-xl">
              {isDragActive ? "Drop Files Here" : "Drag & Drop Files Here"}
            </h4>

            <span className="text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700">
              Drag and drop your PNG, JPG, WebP, SVG images or MP4, WebM videos here or browse
            </span>

            <span className="font-medium underline text-theme-sm text-blue-600">
              Browse File
            </span>
          </div>
        </div>
      </div>
    </ComponentCard>
  );
};

export default DropzoneComponent;

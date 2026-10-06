import React from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface AlertProps {
  type: "success" | "error" | null;
  message: string;
  onClose: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  if (!type) return null;
  
  const isSuccess = type === "success";
  
  return (
    <div className={`flex items-start p-3 mb-4 rounded border shadow-sm ${
      isSuccess ? "bg-[#f2f8f5] border-[#1d8102]" : "bg-[#fdf3f3] border-[#d13212]"
    }`}>
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 text-[#1d8102] mt-0.5 mr-2 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[#d13212] mt-0.5 mr-2 flex-shrink-0" />
      )}
      <div className="flex-1 text-xs text-aws-text font-medium">{message}</div>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-800">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
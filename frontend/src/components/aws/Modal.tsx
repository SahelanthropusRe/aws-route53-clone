import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Modal({ isOpen, title, message, onConfirm, onCancel }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded shadow-lg border border-aws-border w-[400px]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-aws-border bg-gray-50 rounded-t">
          <h2 className="text-sm font-bold text-aws-text">{title}</h2>
          <button onClick={onCancel} className="text-aws-muted hover:text-aws-text">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 text-xs text-aws-text leading-relaxed">
          {message}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t border-aws-border">
          <button 
            onClick={onCancel} 
            className="px-4 py-1.5 border border-aws-borderDark rounded text-xs font-bold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-1.5 bg-aws-text text-white rounded text-xs font-bold hover:bg-black"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
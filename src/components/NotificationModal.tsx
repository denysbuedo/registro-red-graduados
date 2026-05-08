// src/components/NotificationModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface NotificationModalProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export function NotificationModal({ message, type, onClose }: NotificationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mounted) return null;

  const bgColor = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  const textColor = "text-white";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`relative p-4 rounded-lg shadow-lg flex items-center space-x-3 ${bgColor} ${textColor}`}>
        <span>{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          &times;
        </button>
      </div>
    </div>,
    document.body // Portal to the body to ensure it's on top
  );
}

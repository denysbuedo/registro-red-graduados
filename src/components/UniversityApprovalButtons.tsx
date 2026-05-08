"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { NotificationModal } from "@/components/NotificationModal";

interface UniversityApprovalButtonsProps {
  graduateId: number;
  userId: number;
  onRefresh: () => void; // Callback to refresh the parent list
}

export function UniversityApprovalButtons({ graduateId, userId, onRefresh }: UniversityApprovalButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ message: "", type: "info" as "info" | "success" | "error" });
  const router = useRouter();

  const handleApproval = async (status: "approved" | "rejected") => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: status === "approved" ? "approve" : "reject" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar solicitud");
      }

      setNotificationMessage({ message: `Egresado marcado como ${status === 'approved' ? 'Aprobado' : 'Rechazado'}`, type: "success" });
      setShowNotification(true);
      onRefresh(); 
      router.refresh(); 
    } catch (error) {
      console.error("Error al manejar aprobación:", error);
      setNotificationMessage({ message: (error as Error).message, type: "error" });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => handleApproval("approved")}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Aceptar"}
        </button>
        <button
          onClick={() => handleApproval("rejected")}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Rechazar"}
        </button>
      </div>
      {showNotification && (
        <NotificationModal
          message={notificationMessage.message}
          type={notificationMessage.type}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}

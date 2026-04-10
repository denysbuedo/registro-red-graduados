"use client";

import { useState } from "react";
import Link from "next/link";
import { PostComments } from "./PostComments";

interface UserPostCardProps {
  id: number;
  content: string;
  imageUrl: string | null;
  likes: number;
  commentsCount: number;
  createdAt: Date | null;
  graduateId: number;
  graduateName: string;
  graduatePhoto: string | null;
  graduateProfession: string;
  graduateCountry: string;
}

export function UserPostCard({
  id,
  content,
  imageUrl,
  likes,
  commentsCount,
  createdAt,
  graduateId,
  graduateName,
  graduatePhoto,
  graduateProfession,
  graduateCountry,
}: UserPostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount);
  const [localLikes, setLocalLikes] = useState(likes);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setLocalLikes(data.likes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const PREVIEW_LENGTH = 300;
  const shouldTruncate = content.length > PREVIEW_LENGTH;
  const displayContent = isExpanded || !shouldTruncate ? content : content.slice(0, PREVIEW_LENGTH) + "...";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const initials = graduateName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header del post */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <Link href={`/egresados/${graduateId}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003f8f] to-[#0050b8] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
              {graduatePhoto ? (
                <img src={graduatePhoto} alt={graduateName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/egresados/${graduateId}`}>
              <h3 className="font-semibold text-gray-900 hover:text-[#003f8f] transition-colors">
                {graduateName}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 truncate">
              {graduateProfession || "Egresado"}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {graduateCountry}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del post */}
      <div className="p-5">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[#003f8f] hover:text-[#002860] font-medium text-sm transition-colors"
          >
            {isExpanded ? "Mostrar menos" : "Leer más"}
          </button>
        )}

        {/* Imagen */}
        {imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <img
                src={imageUrl}
                alt="Post image"
                className="absolute inset-0 w-full h-full object-contain bg-gray-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Stats y acciones */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {localLikes > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-[#003f8f]">👍</span>
                {localLikes}
              </span>
            )}
            {localCommentsCount > 0 && (
              <span className="flex items-center gap-1">
                <span>💬</span>
                {localCommentsCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              {likeLoading ? "..." : "Like"}
            </button>
          </div>
        </div>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div className="px-5 pb-5">
          <PostComments 
            postId={id} 
            currentGraduateId={graduateId}
            onCountChange={setLocalCommentsCount}
          />
        </div>
      )}
      {!showComments && localCommentsCount > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={() => setShowComments(true)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            💬 Ver {localCommentsCount} {localCommentsCount === 1 ? 'comentario' : 'comentarios'}
          </button>
        </div>
      )}
    </article>
  );
}

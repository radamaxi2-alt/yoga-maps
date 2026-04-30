"use client";

import { useState } from "react";
import { toggleLike } from "@/lib/actions/blog";
import { useRouter } from "next/navigation";

type Props = {
  postId: string;
  initialLikes: number;
  initialHasLiked: boolean;
  title: string;
  isLoggedIn: boolean;
};

export default function BlogInteractions({
  postId,
  initialLikes,
  initialHasLiked,
  title,
  isLoggedIn,
}: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    
    setIsLoading(true);
    // Optimistic UI
    setHasLiked(!hasLiked);
    setLikes((prev) => (hasLiked ? prev - 1 : prev + 1));

    const result = await toggleLike(postId);
    if (result?.error) {
      // Revert on error
      setHasLiked(hasLiked);
      setLikes(initialLikes);
      alert("Error al dar me gusta: " + result.error);
    }
    setIsLoading(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Mira este artículo en Yoga Maps: ${title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error compartiendo:", err);
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          hasLiked
            ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            : "border-brand-100 bg-white text-foreground/70 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-surface-dark-alt dark:bg-surface-dark-alt dark:hover:bg-red-900/20"
        }`}
      >
        <svg
          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
            hasLiked ? "fill-current" : "fill-none stroke-current stroke-2"
          }`}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
        <span>{likes}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-foreground/70 transition-all hover:bg-brand-50 hover:text-brand-600 dark:border-surface-dark-alt dark:bg-surface-dark-alt dark:hover:bg-brand-900/20"
      >
        <svg
          className="h-5 w-5 fill-none stroke-current stroke-2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
        Compartir
      </button>
    </div>
  );
}

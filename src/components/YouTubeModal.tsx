import { useEffect } from "react";
import { X } from "lucide-react";

interface YouTubeModalProps {
  videoId: string | null;
  onClose: () => void;
}

export function YouTubeModal({ videoId, onClose }: YouTubeModalProps) {
  useEffect(() => {
    if (!videoId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [videoId, onClose]);

  if (!videoId) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/10"
      >
        <X className="h-5 w-5" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl overflow-hidden rounded-sm shadow-elegant"
      >
        <div className="relative aspect-video bg-ink">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

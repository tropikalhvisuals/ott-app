import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function HlsPlayer({ src, poster, autoPlay = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;

      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      playsInline
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        background: "#000",
        display: "block",
      }}
    />
  );
}
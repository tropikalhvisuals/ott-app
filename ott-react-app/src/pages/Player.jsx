import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  MessageSquare,
  Video,
  ArrowLeft,
} from "lucide-react";
import Hls from "hls.js";

const fallbackBackdrop =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <rect width="1280" height="720" fill="#020617"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#94a3b8" font-size="42" font-family="Arial, sans-serif">No Backdrop</text>
    </svg>
  `);

const fallbackPoster =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
      <rect width="500" height="750" fill="#0f172a"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#94a3b8" font-size="34" font-family="Arial, sans-serif">No Image</text>
    </svg>
  `);

function DefaultGenreTag({ genre }) {
  return <span className="meta-chip chip-ua">{genre}</span>;
}

function getMovieBackdrop(movie) {
  return (
    movie?.thumbnail_url ||
    movie?.backdrop ||
    movie?.poster ||
    movie?.image ||
    fallbackBackdrop
  );
}

function getRating(movie) {
  if (movie?.rating) return movie.rating;

  const quality = (movie?.quality || "").toLowerCase();
  if (quality.includes("4k")) return "9.0";
  if (quality.includes("1080")) return "8.7";
  if (quality.includes("720")) return "8.2";
  return "8.0";
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function formatLevelLabel(level) {
  const h = level?.height;
  if (h >= 2160) return "4K";
  if (h >= 1440) return "1440p";
  if (h >= 1080) return "1080p";
  if (h >= 720) return "720p";
  if (h >= 480) return "480p";
  if (h >= 360) return "360p";
  return `${h || "Auto"}p`;
}

export default function Player({
  onNavigate,
  GenreTag = DefaultGenreTag,
  selectedMovie,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);
  const [qualityLevels, setQualityLevels] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(-1); // -1 = Auto

  const currentMovie = useMemo(() => {
    return (
      selectedMovie || {
        title: "No Movie Selected",
        genre: "Unknown",
        rating: "0.0",
        thumbnail_url: fallbackPoster,
        description: "Select a movie from the Movies page.",
        hls_master_url: "",
        video_url: "",
        language: "N/A",
        quality: "N/A",
        year: "N/A",
        type: "movie",
      }
    );
  }, [selectedMovie]);

  const videoUrl =
    currentMovie?.hls_master_url ||
    currentMovie?.video_url ||
    currentMovie?.videoUrl ||
    "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsReady(false);
    setQualityLevels([]);
    setSelectedQuality(-1);
    setQualityMenuOpen(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (!videoUrl) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: false,
      });

      hlsRef.current = hls;
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const rawLevels = data?.levels || hls.levels || [];
        const uniqueLevels = rawLevels.filter(
          (level, index, arr) =>
            index === arr.findIndex((x) => x.height === level.height)
        );

        setQualityLevels(uniqueLevels);
        setSelectedQuality(-1);
      });
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume / 100;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsReady(true);
    };

    const onTimeUpdate = () => {
      const current = video.currentTime || 0;
      const total = video.duration || 0;
      setCurrentTime(current);
      setDuration(total);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => setPlaying(false);

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const value = Number(e.target.value);
    const newTime = (value / 100) * duration;
    video.currentTime = newTime;
    setProgress(value);
    setCurrentTime(newTime);
  };

  const handleVolume = (e) => {
    const value = Number(e.target.value);
    setVolume(value);
    setMuted(value === 0);
  };

  const handleMute = () => {
    setMuted((prev) => !prev);
  };

  const skipBy = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    const nextTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    video.currentTime = nextTime;
  };

  const openFullscreen = async () => {
    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const changeQuality = (levelIndex) => {
    const hls = hlsRef.current;

    if (!hls) {
      setSelectedQuality(-1);
      setQualityMenuOpen(false);
      return;
    }

    if (levelIndex === -1) {
      hls.currentLevel = -1;
      hls.nextLevel = -1;
      hls.loadLevel = -1;
      setSelectedQuality(-1);
    } else {
      hls.currentLevel = levelIndex;
      hls.nextLevel = levelIndex;
      hls.loadLevel = levelIndex;
      setSelectedQuality(levelIndex);
    }

    setQualityMenuOpen(false);
  };

  const currentQualityLabel = useMemo(() => {
    if (!qualityLevels.length || selectedQuality === -1) return "Auto";
    return formatLevelLabel(qualityLevels[selectedQuality]);
  }, [qualityLevels, selectedQuality]);

  return (
    <div className="player-page">
      <style>{`
        .player-page {
          color: #fff;
          background: linear-gradient(180deg, #07080d 0%, #090b11 55%, #090a10 100%);
          min-height: 100vh;
        }

        .top-bar {
          padding: 18px 28px 0;
          display: flex;
          align-items: center;
        }

        .back-btn {
          border: none;
          background: rgba(255,255,255,0.08);
          color: #fff;
          height: 42px;
          padding: 0 14px;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
        }

        .player-shell {
          width: 100%;
        }

        .video-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 70vh;
          overflow: hidden;
          background: #000;
        }

        .video-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .player-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
          display: block;
        }

        .video-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .video-overlay-top {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 24%),
            linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.28));
          z-index: 1;
          pointer-events: none;
        }

        .video-overlay-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          pointer-events: none;
        }

        .center-play-btn {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.18);
          background: rgba(229, 9, 20, 0.92);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease;
          box-shadow: 0 12px 30px rgba(229, 9, 20, 0.28);
          pointer-events: auto;
        }

        .center-play-btn:hover {
          transform: scale(1.04);
        }

        .center-play-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .video-controls {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 18px 28px 20px;
          z-index: 3;
          background: linear-gradient(to top, rgba(0,0,0,0.96), rgba(0,0,0,0.08));
          pointer-events: none;
        }

        .controls-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 12px;
        }

        .controls-title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: .4px;
          margin-bottom: 3px;
        }

        .controls-sub {
          font-size: 12px;
          color: rgba(255,255,255,0.68);
        }

        .quality-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .quality-badge {
          background: rgba(229,9,20,0.16);
          border: 1px solid rgba(229,9,20,0.36);
          color: #ff626b;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 8px;
        }

        .quality-menu-wrap {
          position: relative;
          pointer-events: auto;
        }

        .quality-select-btn {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          height: 34px;
          padding: 0 12px;
          border-radius: 10px;
          cursor: pointer;
        }

        .quality-dropdown {
          position: absolute;
          right: 0;
          top: 42px;
          min-width: 140px;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 18px 40px rgba(0,0,0,0.4);
        }

        .quality-option {
          width: 100%;
          text-align: left;
          background: transparent;
          color: #fff;
          border: none;
          padding: 10px 12px;
          cursor: pointer;
          font-size: 13px;
        }

        .quality-option:hover,
        .quality-option.active {
          background: rgba(229,9,20,0.16);
        }

        .seek-row {
          margin-bottom: 14px;
        }

        .seek-range,
        .volume-range {
          width: 100%;
          cursor: pointer;
          pointer-events: auto;
        }

        .seek-range {
          height: 4px;
          accent-color: #e50914;
        }

        .volume-range {
          width: 76px;
          accent-color: #fff;
        }

        .controls-foot {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ctrl-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.76);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 6px;
          transition: color .2s ease, transform .2s ease;
          pointer-events: auto;
        }

        .ctrl-btn:hover {
          color: #fff;
          transform: translateY(-1px);
        }

        .main-play-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #e50914;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          pointer-events: auto;
        }

        .time-text {
          font-size: 13px;
          color: rgba(255,255,255,0.66);
          font-variant-numeric: tabular-nums;
        }

        .controls-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .player-content {
          padding: 24px 28px 36px;
        }

        .content-title {
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .meta-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .meta-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 9px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .chip-rating {
          background: rgba(245,197,24,0.10);
          border-color: rgba(245,197,24,0.30);
          color: #f5c518;
        }

        .chip-ua {
          background: rgba(255,255,255,0.06);
          color: #c3cad8;
        }

        .desc {
          color: #9ca6b7;
          font-size: 14px;
          line-height: 1.8;
          max-width: 780px;
          margin-bottom: 18px;
        }

        .meta-line {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          color: #9ca6b7;
          font-size: 13px;
          margin-bottom: 22px;
        }

        .meta-line strong {
          color: #fff;
        }

        .action-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
        }

        .btn-primary,
        .btn-secondary {
          height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 800;
        }

        .btn-primary {
          background: linear-gradient(135deg, #e50914, #ff3c45);
          color: #fff;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.06);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.10);
        }

        .player-empty {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          color: rgba(255,255,255,0.7);
          font-size: 16px;
          z-index: 0;
        }

        @media (max-width: 768px) {
          .top-bar,
          .video-controls,
          .player-content {
            padding-left: 16px;
            padding-right: 16px;
          }

          .controls-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .controls-right {
            margin-left: 0;
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .content-title {
            font-size: 28px;
          }
        }
      `}</style>

      <div className="top-bar">
        <button className="back-btn" onClick={() => onNavigate?.("movies")}>
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="player-shell">
        <div className="video-wrap" ref={containerRef}>
          {videoUrl ? (
            <div className="video-layer">
              <video
                ref={videoRef}
                className="player-video"
                poster={getMovieBackdrop(currentMovie)}
                playsInline
                preload="metadata"
              />
            </div>
          ) : (
            <>
              <img
                src={getMovieBackdrop(currentMovie)}
                alt={currentMovie.title || "movie background"}
                className="video-bg-img"
                onError={(e) => {
                  e.currentTarget.src = fallbackBackdrop;
                }}
              />
              <div className="player-empty">No video URL available</div>
            </>
          )}

          <div className="video-overlay-top" />

          <div className="video-overlay-center">
            <button
              onClick={togglePlay}
              className="center-play-btn"
              disabled={!videoUrl || !isReady}
            >
              {playing ? (
                <Pause size={26} fill="white" color="white" />
              ) : (
                <Play size={26} fill="white" color="white" />
              )}
            </button>
          </div>

          <div className="video-controls">
            <div className="controls-head">
              <div>
                <div className="controls-title">
                  {currentMovie.title || "No Movie Selected"}
                </div>
                <div className="controls-sub">
                  {currentMovie.year || "N/A"} · {currentMovie.quality || "N/A"} · {currentMovie.language || "N/A"}
                </div>
              </div>

              <div className="quality-badges">
                <span className="quality-badge">
                  {(currentMovie.type || "MOVIE").toUpperCase()}
                </span>

                <div className="quality-menu-wrap">
                  <button
                    className="quality-select-btn"
                    onClick={() => setQualityMenuOpen((prev) => !prev)}
                  >
                    Quality: {currentQualityLabel}
                  </button>

                  {qualityMenuOpen && (
                    <div className="quality-dropdown">
                      <button
                        className={`quality-option ${selectedQuality === -1 ? "active" : ""}`}
                        onClick={() => changeQuality(-1)}
                      >
                        Auto
                      </button>

                      {qualityLevels.map((level, index) => (
                        <button
                          key={`${level.height}-${index}`}
                          className={`quality-option ${selectedQuality === index ? "active" : ""}`}
                          onClick={() => changeQuality(index)}
                        >
                          {formatLevelLabel(level)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="seek-row">
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={handleSeek}
                className="seek-range"
              />
            </div>

            <div className="controls-foot">
              <button className="ctrl-btn" onClick={() => skipBy(-10)}>
                <SkipBack size={18} />
              </button>

              <button onClick={togglePlay} className="main-play-btn">
                {playing ? (
                  <Pause size={16} fill="white" />
                ) : (
                  <Play size={16} fill="white" />
                )}
              </button>

              <button className="ctrl-btn" onClick={() => skipBy(10)}>
                <SkipForward size={18} />
              </button>

              <span className="time-text">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="controls-right">
                <button className="ctrl-btn" onClick={handleMute}>
                  {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="volume-range"
                />

                <button className="ctrl-btn">
                  <MessageSquare size={16} />
                </button>

                <button className="ctrl-btn">
                  <Video size={16} />
                </button>

                <button className="ctrl-btn" onClick={openFullscreen}>
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="player-content">
          <div className="content-title">
            {currentMovie.title || "No Movie Selected"}
          </div>

          <div className="meta-chips">
            <GenreTag genre={currentMovie.genre || "Unknown"} />
            <span className="meta-chip chip-rating">
              IMDb {getRating(currentMovie)}
            </span>
            <span className="meta-chip chip-ua">
              {currentMovie.language || "N/A"}
            </span>
            <span className="meta-chip chip-ua">
              Current: {currentQualityLabel}
            </span>
          </div>

          <p className="desc">
            {currentMovie.description || "No description available."}
          </p>

          <div className="meta-line">
            <span>
              <strong>Type:</strong> {currentMovie.type || "movie"}
            </span>
            <span>
              <strong>Year:</strong> {currentMovie.year || "N/A"}
            </span>
            <span>
              <strong>Quality:</strong> {currentMovie.quality || "N/A"}
            </span>
          </div>

          <div className="action-row">
            <button className="btn-primary" onClick={togglePlay}>
              {playing ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
              {playing ? "Pause" : "Play"}
            </button>

            <button className="btn-secondary" onClick={() => onNavigate?.("movies")}>
              Browse Movies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
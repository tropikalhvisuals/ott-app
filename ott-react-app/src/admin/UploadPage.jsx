import { useRef, useState } from "react";
import {
  Upload,
  CheckCircle,
  Film,
  Image,
  FileVideo,
  Sparkles,
  Save,
} from "lucide-react";

const API = "http://localhost:5000";
const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB

const parseJsonSafe = async (res) => {
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Non-JSON response:", text);
    throw new Error(`Server returned non-JSON response (${res.status})`);
  }
};

function Field({ label, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <input
        {...props}
        style={{
          height: 48,
          borderRadius: 14,
          padding: "0 14px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      />
    </div>
  );
}

function SelectField({ label, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      <select
        {...props}
        style={{
          height: 48,
          borderRadius: 14,
          padding: "0 14px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      >
        {children}
      </select>
    </div>
  );
}

function DropZone({ label, accept, icon: Icon, tone = "red", onFileChange }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const isRed = tone === "red";
  const accent = isRed ? "#e50914" : "#38bdf8";
  const softBg = isRed ? "rgba(229,9,20,0.10)" : "rgba(56,189,248,0.12)";
  const borderColor = dragging ? accent : "rgba(255,255,255,0.12)";

  const pickFile = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      onFileChange?.(selected);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      onFileChange?.(dropped);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={pickFile}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: 20,
          padding: "34px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          textAlign: "center",
          background: dragging ? softBg : "rgba(255,255,255,0.03)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          minHeight: 220,
          justifyContent: "center",
        }}
      >
        {file ? (
          <>
            <CheckCircle size={30} color="#34d399" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>
              {file.name}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: softBg,
                border: `1px solid ${
                  isRed
                    ? "rgba(229,9,20,0.22)"
                    : "rgba(56,189,248,0.22)"
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} color={accent} />
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 6,
                }}
              >
                Drag & drop or click to browse
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.28)",
                  marginTop: 4,
                }}
              >
                {accept}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function UploadPage({ genres = [] }) {
  const initialForm = {
    title: "",
    type: "movie",
    genre: "",
    year: "",
    description: "",
    language: "Tamil",
    quality: "4K Ultra HD",
    posterUrl: "",
    videoUrl: "",
  };

  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [draftSaving, setDraftSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcodeProgress, setTranscodeProgress] = useState(false);

  const setValue = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const getTypeLabel = (type) => {
    if (type === "movie") return "Movie";
    if (type === "series") return "Series";
    if (type === "trailer") return "Trailer";
    return "Movie";
  };

  const resetAll = () => {
    setForm(initialForm);
    setVideoFile(null);
    setThumbnailFile(null);
    setMessage("");
    setUploadProgress(0);
    setTranscodeProgress(false);
  };

  const uploadThumbnailToS3 = async (file) => {
    const res = await fetch(`${API}/api/upload/thumbnail-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to get thumbnail upload URL");
    }

    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload thumbnail to S3");
    }

    return data;
  };

  const initMultipartUpload = async (file) => {
    const res = await fetch(`${API}/api/upload/video/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || "video/mp4",
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to initialize video upload");
    }

    return data;
  };

  const getPartUploadUrl = async ({ key, uploadId, partNumber }) => {
    const res = await fetch(`${API}/api/upload/video/part-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        uploadId,
        partNumber,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(
        data?.message || `Failed to get URL for part ${partNumber}`
      );
    }

    return data;
  };

  const completeMultipartUpload = async ({ key, uploadId, parts }) => {
    const res = await fetch(`${API}/api/upload/video/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        uploadId,
        parts,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to complete video upload");
    }

    return data;
  };

  const abortMultipartUpload = async ({ key, uploadId }) => {
    try {
      await fetch(`${API}/api/upload/video/abort`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          uploadId,
        }),
      });
    } catch (error) {
      console.error("Abort upload error:", error);
    }
  };

  const uploadVideoMultipartToS3 = async (file) => {
    const initData = await initMultipartUpload(file);
    const { uploadId, key, fileUrl } = initData;

    const totalParts = Math.ceil(file.size / CHUNK_SIZE);
    const uploadedParts = [];

    try {
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const blob = file.slice(start, end);

        const partData = await getPartUploadUrl({
          key,
          uploadId,
          partNumber,
        });

        const uploadRes = await fetch(partData.presignedUrl, {
          method: "PUT",
          body: blob,
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed on part ${partNumber}`);
        }

        const rawETag = uploadRes.headers.get("ETag");

        if (!rawETag) {
          throw new Error(`Missing ETag for part ${partNumber}`);
        }

        uploadedParts.push({
          ETag: rawETag.replaceAll('"', ""),
          PartNumber: partNumber,
        });

        const progress = Math.round((partNumber / totalParts) * 100);
        setUploadProgress(progress);
      }

      await completeMultipartUpload({
        key,
        uploadId,
        parts: uploadedParts,
      });

      return {
        key,
        fileUrl,
      };
    } catch (error) {
      await abortMultipartUpload({ key, uploadId });
      throw error;
    }
  };

  const saveContentToDb = async ({
    title,
    type,
    genre,
    year,
    description,
    language,
    quality,
    thumbnail_url,
    thumbnail_key,
    video_url,
    video_key,
    source_video_url,
    source_video_key,
    hls_master_url,
    transcode_status,
    job_id,
    file_size,
    status,
  }) => {
    const res = await fetch(`${API}/api/content/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        type,
        genre,
        year,
        description,
        language,
        quality,
        thumbnail_url,
        thumbnail_key,
        video_url,
        video_key,
        source_video_url,
        source_video_key,
        hls_master_url,
        transcode_status,
        job_id,
        file_size,
        status,
      }),
    });

    const data = await parseJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "Failed to save content");
    }

    return data;
  };

  const handleSaveDraft = async () => {
    try {
      if (!form.title.trim()) {
        alert("Please enter content title.");
        return;
      }

      setDraftSaving(true);
      setSaved(false);
      setMessage("");

      let thumbnailUrl = "";
      let thumbnailKey = "";

      if (thumbnailFile) {
        const thumb = await uploadThumbnailToS3(thumbnailFile);
        thumbnailUrl = thumb.fileUrl;
        thumbnailKey = thumb.key;
      }

      await saveContentToDb({
        title: form.title,
        type: form.type,
        genre: form.genre || "General",
        year: form.year || null,
        description: form.description,
        language: form.language,
        quality: form.quality,
        thumbnail_url: thumbnailUrl,
        thumbnail_key: thumbnailKey,
        video_url: "",
        video_key: "",
        source_video_url: "",
        source_video_key: "",
        hls_master_url: "",
        transcode_status: "draft",
        job_id: "",
        file_size: videoFile?.size || null,
        status: "draft",
      });

      setSaved(true);
      setMessage(`${getTypeLabel(form.type)} draft saved successfully!`);
      setTimeout(() => {
        setSaved(false);
        setMessage("");
      }, 1800);
    } catch (error) {
      console.error("Save draft error:", error);
      alert(error.message || "Draft save failed");
    } finally {
      setDraftSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      if (!form.title.trim()) {
        alert("Please enter content title.");
        return;
      }

      if (!form.genre) {
        alert("Please select genre.");
        return;
      }

      if (!thumbnailFile) {
        alert("Please upload thumbnail.");
        return;
      }

      if (!videoFile) {
        alert("Please upload video.");
        return;
      }

      setPublishing(true);
      setSaved(false);
      setMessage("");
      setUploadProgress(0);
      setTranscodeProgress(false);

      const thumb = await uploadThumbnailToS3(thumbnailFile);
      const video = await uploadVideoMultipartToS3(videoFile);

      const savedData = await saveContentToDb({
        title: form.title,
        type: form.type,
        genre: form.genre,
        year: form.year || null,
        description: form.description,
        language: form.language,
        quality: form.quality,
        thumbnail_url: thumb.fileUrl,
        thumbnail_key: thumb.key,
        video_url: "",
        video_key: "",
        source_video_url: video.fileUrl,
        source_video_key: video.key,
        hls_master_url: "",
        transcode_status: "pending",
        job_id: "",
        file_size: videoFile.size,
        status: "published",
      });

      setMessage(`${getTypeLabel(form.type)} uploaded. Starting transcoding...`);
      setSaved(true);
      setTranscodeProgress(true);

      const transcodeRes = await fetch(`${API}/api/transcode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.fileUrl,
          key: video.key,
          contentId: savedData?.contentId || savedData?.id || null,
        }),
      });

      const transcodeData = await parseJsonSafe(transcodeRes);

      if (!transcodeRes.ok) {
        throw new Error(transcodeData?.error || "Transcoding failed");
      }

      console.log("HLS URL:", transcodeData.hlsUrl);

      setSaved(true);
      setMessage(`${getTypeLabel(form.type)} uploaded and transcoded successfully!`);

      setTimeout(() => {
        setSaved(false);
        resetAll();
      }, 3000);
    } catch (error) {
      console.error("Publish error:", error);
      alert(error.message || "Publish failed");
      setMessage("");
      setSaved(false);
    } finally {
      setPublishing(false);
      setTranscodeProgress(false);
    }
  };

  const totalGenres = [
    ...new Set([
      ...genres,
      "Action",
      "Drama",
      "Comedy",
      "Thriller",
      "Romance",
      "Sci-Fi",
    ]),
  ];

  const styles = {
    page: {
      display: "flex",
      flexDirection: "column",
      gap: 18,
    },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
    },

    statCard: {
      borderRadius: 20,
      padding: 18,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    },

    statTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },

    statLabel: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 13,
      fontWeight: 600,
    },

    statValue: {
      fontSize: 28,
      fontWeight: 900,
      color: "#fff",
      lineHeight: 1.05,
      marginTop: 8,
    },

    statIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background: "rgba(229,9,20,0.12)",
      border: "1px solid rgba(229,9,20,0.34)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ff3b3b",
      flexShrink: 0,
    },

    uploadGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },

    card: {
      borderRadius: 22,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 20,
    },

    cardTitle: {
      margin: 0,
      fontSize: 18,
      fontWeight: 800,
      color: "#fff",
    },

    cardSub: {
      fontSize: 13,
      color: "rgba(255,255,255,0.45)",
      marginTop: 6,
      marginBottom: 18,
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },

    full: {
      gridColumn: "1 / -1",
    },

    textarea: {
      minHeight: 120,
      borderRadius: 14,
      padding: "14px",
      background: "rgba(255,255,255,0.035)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#fff",
      outline: "none",
      fontSize: 14,
      resize: "vertical",
      lineHeight: 1.6,
    },

    footer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 20,
    },

    success: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(52,211,153,0.12)",
      border: "1px solid rgba(52,211,153,0.25)",
      borderRadius: 12,
      padding: "10px 14px",
      fontSize: 13,
      fontWeight: 700,
      color: "#34d399",
    },

    actionRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      marginLeft: "auto",
    },

    ghostBtn: {
      height: 46,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      color: "#fff",
      padding: "0 18px",
      fontWeight: 700,
      cursor: draftSaving || publishing ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      opacity: draftSaving || publishing ? 0.7 : 1,
    },

    primaryBtn: {
      height: 46,
      borderRadius: 14,
      border: "1px solid rgba(229,9,20,0.35)",
      background: "linear-gradient(135deg, #ff2d2d, #e50914)",
      color: "#fff",
      padding: "0 18px",
      fontWeight: 800,
      cursor: publishing || draftSaving ? "not-allowed" : "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      opacity: publishing || draftSaving ? 0.7 : 1,
    },

    progressWrap: {
      width: "100%",
      marginTop: 16,
      display: uploadProgress > 0 && publishing ? "block" : "none",
    },

    progressBarOuter: {
      width: "100%",
      height: 10,
      background: "rgba(255,255,255,0.08)",
      borderRadius: 999,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
    },

    progressBarInner: {
      height: "100%",
      width: `${uploadProgress}%`,
      background: "linear-gradient(90deg, #ff2d2d, #e50914)",
      transition: "width 0.2s ease",
    },

    progressText: {
      marginTop: 8,
      fontSize: 12,
      color: "rgba(255,255,255,0.65)",
      fontWeight: 600,
    },

    transcodeText: {
      marginTop: 12,
      fontSize: 12,
      color: "#fbbf24",
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Content Type</div>
              <div style={styles.statValue}>{getTypeLabel(form.type)}</div>
            </div>
            <div style={styles.statIcon}>
              <FileVideo size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Selected Genre</div>
              <div style={styles.statValue}>{form.genre || "None"}</div>
            </div>
            <div style={styles.statIcon}>
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statTop}>
            <div>
              <div style={styles.statLabel}>Assets Ready</div>
              <div style={styles.statValue}>
                {(videoFile ? 1 : 0) + (thumbnailFile ? 1 : 0)}/2
              </div>
            </div>
            <div style={styles.statIcon}>
              <Upload size={20} />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.uploadGrid}>
        <DropZone
          label={
            form.type === "trailer" ? "Upload Trailer Video" : "Upload Video"
          }
          accept=".mp4,.mkv,.avi,.mov"
          icon={Film}
          tone="red"
          onFileChange={setVideoFile}
        />

        <DropZone
          label={
            form.type === "trailer"
              ? "Upload Trailer Thumbnail"
              : "Upload Thumbnail"
          }
          accept=".jpg,.jpeg,.png,.webp"
          icon={Image}
          tone="blue"
          onFileChange={setThumbnailFile}
        />
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Content Details</h3>
        <div style={styles.cardSub}>
          Add title, metadata, media links, and publishing information.
        </div>

        <div style={styles.formGrid}>
          <Field
            label="Title"
            placeholder="Enter content title"
            value={form.title}
            onChange={setValue("title")}
          />

          <SelectField
            label="Content Type"
            value={form.type}
            onChange={setValue("type")}
          >
            <option style={{ background: "#111" }} value="movie">
              Movie
            </option>
            <option style={{ background: "#111" }} value="series">
              Series
            </option>
            <option style={{ background: "#111" }} value="trailer">
              Trailer
            </option>
          </SelectField>

          <SelectField
            label="Genre"
            value={form.genre}
            onChange={setValue("genre")}
          >
            <option style={{ background: "#111" }} value="">
              Select genre
            </option>
            {totalGenres.map((g) => (
              <option key={g} style={{ background: "#111" }} value={g}>
                {g}
              </option>
            ))}
          </SelectField>

          <Field
            label="Release Year"
            type="number"
            placeholder="2026"
            value={form.year}
            onChange={setValue("year")}
          />

          <SelectField
            label="Language"
            value={form.language}
            onChange={setValue("language")}
          >
            {["Tamil", "Hindi", "English", "Telugu", "Malayalam", "Kannada"].map(
              (lang) => (
                <option key={lang} style={{ background: "#111" }} value={lang}>
                  {lang}
                </option>
              )
            )}
          </SelectField>

          <SelectField
            label="Quality"
            value={form.quality}
            onChange={setValue("quality")}
          >
            <option style={{ background: "#111" }}>4K Ultra HD</option>
            <option style={{ background: "#111" }}>1080p Full HD</option>
            <option style={{ background: "#111" }}>720p HD</option>
            <option style={{ background: "#111" }}>480p SD</option>
          </SelectField>

          <Field
            label="Poster URL"
            placeholder="https://image.tmdb.org/..."
            value={form.posterUrl}
            onChange={setValue("posterUrl")}
          />

          <Field
            label="Video URL / CDN Link"
            placeholder="https://cdn.hflix.com/..."
            value={form.videoUrl}
            onChange={setValue("videoUrl")}
          />

          <div style={styles.full}>
            <label
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                fontWeight: 600,
                display: "block",
                marginBottom: 8,
              }}
            >
              Description / Synopsis
            </label>
            <textarea
              rows={5}
              placeholder="Enter a brief description..."
              value={form.description}
              onChange={setValue("description")}
              style={styles.textarea}
            />
          </div>
        </div>

        <div style={styles.progressWrap}>
          <div style={styles.progressBarOuter}>
            <div style={styles.progressBarInner} />
          </div>
          <div style={styles.progressText}>
            Uploading source video: {uploadProgress}%
          </div>
        </div>

        {transcodeProgress && (
          <div style={styles.transcodeText}>
            Video uploaded. HLS transcoding is in progress... 🎬
          </div>
        )}

        <div style={styles.footer}>
          {saved ? (
            <div style={styles.success}>
              <CheckCircle size={15} />
              {message || "Content saved successfully!"}
            </div>
          ) : (
            <div />
          )}

          <div style={styles.actionRow}>
            <button
              style={styles.ghostBtn}
              onClick={handleSaveDraft}
              disabled={draftSaving || publishing}
            >
              <Save size={14} />
              {draftSaving ? "Saving Draft..." : "Save as Draft"}
            </button>

            <button
              style={styles.primaryBtn}
              onClick={handlePublish}
              disabled={publishing || draftSaving}
            >
              <Upload size={14} />
              {publishing ? "Publishing..." : "Publish Content"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const https = require("https");
const { exec } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const multer = require("multer");

const { v4: uuidv4 } = require("uuid");

const {
  S3Client,
  PutObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://187.127.154.131",
      "https://187.127.154.131",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------- DB ---------------- */

const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ott_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("DB Error:", err);
  } else {
    console.log("MySQL Connected");
    connection.release();
  }
});

/* ---------------- S3 ---------------- */

const BUCKET = process.env.AWS_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const buildS3Url = (key) =>
  `https://s3.${REGION}.amazonaws.com/${BUCKET}/${key}`;

/* ---------------- HELPERS ---------------- */

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          fs.unlink(dest, () => {});
          reject(new Error(`Download failed: ${res.statusCode}`));
          return;
        }

        res.pipe(file);

        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

function convertToHLS(input, outputDir) {
  return new Promise((resolve, reject) => {
    ensureDir(outputDir);

    const outputFile = path.join(outputDir, "index.m3u8");

    const cmd = `"${ffmpegPath}" -i "${input}" -profile:v baseline -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${outputFile}"`;

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("FFmpeg error:", stderr);
        reject(new Error(stderr || err.message));
        return;
      }

      resolve();
    });
  });
}

async function uploadFolderToS3(folder, s3Folder) {
  const files = fs.readdirSync(folder);

  for (const file of files) {
    const filePath = path.join(folder, file);
    const body = fs.readFileSync(filePath);

    let contentType = "application/octet-stream";
    if (file.endsWith(".m3u8")) contentType = "application/vnd.apple.mpegurl";
    if (file.endsWith(".ts")) contentType = "video/MP2T";
    if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    }
    if (file.endsWith(".png")) contentType = "image/png";

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${s3Folder}/${file}`,
      Body: body,
      ContentType: contentType,
    });

    await s3.send(command);
  }
}

function generateTicketId() {
  const now = Date.now().toString().slice(-6);
  const rand = Math.floor(100 + Math.random() * 900);
  return `HFX-${now}-${rand}`;
}

/* ---------------- CUSTOMER CARE UPLOAD ---------------- */

const customerCareUploadDir = path.join(__dirname, "uploads", "customer-care");
ensureDir(customerCareUploadDir);

const customerCareStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, customerCareUploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

const customerCareUpload = multer({
  storage: customerCareStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ---------------- ROOT ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "API Running..." });
});

app.get("/api/test", (req, res) => {
  res.json({ ok: true, message: "Backend working" });
});

/* ---------------- AUTH ---------------- */

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const checkSql = "SELECT id FROM users WHERE email = ?";

    db.query(checkSql, [email], async (err, result) => {
      if (err) {
        console.error("Signup check error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (result.length > 0) {
        return res.status(409).json({ message: "Email exists" });
      }

      const hashed = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (name,email,password) VALUES (?,?,?)",
        [name, email, hashed],
        (insertErr) => {
          if (insertErr) {
            console.error("Signup insert error:", insertErr);
            return res.status(500).json({ message: "Signup failed" });
          }

          return res.json({ message: "Signup success" });
        }
      );
    });
  } catch (err) {
    console.error("Signup route error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) {
      console.error("Login query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid" });
    }

    res.json({
      message: "Login success",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
});

/* ---------------- FAVORITES ---------------- */

app.post("/api/favorites", (req, res) => {
  const { user_id, movie_id } = req.body;

  if (!user_id || !movie_id) {
    return res.status(400).json({
      success: false,
      message: "user_id and movie_id are required",
    });
  }

  const checkSql = `
    SELECT id
    FROM user_favorites
    WHERE user_id = ? AND movie_id = ?
  `;

  db.query(checkSql, [user_id, movie_id], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Favorite check error:", checkErr);
      return res.status(500).json({
        success: false,
        message: "Database error while checking favorite",
      });
    }

    if (checkResult.length > 0) {
      return res.json({
        success: true,
        message: "Already in favorites",
      });
    }

    const insertSql = `
      INSERT INTO user_favorites (user_id, movie_id)
      VALUES (?, ?)
    `;

    db.query(insertSql, [user_id, movie_id], (insertErr, result) => {
      if (insertErr) {
        console.error("Add favorite error:", insertErr);
        return res.status(500).json({
          success: false,
          message: "Failed to add favorite",
        });
      }

      return res.json({
        success: true,
        message: "Added to favorites",
        favoriteId: result.insertId,
      });
    });
  });
});

app.get("/api/favorites/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT
      v.id,
      v.title,
      v.type,
      v.genre,
      v.year,
      v.description,
      v.language,
      v.quality,
      v.thumbnail_url,
      v.thumbnail_key,
      v.video_url,
      v.video_key,
      v.source_video_url,
      v.source_video_key,
      v.hls_master_url,
      v.transcode_status,
      v.file_size,
      v.status,
      v.created_at,
      uf.created_at AS favorited_at
    FROM user_favorites uf
    INNER JOIN videos v ON uf.movie_id = v.id
    WHERE uf.user_id = ?
    ORDER BY uf.created_at DESC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Fetch favorites DB error:", err);
      return res.status(500).json({
        success: false,
        message: "DB error while fetching favorites",
      });
    }

    const favorites = result.map((movie) => ({
      ...movie,
      thumbnail_url:
        movie.thumbnail_url ||
        (movie.thumbnail_key ? buildS3Url(movie.thumbnail_key) : ""),
    }));

    return res.json({
      success: true,
      favorites,
    });
  });
});

app.delete("/api/favorites/:userId/:movieId", (req, res) => {
  const { userId, movieId } = req.params;

  const sql = `
    DELETE FROM user_favorites
    WHERE user_id = ? AND movie_id = ?
  `;

  db.query(sql, [userId, movieId], (err) => {
    if (err) {
      console.error("Delete favorite DB error:", err);
      return res.status(500).json({
        success: false,
        message: "DB error while deleting favorite",
      });
    }

    return res.json({
      success: true,
      message: "Favorite removed successfully",
    });
  });
});

/* ---------------- S3 THUMBNAIL ---------------- */

app.post("/api/upload/thumbnail-url", async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ message: "fileName and contentType required" });
    }

    const ext = fileName.split(".").pop();
    const key = `thumbnails/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    res.json({
      uploadUrl,
      key,
      fileUrl: buildS3Url(key),
    });
  } catch (err) {
    console.error("Thumbnail S3 error:", err);
    res.status(500).json({ message: "S3 thumbnail error" });
  }
});

/* ---------------- LARGE VIDEO MULTIPART UPLOAD ---------------- */

app.post("/api/upload/video/init", async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ message: "fileName and contentType required" });
    }

    const safeName = fileName.replace(/\s+/g, "-");
    const key = `source-videos/${Date.now()}-${safeName}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const response = await s3.send(command);

    res.json({
      message: "Multipart upload initialized",
      uploadId: response.UploadId,
      key,
      fileUrl: buildS3Url(key),
    });
  } catch (err) {
    console.error("Video init error:", err);
    res.status(500).json({ message: "Video init upload error" });
  }
});

app.post("/api/upload/video/part-url", async (req, res) => {
  try {
    const { key, uploadId, partNumber } = req.body;

    if (!key || !uploadId || !partNumber) {
      return res.status(400).json({
        message: "key, uploadId and partNumber required",
      });
    }

    const command = new UploadPartCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
    });

    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });

    res.json({
      presignedUrl,
      partNumber: Number(partNumber),
    });
  } catch (err) {
    console.error("Part URL error:", err);
    res.status(500).json({ message: "Part URL generation failed" });
  }
});

app.post("/api/upload/video/complete", async (req, res) => {
  try {
    const { key, uploadId, parts } = req.body;

    if (!key || !uploadId || !Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({
        message: "key, uploadId and parts required",
      });
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts
          .map((part) => ({
            ETag: part.ETag,
            PartNumber: Number(part.PartNumber),
          }))
          .sort((a, b) => a.PartNumber - b.PartNumber),
      },
    });

    await s3.send(command);

    res.json({
      message: "Video upload completed",
      key,
      fileUrl: buildS3Url(key),
    });
  } catch (err) {
    console.error("Complete upload error:", err);
    res.status(500).json({ message: "Complete upload failed" });
  }
});

app.post("/api/upload/video/abort", async (req, res) => {
  try {
    const { key, uploadId } = req.body;

    if (!key || !uploadId) {
      return res.status(400).json({ message: "key and uploadId required" });
    }

    const command = new AbortMultipartUploadCommand({
      Bucket: BUCKET,
      Key: key,
      UploadId: uploadId,
    });

    await s3.send(command);

    res.json({ message: "Multipart upload aborted" });
  } catch (err) {
    console.error("Abort upload error:", err);
    res.status(500).json({ message: "Abort upload failed" });
  }
});

/* ---------------- SAVE CONTENT ---------------- */

app.post("/api/content/create", (req, res) => {
  const {
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
  } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const finalThumbnailKey = thumbnail_key || null;
  const finalThumbnailUrl =
    thumbnail_url || (finalThumbnailKey ? buildS3Url(finalThumbnailKey) : null);

  const sql = `
    INSERT INTO videos
    (
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
      file_size,
      status,
      created_at,
      source_video_url,
      source_video_key,
      hls_master_url,
      transcode_status,
      job_id
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?,?,?)
  `;

  db.query(
    sql,
    [
      title,
      type || "movie",
      genre,
      year || null,
      description || "",
      language || "",
      quality || "",
      finalThumbnailUrl || "",
      finalThumbnailKey || "",
      video_url || "",
      video_key || "",
      file_size || null,
      status || "published",
      source_video_url || null,
      source_video_key || null,
      hls_master_url || null,
      transcode_status || "pending",
      job_id || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Create content DB error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      res.json({
        message: "Saved successfully",
        id: result.insertId,
      });
    }
  );
});

/* ---------------- UPDATE CONTENT ---------------- */

app.put("/api/content/:id", (req, res) => {
  const { id } = req.params;

  const {
    title,
    type,
    genre,
    year,
    description,
    language,
    quality,
    status,
  } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ message: "Title and genre are required" });
  }

  const sql = `
    UPDATE videos
    SET
      title = ?,
      type = ?,
      genre = ?,
      year = ?,
      description = ?,
      language = ?,
      quality = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title,
      type || "movie",
      genre,
      year || null,
      description || "",
      language || "",
      quality || "",
      status || "published",
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Update content DB error:", err);
        return res.status(500).json({ message: "DB error while updating" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Content not found" });
      }

      return res.json({
        success: true,
        message: "Content updated successfully",
      });
    }
  );
});

/* ---------------- DELETE CONTENT ---------------- */

app.delete("/api/content/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM videos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Delete content DB error:", err);
      return res.status(500).json({ message: "DB error while deleting" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json({
      success: true,
      message: "Content deleted successfully",
    });
  });
});

/* ---------------- FETCH MOVIES ---------------- */

app.get("/api/movies", (req, res) => {
  const sql = `
    SELECT
      id,
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
      file_size,
      status,
      created_at
    FROM videos
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Fetch movies DB error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    const movies = result.map((movie) => ({
      ...movie,
      thumbnail_url:
        movie.thumbnail_url ||
        (movie.thumbnail_key ? buildS3Url(movie.thumbnail_key) : ""),
    }));

    res.json({
      success: true,
      movies,
    });
  });
});

app.get("/api/movies/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM videos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Fetch single movie DB error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    if (!result.length) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movie = result[0];

    res.json({
      success: true,
      movie: {
        ...movie,
        thumbnail_url:
          movie.thumbnail_url ||
          (movie.thumbnail_key ? buildS3Url(movie.thumbnail_key) : ""),
      },
    });
  });
});

/* ---------------- TRANSCODE TO HLS ---------------- */

app.post("/api/transcode", async (req, res) => {
  try {
    const { videoUrl, contentId } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "videoUrl is required" });
    }

    ensureDir(path.join(__dirname, "temp"));
    ensureDir(path.join(__dirname, "output"));

    const name = Date.now().toString();
    const input = path.join(__dirname, "temp", `${name}.mp4`);
    const output = path.join(__dirname, "output", name);
    const s3Folder = `transcoded/${name}`;

    console.log("Downloading source video...");
    await downloadFile(videoUrl, input);

    console.log("Converting video to HLS...");
    await convertToHLS(input, output);

    console.log("Uploading HLS files to S3...");
    await uploadFolderToS3(output, s3Folder);

    const hlsUrl = buildS3Url(`${s3Folder}/index.m3u8`);

    if (contentId) {
      const sql = `
        UPDATE videos
        SET hls_master_url = ?,
            transcode_status = ?
        WHERE id = ?
      `;

      db.query(sql, [hlsUrl, "completed", contentId], (err) => {
        if (err) {
          console.error("Transcode DB update error:", err);
        }
      });
    }

    if (fs.existsSync(input)) {
      fs.unlinkSync(input);
    }

    if (fs.existsSync(output)) {
      fs.rmSync(output, { recursive: true, force: true });
    }

    return res.json({
      success: true,
      hlsUrl,
    });
  } catch (err) {
    console.error("Transcode route error:", err);
    return res.status(500).json({
      error: err.message || "Transcoding failed",
    });
  }
});

/* ---------------- CUSTOMER CARE ---------------- */

app.post(
  "/api/customer-care/ticket",
  customerCareUpload.single("attachment"),
  (req, res) => {
    try {
      const {
        user_id,
        name,
        email,
        mobile,
        subject,
        issue_type,
        priority,
        page_name,
        movie_title,
        device_type,
        app_version,
        browser,
        message,
      } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
        });
      }

      const ticket_id = generateTicketId();
      const attachment = req.file
        ? `/uploads/customer-care/${req.file.filename}`
        : null;

      const sql = `
        INSERT INTO customer_care_tickets
        (
          ticket_id,
          user_id,
          name,
          email,
          mobile,
          subject,
          issue_type,
          priority,
          page_name,
          movie_title,
          device_type,
          app_version,
          browser,
          message,
          attachment,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        ticket_id,
        user_id || null,
        name,
        email,
        mobile || null,
        subject,
        issue_type || "Other",
        priority || "Medium",
        page_name || null,
        movie_title || null,
        device_type || null,
        app_version || null,
        browser || null,
        message,
        attachment,
        "Open",
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Insert ticket error:", err);
          return res.status(500).json({
            success: false,
            message: "Database insert failed",
          });
        }

        return res.json({
          success: true,
          message: "Ticket created successfully",
          ticket_id,
          id: result.insertId,
        });
      });
    } catch (error) {
      console.error("Ticket API error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

app.get("/api/customer-care/tickets/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT *
    FROM customer_care_tickets
    WHERE user_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Fetch tickets error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }

    return res.json({
      success: true,
      tickets: rows,
    });
  });
});

app.post("/api/customer-care/chat/session", (req, res) => {
  const { user_id, name, email } = req.body;

  const checkSql = `
    SELECT id
    FROM customer_chat_sessions
    WHERE user_id <=> ?
    ORDER BY id DESC
    LIMIT 1
  `;

  db.query(checkSql, [user_id || null], (err, rows) => {
    if (err) {
      console.error("Chat session check error:", err);
      return res.status(500).json({
        success: false,
        message: "Session check failed",
      });
    }

    if (rows.length > 0) {
      return res.json({
        success: true,
        session_id: rows[0].id,
      });
    }

    const insertSql = `
      INSERT INTO customer_chat_sessions (user_id, name, email, status)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [user_id || null, name || null, email || null, "Open"],
      (insertErr, result) => {
        if (insertErr) {
          console.error("Create session error:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Session create failed",
          });
        }

        return res.json({
          success: true,
          session_id: result.insertId,
        });
      }
    );
  });
});

app.post("/api/customer-care/chat/send", (req, res) => {
  const { session_id, sender_type, sender_name, message } = req.body;

  if (!session_id || !sender_type || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required chat fields",
    });
  }

  const sql = `
    INSERT INTO customer_chat_messages
    (session_id, sender_type, sender_name, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [session_id, sender_type, sender_name || null, message],
    (err, result) => {
      if (err) {
        console.error("Insert chat message error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to store chat message",
        });
      }

      return res.json({
        success: true,
        id: result.insertId,
        message: "Chat message stored successfully",
      });
    }
  );
});

app.get("/api/customer-care/chat/messages/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  const sql = `
    SELECT *
    FROM customer_chat_messages
    WHERE session_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [sessionId], (err, rows) => {
    if (err) {
      console.error("Fetch chat messages error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch chat messages",
      });
    }

    return res.json({
      success: true,
      messages: rows,
    });
  });
});

/* ---------------- ADMIN CUSTOMER CARE ---------------- */

app.get("/api/admin/customer-care/tickets", (req, res) => {
  const sql = `
    SELECT *
    FROM customer_care_tickets
    ORDER BY id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Admin fetch tickets error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch tickets",
      });
    }

    return res.json({
      success: true,
      tickets: rows,
    });
  });
});

app.put("/api/admin/customer-care/ticket-status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Status is required",
    });
  }

  const sql = `
    UPDATE customer_care_tickets
    SET status = ?
    WHERE id = ?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      console.error("Update ticket status error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update ticket status",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    return res.json({
      success: true,
      message: "Ticket status updated successfully",
    });
  });
});

app.get("/api/admin/customer-care/chat/sessions", (req, res) => {
  const sql = `
    SELECT *
    FROM customer_chat_sessions
    ORDER BY id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Admin fetch chat sessions error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch chat sessions",
      });
    }

    return res.json({
      success: true,
      sessions: rows,
    });
  });
});

/* ---------------- SERVER ---------------- */

app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});

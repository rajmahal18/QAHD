"use client";

import { ChangeEvent, useState } from "react";

const MAX_FILES = 5;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_SOURCE_IMAGE_BYTES = 30 * 1024 * 1024;
const TARGET_IMAGE_BYTES = 900 * 1024;
const UPLOADABLE = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

async function loadImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This photo format could not be read by your browser."));
      image.src = url;
    });
  } finally {
    // The image has decoded by the time onload fires, so the object URL is no longer needed.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function draw(image: HTMLImageElement, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this photo for upload.");
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error(`${file.name}: photo is larger than 30 MB.`);

  const forceConversion = !UPLOADABLE.has(file.type);
  if (!forceConversion && file.size <= TARGET_IMAGE_BYTES) return file;

  let image: HTMLImageElement;
  try {
    image = await loadImage(file);
  } catch (error) {
    if (!forceConversion && file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(`${file.name}: ${error instanceof Error ? error.message : "photo could not be processed"}`);
  }

  const attempts = [
    { maxSide: 1800, quality: 0.82 },
    { maxSide: 1800, quality: 0.74 },
    { maxSide: 1600, quality: 0.72 },
    { maxSide: 1400, quality: 0.68 },
  ];

  let best: Blob | null = null;
  for (const attempt of attempts) {
    const canvas = draw(image, attempt.maxSide);
    const webp = await canvasBlob(canvas, "image/webp", attempt.quality);
    const blob = webp?.type === "image/webp" ? webp : await canvasBlob(canvas, "image/jpeg", attempt.quality);
    if (!blob || !UPLOADABLE.has(blob.type)) continue;
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= TARGET_IMAGE_BYTES) break;
  }

  if (!best) {
    if (!forceConversion && file.size <= MAX_UPLOAD_BYTES) return file;
    throw new Error(`${file.name}: your browser could not optimize this photo.`);
  }

  if (!forceConversion && best.size >= file.size && file.size <= MAX_UPLOAD_BYTES) return file;
  if (best.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: optimized photo is still larger than 10 MB.`);

  const extension = best.type === "image/webp" ? "webp" : best.type === "image/png" ? "png" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "") || "evidence";
  return new File([best], `${base}.${extension}`, { type: best.type, lastModified: Date.now() });
}

function validateSource(file: File) {
  if (file.type === "application/pdf") {
    if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: PDF is larger than 10 MB.`);
    return;
  }
  if (!file.type.startsWith("image/")) throw new Error(`${file.name}: use a photo or PDF file.`);
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error(`${file.name}: photo is larger than 30 MB.`);
}

export async function uploadEvidence(testId: string, inputFiles: File[]) {
  if (inputFiles.length > MAX_FILES) throw new Error(`Maximum ${MAX_FILES} files per upload.`);

  for (const source of inputFiles) {
    validateSource(source);
    const file = await compressImage(source);
    if (!UPLOADABLE.has(file.type) || file.size > MAX_UPLOAD_BYTES) {
      throw new Error(`${source.name}: this file could not be converted to a supported upload format.`);
    }

    const presign = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, fileName: file.name, contentType: file.type, size: file.size }),
    });
    const signed = await presign.json().catch(() => ({}));
    if (!presign.ok) throw new Error(signed.error || `Could not prepare ${source.name}.`);

    const put = await fetch(signed.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!put.ok) throw new Error(`Upload failed for ${source.name}.`);

    const complete = await fetch("/api/uploads/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, key: signed.key, originalName: source.name, contentType: file.type, size: file.size }),
    });
    const completed = await complete.json().catch(() => ({}));
    if (!complete.ok) throw new Error(completed.error || `Could not save ${source.name}.`);
  }
}

export default function EvidenceUploader({ testId, onDone }: { testId: string; onDone?: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function choose(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    if (selected.length > MAX_FILES) {
      setFiles(selected.slice(0, MAX_FILES));
      setStatus(`Only the first ${MAX_FILES} files were selected.`);
      return;
    }
    setFiles(selected);
    setStatus("");
  }

  async function upload() {
    if (!files.length) return;
    setBusy(true);
    setStatus("Optimizing and uploading…");
    try {
      await uploadEvidence(testId, files);
      setFiles([]);
      setStatus("Evidence uploaded.");
      onDone?.();
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card uploadBox">
      <div className="field">
        <label htmlFor={`evidence-${testId}`}>Add evidence</label>
        <input id={`evidence-${testId}`} className="input" type="file" accept="image/*,application/pdf" multiple onChange={choose} disabled={busy} />
        <span className="fieldHint">Up to 5 photos or PDFs. Photos are resized and compressed before storage.</span>
      </div>
      {files.length ? <div className="rowMeta"><span>{files.length} file{files.length === 1 ? "" : "s"} selected</span></div> : null}
      <div className="formActions"><button className="button" type="button" onClick={upload} disabled={busy || !files.length}>{busy ? "Uploading…" : "Upload evidence"}</button></div>
      {status ? <div className="uploadStatus">{status}</div> : null}
    </div>
  );
}

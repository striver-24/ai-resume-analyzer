// @ts-ignore - Vite ?url import provides string URL at build time
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

function resolveWorkerSrc(): string {
  try {
    if (typeof workerUrl === "string" && workerUrl) {
      return workerUrl as string;
    }
  } catch {}
  const base = (import.meta as any)?.env?.BASE_URL ?? "/";
  // Ensure trailing slash behavior by relying on URL API
  return new URL("pdf.worker.min.mjs", new URL(base, window.location.origin)).toString();
}

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  if (typeof window === "undefined") {
    throw new Error("PDF rendering is only available in the browser");
  }

  // @ts-expect-error pdfjs-dist ESM path
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib: any) => {
    try {
      lib.GlobalWorkerOptions.workerSrc = resolveWorkerSrc();
    } catch {
      try { lib.GlobalWorkerOptions.workerSrc = undefined; } catch {}
      try { lib.disableWorker = true; } catch {}
    }
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return { imageUrl: "", file: null, error: "Not running in a browser context" };
    }

    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    // Helper to create a fresh copy for each attempt to avoid detached ArrayBuffer reuse
    const makeData = () => new Uint8Array(arrayBuffer.slice(0));
    let data = makeData();

    let pdf: any;
    try {
      pdf = await lib.getDocument({ data }).promise;
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (/(worker|postmessage|detached|transfer)/i.test(msg)) {
        // Retry without worker and with a fresh data buffer
        try { lib.GlobalWorkerOptions.workerSrc = undefined; } catch {}
        try { lib.disableWorker = true; } catch {}
        data = makeData();
        pdf = await lib.getDocument({ data }).promise;
      } else {
        throw e;
      }
    }

    const page = await pdf.getPage(1);

    const baseViewport = page.getViewport({ scale: 1 });
    const targetWidth = 2000; // aim for ~2k width
    const scale = Math.min(4, Math.max(1, targetWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return { imageUrl: "", file: null, error: "Could not get 2D canvas context" };
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    context.imageSmoothingEnabled = true;
    // @ts-ignore
    context.imageSmoothingQuality = "high";

    await page.render({ canvasContext: context, viewport }).promise;

    const blob: Blob | null = await new Promise((resolve) => {
      if (!("toBlob" in canvas)) {
        resolve(null);
        return;
      }
      canvas.toBlob((b) => resolve(b), "image/png", 1.0);
    });

    let finalBlob = blob;
    if (!finalBlob) {
      try {
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const [meta, b64] = dataUrl.split(",");
        const mime = meta.match(/:(.*?);/)?.[1] || "image/png";
        const bin = atob(b64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        finalBlob = new Blob([u8], { type: mime });
      } catch {
        return { imageUrl: "", file: null, error: "Failed to create image blob" };
      }
    }

    const originalName = file.name.replace(/\.pdf$/i, "");
    const imageFile = new File([finalBlob], `${originalName}.png`, { type: "image/png" });

    return {
      imageUrl: URL.createObjectURL(finalBlob),
      file: imageFile,
    };
  } catch (err: any) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err?.message || String(err)}`,
    };
  }
}
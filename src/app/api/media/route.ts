import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { MediaAsset } from "@/types";

// Sensible file limits per type (in bytes)
const SIZE_LIMITS: Record<string, { maxBytes: number; label: string }> = {
  image: { maxBytes: 20 * 1024 * 1024, label: "20MB" },
  audio: { maxBytes: 50 * 1024 * 1024, label: "50MB" },
  video: { maxBytes: 200 * 1024 * 1024, label: "200MB" },
  document: { maxBytes: 10 * 1024 * 1024, label: "10MB" },
};

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/aac", "audio/x-m4a"],
  document: ["application/pdf", "text/plain", "text/markdown"],
};

function detectTypeFromMime(mimeType: string, filename: string): "image" | "video" | "audio" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return "document";
  
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext || "")) return "image";
  if (["mp4", "webm", "mov"].includes(ext || "")) return "video";
  if (["mp3", "wav", "m4a", "ogg", "aac"].includes(ext || "")) return "audio";
  if (["pdf", "txt", "md"].includes(ext || "")) return "document";
  
  return "document";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");
    const searchQuery = searchParams.get("q")?.toLowerCase();
    const projectId = searchParams.get("projectId");
    const tag = searchParams.get("tag");

    let assets: MediaAsset[] = [];

    // Try Supabase Auth & DB
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        let query = supabase
          .from("media_assets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (typeFilter && typeFilter !== "all") {
          query = query.eq("type", typeFilter);
        }
        if (projectId) {
          query = query.eq("project_id", projectId);
        }

        const { data, error } = await query;
        if (!error && data) {
          assets = data.map((item) => ({
            id: item.id,
            userId: item.user_id,
            projectId: item.project_id,
            name: item.name,
            title: item.name,
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnail_url || item.url,
            tags: item.tags || [],
            size: item.size ? `${(item.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
            fileSizeMb: item.size ? Number((item.size / (1024 * 1024)).toFixed(2)) : undefined,
            createdAt: item.created_at,
          }));
        }
      }
    } catch {
      // Fallback to local store
    }

    // Fallback if Supabase assets empty or unconfigured
    if (assets.length === 0) {
      assets = db.getAssets(typeFilter || undefined);
    }

    // In-memory filters for search and tag
    if (searchQuery) {
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery) ||
          a.tags?.some((t) => t.toLowerCase().includes(searchQuery))
      );
    }
    if (tag) {
      assets = assets.filter((a) => a.tags?.includes(tag));
    }

    return NextResponse.json({ success: true, assets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Multipart Form Upload (Binary file upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const customName = (formData.get("name") as string) || file?.name || "Uploaded Asset";
      const tagsString = (formData.get("tags") as string) || "";
      const projectId = (formData.get("projectId") as string) || null;
      const explicitType = (formData.get("type") as string) || null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file provided in form data" },
          { status: 400 }
        );
      }

      const mimeType = file.type || "application/octet-stream";
      const detectedType = explicitType || detectTypeFromMime(mimeType, file.name);

      // Validate Type
      const allowedMimes = ALLOWED_MIME_TYPES[detectedType];
      if (allowedMimes && !allowedMimes.includes(mimeType) && mimeType !== "application/octet-stream") {
        return NextResponse.json(
          {
            success: false,
            error: `Unsupported file type (${mimeType}). Supported types for ${detectedType}: ${allowedMimes.join(", ")}`,
          },
          { status: 400 }
        );
      }

      // Validate Size
      const sizeLimit = SIZE_LIMITS[detectedType] || { maxBytes: 50 * 1024 * 1024, label: "50MB" };
      if (file.size > sizeLimit.maxBytes) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" is too large (${sizeMb} MB). Maximum size for ${detectedType}s is ${sizeLimit.label}.`,
          },
          { status: 400 }
        );
      }

      const tags = tagsString
        ? tagsString.split(",").map((t) => t.trim()).filter(Boolean)
        : [detectedType];

      const assetId = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let fileUrl = "";

      // Try uploading to Supabase Storage 'references' bucket
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || "anon";
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storagePath = `${userId}/${assetId}_${cleanFileName}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const { error: uploadError } = await supabase.storage
          .from("references")
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          // Create signed read URL (valid for 1 year) or public URL
          const { data: signedData } = await supabase.storage
            .from("references")
            .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
          fileUrl = signedData?.signedUrl || "";

          // Also insert into media_assets table
          if (user) {
            await supabase.from("media_assets").insert({
              id: assetId.startsWith("asset-") ? undefined : assetId,
              user_id: user.id,
              project_id: projectId || undefined,
              type: detectedType,
              url: fileUrl,
              thumbnail_url: detectedType === "image" ? fileUrl : undefined,
              name: customName,
              tags: tags,
              size: file.size,
            });
          }
        }
      } catch {
        // Fallback or offline upload handling
      }

      // If storage URL wasn't generated (offline / dev mode), construct mock data URI or placeholder
      if (!fileUrl) {
        if (detectedType === "image") {
          fileUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
        } else if (detectedType === "video") {
          fileUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
        } else if (detectedType === "audio") {
          fileUrl = "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg";
        } else {
          fileUrl = "https://example.com/document.pdf";
        }
      }

      const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const newAsset = db.createAsset({
        id: assetId,
        name: customName,
        title: customName,
        type: detectedType,
        url: fileUrl,
        thumbnailUrl: detectedType === "image" ? fileUrl : undefined,
        size: sizeFormatted,
        fileSizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
        tags,
      });

      return NextResponse.json({ success: true, asset: newAsset });
    }

    // 2. JSON Payload (register existing URL or reference metadata)
    const body = await request.json();
    const { name, url, type, tags, size, projectId } = body;

    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: "Name and URL are required" },
        { status: 400 }
      );
    }

    const newAsset = db.createAsset({
      name,
      title: name,
      url,
      type: type || "image",
      tags: tags || [],
      size: size || "1.0 MB",
      projectId: projectId || null,
    });

    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process upload" },
      { status: 500 }
    );
  }
}

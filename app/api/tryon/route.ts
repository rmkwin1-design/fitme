import { NextResponse } from "next/server";
import { fal } from "@fal-ai/client";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Check if client provided custom fal.ai key in x-fal-key header
    const customFalKey = request.headers.get("x-fal-key")?.trim();
    const falKey = customFalKey || process.env.FAL_KEY;

    if (!falKey) {
      return NextResponse.json(
        { errorCode: "ERR_NO_KEY", error: "ERR_NO_KEY" },
        { status: 401 }
      );
    }

    fal.config({
      credentials: falKey,
    });

    const body = await request.json();
    const { personImageBase64, garmentImageBase64, garmentPhotoType } = body;

    if (!personImageBase64 || !garmentImageBase64) {
      return NextResponse.json(
        { errorCode: "ERR_NO_IMAGES", error: "ERR_NO_IMAGES" },
        { status: 400 }
      );
    }

    // Convert Base64 data URL to Blob
    const base64ToBlob = (base64String: string): Blob => {
      const cleanBase64 = base64String.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");
      return new Blob([buffer], { type: "image/jpeg" });
    };

    const personBlob = base64ToBlob(personImageBase64);
    const garmentBlob = base64ToBlob(garmentImageBase64);

    // Upload images to fal storage
    const personUploadRes = await fal.storage.upload(personBlob);
    const garmentUploadRes = await fal.storage.upload(garmentBlob);

    const personImageUrl =
      typeof personUploadRes === "string"
        ? personUploadRes
        : (personUploadRes as { url?: string })?.url;
    const garmentImageUrl =
      typeof garmentUploadRes === "string"
        ? garmentUploadRes
        : (garmentUploadRes as { url?: string })?.url;

    if (!personImageUrl || !garmentImageUrl) {
      return NextResponse.json(
        { errorCode: "ERR_UPLOAD_FAILED", error: "ERR_UPLOAD_FAILED" },
        { status: 500 }
      );
    }

    // Execute fal subscribe for fal-ai/fashn/tryon/v1.6
    const result = (await fal.subscribe("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: personImageUrl,
        garment_image: garmentImageUrl,
        garment_photo_type: garmentPhotoType || "model",
        mode: "balanced",
      },
    })) as {
      data?: { images?: Array<{ url: string }> };
      images?: Array<{ url: string }>;
    };

    const imageUrl =
      result?.data?.images?.[0]?.url || result?.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { errorCode: "ERR_GENERATE_FAILED", error: "ERR_GENERATE_FAILED" },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("TryOn API Error:", errorMessage.replace(/:.*/, ""));

    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: "ERR_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

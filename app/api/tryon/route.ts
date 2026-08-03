import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { personImageBase64, garmentImageBase64, garmentPhotoType } = await req.json();

    if (!personImageBase64 || !garmentImageBase64) {
      console.error("[TryOn API Debug] Error: Missing image payload");
      return NextResponse.json(
        { errorCode: "ERR_NO_IMAGES", error: "사진 두 장이 모두 필요합니다." },
        { status: 400 }
      );
    }

    const userKey = req.headers.get("x-fal-key")?.trim();
    const falKey = userKey || process.env.FAL_KEY;

    if (!falKey) {
      console.error("[TryOn API Debug] Error: FAL_KEY is missing (neither x-fal-key header nor process.env.FAL_KEY is set)");
      return NextResponse.json(
        { errorCode: "ERR_NO_KEY", error: "사용 가능한 FAL API 키가 없습니다." },
        { status: 401 }
      );
    }

    // Configure fal client
    fal.config({ credentials: falKey });

    // Helper: Convert Base64 data URL to File object with explicit filename and mime type for Node.js
    const toFile = (b64String: string, filename: string): File => {
      const cleanBase64 = b64String.includes(",") ? b64String.split(",")[1] : b64String;
      const buffer = Buffer.from(cleanBase64, "base64");
      return new File([buffer], filename, { type: "image/jpeg" });
    };

    const personFile = toFile(personImageBase64, "person.jpg");
    const garmentFile = toFile(garmentImageBase64, "garment.jpg");

    console.log("[TryOn API Debug] Starting fal.storage.upload...", {
      personSize: personFile.size,
      garmentSize: garmentFile.size,
      garmentPhotoType: garmentPhotoType || "model",
    });

    const [personUrlRes, garmentUrlRes] = await Promise.all([
      fal.storage.upload(personFile),
      fal.storage.upload(garmentFile),
    ]);

    const personUrl =
      typeof personUrlRes === "string"
        ? personUrlRes
        : (personUrlRes as { url?: string })?.url || String(personUrlRes);
    const garmentUrl =
      typeof garmentUrlRes === "string"
        ? garmentUrlRes
        : (garmentUrlRes as { url?: string })?.url || String(garmentUrlRes);

    console.log("[TryOn API Debug] Storage upload successful:", {
      personUrl,
      garmentUrl,
    });

    if (!personUrl || !garmentUrl) {
      console.error("[TryOn API Debug] Error: Upload returned empty URL", { personUrlRes, garmentUrlRes });
      return NextResponse.json(
        { errorCode: "ERR_UPLOAD_FAILED", error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("[TryOn API Debug] Executing fal.subscribe('fal-ai/fashn/tryon/v1.6')...");

    const result = (await fal.subscribe("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: personUrl,
        garment_image: garmentUrl,
        garment_photo_type: garmentPhotoType || "model",
        mode: "balanced",
      },
    })) as {
      data?: { images?: Array<{ url: string }> };
      images?: Array<{ url: string }>;
    };

    const imageUrl = result.data?.images?.[0]?.url || result.images?.[0]?.url;

    if (!imageUrl) {
      console.error("[TryOn API Debug] Error: Model returned response without image URL", JSON.stringify(result));
      return NextResponse.json(
        { errorCode: "ERR_GENERATE_FAILED", error: "이미지 생성에 실패했습니다. 다시 시도해 주세요." },
        { status: 502 }
      );
    }

    console.log("[TryOn API Debug] Success! Generated Image URL:", imageUrl);
    return NextResponse.json({ imageUrl });

  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : String(err);
    console.error("[TryOn API Serverless Function Failure]:", JSON.stringify(errorDetails));

    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}

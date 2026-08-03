import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const {
      personImageBase64,
      garmentImageBase64,
      garmentPhotoType,
      garmentCategory,
      isPaidUser,
    } = await req.json();

    if (!personImageBase64 || !garmentImageBase64) {
      console.error("[TryOn Submit API] Error: Missing images in payload");
      return NextResponse.json(
        { errorCode: "ERR_NO_IMAGES", error: "사진 두 장이 모두 필요합니다." },
        { status: 400 }
      );
    }

    const userKey = req.headers.get("x-fal-key")?.trim();
    const falKey = userKey || process.env.FAL_KEY;

    if (!falKey) {
      console.error("[TryOn Submit API] Error: FAL_KEY missing (neither x-fal-key header nor process.env.FAL_KEY is set)");
      return NextResponse.json(
        { errorCode: "ERR_NO_KEY", error: "사용 가능한 FAL API 키가 없습니다." },
        { status: 401 }
      );
    }

    fal.config({ credentials: falKey });

    // Dynamic Base64 to File parser with EXIF auto-rotation + mirror border extension padding
    const toFile = async (
      b64String: string,
      defaultName: string,
      shouldExtendPadding = false
    ): Promise<File> => {
      const matches = b64String.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let rawData = b64String;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        rawData = matches[2];
      } else if (b64String.includes(",")) {
        const parts = b64String.split(",");
        rawData = parts[1];
        const mimeMatch = parts[0].match(/data:(image\/\w+);/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }

      rawData = rawData.replace(/\s/g, "");
      const rawBuffer = Buffer.from(rawData, "base64");

      let cleanBuffer: Buffer;
      try {
        let pipeline = sharp(rawBuffer).rotate();

        if (shouldExtendPadding) {
          // Extend borders with mirror background (40px padding) to assist pose landmark detection
          pipeline = pipeline.extend({
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
            background: "mirror",
          });
        }

        cleanBuffer = await pipeline.toBuffer();
      } catch (sharpErr) {
        console.warn("[TryOn Submit API] Sharp processing warning, falling back to raw buffer:", sharpErr);
        cleanBuffer = rawBuffer;
      }

      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";

      const uint8Array = new Uint8Array(cleanBuffer);
      return new File([uint8Array], `${defaultName}.${ext}`, { type: mimeType });
    };

    const personFile = await toFile(personImageBase64, "person", true);
    const garmentFile = await toFile(garmentImageBase64, "garment", false);

    console.log("[TryOn Submit API] Uploading sharp-rotated storage files...", {
      personSize: personFile.size,
      garmentSize: garmentFile.size,
    });

    const [personUrlRes, garmentUrlRes] = await Promise.all([
      fal.storage.upload(personFile),
      fal.storage.upload(garmentFile),
    ]);

    const personUrl =
      typeof personUrlRes === "string"
        ? personUrlRes
        : (personUrlRes as { url?: string })?.url;
    const garmentUrl =
      typeof garmentUrlRes === "string"
        ? garmentUrlRes
        : (garmentUrlRes as { url?: string })?.url;

    if (!personUrl || !garmentUrl) {
      console.error("[TryOn Submit API] Error: Storage upload failed", { personUrlRes, garmentUrlRes });
      return NextResponse.json(
        { errorCode: "ERR_UPLOAD_FAILED", error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // Determine tier-based execution mode (quality for paid users vs balanced for free tier)
    const mode = isPaidUser || !!userKey ? "quality" : "balanced";
    const category = garmentCategory && garmentCategory !== "auto" ? garmentCategory : undefined;

    console.log("[TryOn Submit API] Submitting queue job for fal-ai/fashn/tryon/v1.6...", {
      mode,
      category,
      garmentPhotoType: garmentPhotoType || "model",
    });

    const handle = await fal.queue.submit("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: personUrl,
        garment_image: garmentUrl,
        garment_photo_type: (garmentPhotoType as "model" | "flat-lay") || "model",
        mode: mode as "performance" | "balanced" | "quality",
        ...(category ? { category: category as "tops" | "bottoms" | "one-pieces" } : {}),
      },
    });

    console.log("[TryOn Submit API] Job submitted successfully. requestId:", handle.request_id);

    return NextResponse.json({ requestId: handle.request_id });
  } catch (err: unknown) {
    const errString = String(err);
    console.error("[TryOn Submit API Failure Details]:", errString);

    if (errString.includes("Failed to detect body pose")) {
      return NextResponse.json(
        { errorCode: "ERR_NO_POSE", error: "사진에서 신체 포즈를 인식하지 못했어요. 어깨와 상반신이 잘 보이는 정면 사진으로 다시 시도해 주세요." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: "가상 피팅 제출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

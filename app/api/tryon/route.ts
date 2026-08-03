import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { personImageBase64, garmentImageBase64, garmentPhotoType } = await req.json();

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
      console.error("[TryOn Submit API] Error: FAL_KEY missing (neither header nor process.env.FAL_KEY is set)");
      return NextResponse.json(
        { errorCode: "ERR_NO_KEY", error: "사용 가능한 FAL API 키가 없습니다." },
        { status: 401 }
      );
    }

    fal.config({ credentials: falKey });

    const toFile = (b64String: string, defaultName: string): File => {
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
      const buffer = Buffer.from(rawData, "base64");

      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";

      return new File([buffer], `${defaultName}.${ext}`, { type: mimeType });
    };

    const personFile = toFile(personImageBase64, "person");
    const garmentFile = toFile(garmentImageBase64, "garment");

    console.log("[TryOn Submit API] Uploading storage files...", {
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

    console.log("[TryOn Submit API] Submitting queue job for fal-ai/fashn/tryon/v1.6...");

    const handle = await fal.queue.submit("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: personUrl,
        garment_image: garmentUrl,
        garment_photo_type: garmentPhotoType || "model",
        mode: "balanced",
      },
    });

    console.log("[TryOn Submit API] Job submitted successfully. requestId:", handle.request_id);

    return NextResponse.json({ requestId: handle.request_id });
  } catch (err: unknown) {
    console.error("[TryOn Submit API Failure]:", err);
    return NextResponse.json(
      { errorCode: "ERR_SERVER_ERROR", error: "가상 피팅 제출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

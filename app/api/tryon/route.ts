import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

interface FalApiError {
  body?: {
    detail?: string | Array<{ msg?: string }>;
  };
  message?: string;
}

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

    // Dynamic Base64 to File parser matching exact MIME type and extension
    const toFile = (b64String: string, defaultName: string): File => {
      const matches = b64String.match(/^data:(image\/\w+);base64,(.+)$/);
      let mimeType = "image/jpeg";
      let rawData = b64String;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        rawData = matches[2];
      } else if (b64String.includes(",")) {
        const parts = b64String.split(",");
        const header = parts[0];
        rawData = parts[1];
        const mimeMatch = header.match(/data:(image\/\w+);/);
        if (mimeMatch) mimeType = mimeMatch[1];
      }

      rawData = rawData.replace(/\s/g, "");
      const buffer = Buffer.from(rawData, "base64");

      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";

      const filename = `${defaultName}.${ext}`;
      return new File([buffer], filename, { type: mimeType });
    };

    const personFile = toFile(personImageBase64, "person");
    const garmentFile = toFile(garmentImageBase64, "garment");

    console.log("[TryOn API Debug] Uploading files to fal.storage:", {
      person: { name: personFile.name, type: personFile.type, size: personFile.size },
      garment: { name: garmentFile.name, type: garmentFile.type, size: garmentFile.size },
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

    console.log("[TryOn API Debug] Storage upload complete:", { personUrl, garmentUrl });

    if (!personUrl || !garmentUrl) {
      console.error("[TryOn API Debug] Error: Upload returned empty URL", { personUrlRes, garmentUrlRes });
      return NextResponse.json(
        { errorCode: "ERR_UPLOAD_FAILED", error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("[TryOn API Debug] Executing fal-ai/fashn/tryon/v1.6 model...");

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
    const falErr = err as FalApiError;
    const detail = falErr?.body?.detail;
    const errorMsg =
      Array.isArray(detail) && detail[0]?.msg
        ? detail[0].msg
        : typeof detail === "string"
        ? detail
        : falErr?.message || String(err);

    console.error("[TryOn API Error Log]:", errorMsg);

    return NextResponse.json(
      {
        errorCode: "ERR_SERVER_ERROR",
        error: typeof errorMsg === "string" ? errorMsg : "가상 피팅 처리 중 오류가 발생했습니다."
      },
      { status: 500 }
    );
  }
}

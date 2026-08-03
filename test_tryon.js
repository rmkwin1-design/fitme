const { fal } = require("@fal-ai/client");

const falKey = "107bdf83-4f4b-48de-b878-94be9837c0f0:06461eaca45ad67ec20f8f47df44c835";
fal.config({ credentials: falKey });

// Valid minimal 1x1 red PNG base64
const samplePngB64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const toFile = (b64String, filename) => {
  const matches = b64String.match(/^data:(image\/\w+);base64,(.+)$/);
  let mimeType = "image/png";
  let rawData = b64String;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    rawData = matches[2];
  } else if (b64String.includes(",")) {
    rawData = b64String.split(",")[1];
  }

  rawData = rawData.replace(/\s/g, "");
  const buffer = Buffer.from(rawData, "base64");
  const ext = mimeType.split("/")[1] || "png";
  const finalFilename = `${filename}.${ext}`;

  return new File([buffer], finalFilename, { type: mimeType });
};

async function testTryOn() {
  try {
    const file1 = toFile(samplePngB64, "person");
    const file2 = toFile(samplePngB64, "garment");

    console.log("Uploading person file...", file1.name, file1.type, file1.size);
    const url1 = await fal.storage.upload(file1);
    console.log("Person URL:", url1);

    console.log("Uploading garment file...", file2.name, file2.type, file2.size);
    const url2 = await fal.storage.upload(file2);
    console.log("Garment URL:", url2);

    console.log("Subscribing to fal-ai/fashn/tryon/v1.6...");
    const result = await fal.subscribe("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: url1,
        garment_image: url2,
        garment_photo_type: "model",
        mode: "balanced",
      },
    });

    console.log("Full Result:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Test TryOn Error Catch:", err?.body || err);
  }
}

testTryOn();

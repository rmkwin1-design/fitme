const { fal } = require("@fal-ai/client");

const falKey = "107bdf83-4f4b-48de-b878-94be9837c0f0:06461eaca45ad67ec20f8f47df44c835";
fal.config({ credentials: falKey });

// Valid sample image
const samplePngB64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const toFile = (b64String, filename) => {
  const matches = b64String.match(/^data:(image\/\w+);base64,(.+)$/);
  let mimeType = "image/png";
  let rawData = b64String;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    rawData = matches[2];
  }

  rawData = rawData.replace(/\s/g, "");
  const buffer = Buffer.from(rawData, "base64");
  return new File([buffer], `${filename}.png`, { type: mimeType });
};

async function testQueueFlow() {
  try {
    const file1 = toFile(samplePngB64, "person");
    const file2 = toFile(samplePngB64, "garment");

    console.log("1. Uploading storage files...");
    const [url1, url2] = await Promise.all([
      fal.storage.upload(file1),
      fal.storage.upload(file2),
    ]);
    console.log("URLs:", url1, url2);

    console.log("2. Submitting to queue...");
    const handle = await fal.queue.submit("fal-ai/fashn/tryon/v1.6", {
      input: {
        model_image: url1,
        garment_image: url2,
        garment_photo_type: "model",
        mode: "balanced",
      },
    });

    console.log("Submitted! Request ID:", handle.request_id);

    console.log("3. Polling status...");
    let status = await fal.queue.status("fal-ai/fashn/tryon/v1.6", {
      requestId: handle.request_id,
      logs: true,
    });

    console.log("Initial Status:", JSON.stringify(status, null, 2));

    while (status.status !== "COMPLETED" && status.status !== "FAILED") {
      await new Promise(r => setTimeout(r, 2000));
      status = await fal.queue.status("fal-ai/fashn/tryon/v1.6", {
        requestId: handle.request_id,
        logs: true,
      });
      console.log("Status:", status.status);
    }

    if (status.status === "COMPLETED") {
      const result = await fal.queue.result("fal-ai/fashn/tryon/v1.6", {
        requestId: handle.request_id,
      });
      console.log("Final Result:", JSON.stringify(result, null, 2));
    } else {
      console.error("Queue Failed Status:", JSON.stringify(status, null, 2));
    }
  } catch (err) {
    console.error("Queue Test Catch Error:", err?.body || err);
  }
}

testQueueFlow();

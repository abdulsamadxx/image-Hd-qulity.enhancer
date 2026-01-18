const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const applyBtn = document.getElementById("apply");
const downloadBtn = document.getElementById("download");

let img = new Image();
let imageLoaded = false;

/* ================= LOAD AI MODELS ================= */
async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  console.log("✅ AI Models loaded");
}
loadModels();

/* ================= IMAGE UPLOAD ================= */
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageLoaded = true;
      console.log("✅ Image loaded");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

/* ================= APPLY FILTER ================= */
applyBtn.addEventListener("click", async () => {
  if (!imageLoaded) {
    alert("⚠️ Please upload an image first");
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  let faceDetected = false;

  // FACE DETECTION
  const detections = await faceapi
    .detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.2 })
    )
    .withFaceLandmarks();

  console.log("Faces detected:", detections.length);

  if (detections.length > 0) {
    faceDetected = true;

    detections.forEach(det => {
      const landmarks = det.landmarks;

      // FACE SMOOTH
      const box = det.detection.box;
      ctx.save();
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.clip();
      ctx.globalAlpha = 0.5;
      ctx.filter = "blur(3px)";
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      // NOSE SLIM
      const nose = landmarks.getNose();
      const left = nose[0].x;
      const right = nose[nose.length - 1].x;
      const top = nose[0].y;
      const bottom = nose[nose.length - 1].y;

      ctx.save();
      ctx.beginPath();
      ctx.rect(left - 8, top, (right - left) + 16, bottom - top);
      ctx.clip();
      ctx.globalAlpha = 0.6;
      ctx.filter = "blur(2px)";
      ctx.drawImage(img, -8, 0);
      ctx.restore();

      // EYES BRIGHTEN
      [...landmarks.getLeftEye(), ...landmarks.getRightEye()].forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.6;
        ctx.filter = "brightness(1.8) contrast(1.4)";
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      });
    });
  }

  // FULL IMAGE ENHANCEMENT (ALWAYS)
  ctx.filter = "brightness(1.15) contrast(1.25) saturate(1.3) hue-rotate(-8deg)";
  ctx.drawImage(img, 0, 0);

  // CLARITY / SHARP
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.2)";
  ctx.drawImage(img, 0, 0);

  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";

  console.log(
    faceDetected
      ? "✅ Face + Full enhancement applied"
      : "⚠️ No face → Only full enhancement applied"
  );
});

/* ================= DOWNLOAD ================= */
downloadBtn.addEventListener("click", () => {
  if (!imageLoaded) return;
  const a = document.createElement("a");
  a.download = "azuli-ai-pro.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

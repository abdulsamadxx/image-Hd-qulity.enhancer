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

/* ================= APPLY AI FILTER ================= */
applyBtn.addEventListener("click", async () => {
  if (!imageLoaded) {
    alert("⚠️ Please upload an image first");
    return;
  }

  // Base image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  let faceDetected = false;

  /* 🔹 Face Detection */
  const detections = await faceapi
    .detectAllFaces(
      canvas,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.3
      })
    )
    .withFaceLandmarks();

  console.log("Faces detected:", detections.length);

  if (detections.length > 0) {
    faceDetected = true;

    detections.forEach(det => {
      const landmarks = det.landmarks;

      /* 🔹 FACE SMOOTH */
      const box = det.detection.box;
      ctx.save();
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.clip();

      ctx.globalAlpha = 0.35;
      ctx.filter = "blur(2.5px)";
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      /* 🔹 NOSE SLIM */
      const nose = landmarks.getNose();
      const left = nose[0].x;
      const right = nose[nose.length - 1].x;
      const top = nose[0].y;
      const bottom = nose[nose.length - 1].y;

      ctx.save();
      ctx.beginPath();
      ctx.rect(left - 6, top, (right - left) + 12, bottom - top);
      ctx.clip();

      ctx.globalAlpha = 0.5;
      ctx.filter = "blur(1.8px)";
      ctx.drawImage(img, -6, 0);
      ctx.restore();

      /* 🔹 EYES BRIGHTEN */
      [...landmarks.getLeftEye(), ...landmarks.getRightEye()].forEach(p => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalAlpha = 0.55;
        ctx.filter = "brightness(1.6) contrast(1.3)";
        ctx.drawImage(img, 0, 0);
        ctx.restore();
      });
    });
  }

  /* 🔹 FULL IMAGE AZULI COLOR FILTER */
  ctx.filter = "brightness(1.12) contrast(1.2) saturate(1.25) hue-rotate(-8deg)";
  ctx.drawImage(img, 0, 0);

  /* 🔹 CLARITY / SHARP ENHANCEMENT */
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.15)";
  ctx.drawImage(img, 0, 0);

  /* RESET */
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

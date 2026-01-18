const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const applyBtn = document.getElementById("apply");
const downloadBtn = document.getElementById("download");

let img = new Image();
let imageLoaded = false;

/* 🔹 LOAD AI MODELS */
async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri("./models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
  console.log("✅ AI models loaded");
}
loadModels();

/* 🔹 IMAGE UPLOAD */
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

/* 🔹 APPLY FILTER */
applyBtn.addEventListener("click", async () => {
  if (!imageLoaded) {
    alert("Image load karo pehle");
    return;
  }

  ctx.drawImage(img, 0, 0);

  const detections = await faceapi
    .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  detections.forEach(det => {
    const landmarks = det.landmarks;

    /* NOSE SLIM (light) */
    const nose = landmarks.getNose();
    const left = nose[0].x;
    const right = nose[nose.length - 1].x;
    const top = nose[0].y;
    const bottom = nose[nose.length - 1].y;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();
    ctx.globalAlpha = 0.3;
    ctx.filter = "blur(1.5px)";
    ctx.drawImage(img, -3, 0);
    ctx.restore();

    /* EYES BRIGHTEN */
    [...landmarks.getLeftEye(), ...landmarks.getRightEye()].forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.clip();
      ctx.filter = "brightness(1.4)";
      ctx.globalAlpha = 0.4;
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    });
  });

  /* AZULI COLOR */
  ctx.filter = "brightness(1.1) contrast(1.15) saturate(1.2) hue-rotate(-8deg)";
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";

  console.log("✅ Filter applied");
});

/* 🔹 DOWNLOAD */
downloadBtn.addEventListener("click", () => {
  const a = document.createElement("a");
  a.download = "azuli-ai.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
});

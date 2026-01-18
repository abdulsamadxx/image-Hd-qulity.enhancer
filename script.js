const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
]).then(() => console.log("AI Models Loaded"));

upload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(file);
});

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

async function applyFilter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  /* 🔹 FACE DETECTION */
  const detections = await faceapi.detectAllFaces(
    canvas,
    new faceapi.TinyFaceDetectorOptions()
  );

  detections.forEach(det => {
    const { x, y, width, height } = det.box;

    /* 🔹 FACE-ONLY SMOOTHING */
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();

    ctx.filter = "blur(3px)";
    ctx.globalAlpha = 0.35;
    ctx.drawImage(img, 0, 0);

    ctx.restore();
  });

  /* 🔹 AZULI COLOR FILTER (FULL IMAGE) */
  ctx.filter = `
    brightness(1.1)
    contrast(1.18)
    saturate(1.2)
    hue-rotate(-8deg)
  `;
  ctx.drawImage(img, 0, 0);

  /* 🔹 AI ENHANCEMENT (CLARITY) */
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.15)";
  ctx.drawImage(img, 0, 0);

  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "azuli-ai-face.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

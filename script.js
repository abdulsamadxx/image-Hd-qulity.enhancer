const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
]).then(() => console.log("AI Models Loaded"));

upload.addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(e.target.files[0]);
});

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

async function applyFilter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const detections = await faceapi
    .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  detections.forEach(det => {
    const landmarks = det.landmarks;

    /* ================= NOSE SLIM ================= */
    const nose = landmarks.getNose();
    const left = nose[0].x;
    const right = nose[nose.length - 1].x;
    const top = nose[0].y;
    const bottom = nose[nose.length - 1].y;

    const noseWidth = right - left;

    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, noseWidth, bottom - top);
    ctx.clip();

    ctx.globalAlpha = 0.35;
    ctx.filter = "blur(1.5px)";
    ctx.drawImage(img, -noseWidth * 0.04, 0);

    ctx.restore();

    /* ================= EYES BRIGHTEN ================= */
    const eyes = [...landmarks.getLeftEye(), ...landmarks.getRightEye()];

    eyes.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.clip();

      ctx.globalAlpha = 0.45;
      ctx.filter = "brightness(1.4) contrast(1.2)";
      ctx.drawImage(img, 0, 0);

      ctx.restore();
    });
  });

  /* ================= AZULI COLOR ================= */
  ctx.filter = `
    brightness(1.1)
    contrast(1.18)
    saturate(1.2)
    hue-rotate(-8deg)
  `;
  ctx.drawImage(img, 0, 0);

  /* ================= AI ENHANCEMENT ================= */
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.15)";
  ctx.drawImage(img, 0, 0);

  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "azuli-ai-pro.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

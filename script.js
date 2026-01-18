const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();

upload.addEventListener("change", (e) => {
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

function applyFilter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* 🔹 STEP 1: Beauty (Skin Smooth) */
  ctx.filter = "blur(2px)";
  ctx.globalAlpha = 0.28;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 2: Base Image */
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 3: AZULI COLOR FILTER */
  ctx.filter = `
    brightness(1.1)
    contrast(1.18)
    saturate(1.2)
    hue-rotate(-8deg)
  `;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 4: Cool Tone Overlay */
  ctx.globalCompositeOperation = "color";
  ctx.fillStyle = "rgba(120, 150, 255, 0.08)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* 🔹 STEP 5: Enhancement (Clarity) */
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.15)";
  ctx.drawImage(img, 0, 0);

  /* Reset */
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "azuli-beauty-enhanced.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

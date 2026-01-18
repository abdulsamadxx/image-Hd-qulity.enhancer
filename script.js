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

  /* 🔹 STEP 1: Beauty Smooth */
  ctx.filter = "blur(2px)";
  ctx.globalAlpha = 0.3;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 2: Base Image */
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 3: Pleasant OG Colors */
  ctx.filter = `
    brightness(1.12)
    contrast(1.2)
    saturate(1.3)
    sepia(0.06)
  `;
  ctx.drawImage(img, 0, 0);

  /* 🔹 STEP 4: Enhancement (Sharpen / Clarity) */
  ctx.globalCompositeOperation = "overlay";
  ctx.filter = "contrast(1.15)";
  ctx.drawImage(img, 0, 0);

  /* Reset */
  ctx.globalCompositeOperation = "source-over";
  ctx.filter = "none";
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "pleasant-og-beauty-enhanced.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

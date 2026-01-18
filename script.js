const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let img = new Image();

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

img.onload = () => {
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
};

function applyFilter() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* 🔹 Step 1: Beauty Smooth Layer */
  ctx.filter = "blur(2px)";
  ctx.globalAlpha = 0.35;
  ctx.drawImage(img, 0, 0);

  /* 🔹 Step 2: Original Image */
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.drawImage(img, 0, 0);

  /* 🔹 Step 3: Pleasant OG Color Filter */
  ctx.filter = `
    brightness(1.12)
    contrast(1.18)
    saturate(1.3)
    sepia(0.07)
  `;
  ctx.drawImage(img, 0, 0);

  ctx.filter = "none";
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "pleasant-og-beauty.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

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
  ctx.filter = `
    brightness(1.1)
    contrast(1.15)
    saturate(1.25)
    sepia(0.08)
  `;
  ctx.drawImage(img, 0, 0);
}

function downloadImage() {
  const link = document.createElement("a");
  link.download = "pleasant-og.png";
  link.href = canvas.toDataURL();
  link.click();
}

const imageUpload = document.getElementById('imageUpload');
const originalCanvas = document.getElementById('originalCanvas');
const processedCanvas = document.getElementById('processedCanvas');
const originalCtx = originalCanvas.getContext('2d');
const processedCtx = processedCanvas.getContext('2d');

imageUpload.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                originalCanvas.width = img.width;
                originalCanvas.height = img.height;
                processedCanvas.width = img.width;
                processedCanvas.height = img.height;

                originalCtx.drawImage(img, 0, 0);
                processedCtx.drawImage(img, 0, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function applyGrayscale() {
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const gray = (r + g + b) / 3;

        pixels[i] = gray;        // Red
        pixels[i + 1] = gray;    // Green
        pixels[i + 2] = gray;    // Blue
        // Alpha remains unchanged (pixels[i + 3])
    }

    processedCtx.putImageData(imageData, 0, 0);
}

function applyBlur() {
    const imageData = processedCtx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);
    const pixels = imageData.data;
    const width = processedCanvas.width;
    const height = processedCanvas.height;

    const blurRadius = 2;
    const output = new Uint8ClampedArray(pixels);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let red = 0, green = 0, blue = 0, count = 0;

            for (let dy = -blurRadius; dy <= blurRadius; dy++) {
                for (let dx = -blurRadius; dx <= blurRadius; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;

                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const index = (ny * width + nx) * 4;
                        red += pixels[index];
                        green += pixels[index + 1];
                        blue += pixels[index + 2];
                        count++;
                    }
                }
            }

            const i = (y * width + x) * 4;
            output[i] = red / count;         // Red
            output[i + 1] = green / count;  // Green
            output[i + 2] = blue / count;   // Blue
            output[i + 3] = pixels[i + 3];  // Alpha
        }
    }

    processedCtx.putImageData(new ImageData(output, width, height), 0, 0);
}

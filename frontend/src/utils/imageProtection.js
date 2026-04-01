export function applyAdversarialNoise(imageData) {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] += Math.floor(Math.random() * 3 - 1);
        data[i + 1] += Math.floor(Math.random() * 3 - 1);
        data[i + 2] += Math.floor(Math.random() * 3 - 1);
    }

    return imageData;
}

export function processImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.drawImage(img, 0, 0);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            imageData = applyAdversarialNoise(imageData);

            ctx.putImageData(imageData, 0, 0);

            canvas.toBlob((blob) => {
                resolve(blob);
            });
        };

        img.src = URL.createObjectURL(file);
    });
}
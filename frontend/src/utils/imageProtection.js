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
function embedWatermark(imageData, message = "SHIELD") {
    const data = imageData.data;

    // Convert message to binary
    let binary = "";
    for (let i = 0; i < message.length; i++) {
        binary += message.charCodeAt(i).toString(2).padStart(8, "0");
    }

    let index = 0;

    for (let i = 0; i < data.length && index < binary.length; i += 4) {
        let bit = parseInt(binary[index]);

        // Modify least significant bit of RED channel
        data[i] = (data[i] & 0xFE) | bit;

        index++;
    }

    return imageData;
}
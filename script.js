document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById("grid");
    const colorPicker = document.getElementById("colorPicker");
    const imageInput = document.getElementById("imageInput");
    const scoreDisplay = document.getElementById("score");
    const imageContainer = document.getElementById("imageContainer");
    const randomImage = document.getElementById("randomImage");
    const skipButton = document.getElementById("skipButton");
    const beginButton = document.getElementById("beginButton");
    const revealButton = document.getElementById("revealButton");
    const gridContainer = document.getElementById("gridContainer");
    let currentColor = colorPicker.value;
    let isDrawing = false;
    let originalPixels = [];
    let userPixels = [];
    let originalDrawing = [];
    let revealTimeout;
    const images = [
        'images/image1.jpg',
        'images/image2.jpg',
        'images/image3.jpg'
    ];

    const maxImageWidth = 640;
    const maxImageHeight = 480;
    const pixelSize = 10;

    function getRandomImage() {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }

    function loadRandomImage() {
        const imagePath = getRandomImage();
        randomImage.src = imagePath;
    }

    skipButton.addEventListener("click", loadRandomImage);

    beginButton.addEventListener("click", () => {
        imageContainer.style.display = 'none';
        gridContainer.style.display = 'block';

        const img = new Image();
        img.onload = function() {
            const aspectRatio = img.width / img.height;

            let displayWidth = img.width;
            let displayHeight = img.height;

            if (img.width > maxImageWidth) {
                displayWidth = maxImageWidth;
                displayHeight = maxImageWidth / aspectRatio;
            }

            if (displayHeight > maxImageHeight) {
                displayHeight = maxImageHeight;
                displayWidth = maxImageHeight * aspectRatio;
            }

            const rows = Math.floor(displayHeight / pixelSize);
            const cols = Math.floor(displayWidth / pixelSize);

            gridContainer.style.width = `${cols * pixelSize}px`;
            gridContainer.style.height = `${rows * pixelSize}px`;

            createGrid(rows, cols);

            storePixelatedImage(img, rows, cols);

            calculateInitialScore();
        };
        img.src = randomImage.src;
    });

    revealButton.addEventListener("click", () => {
        revealCorrectPixels();
    });

    loadRandomImage();

    colorPicker.addEventListener("input", (event) => {
        currentColor = event.target.value;
    });

    function createGrid(rows, cols) {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`;
        grid.style.gridTemplateRows = `repeat(${rows}, ${pixelSize}px)`;

        for (let i = 0; i < rows * cols; i++) {
            const pixel = document.createElement("div");
            pixel.classList.add("pixel");
            pixel.style.width = `${pixelSize}px`;
            pixel.style.height = `${pixelSize}px`;
            pixel.addEventListener("mousedown", () => {
                isDrawing = true;
                paintPixel(pixel, i);
            });
            pixel.addEventListener("mouseover", () => {
                if (isDrawing) {
                    paintPixel(pixel, i);
                }
            });
            pixel.addEventListener("mouseup", () => {
                isDrawing = false;
            });
            grid.appendChild(pixel);
            userPixels.push({ r: 255, g: 255, b: 255 });
        }

        document.addEventListener("mouseup", () => {
            isDrawing = false;
        });
    }

    function paintPixel(pixel, index) {
        const [r, g, b] = hexToRgb(currentColor);
        pixel.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        userPixels[index] = { r, g, b };
        updateScore();
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    }

    function storePixelatedImage(img, rows, cols) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = cols;
        canvas.height = rows;
        ctx.drawImage(img, 0, 0, cols, rows);

        const pixelData = ctx.getImageData(0, 0, cols, rows).data;
        originalPixels = [];
        for (let i = 0; i < rows * cols; i++) {
            const r = pixelData[i * 4];
            const g = pixelData[i * 4 + 1];
            const b = pixelData[i * 4 + 2];
            originalPixels.push({ r, g, b });
        }
    }

    function calculateInitialScore() {
        initialScore = 0;
        for (let i = 0; i < userPixels.length; i++) {
            const userPixel = userPixels[i];
            const originalPixel = originalPixels[i];
            if (userPixel && originalPixel) {
                const diff = Math.sqrt(
                    Math.pow(userPixel.r - originalPixel.r, 2) +
                    Math.pow(userPixel.g - originalPixel.g, 2) +
                    Math.pow(userPixel.b - originalPixel.b, 2)
                );
                initialScore += (255 * 3 - diff) / (255 * 3);
            }
        }
        initialScore = (initialScore / userPixels.length) * 100;
    }

    function updateScore() {
        let score = 0;
        for (let i = 0; i < userPixels.length; i++) {
            const userPixel = userPixels[i];
            const originalPixel = originalPixels[i];
            if (userPixel && originalPixel) {
                const diff = Math.sqrt(
                    Math.pow(userPixel.r - originalPixel.r, 2) +
                    Math.pow(userPixel.g - originalPixel.g, 2) +
                    Math.pow(userPixel.b - originalPixel.b, 2)
                );
                score += (255 * 3 - diff) / (255 * 3); // Normalize score between 0 and 1
            }
        }
        score = ((score / userPixels.length) * 100).toFixed(2); // Convert to percentage with 2 decimal points
        scoreDisplay.textContent = `Score: ${score}%`;
    }

    function revealCorrectPixels() {
        const pixels = grid.querySelectorAll('.pixel');
        originalDrawing = userPixels.map(pixel => ({ ...pixel }));

        for (let i = 0; i < originalPixels.length; i++) {
            const { r, g, b } = originalPixels[i];
            pixels[i].style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
        }

        clearTimeout(revealTimeout);
        revealTimeout = setTimeout(() => {
            for (let i = 0; i < userPixels.length; i++) {
                const { r, g, b } = originalDrawing[i];
                pixels[i].style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
            }
        }, 3000);
    }
});

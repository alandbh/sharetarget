// Function for retrieving image stored in Cache API

const btnSend2 = document.querySelector("#btnSend2");

async function loadImageFromCache() {
    document.getElementById("image-container").innerHTML =
        "<small>Loading the preview...</small>";
    const cache = await caches.open("pwa-image-cache-v1");
    const cachedResponse = await cache.match("/cached-file");

    if (cachedResponse) {
        const imageDataUrl = await cachedResponse.text();
        const contentType = imageDataUrl.split(";")[0].split(":")[1]; // gets the content type from base64

        console.log({ imageDataUrl });

        if (imageDataUrl === "" || imageDataUrl === undefined) {
            showToaster("fail", "Error on processing this file.");
        }

        if (contentType.includes("image")) {
            // Show the image
            const imgElement = document.createElement("img");
            imgElement.classList.add("w-full", "h-full", "object-contain");
            imgElement.src = imageDataUrl;
            document.getElementById("image-container").innerHTML = "";
            document.getElementById("image-container").appendChild(imgElement);
        } else if (contentType.includes("video")) {
            // show the video
            const videoElement = document.createElement("video");
            videoElement.classList.add("w-full", "h-full", "object-contain");
            videoElement.src = imageDataUrl;
            document.getElementById("image-container").innerHTML = "";
            document
                .getElementById("image-container")
                .appendChild(videoElement);
            setTimeout(() => {
                videoElement.play();
            }, 400);
        }

        // Sento image to the backend

        const blob = base64ToBlob(imageDataUrl, contentType);

        sendToBackend(blob, contentType);
        enableSendButton(btnSend2);

        // return imageDataUrl;
    } else {
        document.querySelector("#errorMessage").classList.remove("hidden");
        document.querySelector("#errorMessage").textContent =
            "Nenhuma imagem foi compartilhada.";
    }
}

// Função para converter base64 para Blob
function base64ToBlob(base64, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}

function getFileExtension(contentType) {
    switch (contentType) {
        // Image typrd
        case "image/jpeg":
            return "jpg";
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        case "image/gif":
            return "gif";

        // Veideo types
        case "video/mp4":
            return "mp4";
        case "video/webm":
            return "webm";
        case "video/ogg":
            return "ogv";
        case "video/quicktime":
            return "mov";

        default:
            return "";
    }
}

async function sendToBackend(blob, contentType) {
    btnSend2.addEventListener("click", async () => {
        btnSend2.disabled = true;
        btnSend2.innerText = "Starting...";
        const formData = new FormData();
        const customName = await getCustonName(contentType);
        const extension = getFileExtension(contentType); // gets the file extension
        formData.append("customName", customName);
        formData.append("extension", extension);
        formData.append("folder", localStorage.getItem("journey"));

        if (contentType.includes("video")) {
            console.log({ blob });
            // Some tests show that ffmpg only works with files larger than 10MB
            if (blob.size > 20 * 1000 * 1000) {
                console.log("larger than 10 MB");
                const ffmpeg = new FFmpeg();
                await ffmpeg.load({
                    coreURL: "/ffmpeg/ffmpeg-core.js",
                });

                requestIdleCallback(async () => {
                    // Adicionando o arquivo ao FFmpeg
                    await ffmpeg.writeFile(
                        "input." + extension,
                        await fetchFile(blob)
                    );

                    ffmpeg.on("progress", ({ progress, time }) => {
                        btnSend2.innerText = "Compressing video...";
                        setProgressBackground(
                            btnSend2,
                            progress * 100,
                            "#f87171"
                        );
                    });

                    // showCounter();

                    // Executando a compactação
                    await ffmpeg.exec([
                        "-i",
                        "input." + extension,
                        "-vf",
                        "scale=iw/2:ih/2",
                        "-preset",
                        "ultrafast",
                        "-crf",
                        "28",
                        "output.mp4",
                    ]);

                    // Lendo o arquivo compactado
                    const fileData = await ffmpeg.readFile("output.mp4");
                    const customBlob = new Blob([fileData.buffer], {
                        type: "video/mp4",
                    });

                    formData.append("file", customBlob);

                    upload();
                });
            } else {
                console.log("smaller than 10 MB");
                formData.append("file", blob);

                upload();
            }
        } else {
            formData.append("file", blob);

            upload();
        }

        async function upload() {
            filenameContainer.style.height = "0px";
            btnSend2.disabled = true;
            btnSend2.innerText = "Uploading...";

            // progressContainer.style.height = "60px";

            const xhr = new XMLHttpRequest();

            // xhr.withCredentials = true;
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    console.log("Backend Server is Ready", this.responseText);
                }
            });

            xhr.open("POST", window.apiUrlPost, true);

            // xhr.setRequestHeader("bypass-tunnel-reminder", "true");

            let progress;

            // Updates the progress bar
            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;

                    progress = `${Math.round(percentComplete)}%`;
                    // uploadProgress.style.width = progress;
                    // progressText.textContent = progress;
                    // progressText.style.marginInlineStart = `calc(${progress} - 1.25rem)`;

                    setProgressBackground(
                        btnSend2,
                        Math.round(percentComplete),
                        "#b91c1c",
                        "#f87171"
                    );

                    if (Math.round(percentComplete) === 100) {
                        btnSend2.innerText = "Storing in the right folder...";
                    }
                }
            };
            // Handle the end of the upload
            xhr.onload = function (response) {
                if (xhr.status === 200) {
                    btnSend2.innerText = "Done!";
                    // showCounter(false);

                    console.log("Upload completo");

                    showToaster("success", "File has been sent successfuly!");
                    // fileInput.value = "";
                    filename.value = customName;
                    filenameContainer.style.height = "100px";
                    enableSendButton(btnSend2);
                    setTimeout(() => {
                        filename.scrollIntoView({ behavior: "smooth" });
                    }, 800);

                    console.log("SUCESSO", response);

                    setTimeout(() => {
                        btnSend2.innerText = "Send To Drive";
                        btnSend2.removeAttribute("style");
                        // progressText.textContent = "0%";
                        // progressText.style.marginInlineStart = "0%";
                        // uploadProgress.style.width = "0%";
                        // progressContainer.style.height = 0;
                    }, 4000);
                } else {
                    showCounter(false);
                    console.error("Erro no upload:", xhr.statusText);
                    // uploadProgress.textContent = "Erro no upload.";
                    showToaster("fail", "Erro no upload: " + xhr.statusText);
                }
            };

            xhr.onerror = function (error) {
                showCounter(false);
                console.error("Erro ao enviar o arquivo.");
                // uploadProgress.textContent = "Erro ao enviar o arquivo.";
                showToaster("fail", "Erro no upload: " + error);
            };

            xhr.send(formData);
        }
    });
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

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
            videoElement.muted = true; // Mute the video
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

async function sendToBackend(blob, contentType) {
    btnSend2.textContent = "Send to DRIVE 1";
    btnSend2.addEventListener("click", async () => {
        btnSend2.disabled = true;
        btnSend2.innerText = "Starting...";
        journeySelect.disabled = true;
        playerSelect.disabled = true;
        const formData = new FormData();
        const customName = await getCustonName(contentType);
        let extension = getFileExtension(contentType); // gets the file extension
        formData.append("customName", customName);

        // formData.append("folder", localStorage.getItem("journey"));
        if (shouldChooseJourney) {
            formData.append("folder", localStorage.getItem("journey"));
        } else {
            formData.append("folder", localStorage.getItem("player"));
        }

        window.addEventListener("beforeunload", function (e) {
            e.preventDefault();
            e.returnValue = "";
        });

        if (contentType.includes("video")) {
            console.log({ blob });
            // Some tests show that ffmpg only works with files larger than 40MB
            if (blob.size > 40 * 1000 * 1000 || extension !== "mp4") {
                console.log("larger than 40 MB");
                const ffmpeg = new FFmpeg();
                const baseURL =
                    "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                ffmpeg.on("log", ({ message }) => {
                    // messageRef.current.innerHTML = message;
                    console.log(message);
                });

                // await ffmpeg.load({
                //     coreURL: "/ffmpeg/ffmpeg-core.js",
                // });

                // await ffmpeg.load({
                //     coreURL: await toBlobURL(
                //         `${baseURL}/ffmpeg-core.js`,
                //         "text/javascript"
                //     ),
                //     wasmURL: await toBlobURL(
                //         `${baseURL}/ffmpeg-core.wasm`,
                //         "application/wasm"
                //     ),
                // });

                await ffmpeg.load({
                    coreURL: "/ffmpeg/ffmpeg-core.js",
                    wasmURL: "/ffmpeg/ffmpeg-core.wasm",
                });

                async function compressVideo() {
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
                    // await ffmpeg.exec([
                    //     "-i",
                    //     "input." + extension,
                    //     "-vf",
                    //     "scale=iw/2:ih/2",
                    //     "-preset",
                    //     "ultrafast",
                    //     "-crf",
                    //     "28",
                    //     "output.mp4",
                    // ]);
                    await ffmpeg.exec([
                        "-i",
                        "input." + extension,
                        "-vf",
                        "scale=trunc(iw*0.6/2)*2:trunc(ih*0.6/2)*2", // Reducing dimensions by 40% -- trunc() ensures dimensions are even integers
                        "-c:v",
                        "libx264",
                        "-preset",
                        "ultrafast", // Already using the fastest preset
                        "-tune",
                        "zerolatency", // Optimizes for speed and low latency
                        "-crf",
                        "34", // Slightly higher CRF (28->30) for faster encoding with minimal quality loss
                        "-b:v",
                        "0", // Let CRF control the bitrate
                        "-movflags",
                        "+faststart", // Optimizes for web playback
                        "-threads",
                        "0", // Use all available CPU threads
                        "-an", // Remove audio if not needed (speeds up processing)
                        "output.mp4",
                    ]);

                    // Lendo o arquivo compactado
                    const fileData = await ffmpeg.readFile("output.mp4");
                    const customBlob = new Blob([fileData.buffer], {
                        type: "video/mp4",
                    });

                    formData.append("file", customBlob);
                    formData.append("extension", "mp4");

                    upload();
                }

                compressVideo();

                // requestIdleCallback(async () => {});
            } else {
                console.log("smaller than 10 MB");
                formData.append("file", blob);
                formData.append("extension", getFileExtension(contentType));

                upload();
            }
        } else {
            formData.append("file", blob);
            formData.append("extension", getFileExtension(contentType));

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
                        journeySelect.disabled = false;
                        playerSelect.disabled = false;
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
                    journeySelect.disabled = false;
                    playerSelect.disabled = false;
                }
            };

            xhr.onerror = function (error) {
                showCounter(false);
                console.error("Erro ao enviar o arquivo.");
                // uploadProgress.textContent = "Erro ao enviar o arquivo.";
                showToaster("fail", "Erro no upload: " + error);
                journeySelect.disabled = false;
                playerSelect.disabled = false;
            };

            xhr.send(formData);
        }
    });
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

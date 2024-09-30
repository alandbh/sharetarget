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

        // formData.append("customName", "pwa-image");
        // formData.append("folder", window.parentFolder);

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
        filenameContainer.style.height = "0px";
        btnSend2.disabled = true;
        btnSend2.innerText = "Uploading...";

        const extension = getFileExtension(contentType); // gets the file extension

        console.log({ extension });

        const formData = new FormData();
        formData.append("file", blob); // Nome do arquivo pode ser alterado
        formData.append("extension", extension);

        const customName = await getCustonName(contentType);
        formData.append("customName", customName);

        formData.append("folder", localStorage.getItem("journey"));

        // try {
        //     const response = await fetch(window.apiUrl + "/upload", {
        //         method: "POST",
        //         body: formData,
        //     });

        //     if (response.ok) {
        //         console.log("Imagem enviada com sucesso!");
        //         showToaster();
        //         // document.getElementById("uploadStatus").textContent =
        //         //     "Upload realizado com sucesso!";
        //         btnSend2.innerText = "Send To Drive";
        //         filename.value = customName;
        //         filenameContainer.style.height = "100px";
        //         enableSendButton(btnSend2);
        //         setTimeout(() => {
        //             filename.scrollIntoView({ behavior: "smooth" });
        //         }, 800);
        //     } else {
        //         console.error("Erro no upload:", response.statusText);
        //         showToaster("fail");
        //         // document.getElementById("uploadStatus").textContent =
        //         //     "Erro ao enviar a imagem.";
        //     }
        // } catch (error) {
        //     console.error("Erro ao enviar a imagem:", error);
        //     showToaster("fail");
        //     // document.getElementById("uploadStatus").textContent =
        //     //     "Falha na conexão.";
        // }

        progressContainer.style.height = "60px";

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
                showCounter();
                const percentComplete = (event.loaded / event.total) * 100;

                progress = `${Math.round(percentComplete)}%`;
                uploadProgress.style.width = progress;
                progressText.textContent = progress;
                progressText.style.marginInlineStart = `calc(${progress} - 1.25rem)`;

                if (Math.round(percentComplete) === 100) {
                    btnSend2.innerText = "Storing in the right folder...";
                }
            }
        };

        // Handle the end of the upload
        xhr.onload = function (response) {
            if (xhr.status === 200) {
                btnSend2.innerText = "Done!";

                console.log("Upload completo");

                showToaster();
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
                    progressText.textContent = "0%";
                    progressText.style.marginInlineStart = "0%";
                    uploadProgress.style.width = "0%";
                    progressContainer.style.height = 0;
                }, 4000);
            } else {
                console.error("Erro no upload:", xhr.statusText);
                uploadProgress.textContent = "Erro no upload.";
            }
        };

        xhr.onerror = function () {
            console.error("Erro ao enviar o arquivo.");
            uploadProgress.textContent = "Erro ao enviar o arquivo.";
        };

        xhr.send(formData);
    });
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

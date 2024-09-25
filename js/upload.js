// Function for retrieving image stored in Cache API

async function loadImageFromCache() {
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
            document.getElementById("image-container").appendChild(imgElement);
        } else if (contentType.includes("video")) {
            // show the video
            const videoElement = document.createElement("video");
            videoElement.classList.add("w-full", "h-full", "object-contain");
            videoElement.src = imageDataUrl;
            document
                .getElementById("image-container")
                .appendChild(videoElement);
        }

        // Sento image to the backend

        const blob = base64ToBlob(imageDataUrl, contentType);
        const extension = getFileExtension(contentType); // gets the file extension

        console.log({ extension });

        const formData = new FormData();
        formData.append("file", blob); // Nome do arquivo pode ser alterado
        // formData.append("customName", "pwa-image");
        // formData.append("extension", extension);
        // formData.append("folder", window.parentFolder);

        sendToBackend(formData);

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

async function sendToBackend(formData) {
    const btnSend2 = document.querySelector("#btnSend2");
    btnSend2.addEventListener("click", async () => {
        btnSend2.disabled = true;
        btnSend2.innerText = "Uploading...";

        const customName = await getCustonName();

        formData.append("customName", customName);
        formData.append("folder", localStorage.getItem("journey"));

        try {
            const response = await fetch(window.apiUrl, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Imagem enviada com sucesso!");
                showToaster();
                // document.getElementById("uploadStatus").textContent =
                //     "Upload realizado com sucesso!";
                btnSend2.innerText = "Send To Drive";
                filename.value = customName;
                filenameContainer.style.height = "100px";
                enableSendButton();
            } else {
                console.error("Erro no upload:", response.statusText);
                showToaster("fail");
                // document.getElementById("uploadStatus").textContent =
                //     "Erro ao enviar a imagem.";
            }
        } catch (error) {
            console.error("Erro ao enviar a imagem:", error);
            document.getElementById("uploadStatus").textContent =
                "Falha na conexão.";
        }
    });
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

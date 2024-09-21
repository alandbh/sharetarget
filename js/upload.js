const players = [
    {
        name: "Magalu",
        slug: "magalu",
    },
    {
        name: "Casas Bahia",
        slug: "casas-bahia",
    },
    {
        name: "Beleza na Web",
        slug: "beleza",
    },
    {
        name: "Mercado Livre",
        slug: "mercado-livre",
    },
];

const journeys = [
    {
        name: "Site Mobile",
        slug: "site-mobile",
    },
    {
        name: "App",
        slug: "app",
    },
];

// Função para recuperar a imagem armazenada no Cache API

async function loadImageFromCache() {
    const cache = await caches.open("pwa-image-cache-v1");
    const cachedResponse = await cache.match("/cached-image");

    if (cachedResponse) {
        const imageDataUrl = await cachedResponse.text();

        // Exibir a imagem
        const imgElement = document.createElement("img");
        imgElement.classList.add("w-full", "h-full", "object-contain");
        imgElement.src = imageDataUrl;
        document.getElementById("image-container").appendChild(imgElement);

        // Enviar a imagem para o backend
        const contentType = imageDataUrl.split(";")[0].split(":")[1]; // extrai o tipo de conteúdo da base64
        const blob = base64ToBlob(imageDataUrl, contentType);
        const extension = getFileExtension(contentType); // Obter a extensão correta

        console.log({ extension });

        const formData = new FormData();
        formData.append("file", blob); // Nome do arquivo pode ser alterado
        formData.append("customName", "pwa-image");
        formData.append("extension", extension);
        formData.append("folder", window.parentFolder);

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

// Função para mapear contentType para extensão de arquivo
function getFileExtension(contentType) {
    switch (contentType) {
        case "image/jpeg":
            return "jpg";
        case "image/png":
            return "png";
        case "image/webp":
            return "webp";
        case "image/gif":
            return "gif";
        default:
            return ""; // Caso não seja um tipo conhecido, pode retornar uma string vazia
    }
}

async function sendToBackend(formData) {
    const sendToDrive2 = document.querySelector("#sendToDrive2");
    sendToDrive2.addEventListener("click", async () => {
        try {
            const response = await fetch(window.apiUrl, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                console.log("Imagem enviada com sucesso!");
                document.getElementById("uploadStatus").textContent =
                    "Upload realizado com sucesso!";
            } else {
                console.error("Erro no upload:", response.statusText);
                document.getElementById("uploadStatus").textContent =
                    "Erro ao enviar a imagem.";
            }
        } catch (error) {
            console.error("Erro ao enviar a imagem:", error);
            document.getElementById("uploadStatus").textContent =
                "Falha na conexão.";
        }
    });
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

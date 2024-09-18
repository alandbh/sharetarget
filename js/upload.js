// Função para recuperar a imagem armazenada no Cache API
async function loadImageFromCache() {
    const cache = await caches.open("pwa-image-cache-v1");
    const cachedResponse = await cache.match("/cached-image");

    if (cachedResponse) {
        const imageDataUrl = await cachedResponse.text();
        const imgElement = document.createElement("img");
        imgElement.classList.add("w-full", "h-full", "object-contain");
        imgElement.src = imageDataUrl;
        document.getElementById("image-container").appendChild(imgElement);
        return imageDataUrl;
    } else {
        document.querySelector("#errorMessage").classList.remove("hidden");
        document.querySelector("#errorMessage").textContent =
            "Nenhuma imagem foi compartilhada.";
    }
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

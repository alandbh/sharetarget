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
    } else {
        document.querySelector("#errorMessage").classList.remove("hidden");
        document.querySelector("#errorMessage").textContent =
            "Nenhuma imagem foi compartilhada.";
    }
}

window.addEventListener("DOMContentLoaded", loadImageFromCache);

/**
 *
 *
 * Function to authenticate user with OAuth 2.0
 * ----------------------------------------------------------------
 */

// const CLIENT_ID = "YOUR_CLIENT_ID"; // Substitua pelo seu Client ID
// const API_KEY = "YOUR_API_KEY"; // Substitua pelo seu API Key
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const FOLDER_ID = "YOUR_FOLDER_ID"; // Substitua pelo ID da pasta no Google Drive

function authenticate() {
    return gapi.auth2
        .getAuthInstance()
        .signIn({ scope: SCOPES })
        .then(
            function () {
                console.log("Usuário autenticado");
            },
            function (error) {
                console.error("Erro na autenticação", error);
            }
        );
}

// Carrega a biblioteca de APIs do Google
function loadClient() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client
        .load("https://content.googleapis.com/discovery/v1/apis/drive/v3/rest")
        .then(
            function () {
                console.log("Google Drive API carregada");
            },
            function (error) {
                console.error("Erro ao carregar API", error);
            }
        );
}

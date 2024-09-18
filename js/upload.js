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

/**
 *
 *
 * Function to authenticate user with OAuth 2.0
 * ----------------------------------------------------------------
 */

// const CLIENT_ID = "YOUR_CLIENT_ID"; // Substitua pelo seu Client ID
// const API_KEY = "YOUR_API_KEY"; // Substitua pelo seu API Key

let CLIENT_ID;
let API_KEY;

const options = { method: "GET" };

fetch("https://sharetarget.netlify.app/.netlify/functions/keys", options)
    .then((response) => response.json())
    .then((response) => {
        CLIENT_ID = response.client;
        API_KEY = response.api;
        console.log("Client: ", CLIENT_ID);
    })
    .catch((err) => console.error(err));

const SCOPES = "https://www.googleapis.com/auth/drive";
const FOLDER_ID = "1YEe9xlq56ycrajjPGiQ0Ia68y3e2C6lC"; // Substitua pelo ID da pasta no Google Drive

const DISCOVERY_DOCS =
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

let accessToken = "";

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
    return gapi.client.load(DISCOVERY_DOCS).then(
        function () {
            console.log("Google Drive API carregada");
        },
        function (error) {
            console.error("Erro ao carregar API", error);
        }
    );
}

// Função para fazer upload do arquivo para o Google Drive
function uploadFile(imageDataUrl) {
    const boundary = "foo_bar_baz";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileName = "compartilhamento-pwa.png"; // Nome do arquivo
    const contentType = "image/png"; // Tipo do arquivo

    const metadata = {
        name: fileName,
        mimeType: contentType,
        parents: [FOLDER_ID], // ID da pasta onde será salvo o arquivo
    };

    const multipartRequestBody =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " +
        contentType +
        "\r\n\r\n" +
        imageDataUrl.split(",")[1] + // Parte de dados da URL base64
        closeDelimiter;

    const request = gapi.client.request({
        path: "/upload/drive/v3/files?uploadType=multipart",
        method: "POST",
        headers: {
            "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
    });

    request.execute(function (file) {
        console.log("Arquivo enviado ao Google Drive:", file);
        alert("Arquivo enviado com sucesso ao Google Drive!");
    });
}

// Autentica e envia a imagem ao Google Drive
document.getElementById("send-to-drive").addEventListener("click", async () => {
    const imageDataUrl = await loadImageFromCache();

    if (!imageDataUrl) {
        alert("Nenhuma imagem encontrada para enviar.");
        return;
    }

    gapi.load("client:auth2", () => {
        gapi.auth2.init({ client_id: CLIENT_ID });
        authenticate().then(() => {
            loadClient().then(() => {
                uploadFile(imageDataUrl);
            });
        });
    });
});

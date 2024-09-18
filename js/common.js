/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
if (window.location.protocol === "http:") {
    const requireHTTPS = document.getElementById("requireHTTPS");
    const link = requireHTTPS.querySelector("a");
    link.href = window.location.href.replace("http://", "https://");
    requireHTTPS.classList.remove("hidden");
    window.location.href = "https:" + window.location.href.substring(5);
}

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
    console.log("👍", "navigator.serviceWorker is supported");
    navigator.serviceWorker.register("/service-worker.js");
}
let CLIENT_ID;
let API_KEY;

fetch("https://sharetarget.netlify.app/.netlify/functions/keys", {
    method: "GET",
})
    .then((response) => response.json())
    .then((response) => {
        CLIENT_ID = response.client;
        API_KEY = response.api;
        console.log("Client: ", CLIENT_ID);
        handleClientLoad();
    })
    .catch((err) => console.error(err));

var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];
var SCOPES = "https://www.googleapis.com/auth/drive";
var signinButton = document.querySelector("#signIn");
let tokenClient = { callback: null };
let gapiInited = false;
let gisInited = false;

// console.log("asasasa", gapi);

// window.onload = handleClientLoad;

function handleClientLoad() {
    gapi.load("client:auth2", () => {
        gapi.auth2.init({ clientId: CLIENT_ID });
    });
}

// function initClient() {
//     gapi.client
//         .init({
//             apiKey: API_KEY,
//             clientId: CLIENT_ID,
//             discoveryDocs: DISCOVERY_DOCS,
//             scope: SCOPES,
//         })
//         .then(
//             () => {
//                 gapi.auth2
//                     .getAuthInstance()
//                     .isSignedIn.listen(updateSignInStatus);

//                 // check initial signin state
//                 updateSignInStatus(
//                     gapi.auth2.getAuthInstance().isSignedIn.get()
//                 );
//                 signinButton.onclick = handleSignIn;
//             },
//             (err) => {
//                 console.error("error", err);
//             }
//         );
// }

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        signinButton.disable = true;
    } else {
        signinButton.disable = false;
    }
}

signinButton.onclick = () => authenticate();
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

function handleSignIn() {
    // gapi.auth2.getAuthInstance().signIn();
    authenticate().then(() => {
        loadClient();
    });
}

console.log("AMBIENTE", API_KEY);

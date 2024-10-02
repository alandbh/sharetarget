/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
// if (window.location.protocol === "http:") {
//     const requireHTTPS = document.getElementById("requireHTTPS");
//     window.location.href = "https:" + window.location.href.substring(5);
// }

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
    console.log("👍", "navigator.serviceWorker is supported");
    navigator.serviceWorker.register("/service-worker.js");
}

window.parentFolder = "1YEe9xlq56ycrajjPGiQ0Ia68y3e2C6lC";

// window.apiUrl = "http://localhost:4000";
window.apiUrlPost = "https://alanvasconcelos.net/uptodrive/";

// window.apiUrlPost = "http://localhost:8000";
// window.apiUrl = "https://alanvasconcelos.net/uptodrive";
// window.apiUrl = "https://uptodrive-backend.rj.r.appspot.com";
// window.apiUrl = "https://uptodrive.loca.lt";

window.apiUrl = window.location.host.includes("netlify")
    ? "https://uptodrive-backend.onrender.com"
    : "http://localhost:4000";

// window.apiUrl = window.location.host.includes("netlify")
//     ? "https://uptodrive.loca.lt"
//     : "http://localhost:4000";

// window.apiUrl = window.location.host.includes("netlify")
//     ? "https://uptodrive.serveo.net"
//     : "http://localhost:4000";
// window.apiUrl = window.location.host.includes("netlify")
//     ? "https://uptodrive-backend.onrender.com"
//     : "http://localhost:4000";

window.addEventListener("DOMContentLoaded", getInitialData);

async function getInitialData() {
    // const endpoint = window.location.host.includes("netlify")
    //     ? "https://uptodrive-backend.onrender.com"
    //     : "http://localhost:4000";

    const localFolders = JSON.parse(localStorage.getItem("folders"));
    console.log({ localFolders });

    if (!localFolders || localFolders.length === 0) {
        console.log("fetchingggggg");
        const response = await fetch(
            apiUrl + "/folders?folder=" + parentFolder,
            { method: "GET" }
        );

        const folders = await response.json();

        localStorage.setItem("folders", JSON.stringify(folders));

        window.players = localStorage.getItem("folders")
            ? JSON.parse(localStorage.getItem("folders"))
            : [];

        players.map((player) => {
            const opt = document.createElement("option");
            opt.value = player.id;
            opt.innerHTML = player.name;
            playerSelect.appendChild(opt);

            playerSelect.value = localStorage.getItem("player") || "null";
        });

        players[0].subfolders.map((subfolder) => {
            const opt = document.createElement("option");
            opt.value = subfolder.id;
            opt.innerHTML = subfolder.name;
            journeySelect.appendChild(opt);

            journeySelect.value = localStorage.getItem("journey") || "null";
        });
    }
    // Inicializa o FFmpeg fora da função sendToBackend
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
        coreURL: "/ffmpeg/ffmpeg-core.js",
    });
}

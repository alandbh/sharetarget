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

window.addEventListener("DOMContentLoaded", getInitialData);

async function getInitialData() {
    const endpoint = window.location.host.includes("netlify")
        ? "https://uptodrive-backend.onrender.com"
        : "http://localhost:4000";

    const localFolders = JSON.parse(localStorage.getItem("folders"));
    console.log({ localFolders });

    if (!localFolders || localFolders.length === 0) {
        console.log("fetchingggggg");
        const response = await fetch(
            endpoint + "/folders?folder=1YEe9xlq56ycrajjPGiQ0Ia68y3e2C6lC",
            { method: "GET" }
        );

        const folders = await response.json();

        localStorage.setItem("folders", JSON.stringify(folders));
    }
}

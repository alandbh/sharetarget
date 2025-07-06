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

async function getProjectPlayersFromJson(projectSlug) {
    let playersList;

    const response = await fetch(`/js/players-${projectSlug}.json`);
    const data = await response.json();

    return data.data;
}

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
    console.log("👍", "navigator.serviceWorker is supported");
    navigator.serviceWorker.register("/service-worker.js?v=78n");
}

const urlParams = new URLSearchParams(window.location.search);
const projectValue = urlParams.get("project");
console.log("Project value:", projectValue);

if (projectValue && projectValue === "retail") {
    window.parentFolder = "1FCylDw7EXrrgDDXpRnDlP9FEi6U6IwXk"; // Retail 5

    localStorage.setItem("project", "retail");
    localStorage.setItem("showjourney", true);
} else if (projectValue && projectValue === "emea") {
    window.parentFolder = "1JKf3bzWGCz27Jr4VBnJc94tr41o9QbwN"; // Emea 1
    localStorage.setItem("project", "emea");
    localStorage.setItem("showjourney", true);
} else if (projectValue && projectValue === "rspla2") {
    window.parentFolder = "1dgCZnulXt_y5XSLUkIPvrOhiDL3y59By"; // Spla 2
    localStorage.setItem("project", "rspla2");
    localStorage.setItem("showjourney", true);
} else if (projectValue && projectValue === "finance") {
    window.parentFolder = "1soSmxOyeTxz_UqNqkk457j5xZzoBThk7"; // Finance 4
    localStorage.setItem("project", "finance");
} else {
    localStorage.setItem("noproject", true);
}

const localProject = localStorage.getItem("project");

if (localProject === "retail") {
    window.parentFolder = "1FCylDw7EXrrgDDXpRnDlP9FEi6U6IwXk";
    window.shouldChooseJourney = true;
    localStorage.setItem("noproject", false);
} else if (localProject === "emea") {
    window.parentFolder = "1JKf3bzWGCz27Jr4VBnJc94tr41o9QbwN";
    window.shouldChooseJourney = true;
    localStorage.setItem("noproject", false);
} else if (localProject === "finance") {
    window.parentFolder = "1soSmxOyeTxz_UqNqkk457j5xZzoBThk7";
    window.shouldChooseJourney = false;
    localStorage.setItem("noproject", false);
} else {
    window.noProjectMessage = "Please, select a project";
    document.querySelector("#loading-message").textContent =
        "Please, select a project.";
}

// window.parentFolder = "1FCylDw7EXrrgDDXpRnDlP9FEi6U6IwXk"; // Retail 5
// window.parentFolder = "1soSmxOyeTxz_UqNqkk457j5xZzoBThk7"; // Finance 4
// window.parentFolder = "1JKf3bzWGCz27Jr4VBnJc94tr41o9QbwN"; // Emea 1

// window.apiUrlPost = window.location.host.includes("alanvasconcelos")
//     ? "https://alanvasconcelos.net/uptodrive/"
//     : "http://localhost:8000/"; // Mandatory '/' at the end.

// window.apiUrl = window.location.host.includes("alanvasconcelos")
//     ? "https://alanvasconcelos.net/uptodrive"
//     : "http://localhost:8000/";

// For testing purposes only
window.apiUrlPost = "https://alanvasconcelos.net/uptodrive/";
window.apiUrl = "https://alanvasconcelos.net/uptodrive";

window.addEventListener("DOMContentLoaded", getInitialData);

async function getInitialData() {
    const localFolders = JSON.parse(localStorage.getItem("folders"));
    console.log({ localFolders });

    window.shouldChooseJourney = Boolean(localStorage.getItem("showjourney"));

    if (!shouldChooseJourney) {
        document.querySelector("#journeySelectContainer").style.display =
            "none";
    }

    if (!localFolders || localFolders.length === 0) {
        window.loading = true;
        document.body.classList.add("loading");
        console.log("fetchingggggg");

        // const playersList = await getProjectPlayersFromJson(projectValue);
        // const playersNames = playersList.players.map((player) => player.name);
        // const playersSlugs = playersList.players.map((player) => player.slug);

        // console.log("playersList:", playersSlugs);

        const response = await fetch(
            apiUrl + "?list=folders&folder=" + parentFolder,
            {
                method: "GET",
            }
        );

        const folders = await response.json();

        const sortedFolders = folders.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            return 1;
        });

        localStorage.setItem("folders", JSON.stringify(sortedFolders));

        const players = localStorage.getItem("folders")
            ? JSON.parse(localStorage.getItem("folders"))
            : [];

        window.players = players;
        window.loading = false;
        document.body.classList.remove("loading");

        players.map((player) => {
            const opt = document.createElement("option");
            opt.value = player.id;
            opt.innerHTML = player.name;
            playerSelect.appendChild(opt);

            playerSelect.value = localStorage.getItem("player") || "null";
        });

        if (shouldChooseJourney) {
            players[0].subfolders.map((subfolder) => {
                const opt = document.createElement("option");
                opt.value = subfolder.id;
                opt.innerHTML = subfolder.name;
                journeySelect.appendChild(opt);

                journeySelect.value = localStorage.getItem("journey") || "null";
            });
        } else {
            journeySelectContainer.style.display = "none";
        }
    }
}

function setProgressBackground(
    element,
    percentage = 0,
    darkColor = "#94a3b8",
    lightColor = "#cbd5e1"
) {
    if (!element) {
        return;
    }
    element.style.background = `linear-gradient(90deg, ${darkColor} ${percentage}%, ${lightColor} ${percentage}%, ${lightColor} 100%)`;
}

function createSlug(name) {
    return name
        .toLowerCase() // Converte para minúsculas
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9]/g, ""); // Remove caracteres especiais, mantendo letras e números
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

async function toBlobURL(url, mimeType) {
    let buf;

    const response = await fetch(url);
    buf = await response.arrayBuffer();

    const blob = new Blob([buf], { type: mimeType });
    return URL.createObjectURL(blob);
}

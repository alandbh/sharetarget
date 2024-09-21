const playerSelect = document.querySelector("#player");
const journeySelect = document.querySelector("#journey");
// const journeySelect = document.createElement("select");
const copyNameButton = document.querySelector("#copyNameButton");
const iconCopy = document.querySelector("#iconCopy");
const copyedMessage = document.querySelector("#copyedMessage");
const iconCheck = document.querySelector("#iconCheck");
const fileInput = document.querySelector("#fileInput");
const filename = document.querySelector("#filename");
const btnSend = document.querySelector("#btnSend");
const btnSendPreview = document.querySelector("#btnSendPreview");
const toaster = document.querySelector("#toaster");

copyNameButton.addEventListener("click", () => {
    const filenameContainer = document.querySelector("#filename");

    filenameContainer.select();
    filenameContainer.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(filenameContainer.value);

    iconCopy.classList.add("hidden");
    iconCheck.classList.remove("hidden");
    copyNameButton.classList.remove("text-slate-500");
    copyNameButton.classList.add("bg-green-500", "text-white");
    copyedMessage.style.opacity = 1;

    setTimeout(() => {
        iconCopy.classList.remove("hidden");
        iconCheck.classList.add("hidden");
        copyNameButton.classList.add("text-slate-500");
        copyNameButton.classList.remove("bg-green-500", "text-white");
        copyedMessage.style.opacity = 0;
    }, 4000);
});

/**
 *
 * Only for Development purposes
 * --------------------------------
 * */

btnSendPreview.addEventListener("click", async () => {
    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const options = {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
    };

    fetch("http://localhost:3003/share.html", options);
});

btnSend.addEventListener("click", async () => {
    console.log("FILE", fileInput.files[0]);

    if (fileInput.files.length > 0) {
        btnSend.disabled = true;
        btnSend.innerText = "Uploading...";
    }

    const customName = await getCustonName();

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("customName", customName);
    formData.append("folder", localStorage.getItem("journey"));

    const options = {
        method: "POST",
        body: formData,
    };

    fetch(window.apiUrl + "/upload", options)
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            showToaster();
            // btnSend.disabled = false;
            btnSend.innerText = "Send To Drive";
            fileInput.value = "";
            filename.value = customName;
            filenameContainer.style.height = "100px";
            enableSendButton();
        })
        .catch((error) => {
            showToaster("fail");
        });
});

function enableSendButton() {
    btnSend.disabled = true;
    const validInputFile = Boolean(fileInput.value);
    const validPlayer = Boolean(
        localStorage.player && localStorage.player !== "null"
    );
    const validJourney = Boolean(
        localStorage.journey && localStorage.journey !== "null"
    );

    if (validInputFile && validPlayer && validJourney) {
        btnSend.disabled = false;
    }

    return validInputFile && validPlayer && validJourney;
}

function showToaster(status) {
    toaster.style.bottom = "20vh";
    if (status == "fail") {
        toaster.style.border = "1px solid red";
        toaster.style.background = "#ff777711";
        toaster.innerHTML = `<span>👎</span> Error on sending file.`;
    } else {
        toaster.style.border = "1px solid green";
        toaster.style.background = "#77ff7744";
        toaster.innerHTML = `<span>🙌</span> File has been sent successfuly!`;
    }

    setTimeout(() => {
        hideToaster();
    }, 5000);
}

function hideToaster() {
    toaster.style.bottom = "-20vh";
}

function getPlayerName() {
    if (localStorage.getItem("player")) {
        return window.players.find(
            (player) => player.id === localStorage.getItem("player")
        ).name;
    }

    return "player";
}
function getJourneyName() {
    if (localStorage.getItem("journey")) {
        const currentPlayerSubfolders = window.players.find(
            (player) => player.id === localStorage.getItem("player")
        ).subfolders;

        return currentPlayerSubfolders.find(
            (subfolder) => subfolder.id === localStorage.getItem("journey")
        ).name;
    }

    return "journey";
}

async function getFilesList() {
    const response = await fetch(
        // apiUrl + "/files?folder=" + parentFolder,
        apiUrl + "/files?folder=" + localStorage.getItem("journey"),
        { method: "GET" }
    );

    const files = await response.json();

    return files;
}

async function getCustonName() {
    const filesList = await getFilesList();
    return (
        getPlayerName() +
        "-" +
        getJourneyName() +
        "-" +
        Number(filesList.length + 1)
    );
}

/**
 *
 * Populate the player selection
 */

journeySelect.addEventListener("change", () => {
    localStorage.setItem("journey", journeySelect.value);
});

window.players = localStorage.getItem("folders")
    ? JSON.parse(localStorage.getItem("folders"))
    : [];

if (localStorage.getItem("player")) {
    const selectedPlayer = getPlayerObj(
        players,
        localStorage.getItem("player")
    );

    populateJourneySelect(selectedPlayer);
}

if (localStorage.getItem("journey") && localStorage.getItem("player")) {
    journeySelect.value = localStorage.getItem("journey");
}

players.map((player) => {
    const opt = document.createElement("option");
    opt.value = player.id;
    opt.innerHTML = player.name;
    playerSelect.appendChild(opt);

    playerSelect.value = localStorage.getItem("player") || "null";
});

playerSelect.addEventListener("change", (event) => {
    localStorage.setItem("player", playerSelect.value);
    console.log(event.target.value);

    const selectedPlayer = getPlayerObj(players, event.target.value);

    localStorage.removeItem("journey");
    populateJourneySelect(selectedPlayer);
});

function populateJourneySelect(selectedPlayer) {
    clearJourney();
    const subfolders = selectedPlayer.subfolders;
    subfolders.map((folder) => {
        const opt = document.createElement("option");
        opt.value = folder.id;
        opt.innerHTML = folder.name;
        journeySelect.appendChild(opt);
    });
    journeySelect.value = localStorage.getItem("journey") || "null";
}

function clearJourney() {
    journeySelect.length = 0;
    const defaultOpt = document.createElement("option");
    defaultOpt.value = null;
    defaultOpt.innerHTML = "...";
    journeySelect.appendChild(defaultOpt);
}

function getPlayerObj(players, id) {
    const selectedPlayer = players.find((player) => player.id === id);

    return selectedPlayer;
}

[fileInput, playerSelect, journeySelect].map((field) => {
    field.addEventListener("change", () => {
        setTimeout(() => {
            enableSendButton();
        }, 100);
    });
});

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
// const btnSendPreview = document.querySelector("#btnSendPreview");
const toaster = document.querySelector("#toaster");
const uploadProgress = document.getElementById("uploadProgress");
const progressContainer = document.getElementById("progressContainer");
const progressText = document.getElementById("progressText");

const isShowPage = window.location.pathname.endsWith("show.html");

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

// btnSendPreview.addEventListener("click", async () => {
//     const formData = new FormData();
//     formData.append("file", fileInput.files[0]);

//     const options = {
//         method: "POST",
//         body: formData,
//         headers: { "Content-Type": "multipart/form-data" },
//     };

//     fetch("http://localhost:3003/share.html", options);
// });

if (!isShowPage) {
    btnSend.addEventListener("click", async () => {
        filenameContainer.style.height = "0px";
        console.log("FILE", fileInput.files[0]);

        if (fileInput.files.length > 0) {
            btnSend.disabled = true;
            btnSend.innerText = "Uploading...";
        }

        const customName = await getCustonName(fileInput.files[0].type);

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("customName", customName);
        formData.append("folder", localStorage.getItem("journey"));

        // const options = {
        //     method: "POST",
        //     body: formData,
        // };

        // fetch(window.apiUrl + "/upload", options)
        //     .then((response) => response.json())
        //     .then((response) => {
        //         console.log(response);
        //         showToaster();
        //         // btnSend.disabled = false;
        //         btnSend.innerText = "Send To Drive";
        //         fileInput.value = "";
        //         filename.value = customName;
        //         filenameContainer.style.height = "100px";
        //         enableSendButton(btnSend);
        //     })
        //     .catch((error) => {
        //         showToaster("fail");
        //     });

        progressContainer.style.height = "60px";

        const xhr = new XMLHttpRequest();

        xhr.open("POST", window.apiUrl + "/upload", true);

        let progress;

        // Updates the progress bar
        xhr.upload.onprogress = function (event) {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;

                progress = `${Math.round(percentComplete)}%`;
                // uploadProgress.textContent = progress;
                uploadProgress.style.width = progress;
                progressText.textContent = progress;
                progressText.style.marginInlineStart = `calc(${progress} - 1.25rem)`;
            }
        };

        // Handle the end of the upload
        xhr.onload = function (response) {
            if (xhr.status === 200) {
                console.log("Upload completo");

                showToaster();
                btnSend.innerText = "Send To Drive";
                fileInput.value = "";
                filename.value = customName;
                filenameContainer.style.height = "100px";
                enableSendButton(btnSend);

                console.log("SUCESSO", response);

                setTimeout(() => {
                    progressText.textContent = "0%";
                    progressText.style.marginInlineStart = "0%";
                    uploadProgress.style.width = "0%";
                    progressContainer.style.height = 0;
                }, 4000);
            } else {
                console.error("Erro no upload:", xhr.statusText);
                uploadProgress.textContent = "Erro no upload.";
            }
        };

        xhr.onerror = function () {
            console.error("Erro ao enviar o arquivo.");
            uploadProgress.textContent = "Erro ao enviar o arquivo.";
        };

        xhr.send(formData);
    });
}

function enableSendButton(btnSend) {
    btnSend.disabled = true;
    const validInputFile = isShowPage ? false : Boolean(fileInput.value);
    const validPlayer = Boolean(
        localStorage.player && localStorage.player !== "null"
    );
    const validJourney = Boolean(
        localStorage.journey && localStorage.journey !== "null"
    );

    if (isShowPage) {
        if (validPlayer && validJourney) {
            btnSend.disabled = false;
        }

        return validPlayer && validJourney;
    }

    if (validInputFile && validPlayer && validJourney) {
        btnSend.disabled = false;
    }

    return validInputFile && validPlayer && validJourney;
}

function showToaster(status) {
    toaster.style.top = "5vh";
    if (status == "fail") {
        toaster.style.border = "1px solid red";
        toaster.style.background = "#ffe2e2";
        toaster.innerHTML = `<span>👎</span> Error on sending file.`;
    } else {
        toaster.style.border = "1px solid green";
        toaster.style.background = "#ceffce";
        toaster.innerHTML = `<span>🙌</span> File has been sent successfuly!`;
    }

    setTimeout(() => {
        hideToaster();
    }, 5000);
}

function hideToaster() {
    toaster.style.top = "-10vh";
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

async function getCustonName(contentType) {
    let mediaType;

    if (contentType.includes("image")) {
        mediaType = "i";
    } else if (contentType.includes("video")) {
        mediaType = "v";
    } else {
        mediaType = "f";
    }

    const filesList = await getFilesList();
    return (
        mediaType +
        Number(filesList.length + 1) +
        "-" +
        getJourneyName().substr(0, 4) +
        "-" +
        getPlayerName()
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
if (isShowPage) {
    [playerSelect, journeySelect].map((field) => {
        field.addEventListener("change", () => {
            setTimeout(() => {
                enableSendButton(document.querySelector("#btnSend2"));
            }, 100);
        });
    });
} else {
    [fileInput, playerSelect, journeySelect].map((field) => {
        field.addEventListener("change", () => {
            setTimeout(() => {
                enableSendButton(btnSend);
            }, 100);
        });
    });
}

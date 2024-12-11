const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;
let ffmpeg = null;

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
// const uploadProgress = document.getElementById("uploadProgress");
// const progressContainer = document.getElementById("progressContainer");
// const progressText = document.getElementById("progressText");
const countContainer = document.createElement("div");

const isShowPage = window.location.pathname.endsWith("show.html");

let secondInterval;

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
 *
 *
 * ----------------------------------------------------------------
 * Compressing the video file and uploading it
 * -------------------------------- --------------------------------
 *
 *
 * */

if (!isShowPage) {
    btnSend.addEventListener("click", async () => {
        btnSend.disabled = true;
        playerSelect.disabled = true;
        journeySelect.disabled = true;
        fileInput.disabled = true;

        window.addEventListener("beforeunload", function (e) {
            e.preventDefault();
            e.returnValue = "";
        });

        btnSend.innerText = "Starting...";
        filenameContainer.style.height = "0px";
        console.log("FILE", fileInput.files[0]);

        if (fileInput.files.length > 0) {
            btnSend.disabled = true;
            btnSend.innerText = "Uploading...";
        }

        const customName = await getCustonName(fileInput.files[0].type);

        const formData = new FormData();
        formData.append("customName", customName);
        let extension = getFileExtension(fileInput.files[0].type);

        formData.append("folder", localStorage.getItem("journey"));

        console.log({ extension });

        if (fileInput.files[0].type.includes("video")) {
            // Some tests show that ffmpg only works with files larger than 40MB
            if (
                fileInput.files[0].size > 40 * 1000 * 1000 ||
                extension !== "mp4"
            ) {
                console.log("big > 40");
                const ffmpeg = new FFmpeg();
                const baseURL =
                    "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                ffmpeg.on("log", ({ message }) => {
                    // messageRef.current.innerHTML = message;
                    console.log(message);
                });
                // toBlobURL is used to bypass CORS issue, urls with the same
                // domain can be used directly.
                await ffmpeg.load({
                    coreURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.js`,
                        "text/javascript"
                    ),
                    wasmURL: await toBlobURL(
                        `${baseURL}/ffmpeg-core.wasm`,
                        "application/wasm"
                    ),
                });
                // await ffmpeg.load({
                //     coreURL: "/ffmpeg/ffmpeg-core.js",
                //     // coreURL:
                //     //     "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
                // });

                ffmpeg.on("progress", ({ progress, time }) => {
                    btnSend.innerText = "Compressing video...";
                    setProgressBackground(btnSend, progress * 100, "#f87171");
                });

                const { name } = fileInput.files[0];
                await ffmpeg.writeFile(
                    name,
                    await fetchFile(fileInput.files[0])
                );

                await ffmpeg.exec([
                    "-i",
                    name,
                    "-vf",
                    "scale=iw/2:ih/2",
                    "-preset",
                    "ultrafast", // acelera a compressão
                    "-crf",
                    "28", // reduz a qualidade
                    "output.mp4",
                ]);

                const fileData = await ffmpeg.readFile("output.mp4");
                const customBlob = new Blob([fileData.buffer], {
                    type: "video/mp4",
                });

                // updateFormData(compressedBlob);
                formData.append("file", customBlob);
                formData.append("extension", "mp4");

                console.log({ fileData });

                upload();

                // .then(() => ffmpeg.readFile("output.mp4"))
                // .then((fileData) => {
                //     const compressedBlob = new Blob([fileData.buffer], {
                //         type: "video/mp4",
                //     });

                //     // updateFormData(compressedBlob);
                //     formData.append("file", compressedBlob);

                //     console.log({ compressedBlob });

                //     // upload();
                // });
                // requestIdleCallback(async () => {
                // });
            } else {
                console.log("small");
                formData.append("file", fileInput.files[0]);
                formData.append(
                    "extension",
                    getFileExtension(fileInput.files[0].type)
                );
                upload();
            }
        } else {
            formData.append("file", fileInput.files[0]);
            formData.append(
                "extension",
                getFileExtension(fileInput.files[0].type)
            );

            upload();
        }

        function upload() {
            // progressContainer.style.height = "60px";

            const xhr = new XMLHttpRequest();

            // xhr.withCredentials = true;
            xhr.addEventListener("readystatechange", function () {
                if (this.readyState === this.DONE) {
                    console.log("Backend Server is Ready", this.responseText);
                }
            });

            xhr.open("POST", window.apiUrlPost, true);
            // xhr.setRequestHeader("cache-control", "no-cache");

            // Updates the progress bar
            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    // showCounter();
                    btnSend.innerText = "Uploading...";
                    const percentComplete = (event.loaded / event.total) * 100;

                    setProgressBackground(
                        btnSend,
                        Math.round(percentComplete),
                        "#b91c1c",
                        "#f87171"
                    );

                    // progress = `${Math.round(percentComplete)}%`;
                    // // uploadProgress.textContent = progress;
                    // uploadProgress.style.width = progress;
                    // progressText.textContent = progress;
                    // progressText.style.marginInlineStart = `calc(${progress} - 1.25rem)`;
                }
            };

            // Handle the end of the upload
            const latestUploadedFiles =
                JSON.parse(localStorage.getItem("latestUploadedFiles")) || [];
            // response.target.responseText

            xhr.onload = function (response) {
                if (xhr.status === 200) {
                    console.log("Upload completo");
                    // showCounter(false);

                    window.removeEventListener("beforeunload", (e) => {
                        e.returnValue = "";
                    });

                    showToaster("success", "File has been sent successfuly!");
                    btnSend.innerText = "Send To Drive";
                    fileInput.value = "";
                    filename.value = customName;
                    latestUploadedFiles.push(
                        JSON.parse(response.target.responseText)
                    );
                    console.log("FILE RETURN", latestUploadedFiles);
                    localStorage.setItem(
                        "latestUploadedFiles",
                        JSON.stringify(latestUploadedFiles)
                    );
                    filenameContainer.style.height = "100px";
                    enableSendButton(btnSend);
                    playerSelect.disabled = false;
                    journeySelect.disabled = false;
                    fileInput.disabled = false;

                    console.log("SUCESSO", response);

                    setTimeout(() => {
                        // progressText.textContent = "0%";
                        // progressText.style.marginInlineStart = "0%";
                        // uploadProgress.style.width = "0%";
                        // progressContainer.style.height = 0;
                        btnSend.removeAttribute("style");
                    }, 4000);
                } else {
                    console.error("Erro no upload:", xhr.statusText);
                    // uploadProgress.textContent = "Erro no upload.";
                    // showCounter(false);
                    showToaster("fail", "Erro no upload: " + xhr.statusText);
                }
            };

            xhr.onerror = function (error) {
                showCounter(false);
                console.error("Erro ao enviar o arquivo.");
                // uploadProgress.textContent = "Erro ao enviar o arquivo.";
                showToaster("fail", "Erro no upload: " + error);
            };

            xhr.send(formData);
        }
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

function showToaster(
    status = "success",
    message = "File has been sent successfuly!"
) {
    toaster.style.top = "5vh";
    if (status == "fail") {
        toaster.style.border = "1px solid red";
        toaster.style.background = "#ffe2e2";
        toaster.innerHTML = `<span>👎</span> ${message}`;
    } else {
        toaster.style.border = "1px solid green";
        toaster.style.background = "#ceffce";
        toaster.innerHTML = `<span>🙌</span> ${message}`;
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
        apiUrl + "?list=files&folder=" + localStorage.getItem("journey"),
        {
            method: "GET",
        }
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
        getJourneyName().substring(0, 4) +
        "-" +
        createSlug(getPlayerName())
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

/**
 *
 * Showing a counter in the bottom of the page
 */

function showCounter(start = true) {
    // let secondInterval;
    const body = document.querySelector("body");

    if (start && body.querySelector("#counterContainer")) {
        return;
    }

    // const countContainer = document.createElement("div");
    const divSeconds = document.createElement("div");
    const divMinutes = document.createElement("div");

    body.style.paddingBottom = "70px";

    countContainer.style.position = "fixed";
    countContainer.style.bottom = "20px";
    countContainer.style.textAlign = "center";
    countContainer.style.color = "grey";
    countContainer.id = "counterContainer";

    let seconds = 0;
    let minutes = 0;
    let innerSecconds = 0;

    if (start) {
        secondInterval = setInterval(() => {
            seconds++;
            innerSecconds++;
            divSeconds.innerText = "Total seconds: " + seconds;
            if (seconds % 60 === 0) {
                minutes++;
                innerSecconds = 0;
            }
            divMinutes.innerText =
                "Total minutes: " + minutes + ":" + innerSecconds;
        }, 1000);
    } else {
        console.log("stop");
        clearInterval(secondInterval);
        return;
    }

    countContainer.appendChild(divSeconds);
    countContainer.appendChild(divMinutes);
    body.appendChild(countContainer);
}

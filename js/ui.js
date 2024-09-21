const playerSelect = document.querySelector("#player");
const journeySelect = document.querySelector("#journey");
const copyNameButton = document.querySelector("#copyNameButton");
const iconCopy = document.querySelector("#iconCopy");
const iconCheck = document.querySelector("#iconCheck");
const fileInput = document.querySelector("#fileInput");
const btnSend = document.querySelector("#btnSend");
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

    setTimeout(() => {
        iconCopy.classList.remove("hidden");
        iconCheck.classList.add("hidden");
        copyNameButton.classList.add("text-slate-500");
        copyNameButton.classList.remove("bg-green-500", "text-white");
    }, 4000);
});

playerSelect.addEventListener("change", () => {
    localStorage.setItem("player", playerSelect.value);
});

journeySelect.addEventListener("change", () => {
    localStorage.setItem("journey", journeySelect.value);
});

btnSend.addEventListener("click", async () => {
    console.log("FILE", fileInput.files[0]);

    if (fileInput.files.length > 0) {
        btnSend.disabled = true;
        btnSend.innerText = "Uploading...";
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("customName", "custon-name-alan");
    formData.append("folder", window.parentFolder);

    const options = {
        method: "POST",
        body: formData,
    };

    fetch(window.apiUrl + "/upload", options)
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            showToaster();
            btnSend.disabled = false;
            btnSend.innerText = "Send To Drive";
        })
        .catch((error) => {
            showToaster("fail");
        });
});

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

/**
 *
 * Populate the player selection
 */

// const players = localStorage.getItem("folders")
//     ? JSON.parse(localStorage.getItem("folders"))
//     : [];

// players.map((player) => {
//     const opt = document.createElement("option");
//     opt.value = player.id;
//     opt.innerHTML = player.name;
//     playerSelect.appendChild(opt);

//     playerSelect.value = localStorage.getItem("player") || "null";
//     journeySelect.value = localStorage.getItem("journey") || "null";
// });

playerSelect.addEventListener("change", (event) => {
    console.log(event.target.value);

    const selectedPlayer = players.find(
        (player) => player.id === event.target.value
    );

    populateJourneySelect(selectedPlayer.subfolders);
});

function populateJourneySelect(subfolders) {
    subfolders.map((folder) => {
        const opt = document.createElement("option");
        opt.value = folder.id;
        opt.innerHTML = folder.name;
        journeySelect.appendChild(opt);
    });
}

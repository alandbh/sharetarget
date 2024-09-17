const playerSelect = document.querySelector("#player");
const journeySelect = document.querySelector("#journey");
const uploadButton = document.querySelector("#btnUpload");
const copyNameButton = document.querySelector("#copyNameButton");
const iconCopy = document.querySelector("#iconCopy");
const iconCheck = document.querySelector("#iconCheck");

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

playerSelect.value = localStorage.getItem("player") || "null";
journeySelect.value = localStorage.getItem("journey") || "null";

playerSelect.addEventListener("change", () => {
    localStorage.setItem("player", playerSelect.value);
});

journeySelect.addEventListener("change", () => {
    localStorage.setItem("journey", journeySelect.value);
});

uploadButton.addEventListener("click", () => {
    console.log("send file to Drive");
});

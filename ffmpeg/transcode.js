const { fetchFile } = FFmpegUtil;
const { FFmpeg } = FFmpegWASM;
let ffmpeg = null;

const transcode = async ({ target: { files } }) => {
    const message = document.getElementById("message");
    if (ffmpeg === null) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("log", ({ message }) => {
            console.log(message);
        });
        ffmpeg.on("progress", ({ progress, time }) => {
            message.innerHTML = `${progress * 100} %, time: ${
                time / 1000000
            } s`;
        });
        await ffmpeg.load({
            coreURL: "/ffmpeg/ffmpeg-core.js",
        });
    }
    const { name } = files[0];
    await ffmpeg.writeFile(name, await fetchFile(files[0]));
    message.innerHTML = "Start transcoding";
    console.time("exec");
    await ffmpeg.exec([
        "-i",
        name,
        "-preset",
        "ultrafast", // acelera a compressão
        "-crf",
        "28", // reduz a qualidade
        "output.mp4",
    ]);
    console.timeEnd("exec");
    message.innerHTML = "Complete transcoding";
    const data = await ffmpeg.readFile("output.mp4");

    const video = document.getElementById("output-video");
    video.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
    );
};
const elm = document.getElementById("uploader");
elm.addEventListener("change", transcode);

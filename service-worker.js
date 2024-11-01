const FRONT_CACHE = "pwa-cache-v1";
const urlsToCache = [
    "/index.html",
    "/share.html",
    "/show.html",
    "/error.html",
    "/manifest.json",
    "/service-worker.js",
    "/js/common.js",
    "/js/share.js",
    "/js/ui.js",
    "/js/upload.js",
    "/ffmpeg/ffmpeg-core.wasm",
    "/ffmpeg/ffmpeg-core.js",
    "/ffmpeg/ffmpeg-core.worker.js",
    "/ffmpeg/ffmpeg.js",
    "/ffmpeg/ffmpeg.js.map",
    "/ffmpeg/index.js",
    "/ffmpeg/transcode.js",
    // Outros arquivos como CSS, JS ou imagens
];

// Instala o Service Worker e armazena os arquivos no cache
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(FRONT_CACHE).then((cache) => {
            console.log("Arquivos em cache");
            return cache.addAll(urlsToCache);
        })
    );
});

// Responde às requisições da rede com o conteúdo do cache
// self.addEventListener("fetch", (event) => {
//     event.respondWith(
//         caches.match(event.request).then((response) => {
//             // Retorna o arquivo do cache, se disponível
//             return response || fetch(event.request);
//         })
//     );
// });

// Atualiza o cache sempre que necessário
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [FRONT_CACHE];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// self.addEventListener("fetch", async function (event) {
//     console.log("👷", "fetch", event);
//     const url = new URL(event.request.url);
//     // If this is an incoming POST request for the
//     // registered "action" URL, respond to it.
//     if (event.request.method === "POST" && url.pathname === "/target.html") {
//         // const formData = await event.request.formData();
//         // const file = formData.get("file");

//         // const fileReader = new FileReader();
//         // fileReader.readAsDataURL(file);
//         // fileReader.addEventListener("load", (event) => {
//         //     const base64Url = fileReader.result;

//         //     const img = new Image();
//         //     img.src = base64Url;
//         //     document.body.appendChild(img);
//         // });

//         event.respondWith(
//             (async () => {
//                 const formData = await event.request.formData();
//                 const file = formData.get("file");
//                 const filename = file.name.replaceAll(" ", "_");

//                 if (file) {
//                     // Envia o arquivo para a página Target
//                     self.clients.matchAll().then((clients) => {
//                         clients.forEach((client) => {
//                             if (client.url.endsWith("target.html")) {
//                                 client.postMessage({
//                                     type: "file",
//                                     file: {
//                                         name: file.name,
//                                         type: file.type,
//                                         blob: file,
//                                     },
//                                 });
//                             }
//                         });
//                     });
//                 }

//                 // Retorna uma resposta padrão
//                 // return new Response(
//                 //     JSON.stringify({ status: "file received" }),
//                 //     { headers: { "Content-Type": "application/json" } }
//                 // );
//                 const responseUrl = "/target.html?filename=" + filename;
//                 return Response.redirect(responseUrl, 303);

//                 // const fileReader = new FileReader();
//                 // fileReader.readAsDataURL(file);
//                 // fileReader.addEventListener("load", (event) => {
//                 //     const base64Url = fileReader.result;
//                 //     const img = new Image();
//                 //     img.src = base64Url;
//                 //     document.body.appendChild(img);
//                 // });
//                 // const filename = file.name.replaceAll(" ", "_");
//                 // const link = formData.get("link") || "";
//                 // const responseUrl = "/target.html?filename=" + filename;
//                 // return Response.redirect(responseUrl, 303);
//             })()
//         );
//     }
// });

// service-worker.js
// self.addEventListener("fetch", (event) => {
//     if (event.request.method === "POST") {
//         console.log("possstt");
//         event.respondWith(
//             (async () => {
//                 const formData = await event.request.formData();
//                 const file = formData.get("file");
//                 const imageUrl = URL.createObjectURL(file);

//                 if (file) {
//                     // Envia o arquivo de imagem para a página
//                     self.clients.matchAll().then((clients) => {
//                         clients.forEach((client) => {
//                             if (client.url.endsWith("target.html")) {
//                                 client.postMessage({
//                                     type: "file",
//                                     file: {
//                                         name: file.name,
//                                         type: file.type,
//                                         blob: file,
//                                     },
//                                 });
//                             }
//                         });
//                     });
//                 }

//                 // Redireciona para a página target.html
//                 // return Response.redirect("/target.html", 303); // 303: See Other
//                 return Response.redirect(
//                     `/target.html?imageUrl=${encodeURIComponent(imageUrl)}`,
//                     303
//                 );
//             })()
//         );
//     }
// });

// self.addEventListener("fetch", (event) => {
//     if (
//         event.request.method === "POST" &&
//         event.request.url.endsWith("/share.html")
//     ) {
//         event.respondWith(handleShare(event.request));
//     }
// });

// async function handleShare(request) {
//     const formData = await request.formData();
//     const file = formData.get("image");

//     if (file && file.type.startsWith("image/")) {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);

//         return new Promise((resolve) => {
//             reader.onloadend = () => {
//                 const imageDataUrl = reader.result;

//                 // Armazena a imagem no sessionStorage através do Client API
//                 self.clients.matchAll().then((clients) => {
//                     clients.forEach((client) => {
//                         client.postMessage({ imageDataUrl });
//                     });
//                 });

//                 // Redireciona para a página de exibição sem parâmetros de URL
//                 resolve(Response.redirect("/show.html", 303));
//             };
//         });
//     }

//     return Response.redirect("/error.html", 303);
// }

// self.addEventListener("fetch", (event) => {
//     if (
//         event.request.method === "POST" &&
//         event.request.url.endsWith("share.html")
//     ) {
//         event.respondWith(
//             fetch(event.request)
//                 .then((response) => response.blob())
//                 .then((blob) => {
//                     // Salvar a imagem em um local temporário ou enviar para o backend

//                     // Salvar imagem no IndexedDB
//                     const dbPromise = idb.open("myDatabase", 1);
//                     dbPromise.then((db) => {
//                         const tx = db.transaction("images", "readwrite");
//                         const store = tx.objectStore("images");
//                         store.put(blob, imageId);
//                         return tx.complete;
//                     });
//                     // ...
//                     return new Response("Imagem recebida com sucesso");
//                 })
//         );
//     }
// });

const CACHE_NAME = "pwa-image-cache-v1";

self.addEventListener("fetch", (event) => {
    if (
        event.request.method === "POST" &&
        event.request.url.endsWith("/share.html")
    ) {
        event.respondWith(handleShare(event.request));
    }
});

async function handleShare(request) {
    const formData = await request.formData();
    const file = formData.get("file");

    console.log("filetype", file);
    console.log("filetype", file.type);

    if (
        file &&
        (file.type.startsWith("image/") || file.type.startsWith("video/"))
    ) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        return new Promise((resolve) => {
            reader.onloadend = () => {
                const imageDataUrl = reader.result;

                // Stores the file in cache
                caches.open(CACHE_NAME).then((cache) => {
                    const response = new Response(imageDataUrl, {
                        headers: { "Content-Type": file.type },
                    });
                    cache.put("/cached-file", response);
                });

                // Redirects to the preview page
                resolve(Response.redirect("/show.html", 303));
            };
        });
    }

    return Response.redirect("/error.html", 303);
}

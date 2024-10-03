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

// const CACHE_NAME = "pwa-image-cache-v1";

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
//     const file = formData.get("file");

//     console.log("filetype", file);
//     console.log("filetype", file.type);

//     if (
//         file &&
//         (file.type.startsWith("image/") || file.type.startsWith("video/"))
//     ) {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);

//         return new Promise((resolve) => {
//             reader.onloadend = () => {
//                 const imageDataUrl = reader.result;

//                 // Stores the file in cache
//                 caches.open(CACHE_NAME).then((cache) => {
//                     const response = new Response(imageDataUrl, {
//                         headers: { "Content-Type": file.type },
//                     });
//                     cache.put("/cached-file", response);
//                 });

//                 // Redirects to the preview page
//                 resolve(Response.redirect("/show.html", 303));
//             };
//         });
//     }

//     return Response.redirect("/error.html", 303);
// }

const CACHE_NAME = "pwa-file-cache-v1";

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

    if (
        file &&
        (file.type.startsWith("image/") || file.type.startsWith("video/"))
    ) {
        const fileUrl = URL.createObjectURL(file);

        // Salvar a URL do arquivo e o tipo no Cache API
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(
            JSON.stringify({ fileUrl, fileType: file.type }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );
        await cache.put("/cached-file", response);

        // Redireciona para a página de preview
        return Response.redirect("/show.html", 303);
    }

    return new Response("Invalid file type", { status: 400 });
}

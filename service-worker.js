self.addEventListener("install", (event) => {
    console.log("👷", "install", event);
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("👷", "activate", event);
    return self.clients.claim();
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
self.addEventListener("fetch", (event) => {
    if (event.request.method === "POST") {
        console.log("possstt");
        event.respondWith(
            (async () => {
                const formData = await event.request.formData();
                const file = formData.get("file");
                const imageUrl = URL.createObjectURL(file);

                if (file) {
                    // Envia o arquivo de imagem para a página
                    self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            if (client.url.endsWith("target.html")) {
                                client.postMessage({
                                    type: "file",
                                    file: {
                                        name: file.name,
                                        type: file.type,
                                        blob: file,
                                    },
                                });
                            }
                        });
                    });
                }

                // Redireciona para a página target.html
                // return Response.redirect("/target.html", 303); // 303: See Other
                return Response.redirect(
                    `/target.html?imageUrl=${encodeURIComponent(imageUrl)}`,
                    303
                );
            })()
        );
    }
});

self.addEventListener("install", (event) => {
    console.log("👷", "install", event);
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("👷", "activate", event);
    return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
    console.log("👷", "fetch", event);
    const url = new URL(event.request.url);
    // If this is an incoming POST request for the
    // registered "action" URL, respond to it.
    if (event.request.method === "POST" && url.pathname === "/target.html") {
        event.respondWith(
            (async () => {
                const formData = await event.request.formData();
                const file = formData.get("file");
                const filename = file.name.replaceAll(" ", "_");
                // const link = formData.get("link") || "";
                const responseUrl = "/target.html?filename=" + filename;
                return Response.redirect(responseUrl, 303);
            })()
        );
    }
});

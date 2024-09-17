// export default async (req, context) => {
//     const fs = require("fs");
//     fs.writeFileSync(
//         "./js/config.js",
//         `
//         window.API_KEY="${process.env.CLIENT_ID}";\n
//         window.API_KEY="${process.env.API_KEY}";\n
//     `
//     );

//     return {
//         statusCode: 200,
//         body: JSON.stringify({
//             data,
//         }),
//     };
// };

export default async (req, context) => {
    const keys = {
        client: Netlify.env.get("CLIENT_ID"),
        api: Netlify.env.get("API_KEY"),
    };

    return new Response(keys);
};

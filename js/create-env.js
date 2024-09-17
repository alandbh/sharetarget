const fs = require("fs");
fs.writeFileSync(
    "./js/config.js",
    `
    window.API_KEY="${process.env.CLIENT_ID}";\n
    window.API_KEY="${process.env.API_KEY}";\n
`
);

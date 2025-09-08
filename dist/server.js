"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
async function start() {
    await (0, database_1.connectDatabase)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.config.port, () => {
        console.log(`Server started on port ${env_1.config.port}`);
    });
}
start().catch((err) => {
    console.error('Fatal error starting server', err);
    process.exit(1);
});

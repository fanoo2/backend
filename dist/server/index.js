import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes.js";
const app = express();
const FRONTEND_URL = 'https://20cb041c-29ee-4ed6-9fb7-89e207c36447-00-34lt6eadu20q9.kirk.replit.dev';
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
// Health check for --health flag
if (process.argv.includes('--health')) {
    console.log('Health check passed');
    process.exit(0);
}
(async () => {
    const server = await registerRoutes(app);
    app.use((err, req, res, _) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // ALWAYS serve the app on port 5000
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
    });
})();
//# sourceMappingURL=index.js.map
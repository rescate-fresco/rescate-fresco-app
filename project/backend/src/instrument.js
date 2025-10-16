import "dotenv/config";
import * as Sentry from "@sentry/node";

Sentry.init({
    dsn: "https://f85855341577c7210031ca671b56b78e@o4510195937771520.ingest.us.sentry.io/4510195954024448",
    integrations: [
        Sentry.expressIntegration(), // IMPORTANTE: esto debe estar
    ],
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
});
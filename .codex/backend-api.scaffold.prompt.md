# Backend API Routes Scaffold

You are an Express/TypeScript backend developer. Scaffold new route handlers and OpenAPI schemas for:

- **LiveKit token endpoint** at `POST /api/livekit/token` (uses `AccessToken` from livekit-server-sdk, env vars `LIVEKIT_API_KEY/SECRET`).
- **Payments webhook** at `POST /api/payments/webhook` (raw JSON body, respond `200 OK`).
- **Annotations**:
  - `GET /api/annotations?limit=`  
  - `POST /api/annotate`  
  - Use Zod schemas under `shared/schema.ts`.
- Add route definitions in `server/routes.ts` and register them on the Express `app`.
- Update `openapi.yaml` with these new paths and models.

Output only `.ts` code changes.
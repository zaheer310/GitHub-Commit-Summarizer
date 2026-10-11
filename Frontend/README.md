# Commitly frontend

The frontend is served by the Express backend, so its requests to `/summarisecommit` use the same origin and do not need separate CORS configuration.

1. Configure `GEMINI_API_KEY` in `Backend/.env`.
2. From the `Backend` directory, run `node server.js`.
3. Open [http://localhost:8080](http://localhost:8080).
4. Paste a public GitHub repository URL and choose **Summarise commits**.

The page displays the commit summaries returned by the backend. Gemini API quota or availability errors appear above the results.

import express from "express";
import { fileURLToPath } from "node:url";
import { main } from "./index.js";

const app = express();

app.use(express.json());
app.use(express.static(fileURLToPath(new URL("../Frontend/", import.meta.url))));

app.post("/summarisecommit", async (req, res) => {
  const githubURL = req.body?.githubURL ?? req.query.githubURL;
  if (typeof githubURL !== "string" || githubURL.trim() === "") {
    return res.status(400).json({
      error: "githubURL is required in the JSON body.",
    });
  }

  console.log("github url from client:: ", githubURL);

  try {
    const data = await main(githubURL);

    return res.json({
      msg: "Get request recieved",
      data,
    });
  } catch (error) {
    console.error("Failed to summarise commits:", error);
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message = status === 404
      ? "Repository not found or is not accessible."
      : status === 400
        ? error.message
      : status === 429
        ? "Gemini API quota exceeded. Wait a bit or check your API plan and limits."
        : status === 503
          ? "An upstream service is temporarily unavailable. Please try again later."
          : "Failed to summarise commits.";

    return res.status(status).json({
      error: message,
    });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});

// https://github.com/ZayeemMohd/Batch-5-AI
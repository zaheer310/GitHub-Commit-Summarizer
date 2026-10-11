import { getRepositoryCoordinates } from "./getCommit.js";

export async function generateDiff(githubURL, commitHash) {
  const { owner, repo } = getRepositoryCoordinates(githubURL);
  const response = await fetch(
    `https://github.com/${owner}/${repo}/commit/${commitHash}.diff`
  );

  if (!response.ok) {
    const error = new Error(`Failed to fetch commit diff: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.text();
}
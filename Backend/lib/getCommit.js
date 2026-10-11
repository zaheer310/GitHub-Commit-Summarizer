import { Octokit } from "octokit";

const octokit = new Octokit();

function invalidGithubURL(message) {
  const error = new TypeError(message);
  error.status = 400;
  return error;
}

export function getRepositoryCoordinates(githubURL) {
  let repositoryURL;
  try {
    repositoryURL = new URL(githubURL);
  } catch {
    throw invalidGithubURL("githubURL must be a valid GitHub repository URL.");
  }

  if (
    repositoryURL.protocol !== "https:" ||
    repositoryURL.hostname.toLowerCase() !== "github.com" ||
    repositoryURL.username ||
    repositoryURL.password ||
    repositoryURL.port
  ) {
    throw invalidGithubURL("githubURL must be an HTTPS URL pointing to github.com.");
  }

  const pathParts = repositoryURL.pathname.split("/").filter(Boolean);
  if (pathParts.length !== 2) {
    throw invalidGithubURL("githubURL must include an owner and repository name.");
  }

  const [owner, repositoryPath] = pathParts;
  const repo = repositoryPath.replace(/\.git$/i, "");
  if (!owner || !repo) {
    throw invalidGithubURL("githubURL must include an owner and repository name.");
  }

  return { owner, repo };
}

export async function getCommits(githubURL) {
  const { owner, repo } = getRepositoryCoordinates(githubURL);

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  // console.log(data)
  return data;
}


// getCommits( 'https://github.com/ZayeemMohd/Batch-5-AI')
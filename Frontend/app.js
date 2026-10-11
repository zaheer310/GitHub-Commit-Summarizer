const form = document.querySelector("#repository-form");
const urlInput = document.querySelector("#github-url");
const submitButton = document.querySelector("#submit-button");
const buttonLabel = document.querySelector(".button-label");
const requestStatus = document.querySelector("#request-status");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");
const resultsSection = document.querySelector("#results-section");
const resultCount = document.querySelector("#result-count");
const commitList = document.querySelector("#commit-list");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  resultsSection.hidden = true;
  commitList.replaceChildren();
  setLoading(true);

  try {
    const response = await fetch("/summarisecommit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ githubURL: urlInput.value.trim() }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error || `Request failed with status ${response.status}.`);
    }
    if (!Array.isArray(payload?.data)) {
      throw new Error("The server returned an unexpected response. Please try again.");
    }

    renderCommits(payload.data, urlInput.value.trim());
  } catch (error) {
    showError(
      error instanceof TypeError
        ? "Could not connect to the backend. Make sure it is running at http://localhost:8080."
        : error.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  urlInput.readOnly = isLoading;
  buttonLabel.textContent = isLoading ? "Summarising commits..." : "Summarise commits";
  requestStatus.hidden = !isLoading;
  statusMessage.textContent = "Fetching commits and generating AI summaries. This may take a little while.";
}

function clearError() {
  errorMessage.hidden = true;
  errorMessage.textContent = "";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function renderCommits(commits, repositoryURL) {
  resultCount.textContent = `${commits.length} ${commits.length === 1 ? "COMMIT" : "COMMITS"}`;
  const repositoryBase = getRepositoryBase(repositoryURL);

  for (const commit of commits) {
    commitList.append(createCommitCard(commit, repositoryBase));
  }

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getRepositoryBase(value) {
  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/+$/, "").replace(/\.git$/i, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function createCommitCard(commit, repositoryBase) {
  const card = document.createElement("article");
  card.className = "commit-card";

  const meta = document.createElement("div");
  meta.className = "commit-meta";

  const author = document.createElement("div");
  author.className = "commit-author";
  if (commit.commitAuthorImg) {
    const avatar = document.createElement("img");
    avatar.className = "author-avatar";
    avatar.src = commit.commitAuthorImg;
    avatar.alt = "";
    avatar.loading = "lazy";
    avatar.addEventListener("error", () => avatar.remove(), { once: true });
    author.append(avatar);
  }

  const authorName = document.createElement("span");
  authorName.textContent = commit.commitAuthorName || "Unknown author";
  author.append(authorName);

  const date = document.createElement("time");
  date.className = "commit-date";
  date.dateTime = commit.commitDate || "";
  date.textContent = formatDate(commit.commitDate);
  meta.append(author, date);

  const title = document.createElement("h3");
  title.className = "commit-title";
  title.textContent = commit.commitMessage || "Untitled commit";

  const summary = document.createElement("p");
  summary.className = "commit-summary";
  summary.textContent = commit.summary || "No summary was returned for this commit.";

  card.append(meta, title, summary);

  if (repositoryBase && commit.commitHash) {
    const commitLink = document.createElement("a");
    commitLink.className = "commit-link";
    commitLink.href = `${repositoryBase}/commit/${encodeURIComponent(commit.commitHash)}`;
    commitLink.target = "_blank";
    commitLink.rel = "noopener noreferrer";
    commitLink.append(
      document.createTextNode(`VIEW COMMIT ${commit.commitHash.slice(0, 7)}`),
      createExternalLinkIcon()
    );
    card.append(commitLink);
  }

  return card;
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function createExternalLinkIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("fill", "none");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10M8 2h6v6m-.5-5.5L7 9");
  icon.append(path);
  return icon;
}

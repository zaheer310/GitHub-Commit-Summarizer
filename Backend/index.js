import { generateDiff } from "./lib/generateDiff.js";
import { getAISummary } from "./lib/getAISummary.js";
import { getCommits } from "./lib/getCommit.js";
// ./lib/getCommits.js
export async function main(githubURL) {
  const commitsArray = await getCommits(githubURL);
  console.log("commits array fetched", commitsArray.length);

  const diffArrayPromise = commitsArray.map(async (commitObj) => {
    const diff = await generateDiff(githubURL, commitObj.sha);
    return diff;
  });

  const diffArray = await Promise.all(diffArrayPromise);
  console.log("diff array generated", diffArray.length);

  const summaryArrayPromise = diffArray.map(async (diffObj, index) => {
    console.log("generating summary: ", index);
    const summary = await getAISummary(diffObj);
    return summary;
  });

  const summaryArray = await Promise.all(summaryArrayPromise);
  console.log("summary array generated", summaryArray.length);

  const finalDataArray = summaryArray.map((summaryText, index) => {
    return {
      summary: summaryText,
      commitHash: commitsArray[index]?.sha,
      commitMessage: commitsArray[index]?.commit?.message,
      commitAuthorName:
        commitsArray[index]?.commit?.author?.name ||
        commitsArray[index]?.author?.login ||
        "Unknown author",
      commitAuthorImg: commitsArray[index]?.author?.avatar_url,
      commitDate: commitsArray[index]?.commit?.author?.date,
    };
  });

  //   console.log(finalDataArray, finalDataArray.length)
  return finalDataArray;
}

// main("https://github.com/ZayeemMohd/small-test");
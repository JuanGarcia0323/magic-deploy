import "dotenv/config";
import { Octokit } from "@octokit/core";
import {
  existsSync,
  copySync,
  mkdir,
  rmSync,
  writeFileSync,
  readFileSync,
} from "fs-extra";
import { execSync } from "node:child_process";
import { GetRepo, DataRepo } from "./interfaces";
import Zip from "adm-zip";

const token: string = process.env.GIT_TOKEN;
const owner: string = process.env.OWNER_NAME;
const repo: string = process.env.REPO_NAME;
const projectDirectory: string = process.env.PROJECT_DIRECTORY;
const repoLink: string = process.env.REPO_LINK;
const uiFolder: string = process.env.UI_FOLDER;
const backendFolder: string = process.env.BACKEND_FOLDER;
const deployUiFolder: string = process.env.DEPLOY_UI_FOLDER;
const deployBackendFolder: string = process.env.DEPLOY_BACKEND_FOLDER;
const octokit = new Octokit({
  auth: token,
});

const getRepo: GetRepo = async (owner: string, repo: string) => {
  try {
    const result = await octokit.request(`GET /repos/{owner}/{repo}/commits`, {
      owner,
      repo,
      per_page: 1,
    });
    return result.data[0];
  } catch {
    return {};
  }
};

const installNodePackage = (folder: string): void => {
  execSync(`npm install`, {
    timeout: 300000,
    cwd: folder,
  });
  execSync(`npm run build`, {
    timeout: 300000,
    cwd: folder,
  });
};

const zipElements = (type: string = "", deployFolder: string): void => {
  const creationDate: Date = new Date();
  const backUpFolder: string[] = deployFolder.split("\\");
  backUpFolder.pop();
  const fileName: string = `${creationDate
    .toDateString()
    .split(" ")
    .join("_")}_${type}.zip`;

  const zip = new Zip();
};

const deploy = (
  folderRepository: string,
  buildFolder: string,
  deployFolder: string
): void => {
  installNodePackage(folderRepository);
  rmSync(deployFolder, { recursive: true, force: true });
  copySync(buildFolder, deployFolder);
};

getRepo(owner, repo).then((d: DataRepo) => {
  const dateCommit: string = d.commit.author.date;
  const resultUi: string = `${projectDirectory}\\${repo}\\Solution Code\\${uiFolder}`;
  const resultBackend: string = `${projectDirectory}\\${repo}\\Solution Code\\${backendFolder}`;
  const buildUi: string = `${resultUi}\\build`;
  const distBackend: string = `${resultBackend}\\dist`;

  // Folder validation
  const pathValidation: boolean = existsSync(`${projectDirectory}\\${repo}`);
  const deployUiValidation: boolean = existsSync(deployUiFolder);
  const deployBackendValidation: boolean = existsSync(deployBackendFolder);
  const lastDateValidation: boolean = existsSync("./lastDate.txt");

  if (!lastDateValidation) writeFileSync("./lastDate.txt", dateCommit);

  const lastDate: Date = new Date(readFileSync("./lastDate.txt", "utf-8"));
  const dateCommitForComparasion: Date = new Date(dateCommit);

  if (lastDate >= dateCommitForComparasion) {
    return;
  }

  writeFileSync("./lastDate.txt", dateCommit);

  if (!deployUiValidation) {
    mkdir(deployUiFolder);
  }
  if (!deployBackendValidation) {
    mkdir(deployBackendFolder);
  }

  if (!pathValidation) {
    execSync(`git clone ${repoLink}`, {
      timeout: 300000,
      cwd: projectDirectory,
    });
    deploy(resultUi, buildUi, deployUiFolder);
    deploy(resultBackend, distBackend, deployBackendFolder);
    return;
  }
  deploy(resultUi, buildUi, deployUiFolder);
  deploy(resultBackend, distBackend, deployBackendFolder);
});

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
require("dotenv/config");
var core_1 = require("@octokit/core");
var fs_extra_1 = require("fs-extra");
var node_child_process_1 = require("node:child_process");
var adm_zip_1 = __importDefault(require("adm-zip"));
var token = process.env.GIT_TOKEN;
var owner = process.env.OWNER_NAME;
var repo = process.env.REPO_NAME;
var projectDirectory = process.env.PROJECT_DIRECTORY;
var repoLink = process.env.REPO_LINK;
var uiFolder = process.env.UI_FOLDER;
var backendFolder = process.env.BACKEND_FOLDER;
var deployUiFolder = process.env.DEPLOY_UI_FOLDER;
var deployBackendFolder = process.env.DEPLOY_BACKEND_FOLDER;
var octokit = new core_1.Octokit({
    auth: token
});
var getRepo = function (owner, repo) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, octokit.request("GET /repos/{owner}/{repo}/commits", {
                        owner: owner,
                        repo: repo,
                        per_page: 1
                    })];
            case 1:
                result = _b.sent();
                return [2 /*return*/, result.data[0]];
            case 2:
                _a = _b.sent();
                return [2 /*return*/, {}];
            case 3: return [2 /*return*/];
        }
    });
}); };
// add commands shell: copy repository if this not exist, clone in other case
// add some kind of while true and save the last commit
var installNodePackage = function (folder) {
    (0, node_child_process_1.execSync)("npm install", {
        timeout: 300000,
        cwd: folder
    });
    (0, node_child_process_1.execSync)("npm run build", {
        timeout: 300000,
        cwd: folder
    });
};
var zipElements = function (type, deployFolder) {
    if (type === void 0) { type = ""; }
    var creationDate = new Date();
    var backUpFolder = deployFolder.split("\\");
    backUpFolder.pop();
    var fileName = "".concat(creationDate
        .toDateString()
        .split(" ")
        .join("_"), "_").concat(type, ".zip");
    var zip = new adm_zip_1["default"]();
};
var deploy = function (folderRepository, buildFolder, deployFolder) {
    installNodePackage(folderRepository);
    (0, fs_extra_1.rmSync)(deployFolder, { recursive: true, force: true });
    (0, fs_extra_1.copySync)(buildFolder, deployFolder);
};
getRepo(owner, repo).then(function (d) {
    var dateCommit = d.commit.author.date;
    var resultUi = "".concat(projectDirectory, "\\").concat(repo, "\\Solution Code\\").concat(uiFolder);
    var resultBackend = "".concat(projectDirectory, "\\").concat(repo, "\\Solution Code\\").concat(backendFolder);
    var buildUi = "".concat(resultUi, "\\build");
    var distBackend = "".concat(resultBackend, "\\dist");
    // Folder validation
    var pathValidation = (0, fs_extra_1.existsSync)("".concat(projectDirectory, "\\").concat(repo));
    var deployUiValidation = (0, fs_extra_1.existsSync)(deployUiFolder);
    var deployBackendValidation = (0, fs_extra_1.existsSync)(deployBackendFolder);
    var lastDateValidation = (0, fs_extra_1.existsSync)("./lastDate.txt");
    if (!lastDateValidation)
        (0, fs_extra_1.writeFileSync)("./lastDate.txt", dateCommit);
    var lastDate = new Date((0, fs_extra_1.readFileSync)("./lastDate.txt", "utf-8"));
    var dateCommitForComparasion = new Date(dateCommit);
    console.log("lastDate:", lastDate);
    console.log("dateCommitForComparasion:", dateCommitForComparasion);
    if (lastDate >= dateCommitForComparasion) {
        console.log("lastDate bigger");
        return;
    }
    (0, fs_extra_1.writeFileSync)("./lastDate.txt", dateCommit);
    console.log("lastDate smaller");
    if (!deployUiValidation) {
        (0, fs_extra_1.mkdir)(deployUiFolder);
    }
    if (!deployBackendValidation) {
        (0, fs_extra_1.mkdir)(deployBackendFolder);
    }
    if (!pathValidation) {
        // The folder that contains the project haven't be found
        (0, node_child_process_1.execSync)("git clone ".concat(repoLink), {
            timeout: 300000,
            cwd: projectDirectory
        });
        deploy(resultUi, buildUi, deployUiFolder);
        deploy(resultBackend, distBackend, deployBackendFolder);
        return;
    }
    deploy(resultUi, buildUi, deployUiFolder);
    deploy(resultBackend, distBackend, deployBackendFolder);
});

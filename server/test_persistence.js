import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.resolve(__dirname, "test-data");
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

process.env.PERSISTENT_STORAGE_DIR = TEST_DIR;

// Mocking the behavior of api/poll.ts logic
function voteFile(group) {
    const baseDir = process.env.PERSISTENT_STORAGE_DIR || "/tmp";
    return `${baseDir}/votes-group${group}.json`;
}

function saveVotes(votes, group) {
    const file = voteFile(group);
    fs.writeFileSync(file, JSON.stringify(votes, null, 2));
}

function loadVotes(group) {
    const file = voteFile(group);
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
    return {};
}

console.log("--- Testing Persistence Fix ---");

const testVotes = { "Company A": 5, "Company B": 10 };
saveVotes(testVotes, 1);
console.log("Saved votes for group 1.");

const loadedVotes = loadVotes(1);
console.log("Loaded votes:", loadedVotes);

if (loadedVotes["Company A"] === 5 && loadedVotes["Company B"] === 10) {
    console.log("✅ Persistence test passed!");
} else {
    console.log("❌ Persistence test failed!");
    process.exit(1);
}

// Cleanup
fs.unlinkSync(voteFile(1));
fs.rmdirSync(TEST_DIR);
console.log("Cleanup complete.");

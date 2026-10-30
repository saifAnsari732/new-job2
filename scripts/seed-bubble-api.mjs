#!/usr/bin/env node
/**
 * BookLeaf Automated Bubble.io Data API Seeder
 * Automatically populates all 10 Authors and 18 Books into your Bubble database via the Bubble Data API.
 *
 * Usage:
 *   node scripts/seed-bubble-api.mjs --url "https://your-app.bubbleapps.io/version-test/api/1.1/obj" --token "YOUR_BUBBLE_API_TOKEN"
 */

import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
let baseUrl = process.env.BUBBLE_API_BASE_URL || "";
let apiToken = process.env.BUBBLE_API_TOKEN || "";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url" && args[i + 1]) baseUrl = args[++i];
  if (args[i] === "--token" && args[i + 1]) apiToken = args[++i];
}

if (!baseUrl || !apiToken) {
  console.log(`
================================================================================
BookLeaf Bubble.io Automated Data Seeder
================================================================================
To automatically upload all 10 Authors and 18 Books to your Bubble app:
1. In Bubble Editor, go to Settings -> API
2. Check "Enable Data API" and check "author", "book", and "notification_log"
3. Click "Generate a new API token" and copy the Private Key + Data API root URL.
4. Run:
   node scripts/seed-bubble-api.mjs --url "https://YOUR-APP.bubbleapps.io/version-test/api/1.1/obj" --token "YOUR_TOKEN"
================================================================================
`);
  process.exit(0);
}

baseUrl = baseUrl.replace(/\/$/, "");
const dataPath = path.resolve("h:\\Desktop\\new2\\data\\bookleaf_enriched_bubble_data.json");
const { authors, books } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

async function createRecord(typeName, payload) {
  const res = await fetch(`${baseUrl}/${typeName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bubble API Error (${typeName} - ${res.status}): ${text}`);
  }
  return JSON.parse(text);
}

async function run() {
  console.log(`Seeding ${authors.length} authors to ${baseUrl}/author ...`);
  for (const author of authors) {
    const res = await createRecord("author", author);
    console.log(`  [+] Created Author ${author.author_id} (${author.name}) -> Bubble ID: ${res.id}`);
  }

  console.log(`\nSeeding ${books.length} books to ${baseUrl}/book ...`);
  for (const book of books) {
    const { available_on_list, ...cleanBook } = book;
    const res = await createRecord("book", cleanBook);
    console.log(`  [+] Created Book ${book.book_id} ("${book.title}") -> Bubble ID: ${res.id}`);
  }

  console.log("\nAll 10 Authors and 18 Books seeded into Bubble successfully!");
}

run().catch((err) => {
  console.error("Failed to seed Bubble database:", err.message);
  process.exit(1);
});

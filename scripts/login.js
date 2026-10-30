#!/usr/bin/env node
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

function getBrowserPath() {
    const paths = [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return "/usr/bin/chromium";
}

const CHROME_PATH = getBrowserPath();
const PROFILE_DIR = path.join(process.cwd(), "gemini_profile");

if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
}

console.log("==================================================");
console.log(" Membuka Browser Login Lokal untuk Gemini Argon...");
console.log("==================================================");

const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    userDataDir: PROFILE_DIR,
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-first-run']
});

const pages = await browser.pages();
const page = pages.length > 0 ? pages[0] : await browser.newPage();

await page.goto("https://gemini.google.com/", { waitUntil: 'networkidle2' });

console.log("\nPetunjuk:");
console.log("1. Silakan login ke akun Google Anda.");
console.log("2. Pilih model 'Argon' di web Gemini.");
console.log("3. Setelah selesai, tutup jendela browser.");
console.log("   (Sesi Anda akan tersimpan otomatis untuk server MCP)\n");

import puppeteer from "puppeteer-core";
import path from "path";

const PROFILE_DIR = path.join(process.cwd(), "gemini_profile");

async function run() {
    console.log("Membuka Chromium via Xvfb...");
    const browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        userDataDir: PROFILE_DIR,
        headless: false,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage"
        ]
    });
    const page = await browser.newPage();
    await page.goto("https://gemini.google.com/app", { waitUntil: "networkidle2" });
    console.log("Page URL:", page.url());
    console.log("Page Title:", await page.title());
    await page.screenshot({ path: "/root/gemini_fetch_test.png" });
    await browser.close();
}
run().catch(console.error);

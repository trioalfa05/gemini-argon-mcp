#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

// Baca file .env manual tanpa dependensi tambahan
function loadEnv() {
    const envPath = path.join(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            let val = trimmed.substring(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    }
}
loadEnv();

// Deteksi path browser di sistem
function getBrowserPath() {
    const paths = [
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return "/usr/bin/chromium";
}

const CHROME_PATH = getBrowserPath();
const PROFILE_DIR = path.join(process.cwd(), "gemini_profile");

let browser = null;
let page = null;

async function getBrowserPage() {
    if (page && browser) {
        try {
            await page.evaluate(() => 1);
            return page;
        } catch (e) {
            browser = null;
            page = null;
        }
    }

    if (!fs.existsSync(PROFILE_DIR)) {
        fs.mkdirSync(PROFILE_DIR, { recursive: true });
    }

    browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        userDataDir: PROFILE_DIR,
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--password-store=basic'
        ]
    });

    const pages = await browser.pages();
    page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Suntikkan Cookie jika diset di .env
    const psid = process.env.GEMINI_SECURE_1PSID;
    const psidts = process.env.GEMINI_SECURE_1PSIDTS;

    if (psid && psidts && psid !== "paste_nilai___Secure-1PSID_disini") {
        const cookies = [
            {
                name: "__Secure-1PSID",
                value: psid,
                domain: ".google.com",
                path: "/",
                secure: true,
                httpOnly: true
            },
            {
                name: "__Secure-1PSIDTS",
                value: psidts,
                domain: ".google.com",
                path: "/",
                secure: true,
                httpOnly: true
            }
        ];
        await page.setCookie(...cookies);
    }
    
    await page.goto("https://gemini.google.com/app", { waitUntil: 'networkidle2' });
    return page;
}

const server = new Server(
    { name: "gemini-argon-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "ask_gemini_argon",
                description: "Mengirim prompt ke Gemini Web (Model Argon eksklusif browser) dan mengembalikan respons analisisnya.",
                inputSchema: {
                    type: "object",
                    properties: {
                        prompt: { type: "string", description: "Pertanyaan, instruksi, atau kode yang ingin dianalisis oleh Gemini Argon" }
                    },
                    required: ["prompt"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "ask_gemini_argon") {
        const promptText = args.prompt;
        try {
            const p = await getBrowserPage();
            
            // Cek apakah halaman meminta login
            const isLoggedOut = await p.evaluate(() => {
                const text = document.body.innerText || "";
                return text.includes("Sign in") || window.location.href.includes("accounts.google.com");
            });

            if (isLoggedOut) {
                return {
                    content: [{ type: "text", text: "❌ Cookie sesi Google belum diatur atau sudah kedaluwarsa. Silakan masukkan cookie terbaru di file `.env` (GEMINI_SECURE_1PSID & GEMINI_SECURE_1PSIDTS)." }],
                    isError: true
                };
            }

            // Pastikan model yang terpilih adalah Argon jika tersedia
            try {
                await p.evaluate(() => {
                    const picker = document.querySelector('button[aria-label*="mode picker"], button[aria-label*="pilih model"]');
                    if (picker && !picker.innerText.includes("Argon")) {
                        picker.click();
                        setTimeout(() => {
                            const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="option"]'));
                            const argon = items.find(el => el.innerText.includes("Argon"));
                            if (argon) argon.click();
                        }, 500);
                    }
                });
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                // Ignore jika mode picker tidak terbuka
            }

            // Ketik prompt
            await p.waitForSelector('div[contenteditable="true"]', { timeout: 15000 });
            await p.click('div[contenteditable="true"]');
            
            // Masukkan teks prompt
            await p.type('div[contenteditable="true"]', promptText);
            await new Promise(r => setTimeout(r, 500));
            await p.keyboard.press("Enter");
            
            // Tunggu respons selesai
            console.error("Menunggu respons Gemini...");
            await new Promise(r => setTimeout(r, 10000));
            
            const responseText = await p.evaluate(() => {
                const responses = document.querySelectorAll('message-content, .model-response-text, model-response');
                if (responses.length === 0) return "Tidak ditemukan elemen respons.";
                const last = responses[responses.length - 1];
                return last.innerText || last.textContent;
            });
            
            return {
                content: [{ type: "text", text: responseText }]
            };
        } catch (err) {
            return {
                content: [{ type: "text", text: `Gagal mengeksekusi Gemini Argon: ${err.message}` }],
                isError: true
            };
        }
    }
    throw new Error(`Tool tidak dikenal: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Gemini Argon MCP Server aktif.");

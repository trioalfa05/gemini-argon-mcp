#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import puppeteer from "puppeteer-core";
import path from "path";
import fs from "fs";

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
    return "/usr/bin/chromium"; // Fallback default
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
        headless: true, // Berjalan headless di background setelah login selesai
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
    
    await page.goto("https://gemini.google.com/", { waitUntil: 'networkidle2' });
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
            
            // Cek apakah halaman redirect ke login Google
            if (p.url().includes("accounts.google.com")) {
                return {
                    content: [{ type: "text", text: "❌ Sesi login Google kedaluwarsa atau belum ada. Silakan jalankan `npm run login:vps` (di VPS) atau `npm run login` (di lokal) untuk login ulang." }],
                    isError: true
                };
            }

            await p.waitForSelector('rich-textarea p, div[contenteditable="true"]', { timeout: 10000 });
            await p.click('div[contenteditable="true"]');
            
            await p.evaluate((text) => {
                const el = document.querySelector('div[contenteditable="true"]');
                if (el) {
                    el.focus();
                    document.execCommand('selectAll', false, null);
                    document.execCommand('insertText', false, text);
                }
            }, promptText);
            
            await new Promise(r => setTimeout(r, 1000));
            await p.evaluate(() => {
                const sendBtn = document.querySelector('button[aria-label*="Kirim"], button.send-button, button[mat-fab]');
                if (sendBtn) sendBtn.click();
            });
            
            // Tunggu respons selesai
            console.error("Menunggu respons Gemini Argon...");
            await new Promise(r => setTimeout(r, 15000));
            
            const responseText = await p.evaluate(() => {
                const responses = document.querySelectorAll('message-content, .model-response-text, .response-container');
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

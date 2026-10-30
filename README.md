# Gemini Argon MCP Server 🚀

Model Context Protocol (MCP) Server mandiri untuk menjembatani **Google Gemini Web UI** (khususnya model eksklusif browser seperti **Gemini Argon**) ke berbagai AI Client/Agent (seperti **Hermes Agent**, **Claude Desktop**, atau **Cursor**).

Dirancang khusus agar berjalan **100% mandiri di Server VPS Linux CLI** tanpa kerumitan instalasi layar virtual (noVNC/Xvfb). Cukup masukkan cookie akun Anda sekali saja!

---

## 🌟 Keunggulan Versi Baru (Zero-VNC Architecture)

- **Tanpa Layar Virtual / VNC**: Tidak perlu install `xvfb`, `x11vnc`, `novnc`, atau buka-buka port VNC.
- **Ringan & Hemat Resource**: Berjalan murni headless di background Linux.
- **Anti-Logout**: Menggunakan session cookie resmi dari browser laptop/HP Anda.
- **Zero Cost / API Token**: Memanfaatkan kuota model web Google Gemini Anda secara penuh.

---

## 📋 Persyaratan Sistem

- **Node.js**: v18 atau lebih baru.
- **Chromium / Google Chrome**: Terinstal di sistem (`apt install chromium` di Debian/Ubuntu).

---

## 🚀 Panduan Setup Instan (Hanya 3 Langkah)

### 1. Clone & Install Dependensi

```bash
git clone https://github.com/trioalfa05/gemini-argon-mcp.git
cd gemini-argon-mcp
npm install
```

---

### 2. Konfigurasi Cookie Google (`.env`)

Salin template file `.env`:
```bash
cp .env.example .env
nano .env
```

**Cara mengambil 2 nilai cookie dari browser laptop Anda:**
1. Buka browser (Chrome/Edge/Brave) yang sudah login ke **https://gemini.google.com**.
2. Tekan **F12** (atau klik kanan -> *Inspect* / Periksa).
3. Pilih tab **Application** (atau **Storage** di Firefox) -> di kolom kiri klik **Cookies** -> `https://gemini.google.com`.
4. Salin nilai (*Value*) dari 2 cookie ini:
   - `__Secure-1PSID`
   - `__Secure-1PSIDTS`
5. Masukkan ke file `.env`:
   ```env
   GEMINI_SECURE_1PSID="paste_nilai___Secure-1PSID_disini"
   GEMINI_SECURE_1PSIDTS="paste_nilai___Secure-1PSIDTS_disini"
   ```
6. Simpan dengan menekan **Ctrl + O**, Enter, lalu keluar dengan **Ctrl + X**.

---

### 3. Sambungkan ke Hermes Agent

Daftarkan server MCP ke Hermes langsung dari dalam folder proyek:
```bash
hermes mcp add gemini-argon --command node --args $(pwd)/index.js
```
*(Saat muncul konfirmasi `Enable all 1 tools? [Y/n]`, tekan **Y** lalu Enter)*.

---

## 🛠️ Cara Penggunaan di Chat AI

Setelah terdaftar, Anda bisa langsung berbicara santai di chat:
* *"Tolong analisis arsitektur microservice ini menggunakan model Gemini Argon."*
* *"Tanyakan ke Argon bagaimana cara optimasi performa query database ini."*

AI Agent akan otomatis memanggil tool `ask_gemini_argon` di background dan mengembalikan jawabannya secara rapi!

---

## 📄 Lisensi
MIT License. Bebas digunakan dan dibagikan.

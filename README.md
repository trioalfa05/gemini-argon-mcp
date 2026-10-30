# Gemini Argon MCP Server 🚀

Model Context Protocol (MCP) Server mandiri untuk menjembatani **Google Gemini Web UI** (khususnya model eksklusif browser seperti **Gemini Argon**) ke berbagai AI Client/Agent (seperti **Hermes Agent**, **Claude Desktop**, atau **Cursor**).

Dirancang khusus agar dapat berjalan **100% di Server VPS Headless (Murni Terminal)** tanpa memerlukan desktop fisik atau menjaga laptop tetap terbuka.

---

## 🌟 Fitur Utama

- **Headless VPS Ready**: Berjalan di background server tanpa monitor fisik.
- **Web-Screen 1-Click Login (noVNC)**: Login Google 2FA di VPS cukup buka link di browser HP/Laptop.
- **Persistent Profile**: Sesi Google & pemilihan model Argon tersimpan permanen di folder `gemini_profile/`.
- **Zero Token/API Cost**: Menggunakan kuota akun Gemini web Anda langsung.
- **Multi-Client Support**: Kompatibel dengan semua AI Client yang mendukung MCP protocol.

---

## 📋 Persyaratan Sistem

- **Node.js**: v18 atau lebih baru.
- **Chromium / Google Chrome**: Terinstal di sistem.
- **Linux VPS (Debian/Ubuntu)**: Paket `xvfb`, `x11vnc`, `novnc`, `websockify` (akan otomatis diinstall oleh script jika belum ada).

---

## 🚀 Panduan Instalasi Cepat

### 1. Clone & Install Dependensi

```bash
git clone https://github.com/username/gemini-argon-mcp.git
cd gemini-argon-mcp
npm install
```

---

## 🔑 Langkah Login Akun Google

Pilih metode yang sesuai dengan lingkungan perangkat Anda:

### Opsi A: Jika Berjalan di Server VPS Murni Terminal (Paling Direkomendasikan)
Gunakan fitur **Web-Screen**:
```bash
npm run login:vps
```
1. Script akan otomatis memunculkan URL seperti ini:
   ```text
   👉 http://IP-SERVER-ANDA:6080/vnc.html?autoconnect=true
   ```
2. Buka link tersebut di browser HP atau laptop Anda.
3. Di layar virtual yang muncul:
   - Login ke akun Google Anda (dan selesaikan 2FA).
   - Di dropdown model Gemini, **pilih model Argon**.
4. Setelah selesai, kembali ke terminal server dan tekan `Ctrl + C`.  
   *(Sesi login Anda sudah tersimpan permanen di folder `gemini_profile/`)*.

---

### Opsi B: Jika Berjalan di PC / Laptop Lokal (Windows, Mac, atau Linux GUI)
Cukup jalankan:
```bash
npm run login
```
Jendela browser Chrome akan terbuka otomatis. Login dan pilih model **Argon**, lalu tutup jendela browser.

---

## 🔌 Cara Menghubungkan ke AI Client

### 1. Hermes Agent (CLI)
Daftarkan server MCP ke Hermes dengan perintah:
```bash
hermes mcp add gemini-argon --command node --args /path/ke/gemini-argon-mcp/index.js
```

### 2. Claude Desktop (`claude_desktop_config.json`)
Tambahkan ke konfigurasi Claude Desktop:
```json
{
  "mcpServers": {
    "gemini-argon": {
      "command": "node",
      "args": ["/path/ke/gemini-argon-mcp/index.js"]
    }
  }
}
```

---

## 🛠️ Cara Penggunaan di Chat AI

Setelah terpasang, Anda cukup berbicara santai dengan AI Anda:
* *"Tolong analisis arsitektur microservice ini menggunakan model Gemini Argon."*
* *"Tanyakan ke Argon bagaimana cara optimasi query database ini."*

AI Agent akan otomatis memanggil tool `ask_gemini_argon` di background dan menyajikan hasilnya secara rapi!

---

## 📄 Lisensi
MIT License. Bebas digunakan dan dibagikan.

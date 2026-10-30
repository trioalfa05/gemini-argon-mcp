# Gemini Argon MCP Server 🚀

Model Context Protocol (MCP) Server mandiri untuk menjembatani **Google Gemini Web UI** (termasuk model reasoning eksklusif browser seperti **Gemini Argon**) ke berbagai AI Agent & Client (seperti **Hermes Agent**, **Claude Desktop**, atau **Cursor**).

Dirancang khusus agar berjalan **100% andal di Server VPS Linux CLI** tanpa perlu instalasi display grafis (Xvfb/VNC) yang rumit dan berat. Cukup masukkan cookie akun Google Anda sekali saja!

---

## 🌟 Fitur & Keunggulan

- **Pure Headless (Tanpa VNC/Xvfb)**: Berjalan ringan di latar belakang tanpa memakan RAM server untuk virtual display.
- **Autentikasi Cookie Anti-Logout**: Menggunakan sesi cookie asli dari browser Anda (`__Secure-1PSID` & `__Secure-1PSIDTS`).
- **Kompatibel Penuh dengan Linux Server**: Bekerja mulus di Debian, Ubuntu, CentOS, hingga VPS termurah sekalipun.
- **Zero API Cost**: Mengakses antarmuka resmi Gemini Web secara gratis.

---

## 📋 Persyaratan Sistem

- **Node.js**: v18 atau lebih baru (`node -v`).
- **Chromium / Google Chrome**: Terinstal di sistem:
  ```bash
  # Untuk Debian / Ubuntu:
  apt update && apt install -y chromium
  ```

---

## 🚀 Panduan Setup Cepat (100% Work)

### 1. Clone Repositori & Install Dependensi

```bash
git clone https://github.com/trioalfa05/gemini-argon-mcp.git
cd gemini-argon-mcp
npm install
```

---

### 2. Dapatkan Cookie Google Anda

Buka browser laptop/PC Anda (Chrome/Brave/Edge) yang sudah login ke **https://gemini.google.com**:
1. Tekan tombol **F12** (atau klik kanan di mana saja -> pilih **Inspect / Periksa**).
2. Di baris menu atas DevTools, klik tab **Application** (jika tertutup, klik tanda panah ganda `>>` di sebelah kanan *Network*).
3. Pada panel sebelah kiri, buka menu **Cookies** -> klik **`https://gemini.google.com`**.
4. Cari dan salin nilai (*Value*) dari 2 cookie berikut:
   - **`__Secure-1PSID`**
   - **`__Secure-1PSIDTS`**

---

### 3. Buat File Konfigurasi `.env`

Di terminal server Anda, buat file `.env` dengan perintah satu baris berikut (ganti teks di dalamnya dengan cookie Anda):

```bash
cat << 'EOF' > .env
GEMINI_SECURE_1PSID="paste_nilai___Secure-1PSID_disini"
GEMINI_SECURE_1PSIDTS="paste_nilai___Secure-1PSIDTS_disini"
EOF
```

> **Tips:** Anda juga bisa menggunakan editor teks biasa (`nano .env`) jika lebih menyukainya.

---

### 4. Daftarkan ke Hermes Agent

Jalankan perintah berikut langsung dari dalam folder repositori:

```bash
hermes mcp add gemini-argon --command node --args $(pwd)/index.js
```
*(Saat muncul pertanyaan konfirmasi `Enable all 1 tools? [Y/n]`, tekan **Y** lalu **Enter**)*.

---

## 💬 Cara Memanggil Argon di Chat AI

Setelah terdaftar, Anda bisa langsung berinteraksi di chat Hermes Agent:

```text
User: Tolong tanyakan ke Argon, bagaimana cara optimasi database MariaDB untuk high-traffic?
Hermes: (Memanggil tool ask_gemini_argon di background dan menyajikan jawaban lengkap dari model Argon)
```

---

## 🛠️ Opsi Klien AI Lainnya (Claude Desktop / Cursor)

Jika ingin digunakan di **Claude Desktop**, tambahkan konfigurasi berikut ke file `claude_desktop_config.json`:

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

## 📄 Lisensi
MIT License - Bebas digunakan dan dimodifikasi untuk kebutuhan personal maupun operasional AI Agent.

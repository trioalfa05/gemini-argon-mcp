#!/bin/bash
set -e

# Port configuration
VNC_PORT=5901
NOVNC_PORT=6080
DISPLAY_NUM=":99"
PROFILE_DIR="$(pwd)/gemini_profile"

mkdir -p "$PROFILE_DIR"

cleanup() {
    echo ""
    echo "=================================================="
    echo " Menghentikan Web-Screen & Virtual Display..."
    echo "=================================================="
    kill -9 $CHROME_PID $NOVNC_PID $X11VNC_PID $XVFB_PID 2>/dev/null || true
    echo "✅ Sesi browser tersimpan aman di: $PROFILE_DIR"
    echo "Server MCP sekarang siap dijalankan!"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Pastikan tools terinstal
if ! command -v Xvfb &> /dev/null || ! command -v x11vnc &> /dev/null || ! command -v websockify &> /dev/null; then
    echo "Memeriksa dan melengkapi dependensi..."
    if [ -f /etc/debian_version ]; then
        apt-get update -qq && apt-get install -y -qq xvfb x11vnc novnc websockify chromium >/dev/null 2>&1
    fi
fi

# 2. Deteksi browser binary
BROWSER_BIN=""
for b in "/usr/bin/chromium" "/usr/bin/chromium-browser" "/usr/bin/google-chrome" "/usr/bin/google-chrome-stable"; do
    if [ -x "$b" ]; then
        BROWSER_BIN="$b"
        break
    fi
done

if [ -z "$BROWSER_BIN" ]; then
    echo "❌ Error: Chromium atau Chrome tidak ditemukan di server!"
    exit 1
fi

# 3. Bersihkan sisa proses lama jika ada
killall -9 Xvfb x11vnc websockify 2>/dev/null || true
sleep 1

# 4. Jalankan Xvfb
Xvfb $DISPLAY_NUM -screen 0 1280x800x24 >/dev/null 2>&1 &
XVFB_PID=$!
sleep 1

# 5. Jalankan x11vnc
x11vnc -display $DISPLAY_NUM -forever -shared -nopw -rfbport $VNC_PORT >/dev/null 2>&1 &
X11VNC_PID=$!
sleep 1

# 6. Jalankan websockify / noVNC
NOVNC_WEB="/usr/share/novnc"
websockify --web="$NOVNC_WEB" $NOVNC_PORT localhost:$VNC_PORT >/dev/null 2>&1 &
NOVNC_PID=$!
sleep 1

# 7. Buka browser di display virtual
DISPLAY=$DISPLAY_NUM "$BROWSER_BIN" \
    --user-data-dir="$PROFILE_DIR" \
    --no-sandbox \
    --disable-setuid-sandbox \
    --no-first-run \
    --disable-dev-shm-usage \
    "https://gemini.google.com" >/dev/null 2>&1 &
CHROME_PID=$!

# 8. Deteksi IP (Local, Tailscale, Public)
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || ip addr show tailscale0 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' || echo "")
LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
PUBLIC_IP=$(curl -s --max-time 2 https://api.ipify.org 2>/dev/null || echo "")

# 9. Tampilkan Banner Link Web secara Lengkap
clear
echo "===================================================================="
echo " 🌐 GEMINI ARGON VPS WEB-LOGIN SCREEN BERHASIL AKTIF!"
echo "===================================================================="
echo ""
echo " Silakan buka link sesuai jaringan yang Anda gunakan:"
echo ""
echo " 💻 Local      : http://localhost:${NOVNC_PORT}/vnc.html?autoconnect=true&resize=remote"
if [ -n "$TAILSCALE_IP" ]; then
echo " 🔒 Tailscale  : http://${TAILSCALE_IP}:${NOVNC_PORT}/vnc.html?autoconnect=true&resize=remote"
fi
if [ -n "$LAN_IP" ] && [ "$LAN_IP" != "127.0.0.1" ]; then
echo " 🏠 LAN        : http://${LAN_IP}:${NOVNC_PORT}/vnc.html?autoconnect=true&resize=remote"
fi
if [ -n "$PUBLIC_IP" ]; then
echo " 🌍 Public     : http://${PUBLIC_IP}:${NOVNC_PORT}/vnc.html?autoconnect=true&resize=remote"
fi
echo ""
echo "--------------------------------------------------------------------"
echo " Langkah di layar web:"
echo " 1. Login ke akun Google Anda (selesaikan 2FA jika diminta)."
echo " 2. Di dropdown model Gemini, pilih model 'Argon'."
echo " 3. Setelah selesai, kembali ke terminal ini dan tekan [Ctrl + C]."
echo "--------------------------------------------------------------------"
echo " Menunggu Anda selesai login di browser... (Tekan Ctrl + C jika sudah)"
echo ""

# Tunggu sampai user menekan Ctrl+C
wait $CHROME_PID 2>/dev/null || while true; do sleep 1; done

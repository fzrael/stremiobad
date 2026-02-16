# 🛡️ StremioBad — Stremio CORS Vulnerability Scanner

> A proof-of-concept tool that demonstrates a **critical CORS misconfiguration** in Stremio's local streaming server, allowing **any website** to silently access user data, modify settings, and inject torrents — without any user interaction or consent.

**🔴 Live Demo:** [https://stremiobad.fly.dev/](https://stremiobad.fly.dev/)  
Open this link while Stremio is running to see the vulnerability in action.

---

## 🧨 What's the Problem?

Stremio runs a local HTTP server on `http://127.0.0.1:11470` with **no CORS protection whatsoever**. This means:

- ❌ **No `Access-Control-Allow-Origin` restriction** — any website can make requests
- ❌ **No authentication** — no tokens, no API keys, no session validation
- ❌ **No origin validation** — the server doesn't check who's making the request

Any website you visit in your browser can silently communicate with Stremio's local server and extract sensitive data or perform destructive actions.

---

## 🔍 What This Tool Demonstrates

### 1. 📡 Data Leakage (GET requests — zero interaction)
When you open the scanner page, it automatically fetches and displays:

| Endpoint | Data Exposed |
|----------|-------------|
| `GET /settings` | Windows username, server path, app version, cache config, HTTPS settings, transcode profiles |
| `GET /network-info` | All local network interfaces and IP addresses |
| `GET /device-info` | Device-level information |

**Impact:** An attacker can fingerprint your device even if you use a VPN or incognito mode. Your Windows username and file paths are leaked instantly.
a
### 2. ⚡ Remote Settings Modification (POST — one click)
The tool includes a **control panel** that can remotely modify Stremio's server configuration:

- `cacheSize` → Set to `null` (∞ infinite) to fill the victim's disk
- `btMaxConnections` → Max out torrent connections
- `btDownloadSpeedSoftLimit` / `btDownloadSpeedHardLimit` → Remove speed limits
- `proxyStreamsEnabled` → Toggle proxy streams
- `remoteHttps` → Modify HTTPS configuration
- `localAddonEnabled` → Enable/disable local addon
- `transcodeHardwareAccel` → Toggle hardware acceleration

**Impact:** A malicious website can silently alter Stremio's behavior, disable security features, or cause resource exhaustion.

### 3. 💣 Torrent Injection (POST — zero authentication)
<img src="https://l.top4top.io/p_3699rfvn71.gif"/>

The scanner includes a **torrent injection panel** that accepts:
- A **magnet link** (auto-parses infoHash + trackers)
- A raw **infoHash** (40-character hex)

It sends a `POST /{infoHash}/create` request to Stremio's server, forcing it to **start downloading a torrent on the victim's machine** — without any confirmation dialog.

After injection, it polls `GET /{infoHash}/{fileIdx}/stats.json` and displays:
- Torrent name and files
- Download/upload speed and progress
- Peer count and swarm status
- Connection details
- **💀 The full local cache path** (e.g., `C:\Users\USERNAME\AppData\Roaming\stremio\stremio-cache\...`)
- All tracker sources with peer counts

**Impact:** Any website can silently force-download arbitrary torrents, potentially illegal content, onto the user's machine and read the exact file paths where it's stored.


---

## 🖥️ Affected Platforms

| Platform | Affected? | Notes |
|----------|-----------|-------|
| Windows | ✅ Yes | Tested and confirmed |
| macOS | ✅ Yes | Same local server architecture |
| Linux | ✅ Yes | Same local server architecture |
| Android | ❓ Varies | Different server implementation |

**Prerequisite:** Stremio desktop app must be running (the local server on port `11470` must be active).

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/StremioBad.git
cd StremioBad

# Install dependencies
npm install

# Run locally
node .
# → http://localhost:3000
```

Then open `http://localhost:3000` in your browser while Stremio is running.

---


## 🔐 Technical Details

### Root Cause
Stremio's local streaming server (part of `stremio-core` / `stremio-server`) responds to all HTTP requests regardless of the `Origin` header. The server does not implement:
- CORS origin whitelisting
- Authentication tokens
- CSRF protection
- Rate limiting

### Attack Surface (from source code audit)

| Endpoint | Method | Risk |
|----------|--------|------|
| `/settings` | GET | Leaks username, paths, version |
| `/settings` | POST | Modify any server setting |
| `/network-info` | GET | Leaks all network interfaces |
| `/device-info` | GET | Leaks device info |
| `/{infoHash}/create` | POST | Force torrent download |
| `/create` | POST | Create torrent from blob |
| `/{infoHash}/{fileIdx}/stats.json` | GET | Leaks file paths, download activity |
| `/casting/{deviceId}/player` | POST | Control playback devices |

### Addon-Level Risks
Stremio's addon system has additional security concerns:
- **Zero-review publishing** — addons are published via a single POST to `api.strem.io/api/addonPublish` with no code review
- **Viewing tracking** — any installed addon receives IMDB IDs for every movie/series the user opens
- **Search tracking** — catalog addons receive all search queries
- **`playerFrame` exploitation** — an addon can return a `playerFrameUrl` that opens an attacker-controlled webpage directly inside Stremio's player

---

## ⚠️ Disclaimer

> **This project is for educational and awareness purposes only.**
>
> The goal is to demonstrate that **Stremio's privacy and security model needs improvement**. Users deserve to know that their local Stremio data is accessible to any website they visit.
>
> - ❌ Do not use this tool for malicious purposes
> - ❌ Do not use this to attack other users
> - ✅ Use this to understand the risks of running Stremio
> - ✅ Share this to raise awareness about local server security
>
> **If you want to see the vulnerability yourself**, visit the live demo at [https://stremiobad.fly.dev/](https://stremiobad.fly.dev/) while Stremio is running on your device.
>
> The author is not responsible for any misuse of this tool. This is a **security research project** aimed at improving user privacy.

---



---

## 📜 License

MIT — Use responsibly.

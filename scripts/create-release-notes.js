const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'Proton PRO', 'manifest.json'), 'utf8'));
const version = manifest.version;

const releaseNotes = `# 🚀 Proton PRO v${version} Release Notes

## 🛡️ Highlights
- **Manifest V3 Optimization**: High-performance service worker background architecture.
- **Armored Core Encryption**: Seamless Swiss privacy and end-to-end encrypted proxy routing.
- **Zero-Logs Guarantee**: Strict Swiss privacy law jurisdiction enforcement.
- **Leak Shields Active**: Automatic WebRTC protection and IPv6 leak prevention.
- **Multi-lingual Support**: Full localization across 35+ worldwide languages.

## 📦 Release Artifacts
- **File**: \`proton-pro-v${version}.zip\`
- **SHA-256 Checksum**: Check \`dist/proton-pro-v${version}.sha256\`

## 🔧 Installation Guide
1. Download \`proton-pro-v${version}.zip\` from Assets below.
2. Unzip into a folder of your choice.
3. Open Chrome/Brave/Edge and navigate to \`chrome://extensions\`.
4. Turn ON **Developer Mode** (top-right toggle).
5. Click **Load unpacked** and select the unzipped directory.
6. Enjoy high-speed encrypted private browsing!
`;

const outputPath = path.join(__dirname, '..', 'dist', `RELEASE_NOTES_v${version}.md`);
fs.writeFileSync(outputPath, releaseNotes, 'utf8');
console.log(`✓ Release notes created at: ${outputPath}`);


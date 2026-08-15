# NexaLink - Landing Page + Admin Panel

Landing page modern dengan admin panel terproteksi password (SHA-256 encrypted).

## 🚀 Deploy ke Vercel

### Cara 1: Vercel CLI (Cepat)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd nexalink-vercel
vercel --prod
```

### Cara 2: Git Integration
1. Push repo ini ke GitHub/GitLab/Bitbucket
2. Buka [vercel.com](https://vercel.com)
3. Click **"Add New Project"**
4. Import repo kamu
5. Framework Preset: **Other**
6. Click **Deploy**

### Cara 3: Drag & Drop
1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih **"Import Git Repository"** atau upload folder

## 🔐 Admin Panel

- **URL:** `https://your-domain.vercel.app/admin.html`
- **Password:** `Sempakkkk`
- **Encryption:** SHA-256

## 📁 Struktur File

```
├── index.html          # Landing page
├── admin.html          # Admin panel
├── assets/
│   ├── style.css       # Styling
│   ├── script.js       # Landing page logic
│   └── admin.js        # Admin panel logic
├── vercel.json         # Vercel config
├── .gitignore          # Git ignore rules
└── README.md           # Dokumentasi ini
```

## ✨ Fitur

- 🎨 Glassmorphism UI design
- 📱 Fully responsive
- 🔗 Direct link redirect via href
- 🔒 SHA-256 password encryption
- 🎨 Color & icon picker di admin
- 💾 Data tersimpan di localStorage
- ⚡ Zero dependencies (pure HTML/CSS/JS)

## 📝 Catatan

- Data link tersimpan di **browser localStorage** (per-device)
- Password hash: `dcfd2138a66dc5b4401831c2783a25559ed483104454fa9c42e37bce28f960dc`

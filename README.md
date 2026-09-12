# Nomory — Your meals, remembered.

Nomory helps you remember what you eat, one photo at a time. Good food, brighter days.

Capture meals, remember them automatically by date, and look back on your food memories anytime.

## Fitur

- **Capture** — foto makanan langsung atau upload dari galeri, otomatis jadi stiker makanan.
- **Remember** — setiap meal tersimpan dengan tanggal, jam, tipe (breakfast/lunch/dinner/snack), catatan, dan tags.
- **Look Back** — jelajahi memori lewat halaman Today, Calendar, Memories, dan Search.
- **Cloud sync** — login dengan Google atau username + password untuk sinkronisasi antar perangkat (D1 + R2). Tanpa login, data tersimpan lokal di perangkat (IndexedDB).
- **PWA** — bisa di-install di HP, support offline untuk data lokal.

## Tech stack

- TanStack Start (React + file-based routing) + Vite + Tailwind CSS v4
- React Query, shadcn/ui, Lucide icons
- Cloudflare D1 (metadata) + R2 (foto) untuk cloud sync
- Deploy target: Cloudflare Workers (via Nitro)

## Development

Butuh Node.js dan npm.

```sh
git clone https://github.com/ammarhisyamm/nomory.git
cd nomory
npm i
npm run dev
```

Perintah lain:

```sh
npm run build    # production build
npm run preview  # preview hasil build
npm run lint     # eslint
```

## Database (cloud sync)

Cloud sync butuh D1 + R2. Sekali saja:

```sh
npx wrangler d1 create nomory-db
# masukkan database_id yang dihasilkan ke wrangler.json
npx wrangler d1 migrations apply nomory-db --remote
npx wrangler r2 bucket create nomory-images
# aktifkan public access untuk bucket di dashboard Cloudflare,
# lalu isi R2_PUBLIC_URL di wrangler.json
```

Tanpa langkah di atas aplikasi tetap berjalan penuh dengan penyimpanan lokal di perangkat. Cloud sync aktif otomatis setelah D1 ter-binding dan user login dengan Google.

Aplikasi mewajibkan login sebelum bisa dipakai. Saat database masih kosong, akun awal `admin` / `Admin123` dibuat otomatis — segera ganti passwordnya lewat halaman Profile setelah masuk pertama kali.

## Brand

Nomory v1.0 (Sept 2026) — Nom Orange `#FF5A1F`, Sunny Yellow `#FFC400`, Leaf Green `#22C55E`, Sky Blue, Blush Pink, Cream `#FFF7EE`. Display: Baloo 2, Body: Satoshi.

# 🍽️ Nomory — Your meals, remembered.

**Nomory** adalah aplikasi food diary berbasis web yang membantu kamu mengingat apa yang kamu makan, satu foto dalam satu waktu. Foto makanannya, dan Nomory menyimpannya sebagai kenangan yang rapi berdasarkan tanggal — siap dibuka kembali kapan saja.

> Live: [nomory.site](https://nomory.site)

## Kenapa Nomory?

Kebanyakan orang tidak ingat apa yang mereka makan minggu lalu. Nomory mengubah foto makanan menjadi "stiker" kenangan yang bisa dijelajahi — seperti album foto, tapi khusus untuk perjalanan kulinermu. Good food, brighter days.

## Fitur

- **📸 Capture** — foto makanan langsung dari kamera atau upload dari galeri, otomatis jadi stiker makanan.
- **🗓️ Remember** — setiap meal tersimpan dengan tanggal, jam, tipe (breakfast / lunch / dinner / snack / drink), catatan, dan lokasi.
- **💭 Look Back** — jelajahi memori lewat halaman **Today**, **Calendar**, **Memories**, dan **Search**.
- **☁️ Cloud sync** — login dengan Google atau username + password untuk sinkronisasi antar perangkat (D1 + R2). Tanpa login, data tersimpan lokal di perangkat (IndexedDB).
- **🔒 Akun & keamanan** — reset password via email, halaman settings untuk privacy, data, dan keamanan.
- **📱 PWA** — bisa di-install di HP, support offline untuk data lokal.

## Tech stack

| Bagian | Teknologi |
| --- | --- |
| Framework | TanStack Start (React 19 + file-based routing) + Vite |
| Styling | Tailwind CSS v4, shadcn/ui, Lucide icons |
| State/data | React Query, Zod, React Hook Form |
| Cloud sync | Cloudflare D1 (metadata) + R2 (foto) |
| Deploy | Cloudflare Workers (via Nitro) |

## Menjalankan proyek

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
npm run format   # prettier
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

Tanpa langkah di atas aplikasi tetap berjalan penuh dengan penyimpanan lokal di perangkat. Cloud sync aktif otomatis setelah D1 ter-binding dan user login.

Aplikasi mewajibkan login sebelum bisa dipakai. Saat database masih kosong, akun awal `admin` / `Admin123` dibuat otomatis — segera ganti passwordnya lewat halaman Profile setelah masuk pertama kali.

## Struktur proyek

```
src/
├── components/   # komponen UI (shadcn/ui + komponen app)
├── hooks/        # custom hooks
├── lib/          # utilitas, auth, db, sync
├── routes/       # file-based routing (TanStack Start)
└── server.ts     # server functions (D1 + R2)
migrations/       # migrasi D1
```

## Brand

Nomory v1.0 (Sept 2026) — Nom Orange `#FF5A1F`, Sunny Yellow `#FFC400`, Leaf Green `#22C55E`, Sky Blue, Blush Pink, Cream `#FFF7EE`. Display: Baloo 2, Body: Satoshi.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

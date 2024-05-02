# Backend REST API menggunakan Express.js dan Prisma

Ini adalah proyek backend REST API sederhana yang dibangun menggunakan Express.js sebagai framework web, PostgreSQL sebagai database, dan Prisma sebagai ORM (Object-Relational Mapping).

## Persyaratan

Sebelum memulai, pastikan telah terinstal:

- Node.js
- npm
- PostgreSQL

## Instalasi

1. **Clone Repository**

   ```bash
   git clone https://github.com/username/nama-repo.git
   ```

2. **Masuk ke Direktori Proyek**

   ```bash
   cd nama-repo
   ```

3. **Instal Dependensi**

   ```bash
   npm install
   ```

4. **Inisialisasi Prisma**

   ```bash
   npx prisma init
   ```

5. **Terapkan Migrasi**

   ```bash
   npx prisma migrate dev --name initial
   ```

6. **Mulai Server**

   ```bash
   npm start
   ```

## Konfigurasi

1. **Database**

   Konfigurasi koneksi database PostgreSQL bisa ditemukan di file `.env`. Pastikan untuk mengatur `DATABASE_URL` sesuai dengan konfigurasi database kamu.

## Penggunaan

1. **API Endpoints**

   - `GET /api/users`: Mendapatkan daftar semua pengguna.
   - `GET /api/users/:id`: Mendapatkan detail pengguna berdasarkan ID.
   - `POST /api/users`: Membuat pengguna baru.
   - `PUT /api/users/:id`: Memperbarui pengguna berdasarkan ID.
   - `DELETE /api/users/:id`: Menghapus pengguna berdasarkan ID.

2. **Contoh Permintaan HTTP**

   ```http
   GET /api/users
   ```

   ```http
   POST /api/users
   Content-Type: application/json

   {
       "name": "John Doe",
       "email": "john@example.com"
   }
   ```

## Kontribusi

1. Fork repository ini
2. Buat branch baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## Lisensi

[MIT](https://choosealicense.com/licenses/mit/)

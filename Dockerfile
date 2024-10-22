# Menggunakan Node.js versi 20 sebagai base image
FROM node:20

# Menetapkan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Menyalin seluruh proyek ke dalam container
COPY . .

# Menentukan port yang akan digunakan oleh aplikasi
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]

# Menggunakan base image Node.js
FROM node:14

# Menetapkan direktori kerja di dalam container
WORKDIR /usr/src/app

# Menyalin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Menyalin seluruh isi proyek ke dalam container
COPY . .

# Menentukan port yang akan digunakan
EXPOSE 3000

# Menjalankan aplikasi
CMD ["npm", "start"]

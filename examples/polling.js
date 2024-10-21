require('dotenv').config(); // Untuk memuat API Token dan Groq API Key dari file .env
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const axios = require('axios');

// Inisialisasi bot Telegram
const TOKEN = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

// Inisialisasi Groq AI SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Objek untuk menyimpan riwayat percakapan per pengguna
const chatHistories = {};

// Fungsi untuk memanggil API Groq
// Modifikasi fungsi untuk mengirim hanya sebagian dari riwayat
async function getGroqChatCompletion(messages) {
  try {
      // Batasi hanya 10 pesan terakhir (user dan AI)
      const recentMessages = messages.slice(-20); // 10 pesan user dan 10 pesan AI
      return await groq.chat.completions.create({
          messages: [
              { role: 'system', content: 'Anda adalah asisten AI yang ramah dan menggunakan bahasa Indonesia.' },
              ...recentMessages
          ],
          model: "llama3-8b-8192", // Model yang Anda inginkan
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 1.0
      });
  } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
  }
}


// Ketika menerima pesan di Telegram
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    console.log(`Received message from ${chatId}: ${messageText}`);

    // Inisialisasi riwayat percakapan jika belum ada untuk chatId ini
    if (!chatHistories[chatId]) {
        chatHistories[chatId] = [];
    }

    // Tambahkan pesan pengguna ke riwayat percakapan
    chatHistories[chatId].push({ role: 'user', content: messageText });

    try {
        // Kirim seluruh riwayat percakapan ke Groq AI dan dapatkan balasan
        const chatCompletion = await getGroqChatCompletion(chatHistories[chatId]);
        const aiResponse = chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak mengerti.";

        // Tambahkan respons AI ke riwayat percakapan
        chatHistories[chatId].push({ role: 'assistant', content: aiResponse });

        // Kirim balasan AI kembali ke pengguna Telegram
        await bot.sendMessage(chatId, aiResponse);
        console.log(aiResponse)
    } catch (error) {
        console.error(`Error processing message from ${chatId}:`, error);
        await bot.sendMessage(chatId, "Terjadi kesalahan saat memproses permintaan Anda.");
    }
});

// Menangani exception yang tidak tertangani
process.on("uncaughtException", (err) => {
    console.log("Unhandled Exception", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled Rejection", reason);
});

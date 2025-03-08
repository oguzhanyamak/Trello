// Gerekli modülleri içe aktarıyoruz
import express from "express"; // Express.js framework'ünü kullanıyoruz
import { createServer } from "http"; // HTTP sunucusu oluşturmak için kullanıyoruz
import mongoose from "mongoose"; // MongoDB bağlantısı için Mongoose kullanıyoruz
import { Server } from "socket.io"; // Gerçek zamanlı iletişim için Socket.io kullanıyoruz
import * as usersController from "./controllers/users"; // Kullanıcı işlemleri için controller dosyasını içe aktarıyoruz
import bodyParser from "body-parser"; // Gelen JSON verilerini işlemek için body-parser kullanıyoruz
import { mongoDbUri } from "./config"; // MongoDB bağlantı URI'sini içe aktarıyoruz
import authMiddleware from "./middlewares/auth";
import cors from "cors";

// Express uygulamasını başlatıyoruz
const app = express();
// HTTP sunucusunu Express uygulamasıyla oluşturuyoruz
const httpServer = createServer(app);
// Socket.io sunucusunu HTTP sunucusuna bağlıyoruz
const io = new Server(httpServer);

app.use(cors());

// Middleware'leri ekliyoruz
app.use(bodyParser.json()); // JSON verileri almak için
app.use(bodyParser.urlencoded({ extended: true })); // URL Encoded verileri almak için

// Ana sayfa için basit bir GET isteği
app.get("/", (req, res) => {
  res.send("API is UP"); // API'nin çalıştığını belirten bir mesaj döndürüyoruz
});

// Kullanıcı kayıt işlemi için POST isteği
app.post("/api/users", usersController.register);

// Kullanıcı giriş işlemi için POST isteği
app.post("/api/users/login", usersController.login);
app.get("/api/user",authMiddleware,usersController.currentUser)

// Socket.io bağlantısı için olay dinleyici
io.on("connection", () => {
  console.log("connect"); // Yeni bir istemci bağlandığında konsola mesaj yazdırıyoruz
});

// MongoDB bağlantısını gerçekleştiriyoruz
mongoose.connect(mongoDbUri).then(() => {
  console.log("connected to mongodb"); // Bağlantı başarılı olursa konsola mesaj yazdırıyoruz

  // Sunucuyu belirlenen port üzerinden dinlemeye başlatıyoruz
  httpServer.listen(3000, () => {
    console.log(`API is listening on port 4001`); // Başarılı başlatma mesajı
  });
});

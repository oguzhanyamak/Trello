// Gerekli modülleri içe aktarıyoruz
import express from "express"; // Express.js framework'ünü kullanıyoruz
import { createServer } from "http"; // HTTP sunucusu oluşturmak için kullanıyoruz
import mongoose from "mongoose"; // MongoDB bağlantısı için Mongoose kullanıyoruz
import { Server } from "socket.io"; // Gerçek zamanlı iletişim için Socket.io kullanıyoruz
import {Socket} from "./types/socket.interface"
import * as usersController from "./controllers/users"; // Kullanıcı işlemleri için controller dosyasını içe aktarıyoruz
import * as boardsController from "./controllers/boards"; 
import * as columnsController from "./controllers/columns"; 
import * as tasksController from "./controllers/tasks"; 
import bodyParser from "body-parser"; // Gelen JSON verilerini işlemek için body-parser kullanıyoruz
import { mongoDbUri } from "./config"; // MongoDB bağlantı URI'sini içe aktarıyoruz
import authMiddleware from "./middlewares/auth";
import cors from "cors";
import jwt from "jsonwebtoken";
import { SocketEventsEnum } from "./types/socketEnums.enum";
import {secret} from "./config";
import User from "./models/user"; // Kullanıcı modelini içe aktarıyoruz

// Express uygulamasını başlatıyoruz
const app = express();
// HTTP sunucusunu Express uygulamasıyla oluşturuyoruz
const httpServer = createServer(app);
// Socket.io sunucusunu HTTP sunucusuna bağlıyoruz
const io = new Server(httpServer,{cors:{origin:"*"}});

app.use(cors());

// Middleware'leri ekliyoruz
app.use(bodyParser.json()); // JSON verileri almak için
app.use(bodyParser.urlencoded({ extended: true })); // URL Encoded verileri almak için

mongoose.set("toJSON", {
  virtuals: true,  // Virtual alanları JSON çıktısına dahil eder.
  transform: (_, converted) => { 
    delete converted._id;  // JSON çıktısından _id alanını siler.
  }
});

// Ana sayfa için basit bir GET isteği
app.get("/", (req, res) => {
  res.send("API is UP"); // API'nin çalıştığını belirten bir mesaj döndürüyoruz
});

// Kullanıcı kayıt işlemi için POST isteği
app.post("/api/users", usersController.register);
app.post("/api/users/login", usersController.login);
app.get("/api/user",authMiddleware,usersController.currentUser);
app.get("/api/boards",authMiddleware,boardsController.getBoards);
app.post("/api/boards",authMiddleware,boardsController.createBoard);
app.get("/api/boards/:boardId",authMiddleware,boardsController.getBoard);
app.get("/api/boards/:boardId/columns",authMiddleware,columnsController.getColumns);
app.get("/api/boards/:boardId/tasks",authMiddleware,tasksController.getTasks);

// Socket.io bağlantısı için olay dinleyici
// Socket.IO için kimlik doğrulama middleware'i
io.use(async (socket: Socket, next) => {
  try {
    // İstemciden gelen token'ı al (handshake.auth.token üzerinden)
    const token = (socket.handshake.auth.token as string) ?? "";

    // JWT token'ı doğrula ve içindeki kullanıcı bilgilerini al
    const data = jwt.verify(token.split(' ')[1], secret) as {
      id: string;
      email: string;
    };

    // Veritabanından kullanıcıyı bul
    const user = await User.findById(data.id);
    if (!user) {
      return next(new Error("Authentication error")); // Kullanıcı bulunamazsa hata döndür
    }

    // Socket nesnesine doğrulanmış kullanıcıyı ekle (diğer event'lerde kullanılabilir)
    socket.user = user;
    
    // Kimlik doğrulama başarılıysa, bir sonraki middleware'e geç
    next();
  } catch (error) {
    // Hata durumunda bağlantıyı engelle
    next(new Error("Socket Authentication Error"));
  }
});
// Socket.IO bağlantısı kurulduğunda çalışacak olay dinleyicileri
io.on("connection", (socket) => {
  // Kullanıcı bir board'a katılmak istediğinde çalışır
  socket.on(SocketEventsEnum.boardsJoin, (data) => {
    boardsController.joinBoard(io, socket, data);
  });

  // Kullanıcı bir board'dan ayrılmak istediğinde çalışır
  socket.on(SocketEventsEnum.boardsLeave, (data) => {
    boardsController.leaveBoard(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsCreate, (data) => {
    columnsController.createColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksCreate, (data) => {
    tasksController.createTask(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsUpdate, (data) => {
    boardsController.updateBoard(io, socket, data);
  });
  socket.on(SocketEventsEnum.boardsDelete, (data) => {
    boardsController.deleteBoard(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsDelete, (data) => {
    columnsController.deleteColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.columnsUpdate, (data) => {
    columnsController.updateColumn(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksUpdate, (data) => {
    tasksController.updateTask(io, socket, data);
  });
  socket.on(SocketEventsEnum.tasksDelete, (data) => {
    tasksController.deleteTask(io, socket, data);
  });
});


// MongoDB bağlantısını gerçekleştiriyoruz
mongoose.connect(mongoDbUri).then(() => {
  console.log("connected to mongodb"); // Bağlantı başarılı olursa konsola mesaj yazdırıyoruz

  // Sunucuyu belirlenen port üzerinden dinlemeye başlatıyoruz
  httpServer.listen(3000, () => {
    console.log(`API is listening on port 3000`); // Başarılı başlatma mesajı
  });
});

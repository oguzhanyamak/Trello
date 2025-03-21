import { NextFunction, Response } from "express";
import BoardModel from "../models/board";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import board from "../models/board";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEnums.enum";
import { getErrorMessage } from "../helper";

// getBoards fonksiyonu, kullanıcıya ait tüm board'ları alır.
export const getBoards = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401); // Kullanıcı doğrulaması yoksa, 401 hatası döner.
    }

    // BoardModel kullanılarak, mevcut kullanıcının (userId ile) tüm board'ları bulunur.
    const boards = await BoardModel.find({ userId: req.user.id });

    // Board'lar başarıyla alındıysa, bunları JSON formatında yanıt olarak döner.
    res.send(boards);
  } catch (err) {
    // Eğer bir hata oluşursa, error'ı bir sonraki middleware'e iletir.
    next(err);
  }
};

// createBoard fonksiyonu, yeni bir board oluşturur.
export const createBoard = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401); // Kullanıcı doğrulaması yoksa, 401 hatası döner.
    }

    // Yeni bir board oluşturuluyor. Board'ın başlığı ve kullanıcı id'si kullanıcının kimliğine göre ayarlanır.
    const newBoard = new BoardModel({
      title: req.body.title, // Body'den gelen 'title' kullanılır.
      userId: req.user.id, // Board, mevcut kullanıcının id'si ile ilişkilendirilir.
    });

    // Yeni board veritabanına kaydedilir.
    const savedBoard = await newBoard.save();

    // Başarıyla kaydedilen board veritabanından alınarak yanıt olarak döner.
    res.send(savedBoard);
  } catch (err) {
    // Eğer bir hata oluşursa, error'ı bir sonraki middleware'e iletir.
    next(err);
  }
};

export const getBoard = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401); // Kullanıcı doğrulaması yoksa, 401 hatası döner.
    }

    // BoardModel kullanılarak, mevcut kullanıcının (userId ile) istenen board bulunur.
    const boards = await BoardModel.findById(req.params.boardId);

    // Board başarıyla alındıysa, bunları JSON formatında yanıt olarak döner.
    res.send(boards);
  } catch (err) {
    // Eğer bir hata oluşursa, error'ı bir sonraki middleware'e iletir.
    next(err);
  }
};

// Belirtilen board'a (oda) bir socket'in katılmasını sağlayan fonksiyon
export const joinBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  // Katılım işlemiyle ilgili log kaydı
  console.log("server socket io join", data.boardId);

  // Socket'i belirtilen board (oda) kimliğiyle bir odaya dahil et
  socket.join(data.boardId);
};

// Belirtilen board'dan (oda) bir socket'in ayrılmasını sağlayan fonksiyon
export const leaveBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  // Socket'i belirtilen board (oda) kimliğiyle odadan çıkar
  console.log("server socket io leave", data.boardId);
  socket.leave(data.boardId);
};

export const updateBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; fields: { title: string } }
) => {
  try {
    // Kullanıcının yetkili olup olmadığını kontrol et
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.boardsUpdateFailure,
        "User is not authorized" // Yetkisiz kullanıcıya hata mesajı gönder
      );
      return;
    }

    // Board güncellemesini gerçekleştir ve tüm bağlı istemcilere başarı mesajı gönder
    io.to(data.boardId).emit(
      SocketEventsEnum.boardsUpdateSuccess,
      await BoardModel.findByIdAndUpdate(data.boardId, data.fields, {
        new: true, // Güncellenmiş dokümanı döndür
      })
    );
  } catch (error) {
    // Bir hata oluşursa, istemciye hata mesajı gönder
    socket.emit(SocketEventsEnum.boardsUpdateFailure, getErrorMessage(error));
  }
};

export const deleteBoard = async (
  io: Server,
  socket: Socket,
  data: { boardId: string }
) => {
  try {
    // Kullanıcının yetkili olup olmadığını kontrol et
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.boardsDeleteFailure,
        "User is not authorized" // Yetkisiz kullanıcıya hata mesajı gönder
      );
      return;
    }

    // Board'u veritabanından sil
    await BoardModel.deleteOne({ _id: data.boardId });

    // Tüm bağlı istemcilere board'un silindiğine dair bildirim gönder
    io.to(data.boardId).emit(SocketEventsEnum.boardsDeleteSuccess);
  } catch (error) {
    // Bir hata oluşursa, istemciye hata mesajı gönder
    socket.emit(SocketEventsEnum.boardsDeleteFailure, getErrorMessage(error));
  }
};



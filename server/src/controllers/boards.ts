import { NextFunction,Response } from "express";
import BoardModel from '../models/board'
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import board from "../models/board";


// getBoards fonksiyonu, kullanıcıya ait tüm board'ları alır.
export const getBoards = async (req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401);  // Kullanıcı doğrulaması yoksa, 401 hatası döner.
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
export const createBoard = async (req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401);  // Kullanıcı doğrulaması yoksa, 401 hatası döner.
    }

    // Yeni bir board oluşturuluyor. Board'ın başlığı ve kullanıcı id'si kullanıcının kimliğine göre ayarlanır.
    const newBoard = new BoardModel({
      title: req.body.title,  // Body'den gelen 'title' kullanılır.
      userId: req.user.id,  // Board, mevcut kullanıcının id'si ile ilişkilendirilir.
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

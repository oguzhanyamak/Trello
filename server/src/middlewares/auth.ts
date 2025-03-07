import { NextFunction, Response } from "express"; // Express framework'ünden temel türleri alıyoruz
import { secret } from "../config"; // JWT oluştururken kullanılan gizli anahtarı içe aktarıyoruz
import UserModel from "../models/user"; // Kullanıcı modelini içe aktarıyoruz
import jwt from "jsonwebtoken";
import { ExpressRequestInterface } from "../types/expressRequest.interface";

// Kimlik doğrulama middleware fonksiyonu
export default async (req: ExpressRequestInterface, res: Response, next: NextFunction): Promise<any> => {
  try {
    // HTTP isteğinin Authorization başlığını alıyoruz
    const authHeader = req.headers.authorization;

    // Eğer Authorization başlığı yoksa, 401 (Unauthorized) hatası döndür
    if (!authHeader) {
      return res.sendStatus(401);
    }

    // Bearer token formatında geliyor, bu yüzden "Bearer <token>" şeklinde ayrıştırıyoruz
    const token = authHeader?.split(" ")[1];

    // JWT token'ı doğruluyoruz, eğer geçerliyse içinden kullanıcı bilgilerini alıyoruz
    const data = jwt.verify(token, secret) as { id: string; email: string };

    // Kullanıcıyı veritabanında bulmaya çalışıyoruz
    const user = await UserModel.findById(data.id);

    // Eğer kullanıcı bulunamazsa, yine 401 hatası döndürüyoruz
    if (!user) {
      return res.sendStatus(401);
    }

    // Kullanıcı doğrulandıysa, request nesnesine ekleyerek sonraki middleware'e devam etmesini sağlıyoruz
    req.user = user;

    // İşlem başarılıysa `next()` ile bir sonraki middleware'e geçiyoruz
    next();
  } catch (error) {
    // Eğer herhangi bir hata olursa (JWT süresi dolmuş, geçersiz vs.), 401 hatası döndürüyoruz
    res.sendStatus(401);
  }
};

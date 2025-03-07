// Gerekli modülleri ve bağımlılıkları içe aktarıyoruz
import { NextFunction, Request, Response } from "express"; // Express framework'ünden temel türleri alıyoruz
import UserModel from "../models/user"; // Kullanıcı modelini içe aktarıyoruz
import { UserDocument } from "../types/user.interface"; // Kullanıcı belgeleri için TypeScript arayüzünü içe aktarıyoruz
import { Error } from "mongoose"; // Mongoose hata tiplerini kullanmak için içe aktarıyoruz
import jwt from "jsonwebtoken"; // Kullanıcı kimlik doğrulaması için JSON Web Token (JWT) kullanıyoruz
import { secret } from "../config"; // JWT oluştururken kullanılan gizli anahtarı içe aktarıyoruz
import { ExpressRequestInterface } from "../types/expressRequest.interface";

// Kullanıcı nesnesini normalize eden yardımcı fonksiyon
const normalizeUser = (user: UserDocument) => {
  // Kullanıcıya JWT (JSON Web Token) oluşturuyoruz
  const token = jwt.sign({ id: user.id, email: user.email }, secret);

  // Kullanıcı bilgilerini belirli bir formatta döndürüyoruz
  return {
    email: user.email,
    username: user.username,
    id: user.id,
    token, // Kullanıcıya JWT token ekliyoruz
  };
};

// Kullanıcı kayıt fonksiyonu (register)
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Yeni kullanıcı nesnesi oluşturuyoruz
    const newUser = new UserModel({
      email: req.body.email, // Kullanıcının e-posta adresi
      username: req.body.username, // Kullanıcının kullanıcı adı
      password: req.body.password, // Kullanıcının şifresi (hashlenecektir)
    });

    // Kullanıcıyı veritabanına kaydediyoruz ve normalize edilmiş bilgiyi döndürüyoruz
    return res.status(201).json(normalizeUser(await newUser.save()));
  } catch (err) {
    // Eğer bir doğrulama hatası olursa, hata mesajlarını döndürüyoruz
    if (err instanceof Error.ValidationError) {
      const messages = Object.values(err.errors).map((err) => err.message);
      return res.status(422).json(messages); // 422: Unprocessable Entity
    }
    next(err); // Diğer hatalar için hata işleyicisine yönlendiriyoruz
  }
};

// Kullanıcı giriş fonksiyonu (login)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Veritabanında e-posta adresine göre kullanıcıyı arıyoruz
    const user = await UserModel.findOne({ email: req.body.email }).select("+password");

    // Eğer kullanıcı bulunamazsa, hata mesajı döndürüyoruz
    if (!user) {
      return res.status(422).json({ message: "Incorrect email or password" });
    }

    // Kullanıcının girdiği şifrenin doğruluğunu kontrol ediyoruz
    const isSamePassword = await user.validatePassword(req.body.password);
    if (!isSamePassword) {
      return res.status(422).json({ message: "Incorrect email or password" });
    }

    // Kullanıcı doğrulandıysa, normalize edilmiş kullanıcı bilgilerini döndürüyoruz
    res.send(normalizeUser(user));
  } catch (error) {
    next(error); // Hata durumunda hata işleyicisine yönlendiriyoruz
  }
};

// `currentUser` fonksiyonu, giriş yapmış olan kullanıcının bilgilerini döndürür.
export const currentUser = async (
  req: ExpressRequestInterface, // `ExpressRequestInterface` sayesinde `req.user` özelliğini kullanabiliyoruz.
  res: Response, // Express'in yanıt (response) nesnesi
  next: NextFunction // Bir sonraki middleware'e geçmek için kullanılan fonksiyon
): Promise<any> => {
  
  // Eğer `req.user` tanımlı değilse, yani kullanıcı giriş yapmamışsa 401 Unauthorized hatası döndür.
  if (!req.user) {
    return res.sendStatus(401); // Kullanıcı yetkilendirilmemişse erişimi reddet.
  }

  // Kullanıcı giriş yapmışsa, `normalizeUser` fonksiyonunu kullanarak kullanıcı bilgilerini dön.
  res.send(normalizeUser(req.user));
};

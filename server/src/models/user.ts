import { Schema, model } from "mongoose"; // Mongoose'tan Schema ve model fonksiyonlarını içe aktarıyoruz
import { UserDocument } from "../types/user.interface"; // Kullanıcı belgesi için TypeScript arayüzünü içe aktarıyoruz
import validator from "validator"; // Email doğrulaması için validator kütüphanesini içe aktarıyoruz
import bcryptjs from "bcryptjs"; // Şifreleme işlemleri için bcryptjs kütüphanesini içe aktarıyoruz

// Kullanıcı şeması oluşturuluyor
const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is require"], // Email alanı zorunludur
      validate: [validator.isEmail, "invalid Email"], // Email doğrulaması yapılıyor
      createIndexes: { unique: true }, // Email için benzersiz indeks oluşturuluyor
    },
    username: {
      type: String,
      required: [true, "Username is require"], // Kullanıcı adı zorunludur
    },
    password: {
      type: String,
      required: [true, "Password is require"], // Şifre zorunludur
      select: false, // Varsayılan sorgularda şifre alanı seçilmez (güvenlik amacıyla)
    },
  },
  { timestamps: true } // Mongoose otomatik olarak createdAt ve updatedAt alanlarını ekler
);

// Kullanıcı kaydedilmeden önce (pre-save hook), şifreyi hash'leyerek saklıyoruz
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) { // Eğer şifre değiştirilmediyse devam et
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10); // Şifreyi hash'lemek için salt oluşturuyoruz
    this.password = await bcryptjs.hash(this.password, salt); // Şifreyi hash'leyerek güncelliyoruz
    return next();
  } catch (err) {
    return next(err as Error); // Hata varsa sonraki middleware'e hatayı iletiyoruz
  }
});

// Şifre doğrulama fonksiyonu: Kullanıcının girdiği şifre ile hash'lenmiş şifreyi karşılaştırır
userSchema.methods.validatePassword = function (password: string) {
  return bcryptjs.compare(password, this.password); // Bcryptjs ile karşılaştırma yapılıyor
};

// Şemadan bir Mongoose modeli oluşturup dışa aktarıyoruz
export default model<UserDocument>("User", userSchema);

# TRELLO Backend API Dokümantasyonu

## Genel Bakış

Bu repository, **Node.js**, **Express.js** ve **Socket.io** kullanılarak geliştirilmiş bir Board Yönetim Sistemi'nin backend kodlarını içermektedir. Uygulama, kullanıcıların board (tahtalar) oluşturmasını, güncellemesini, silmesini ve gerçek zamanlı olarak board'lar ile etkileşimde bulunmasını sağlar. Backend, güvenli kullanıcı erişimi sağlar, board verileri üzerinde CRUD (Create, Read, Update, Delete) işlemleri yapar ve WebSocket ile gerçek zamanlı işbirliğini mümkün kılar.

---

## Teknolojiler

- **Node.js**: Ölçeklenebilir backend uygulamaları oluşturmak için Chrome'un V8 JavaScript motoru üzerine inşa edilmiş JavaScript çalışma zamanı.
- **Express.js**: RESTful API endpoint'leri oluşturmak için kullanılan Node.js için bir web uygulama framework'ü.
- **Socket.io**: Web istemcileri ve sunucu arasında gerçek zamanlı, iki yönlü iletişimi etkinleştiren kütüphane.
- **MongoDB**: Board ve kolona dair verilerin saklandığı NoSQL veritabanı.
- **Mongoose**: MongoDB ve Node.js için ODM (Object Data Modeling) kütüphanesi, veritabanı şemaları ve etkileşimini yönetir.
- **JWT**: Kullanıcıların güvenli bir şekilde kimlik doğrulaması yapması için kullanılan JSON Web Token.

---

## Proje Yapısı

```
├── models/
│   ├── board.js
│   ├── column.js
│   └── user.js
├── routes/
│   ├── boardRoutes.js
│   ├── columnRoutes.js
│   └── authRoutes.js
├── controllers/
│   ├── boardController.js
│   ├── columnController.js
│   └── authController.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── utils/
│   ├── socketUtils.js
│   ├── jwtUtils.js
│   └── errorUtils.js
├── server.js
├── config/
│   └── config.js
└── .env
```

- **models/**: Board, column ve user şemaları için Mongoose modellerini içerir.
- **routes/**: Board, column ve kimlik doğrulama ile ilgili API taleplerini yöneten route'ları tanımlar.
- **controllers/**: Route'lardan gelen taleplerin işlenmesi için gerekli olan iş mantığını içerir.
- **middleware/**: Kimlik doğrulama ve hata yönetimi gibi ara katmanları barındırır.
- **utils/**: JWT yönetimi, hata formatlama ve socket olayları gibi yardımcı fonksiyonları içerir.
- **server.js**: Uygulamanın ana giriş noktasıdır.
- **config/**: Konfigürasyon dosyalarını (örneğin çevresel değişkenler, veritabanı bağlantıları) içerir.
- **.env**: Gizli veriler (örneğin JWT gizli anahtarı, MongoDB URI) için ortam değişkenlerini saklar.

---

## API Endpoints

### Kimlik Doğrulama ve Yetkilendirme

#### 1. POST `/api/auth/login`
- **Açıklama**: Kullanıcıyı doğrular ve bir JWT token döner.
- **Body**: 
  ```json
  {
    "username": "user123",
    "password": "password"
  }
  ```
- **Yanıt**:
  - **200 OK**: Başarıyla doğrulama yapılmış ve JWT token verilmiş olur.
  - **401 Unauthorized**: Geçersiz kimlik bilgileri.

#### 2. POST `/api/auth/register`
- **Açıklama**: Yeni bir kullanıcı kaydeder.
- **Body**:
  ```json
  {
    "username": "newuser",
    "password": "password"
  }
  ```
- **Yanıt**:
  - **201 Created**: Kullanıcı başarıyla kaydedildi.
  - **400 Bad Request**: Geçersiz veri.

### Board Endpoints

#### 1. GET `/api/boards`
- **Açıklama**: Kimlik doğrulaması yapılmış kullanıcının tüm board'larını alır.
- **Yanıt**:
  - **200 OK**: Kullanıcının tüm board'ları.
  - **401 Unauthorized**: Kullanıcı doğrulaması yapılmamışsa.

#### 2. POST `/api/boards`
- **Açıklama**: Yeni bir board oluşturur.
- **Body**:
  ```json
  {
    "title": "Yeni Board Başlığı"
  }
  ```
- **Yanıt**:
  - **201 Created**: Başarıyla oluşturulmuş board.
  - **400 Bad Request**: Geçersiz veri.

#### 3. GET `/api/boards/:boardId`
- **Açıklama**: Belirtilen board'ı ID ile alır.
- **Yanıt**:
  - **200 OK**: Board nesnesi.
  - **404 Not Found**: Board bulunamazsa.
  - **401 Unauthorized**: Kullanıcı doğrulaması yapılmamışsa.

#### 4. PUT `/api/boards/:boardId`
- **Açıklama**: Belirtilen board'ın başlığını günceller.
- **Body**:
  ```json
  {
    "title": "Güncellenmiş Başlık"
  }
  ```
- **Yanıt**:
  - **200 OK**: Güncellenmiş board.
  - **401 Unauthorized**: Yetkisiz kullanıcı.

#### 5. DELETE `/api/boards/:boardId`
- **Açıklama**: Belirtilen board'ı siler.
- **Yanıt**:
  - **200 OK**: Başarıyla silinen board.
  - **404 Not Found**: Board bulunamazsa.
  - **401 Unauthorized**: Yetkisiz kullanıcı.

### Gerçek Zamanlı İletişim Endpoints

#### 1. POST `/socket/joinBoard`
- **Açıklama**: Bir socket bağlantısını belirli bir board'a (oda) ekler.
- **Yanıt**:
  - **200 OK**: Başarıyla katılma işlemi yapılır.
  - **401 Unauthorized**: Kimlik doğrulaması yapılmamışsa.

#### 2. POST `/socket/leaveBoard`
- **Açıklama**: Bir socket bağlantısını belirtilen board'dan çıkarır.
- **Yanıt**:
  - **200 OK**: Başarıyla çıkış yapılır.
  - **401 Unauthorized**: Kimlik doğrulaması yapılmamışsa.

---

## Socket Olayları

### **Board Olayları**
- `boardsCreateSuccess`: Board başarıyla oluşturulduğunda tetiklenir.
- `boardsCreateFailure`: Board oluşturulamadığında tetiklenir.
- `boardsUpdateSuccess`: Board başarıyla güncellendiğinde tetiklenir.
- `boardsUpdateFailure`: Board güncellenemediğinde tetiklenir.
- `boardsDeleteSuccess`: Board başarıyla silindiğinde tetiklenir.
- `boardsDeleteFailure`: Board silinemediğinde tetiklenir.

### **Column Olayları**
- `columnsCreateSuccess`: Column başarıyla oluşturulduğunda tetiklenir.
- `columnsCreateFailure`: Column oluşturulamadığında tetiklenir.
- `columnsUpdateSuccess`: Column başarıyla güncellendiğinde tetiklenir.
- `columnsUpdateFailure`: Column güncellenemediğinde tetiklenir.
- `columnsDeleteSuccess`: Column başarıyla silindiğinde tetiklenir.
- `columnsDeleteFailure`: Column silinemediğinde tetiklenir.

---

## Hata Yönetimi

Hata yönetimi, merkezi bir middleware ile yapılır ve herhangi bir beklenmedik hata sunucu tarafında yakalanır.

- **400 Bad Request**: Geçersiz veri veya doğrulama hataları.
- **401 Unauthorized**: Kullanıcı kimliği doğrulaması yapılmamışsa veya yetkisizse.
- **404 Not Found**: İstenilen kaynak (board veya column) bulunamazsa.
- **500 Internal Server Error**: Beklenmedik sunucu hataları.

---

## Güvenlik

- **Kimlik Doğrulama**: JWT tokenları, kullanıcıların güvenli bir şekilde kimlik doğrulaması yapabilmesi için kullanılır. Her istekle birlikte token, `Authorization` başlığında gönderilir.
- **Yetkilendirme**: Middleware, kullanıcıların yalnızca kendi board'ları üzerinde işlem yapabilmesini sağlar.

---
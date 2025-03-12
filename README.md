# Kanban Board Projesi - Teknik Detaylar

Bu proje, bir Kanban board uygulamasıdır. Kullanıcılar board'lar oluşturabilir, her board'a sütunlar ekleyebilir, bu sütunlara görevler atayabilir ve görevlerin durumunu yönetebilirler. WebSocket üzerinden gerçek zamanlı güncellemeler yapılır. Bu README, projede kullanılan teknolojiler, yapılar ve servisler hakkında teknik detaylar sunar.

## Proje Hakkında

Bu proje, kullanıcıların görevlerini yönetebileceği kanban tarzı bir board uygulamasıdır. WebSocket desteğiyle, board'daki değişiklikler anında tüm bağlı kullanıcılar arasında güncellenir. Proje, kullanıcılara görev ekleme, silme, düzenleme ve taşımayı sağlayan bir yönetim paneli sunar. Ayrıca, kullanıcılar giriş yapabilir, kayıt olabilir ve çıkış yapabilirler.

## Mimari Detaylar

### Frontend

Frontend, **Angular** framework'ü kullanılarak geliştirilmiştir. Uygulama, modern bir kullanıcı arayüzü sağlamak için Angular Material ve Custom CSS kullanılarak tasarlanmıştır. WebSocket ile gerçek zamanlı veri akışı sağlanır.

#### Kullanılan Teknolojiler:
- **Angular 12+**: Framework, component tabanlı mimari, reactive programming (rxjs) desteği sağlar.
- **Angular Material**: Kullanıcı arayüzünü düzenlemek için kullanılır (butonlar, form kontrolleri, modallar vb.).
- **RxJS**: Asenkron veri akışlarını yönetmek ve event-driven programlama yapmak için kullanılır.
- **Socket.IO (WebSocket)**: Gerçek zamanlı uygulama gereksinimleri için kullanılır.
  
#### Yapılar:
- **BoardService**: Kullanıcıların board, sütun ve görev verilerini yönetmesini sağlayan servis.
- **AuthService**: Kullanıcı yönetimi, giriş, çıkış ve kayıt işlemlerini sağlayan servis.
- **AuthGuardService**: Yalnızca yetkilendirilmiş kullanıcıların belirli sayfalara erişmesini sağlar.
- **HttpInterceptor**: API isteklerine otomatik olarak `Authorization` header'ı ekler.

### Backend

Backend, **Node.js** ve **Express.js** kullanılarak geliştirilmiştir. Uygulama, RESTful API'ler ve WebSocket üzerinden gerçek zamanlı veri akışını yönetir. MongoDB veya PostgreSQL gibi veritabanı çözümleri kullanılabilir.

#### Kullanılan Teknolojiler:
- **Node.js**: Sunucu tarafı uygulama geliştirmek için kullanılır.
- **Express.js**: HTTP isteklerini yönetmek için kullanılan minimal framework.
- **JWT (JSON Web Token)**: Kullanıcı doğrulaması ve yetkilendirmesi için kullanılır.
- **MongoDB/PostgreSQL**: Veritabanı yönetimi için kullanılır. MongoDB, NoSQL çözümü, PostgreSQL ise ilişkisel veritabanıdır.
- **Socket.IO (WebSocket)**: Gerçek zamanlı veri akışı sağlar.

#### Yapılar:
- **UserController**: Kullanıcı ile ilgili işlemleri (giriş, kayıt, profil güncelleme vb.) yönetir.
- **BoardController**: Board, sütun ve görev yönetimini sağlayan controller.
- **AuthMiddleware**: JWT doğrulaması yapmak için kullanılır, API isteklerinde kullanıcı kimlik doğrulaması sağlar.
- **SocketService**: WebSocket (Socket.IO) üzerinden gerçek zamanlı bağlantıları yönetir.

### Gerçek Zamanlı Güncellemeler

WebSocket, **Socket.IO** ile entegrasyon sağlanmıştır. Bu sayede bir kullanıcının gerçekleştirdiği herhangi bir işlem (görev eklemek, taşımak, silmek gibi) diğer tüm kullanıcılara anında yansır. Backend tarafında WebSocket eventi tetiklendiğinde, frontend tarafı da bu değişikliği dinleyerek kullanıcıya anında güncelleme yapar.

#### Socket Events:
- **taskAdded**: Yeni bir görev eklendiğinde tetiklenir.
- **taskUpdated**: Bir görev güncellendiğinde tetiklenir.
- **taskDeleted**: Bir görev silindiğinde tetiklenir.
- **columnAdded**: Yeni bir sütun eklendiğinde tetiklenir.
- **columnUpdated**: Bir sütun güncellendiğinde tetiklenir.
- **boardUpdated**: Board başlığı gibi genel board bilgileri güncellendiğinde tetiklenir.

---

## API ve WebSocket Endpoints

### API Endpoints

- **POST /users/register**: Kullanıcı kaydı oluşturur.
- **POST /users/login**: Kullanıcı giriş yapar ve JWT token alır.
- **GET /user**: Mevcut kullanıcı bilgisini döner.
- **GET /boards**: Kullanıcının oluşturduğu board'ları döner.
- **POST /boards**: Yeni board oluşturur.
- **PUT /boards/{boardId}**: Board başlığını günceller.
- **DELETE /boards/{boardId}**: Board'ı siler.

### WebSocket Events

- **taskAdded**: Yeni görev ekleme.
- **taskUpdated**: Görev güncelleme.
- **taskDeleted**: Görev silme.
- **columnAdded**: Yeni sütun ekleme.
- **columnUpdated**: Sütun güncelleme.
- **boardUpdated**: Board güncelleme.

---

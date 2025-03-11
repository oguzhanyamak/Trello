import { Injectable } from '@angular/core';
import { CurrentUserInterface } from '../../auth/types/currentUser.interface';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
// Socket.IO bağlantısını yöneten servis sınıfı
export class SocketService {
  // Socket nesnesi (başlangıçta undefined)
  socket: Socket | undefined;

  /**
   * Kullanıcı için Socket.IO bağlantısını başlatan fonksiyon
   * @param currentUser - Mevcut kullanıcı bilgileri (token içerir)
   */
  setupSocketConnection(currentUser: CurrentUserInterface): void {
    // Kullanıcının token'ını kullanarak Socket.IO bağlantısını başlat
    this.socket = io(environment.socketUrl, {
      auth: { token: currentUser.token }, // Kimlik doğrulama için token gönderilir
    });
  }

  /**
   * Socket bağlantısını kesen fonksiyon
   * Eğer bağlantı kurulmamışsa hata fırlatır
   */
  disconnect(): void {
    if (!this.socket) {
      throw new Error("Socket connection is not established");
    }
    this.socket.disconnect();
  }

  /**
   * Belirtilen event'e mesaj gönderen fonksiyon
   * @param eventName - Emit edilecek event ismi
   * @param message - Gönderilecek veri
   */
  emit(eventName: string, message: any): void {
    if (!this.socket) {
      throw new Error("Socket connection is not established");
    }
    this.socket.emit(eventName, message);
  }

// Generic bir listen metodu tanımlanıyor, verilen olay adını dinleyerek Observable<T> döndürüyor.
listen<T>(eventName: string): Observable<T> {
  // Mevcut socket bağlantısını alıyoruz.
  const socket = this.socket;

  // Eğer socket bağlantısı yoksa, hata fırlatıyoruz.
  if (!socket) {
      throw new Error("Socket connection is not established");
  }

  // Yeni bir Observable oluşturuyoruz, bu Observable belirli bir olay adını dinleyerek veri yayınlayacak.
  return new Observable((subscriber) => {
      // Socket belirli bir eventName (olay adını) dinliyor.
      socket.on(eventName, (data) => {
          // Olay tetiklendiğinde gelen veriyi Observable abonelerine iletiyoruz.
          subscriber.next(data);
      });
  });
}


  // Constructor (gerekirse başka işlemler yapılabilir)
  constructor() {}
}


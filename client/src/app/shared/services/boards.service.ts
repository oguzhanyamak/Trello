import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardInterface } from '../types/board.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
// BoardsService sınıfı, board'larla ilgili HTTP isteklerini yöneten servistir.
export class BoardsService {

  // Constructor, HttpClient servisini enjekte eder. Bu servis HTTP isteklerini yapmamıza olanak tanır.
  constructor(private http: HttpClient) { }

  // getBoards metodu, tüm board'ları almak için HTTP GET isteği gönderir.
  getBoards(): Observable<BoardInterface[]> {
    // 'environment.apiUrl' ile API'nın base URL'sini kullanarak '/boards' endpoint'ine istek gönderilir.
    return this.http.get<BoardInterface[]>(environment.apiUrl + '/boards');
  }

  // createBoard metodu, yeni bir board oluşturmak için HTTP POST isteği gönderir.
  createBoard(title: string): Observable<BoardInterface> {
    // POST isteği ile API'ye title'ı içeren bir veri gönderilir.
    // 'environment.apiUrl' ile base URL'yi kullanarak '/boards' endpoint'ine yeni board verisi gönderilir.
    return this.http.post<BoardInterface>(environment.apiUrl + '/boards', { title });
  }

  //Belirtilen board ID'sine göre board bilgisini getirir.
  getBoard(boardId:string):Observable<BoardInterface>{
    return this.http.get<BoardInterface>(`${environment.apiUrl}/boards/${boardId}`);
  }


}

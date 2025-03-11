import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ColumnInterface } from '../types/column.interface';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ColumnInputInterface } from '../types/columnIput.interface';
import { SocketService } from './socket.service';
import { SocketEventsEnum } from '../types/socketEvents.enum';

@Injectable({
  providedIn: 'root',
})
// ColumnsService sınıfı, HTTP isteklerini yönetir ve WebSocket üzerinden olaylar yayınlar.
export class ColumnsService {
  // Constructor içinde HttpClient ve SocketService bağımlılıklarını enjekte ediyoruz.
  constructor(private http: HttpClient, private socketService: SocketService) {}

  /**
   * Belirli bir board (tahta) ID'sine ait sütunları getirir.
   * @param boardId - Alınacak sütunların bağlı olduğu tahta ID'si.
   * @returns Observable<ColumnInterface[]> - Sunucudan gelen sütun verisini içeren bir Observable döndürür.
   */
  getColumns(boardId: string): Observable<ColumnInterface[]> {
    return this.http.get<ColumnInterface[]>(
      `${environment.apiUrl}/boards/${boardId}/columns`
    );
  }

  /**
   * Yeni bir sütun oluşturmak için WebSocket üzerinden bir olay yayınlar.
   * @param columnInput - Yeni oluşturulacak sütunun bilgilerini içeren nesne.
   */
  createColumn(columnInput: ColumnInputInterface): void {
    this.socketService.emit(SocketEventsEnum.columnsCreate, columnInput);
  }
}


import { Injectable } from '@angular/core';
import { TaskInterface } from '../types/task.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { environment } from '../../../environments/environment';
import { TaskInputInterface } from '../types/taskInput.interface';
import { SocketEventsEnum } from '../types/socketEvents.enum';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  // Yapıcı fonksiyon, HttpClient ve SocketService bağımlılıklarını enjekte eder.
  constructor(private http: HttpClient, private socketService: SocketService) {}

  /**
   * Belirli bir board (tahta) ID'sine ait task'ları getirir.
   * @param boardId - Alınacak sütunların bağlı olduğu tahta ID'si.
   * @returns Observable<TaskInterface[]> - Sunucudan gelen task verisini içeren bir Observable döndürür.
   */
  getTasks(boardId: string): Observable<TaskInterface[]> {
    // HTTP isteği ile belirtilen boardId'ye ait task'lar alınır.
    return this.http.get<TaskInterface[]>(
      `${environment.apiUrl}/boards/${boardId}/tasks`
    );
  }

  /**
   * Yeni bir task oluşturmak için WebSocket üzerinden bir olay yayınlar.
   * @param taskInput - Yeni oluşturulacak task bilgilerini içeren nesne.
   */
  createTask(taskInput: TaskInputInterface): void {
    // WebSocket üzerinden yeni task yaratma olayı gönderilir.
    this.socketService.emit(SocketEventsEnum.tasksCreate, taskInput);
  }

  /**
   * Mevcut bir task'ı güncellemek için WebSocket üzerinden bir olay yayınlar.
   * @param boardId - Güncellenmek istenen task'ın bulunduğu tahta ID'si.
   * @param taskId - Güncellenmek istenen task'ın ID'si.
   * @param fields - Güncellenmesi gereken task alanları (başlık, açıklama, kolonID).
   */
  updateTask(
    boardId: string,
    taskId: string,
    fields: { title?: string; description?: string; columnId?: string }
  ): void {
    // WebSocket üzerinden task güncelleme olayı gönderilir.
    this.socketService.emit(SocketEventsEnum.tasksUpdate, {
      boardId,
      taskId,
      fields,
    });
  }

  /**
   * Mevcut bir task'ı silmek için WebSocket üzerinden bir olay yayınlar.
   * @param boardId - Silinecek task'ın bulunduğu tahta ID'si.
   * @param taskId - Silinecek task'ın ID'si.
   */
  deleteTask(boardId: string, taskId: string): void {
    // WebSocket üzerinden task silme olayı gönderilir.
    this.socketService.emit(SocketEventsEnum.tasksDelete, { boardId, taskId });
  }
}

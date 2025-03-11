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

    constructor(private http: HttpClient, private socketService: SocketService) {}
  
    /**
     * Belirli bir board (tahta) ID'sine ait taskları getirir.
     * @param boardId - Alınacak sütunların bağlı olduğu tahta ID'si.
     * @returns Observable<TaskInterface[]> - Sunucudan gelen task verisini içeren bir Observable döndürür.
     */
    getTasks(boardId: string): Observable<TaskInterface[]> {
      return this.http.get<TaskInterface[]>(
        `${environment.apiUrl}/boards/${boardId}/tasks`
      );
    }
  
    /**
     * Yeni bir task oluşturmak için WebSocket üzerinden bir olay yayınlar.
     * @param columnInput - Yeni oluşturulacak task bilgilerini içeren nesne.
     */
    createTask(taskInput: TaskInputInterface): void {
      this.socketService.emit(SocketEventsEnum.tasksCreate, taskInput);
    }
}

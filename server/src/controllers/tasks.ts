import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import TaskModel from "../models/task";
import { SocketEventsEnum } from "../types/socketEnums.enum";
import { getErrorMessage } from "../helper";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";

export const getTasks = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const tasks = await TaskModel.find({ boardId: req.params.boardId });
    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  io: Server,
  socket: Socket,
  data: { boardId: string; title: string; columnId: string }
) => {
  try {
    // Eğer kullanıcı kimliği doğrulanmamışsa, hata mesajı gönderilir.
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksCreateFailure, // Görev oluşturma başarısızlık mesajı
        "User is not Authorized" // Hata mesajı
      );
      return; // Yetkisiz kullanıcı olduğunda fonksiyon durdurulur.
    }

    // Yeni bir görev nesnesi oluşturulur. Kullanıcı kimliği, boardId ve kolonId verileri de görevle birlikte kaydedilir.
    const newTask = new TaskModel({
      title: data.title, // Görev başlığı
      boardId: data.boardId, // Board kimliği
      userId: socket.user.id, // Kullanıcı kimliği
      columnId: data.columnId, // Kolon kimliği
    });

    // Yeni görev veritabanına kaydedilir.
    const savedTask = await newTask.save();

    // Yeni görev başarıyla kaydedildikten sonra, ilgili boardId'ye sahip tüm kullanıcılara görev oluşturma başarı mesajı gönderilir.
    io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess, savedTask);
  } catch (error) {
    // Eğer bir hata oluşursa, hata mesajı kullanıcıya iletilir.
    socket.emit(SocketEventsEnum.tasksCreateFailure, getErrorMessage(error));
  }
};

export const updateTask = async (
  io: Server,
  socket: Socket,
  data: {
    boardId: string;
    taskId: string;
    fields: { title?: string; description?: string; columnId?: string };
  }
) => {
  try {
    // Eğer kullanıcı kimliği doğrulanmamışsa, hata mesajı gönderilir.
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksUpdateFailure, // Hata durumu mesajı
        "User is not authorized" // Hata mesajı
      );
      return; // Yetkisiz kullanıcı olduğunda fonksiyon durdurulur.
    }

    // TaskModel üzerinde taskId'ye göre görev güncellenir. Yeni görev verisi döndürülür.
    const updatedTask = await TaskModel.findByIdAndUpdate(
      data.taskId, // Güncellenmek istenen görev kimliği
      data.fields, // Güncellenmesi gereken alanlar
      { new: true } // Güncellenen görev verisini döndür
    );

    // Görev başarıyla güncellenir ve ilgili boardId'ye sahip tüm kullanıcılara bildirim gönderilir.
    io.to(data.boardId).emit(SocketEventsEnum.tasksUpdateSuccess, updatedTask);
  } catch (err) {
    // Eğer bir hata oluşursa, hata mesajı kullanıcıya iletilir.
    socket.emit(SocketEventsEnum.tasksUpdateFailure, getErrorMessage(err));
  }
};

export const deleteTask = async (
  io: Server, // Sunucu nesnesi
  socket: Socket,
  data: { boardId: string; taskId: string } // Görev silme işleminde kullanılacak veriler
) => {
  try {
    // Eğer kullanıcı kimliği doğrulanmamışsa, hata mesajı gönderilir.
    if (!socket.user) {
      socket.emit(
        SocketEventsEnum.tasksDeleteFailure, // Hata durumunda başarısızlık mesajı gönderilir.
        "User is not authorized" // Hata mesajı
      );
      return; // Yetkisiz kullanıcı olduğunda fonksiyon durdurulur.
    }

    // Görev silme işlemi yapılır. TaskModel'den belirtilen taskId ile eşleşen görev silinir.
    await TaskModel.deleteOne({ _id: data.taskId });

    // Görev başarıyla silindiğinde, ilgili boardId'ye sahip tüm kullanıcılara bildirim gönderilir.
    io.to(data.boardId).emit(SocketEventsEnum.tasksDeleteSuccess, data.taskId);
  } catch (err) {
    // Eğer bir hata oluşursa, hata mesajı socket üzerinden kullanıcıya iletilir.
    socket.emit(SocketEventsEnum.tasksDeleteFailure, getErrorMessage(err));
  }
};

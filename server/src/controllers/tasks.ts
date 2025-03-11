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


export const createTask = async (io:Server ,socket:Socket ,data:{boardId:string;title:string,columnId:string}) => {
    try {
        if(!socket.user){
            socket.emit(SocketEventsEnum.tasksCreateFailure,"User is not Authorized");
            return;
        }
        const newTask = new TaskModel({title:data.title,boardId:data.boardId,userId:socket.user.id,columnId:data.columnId});
        const savedTask = await newTask.save();
        io.to(data.boardId).emit(SocketEventsEnum.tasksCreateSuccess,savedTask);
    } catch (error) {
        socket.emit(SocketEventsEnum.tasksCreateFailure,getErrorMessage(error))
    }
}

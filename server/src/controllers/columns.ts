import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../types/expressRequest.interface";
import ColumnModel from "../models/column";
import { Server } from "socket.io";
import { Socket } from "../types/socket.interface";
import { SocketEventsEnum } from "../types/socketEnums.enum";
import { getErrorMessage } from "../../src/helper";
export const getColumns = async (req: ExpressRequestInterface,res: Response,next: NextFunction): Promise<any> => {
  try {
    // Eğer kullanıcı kimlik doğrulaması yapmamışsa (req.user boşsa), 401 Unauthorized döner.
    if (!req.user) {
      return res.sendStatus(401); // Kullanıcı doğrulaması yoksa, 401 hatası döner.
    }
    const columns = await ColumnModel.find({ boardId: req.params.boardId });
    res.send(columns);
  } catch (err) {
    // Eğer bir hata oluşursa, error'ı bir sonraki middleware'e iletir.
    next(err);
  }
};


export const createColumn = async (io:Server ,socket:Socket ,data:{boardId:string;title:string}) => {
    try {
        if(!socket.user){
            socket.emit(SocketEventsEnum.columnsCreateFailure,"User is not Authorized");
            return;
        }
        const newColumn = new ColumnModel({title:data.title,boardId:data.boardId,userId:socket.user.id});
        const savedColumn = await newColumn.save();
        io.to(data.boardId).emit(SocketEventsEnum.columnsCreateSuccess,savedColumn);
    } catch (error) {
        socket.emit(SocketEventsEnum.columnsCreateFailure,getErrorMessage(error))
    }
}

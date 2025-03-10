import { UserDocument } from "./user.interface"
import {Socket as SocketIoSocket} from "socket.io"

export interface Socket extends SocketIoSocket {
    user? : UserDocument
}
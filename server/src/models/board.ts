import { model, Schema } from "mongoose";
import { BoardDocument } from "../types/board.interfaces";

const boardSchema = new Schema<BoardDocument>({
    title:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        required:true
    },

});

export default model<BoardDocument>('Board',boardSchema);
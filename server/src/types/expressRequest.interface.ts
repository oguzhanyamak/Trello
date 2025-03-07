import { Request } from "express";
import { UserDocument } from "./user.interface";

// Express'in Request nesnesini genişleterek `user` özelliğini ekliyoruz
export interface ExpressRequestInterface extends Request {
    user?: UserDocument; // `user` özelliğini opsiyonel (`?`) olarak tanımlıyoruz
}

/*
Express'in varsayılan Request tipinde user özelliği yoktur.
Middleware içinde req.user eklemek istiyoruz ancak TypeScript hata verir.
Bu özel arayüzü ekleyerek TypeScript'e req.user özelliğinin olabilmesini sağlıyoruz
*/
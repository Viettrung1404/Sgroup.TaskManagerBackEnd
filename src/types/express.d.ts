// Chúng ta đang khai báo để mở rộng một module đã có sẵn
declare namespace Express {
    export interface Request {
        user?: {
            userId: string;
            roles?: string[];
            permissions?: string[];
            [key: string]: any;
        };
    }
}

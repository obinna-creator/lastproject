import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
interface CustomRequest extends Request {
  user: {
    userId: number;
    clientId: number;
    };
    prisma: PrismaClient
}

export default CustomRequest;
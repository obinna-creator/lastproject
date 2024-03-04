// import express, { Request, Response } from 'express';
// import bodyParser from 'body-parser';
// import { PrismaClient } from '@prisma/client';
// import nodemailer from 'nodemailer';
// import { format } from 'date-fns';
// import cron from 'node-cron';

// const app = express();
// const port = 3000;

// // Initialize Prisma client
// const prisma = new PrismaClient();

// // Middleware
// app.use(bodyParser.json());

// // Schedule email notification for the appointment
// export function scheduleEmailNotification(clientEmail: string, appointmentDate: Date): void {
//     // For simplicity, let's assume we're scheduling the email to be sent 1 hour before the appointment
//     const notificationDateTime = new Date(appointmentDate.getTime() - 1 * 60 * 60 * 1000); // 1 hour before appointment
//     // Here you can use node-cron or any other scheduler library to schedule the email notification
//     // For demonstration purpose, we'll just log the scheduled time
//     console.log(`Email notification scheduled for ${notificationDateTime.toISOString()} for client ${clientEmail}`);
// }

// // Create and schedule a new appointment
// export async function createAndScheduleAppointment(req: Request, res: Response) {
//     const { clientId, clientEmail, appointmentDateTime,clientName ,description} = req.body;

//     try {
//         // Create a new appointment record
//         const appointment = await prisma.appointment.create({
//             data: {
//                 clientId,
//                 appointmentDateTime,
//                 clientName ,
//                 description,
//                 clientEmail
//             }
//         });

//         // Schedule email notification for the appointment
//         scheduleEmailNotification(clientEmail, appointmentDateTime);

//         res.status(200).json({ message: 'Appointment scheduled successfully' });
//     } catch (error) {
//         console.error('Error scheduling appointment:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }
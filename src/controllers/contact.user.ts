import { Request, Response } from 'express';
import { User,PrismaClient } from '@prisma/client';
import {getUserById,getOneClient, createContact, } from '../db/users.db';
//import CustomRequest from '../controllers/interface.contact'
import nodemailer from 'nodemailer';
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();


export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phoneNumber, description } = req.body;

 

    // Assuming you have authenticated user and client ID
    const userId = parseInt(req.params.UserID, 10)
    await getUserById(userId)
    const clientId = parseInt(req.params.ClientID,10)
            await getOneClient(clientId)

    await createContact(name, email, phoneNumber, description, clientId, userId);

    // Sending email
    await sendEmail(email, name, description);

    res.status(200).send('Contact request submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

const sendEmail = async (recipient: string, name: string, description: string): Promise<void> => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: "obinnpatrick301@gmail.com", // Replace with your Gmail address
      pass: "kube ragg uwnu ykmf"// Replace with your Gmail password
    },
    debug: true 

  });

  // Email options
  const mailOptions = {
    from: "obinnpatrick301@gmail.com",
    to: recipient,
    subject: 'New Contact Request',
    text: `Hello ${name},\n\nYou have received a new contact request:\n\n${description}\n\nBest regards,\nYour Application`
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

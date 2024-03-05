import express, { NextFunction, Request, Response } from "express";

import { PrismaClient } from '@prisma/client';
import { readXlsxFile } from "read-excel-file"
const prisma = new PrismaClient();
import * as  exceljs from "exceljs"

import {
  getAllUsers,
  getUserByEmail,
  createUser,
  comparePassword,
  getUserById,
  jwtverify,
  verification,
  createNewToken,
  updateUserPassword,
  updateUserToken,
  destroyToken,
  createClientManually,
  createClientBatchUpload,
  getAllClients,
  getOneClient,
  getClientByLastname,
  getClientByFirstname,
  
  deleteClientById ,
getDeletedClientById,
geteverydeletedclient ,
uploadBlogPost
  
} from "../db/users.db";
import * as jwt from "jsonwebtoken";

import { hashSync, compareSync } from "bcrypt";

import { sendEmail } from "../middleware/nodemailer";
import { error } from "console";




export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json(users);
  } catch (err: any) {
    console.log(err);
    return res.sendStatus(400).json({ status: "false", message: err.message });
  }
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password, legalFirmName } = req.body;

  try {
    if(!email || !password || !legalFirmName){
      res.status(400).json("one or more input fields are empty")
    }
    let user = await getUserByEmail(email);

    if (user) {
      throw new Error("User already exists");
    }

    //sign the user
    // Create the user
    user = await createUser(legalFirmName, password, email);



    const subject = 'Email Verification'
    //jwt.verify(token, process.env.secret)
    const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${user.UserID}/${user.Token}`
    const html = `<a href="${link}">Click here to verify your email</a>`;
    sendEmail({
        email: user.Email,
        html,
        subject
    })

    // Send a response indicating success
    return res.status(200).json(user);
  } catch (err: any) {
    // Handle errors
    console.error(err);
    // Send an error response
    return res.status(400).json({ status: false, message: err.message });
  }
};

//verify email function

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID, 10);
    const token = req.params.Token;

    // Get the intended user by id
    const user = await getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verify the token after getting the user ID
    await jwtverify(token);

    // If the verification was successful, update the user's isVerified status
    const updatedUser = await verification(user.UserID, true);

   if(updatedUser.isVerified ===true){
    return res.status(200).send("<h1>You have been successfully verified. Kindly visit the login page.</h1>");

   }
//write the function if there is error in verifying the token
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token expiration
      const userId = parseInt (req.params.UserID, 10);
      const updateUser = await getUserById(userId)
      
      if (updateUser) {
        // Create a new token for the user
        const newToken = await createNewToken({ email: updateUser.Email });
  
        // Update the user's token with the new one
        updateUser.Token = newToken;
      // Save the updated user with the new token
      const savedUser = await updateUserPassword(updateUser.UserID, newToken);

      const link = `${req.protocol}://${req.get('host')}/api_v1/verify/${updateUser.UserID}/${updateUser.Token}`;
      console.log(link)
      sendEmail({
        email: updateUser.Email,
        html: `<a href="${link}">Click here to verify your email</a>`,
        subject: "RE-VERIFY YOUR ACCOUNT"
      });
      return res.status(401).send("<h1>This link is expired. Kindly check your email for another email to verify.</h1>");

    }  else {
      return res.status(500).json({
        message:error.message,
      });
    }
  }

    }


  }


  export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      const existingUser = await getUserByEmail(email);
      if (!existingUser) {
        throw new Error(`User ${email} does not exist`);
      }
  
      if (!compareSync(password, existingUser.Password)) {
        throw new Error(`Incorrect Password ${password}`);
      }
  
      // Create a token for the logged-in user
      const token = await createNewToken({ email: existingUser.Email, id: existingUser.UserID });
  
      // Assign the token to the existingUser's Token property
      existingUser.Token = token;
  
      // Update the user record in the database with the new token
      await updateUserToken(existingUser.UserID, token)
   
      if(existingUser.isVerified === true){
        res.status(200).json({
          message: `welcome!, ${existingUser.Username}`,
          data:existingUser,
        })
      }
      else{
        res.status(400).json("sorry, you are not verified yet!. check email for verification link")
      }
  
    } catch (err: any) {
      return res.status(400).json({ status: false, message: err.message });
    }
  };
  

export const forgotPassword = async (req: Request, res: Response) => {
  const { email} = req.body;
  try {
    // Check if the User exists
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      throw new Error(`User ${email} does not exist`);
    }

    //after this, send the user a reset password link
    else{
      const link = `${req.protocol}://${req.get('host')}/api_v1/reset/${existingUser.UserID}`;
      console.log(link)
      sendEmail({
        email: existingUser.Email,
        html: `<a href="${link}">Click here to reset your password</a>`,
        subject: "PASSWORD RESET"
      });

    }
    return res.status(200).json({
      message:"kindly check your email to reset your password"
    })

  }catch(error){
     res.status(500).json(error)
  }
}
//after this, write a fuction that resets the password itself

export const resetPassword = async(req:Request, res:Response)=>{
  try {
    const userId = parseInt(req.params.UserID, 10)
  const {newPassword, confirmPassword} = req.body
  if(!newPassword || !confirmPassword){
   return res.status(400).json("password and confirmPassword can't be empty!")
  }

  if(newPassword !== confirmPassword){
    return res.status(400).json("passwords do not match")
  }
  //after this, hash the password
  await updateUserPassword(userId, newPassword)
   const hashedPassword = hashSync(newPassword, 10);

  return res.status(200).json({message:"your password has been reset successfully", })
  } catch (error) {
    res.status(500).json({error:"failed to reset password"} )
  }
  
}


//function to sign out the user... 
export const signOut = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID, 10);
   
    // Get user by id
    const user = await getUserById(userId);
    if (!user) {
      return res.status(400).json("User doesn't exist");
    }

    // Check if the user's token is already null or not a string
    if (user.Token === "") {
      // Respond with a message indicating that the user is already signed out
      return res.status(400).json({ message: 'User is already signed out' });
    }

    // Update user's token to an empty string
    await destroyToken(userId);

    // Respond with success message
    return res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    // Handle errors
    console.error('Error signing out user:', error);
    return res.status(500).json(error);
  }
};




//create a client manually

// export const createClientController = async (req: Request, res: Response) => {
//   try {
//     const userId = parseInt(req.params.UserID); // Extract userId from URL params

//     // Get the authenticated user
//     const authenticatedUser = await getUserById(userId);

//     // Check if user is authenticated
//     if (!authenticatedUser) {
//       return res.status(403).json("Forbidden"); // Send forbidden response if user is not authenticated
//     }

//     // Check if userId from URL params matches authenticated user's ID
//     if (userId !== authenticatedUser.UserID) {
//       return res.status(403).json("Forbidden"); // Send forbidden response if userId doesn't match authenticated user's ID
//     }

//     // Extract client and case data from request body
//     const { firstname, lastname, contactNumber, email, address, caseName, caseDescription, caseStatus, assignedUserId } = req.body;

//     // Call createClient function to create a new client
//     const newClient = await createClient(userId, firstname, lastname, contactNumber, email, address, caseName, caseDescription, caseStatus, assignedUserId);

//     // Respond with the created client
//     res.status(201).json(newClient);
//   } catch (error) {
//     console.error('Error creating client:', error);
//     res.status(500).send('Internal server error');
//   }
// };



//function to download excel sheet from the server for the batch upload

// Endpoint for downloading the Excel template

export const downloadTemplateController = (req: Request, res: Response) => {
  try {
    // Create Excel workbook
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Clients');

    // Add headers to the worksheet
    worksheet.addRow(['FirstName', 'LastName', 'ContactNumber', 'Email', 'Address', 'CaseName', 'CaseDescription', 'CaseStatus', 'AssignedUserID']);

    // Send the Excel file as a response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="client_template.xlsx"');
    workbook.xlsx.write(res)
      .then(() => {
        res.status(200).end();
      });
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).send('Internal server error');
  }
};




export const ClientBatchUpload = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.UserID, 10);
  const assignedUserId = parseInt(req.params.AssignedUserID)

  try {
    // Check if user is authenticated
    const user = await getUserById(userId);
    if (!user) {
      return res.status(403).json("Forbidden");
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new exceljs.Workbook();

    // Read the Excel file from memory
    await workbook.xlsx.load(req.file.buffer);

    // Get the first worksheet
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new Error("Worksheet not found");
    }

    // Initialize row array
    const clientsData: any[] = [];

    // Iterate through each row in the worksheet and push to clientsData
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        clientsData.push(row.values);
      }
    });

    // Save data to database
    await Promise.all(clientsData.map(async (row: any[]) => {
      const [_, FirstName, LastName, ContactNumber, EmailObj, Address, Gender, CaseName] = row;

      // Extracting email from the object
      const Email = typeof EmailObj === 'object' && EmailObj.text ? EmailObj.text : '';

      await createClientBatchUpload(userId, FirstName, LastName, ContactNumber, Email, Address, Gender, CaseName, assignedUserId);
    }));

    res.status(200).json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



//get all clients

export const createClient = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.UserID,10); // Extract userId from URL params

    // Get the authenticated user
    const authenticatedUser = await getUserById(userId);

    // Check if user is authenticated
    if (!authenticatedUser) {
      return res.status(403).json("Forbidden"); // Send forbidden response if user is not authenticated
    }

    // Check if userId from URL params matches authenticated user's ID
    if (userId !== authenticatedUser.UserID) {
      return res.status(403).json("Forbidden"); // Send forbidden response if userId doesn't match authenticated user's ID
    }

    // Extract client and case data from request body
    const { firstname, lastname, contactNumber, email, address, Gender, caseName} = req.body;

    // Call createClientManually function to create a new client
    const newClient = await createClientManually(userId, firstname, lastname, contactNumber, email, address, Gender, caseName,userId);

    // Respond with the created client
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).send('Internal server error');
  }
};

export const get_One_Client = async (req: Request, res: Response) => {
  try {
    
    const clientIds = parseInt(req.params.ClientID)
    const client = await getOneClient(clientIds)
    const getyourClient= (clientId: number) => prisma.client.findUnique({
  where: {
    ClientID:clientId
  }
})
    if (!client) {
      res.status(404).json({
        status: false,
        message:error.name 

          })
        }
        res.status(200).json({
          status: true,
          message: `gotten retrieved successfully`,
          client:client
        })
  } catch (error:any) {
    res.status(500).json({
      message:error.message
    })
  }
}
     
export const getAlltheClients = async( req:Request,res:Response)=>{
  try {
    const userId = parseInt(req.params.UserID)
    const user= await getUserById(userId)
    if (!user) {
       res.status(403).json("forbidden")
     }

    const getClients = await getAllClients(userId)
    if (!getClients) {
      return res.status(401).json({
        status: false,
        message:"No clients found"
     })
    } 
    return res.status(200).json({
      status:true,
      data:getClients
    })
  } catch(error:any){
   return res.status(500).json({
      status:false,
      message:error.message
    })
  }
    
  }
  


export const getclientbylastname = async(req:Request, res:Response)=>{
  try {
    const {lastname}= req.body
    const getlastname= await getClientByLastname(lastname)
    res.status(200).json({
      message: `this is client lastname ${lastname}`,
      getlastname
    })


  } catch (error:any) {
    res.status(500).json({
      message:error.message
    })
  }

}

export const getclientbyfirstname = async (req: Request, res: Response) => {
  try {
    
    const { firstname } = req.body
    const getfirstname = await getClientByFirstname(firstname)
    res.status(200).json({
      message: ` this is client firstname ${firstname}`,
      getfirstname
    })
 
  } catch (error: any) {
    res.status(500).json(error.message)
  }
}

// export const deleteAllClient = async(req:Request, res:Response)=>{
//   try {
//     const  deleteall = await deleteAllClients()

//     res.status(200).json({
//       message:"all client deleted successfuly",
//       deleteall
//     })
//   } catch (error:any) {
//     res.status(500).json({
//       message:error.message
//     })
//   }
// }

export const deleteOneclient = async(req:Request,res:Response)=>{
  try {
    
    const clientId = parseInt(req.params.ClientID)
    //check if the client exists in the database
       const client= await getOneClient(clientId)
       if (!client) {
        return res.status(404).json({ message: "Client not found" });
       }
    const deletedClient= await deleteClientById(clientId)
  res.status(200).json({
    message: `this is the deleted client `,
    deletedClient
  }) 


  } catch (error:any) {
     res.status(500).json({
      message:error.message
     })
  }
}


export const getOnedeletedclient= async(req:Request, res:Response)=>{
  try {
    const RetrievId= parseInt(req.params.clientId)
    const Retrieveoneclient= await getDeletedClientById(RetrievId)
    res.status(200).json({
      message:`client ${Retrieveoneclient} sucessfully`
    })
  } catch (error:any) {
    res.status(500).json({
      message:error.message
    })
  }
}


export const getAllthedeletedclient  = async (req: Request, res: Response) => {
  try {
    const deletedClients = await geteverydeletedclient (); // No need to pass req and res here

    res.status(200).json(deletedClients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve deleted clients" });
  }
};






// Handle upload request

export const blogposthandleUpload = async (req: Request, res: Response, ) => {
  try {
    
  await uploadBlogPost(req, res);
  
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).send('Internal server error');
  }
};




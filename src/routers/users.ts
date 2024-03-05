import express, { Request, Response } from "express";
import multer from 'multer';
// Define storage settings for multer
const storage = multer.memoryStorage();

// Initialize multer with the storage settings
const upload = multer({ storage: storage });
// import upload from "../config/multer.config";
import {
  getAllUsersController,
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  verifyEmail,
  signOut,
  ClientBatchUpload,
  downloadTemplateController,
  createClient,
  get_One_Client,
   getAlltheClients,
  getclientbylastname,
  getclientbyfirstname,
  //deleteAllClient,
  deleteOneclient,
  getAllthedeletedclient,
  getOnedeletedclient,
  blogposthandleUpload,
 



} from "../controllers/user.controller";

import { handleValidationErrors, validateUserRegistration } from "../validator/validator";
import{submitContactForm}  from "../controllers/contact.user"
//import {createAndScheduleAppointment} from "../controllers/user.appointment"
  //import{getAlltheDeletedClients} from "../db/users.db"
// import { updateUser } from "../db/users.db";

export default (router: express.Router) => {
  router.get("/users", getAllUsersController)

  router.post("/signup",validateUserRegistration,handleValidationErrors, signUp);
  router.post("/login",  signIn);
  router.get("/verify/:UserID/:Token", verifyEmail)
  router.post("/forgotPassword", forgotPassword)
  router.put("/reset/:UserID", resetPassword)
  router.get("/signout/:UserID/:Token", signOut)
  router.get("/download-template/:UserID", downloadTemplateController),
  router.post("/upload-Template/:UserID/:AssignedUserID",upload.single("file"),ClientBatchUpload )
  // router.post("/appointment",createAndScheduleAppointment)
  router.post("/createNewClient/:UserID",createClient )
  router.get("/get_allclient/",getAlltheClients)
   router.get("/get_One_Client/:ClientID",get_One_Client)
  router.get("/get_client_by_lastname",getclientbylastname)
  router.get("/get_client_by_firtsname", getclientbyfirstname )
 //router.delete("/delete_all_client",deleteAllClient)
  router.delete("/delete_One_Client/:ClientID",  deleteOneclient )
  router.get("/retrieve_one_deleted_client/:ClientID", getOnedeletedclient)
 router.get("/retrieve_all_deleted_client",  getAllthedeletedclient )
  router.post("/blog_post/:UserID", blogposthandleUpload)
  router.post("/contact/:UserID/:ClientID",submitContactForm)
  }

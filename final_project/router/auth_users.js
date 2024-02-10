import express from "express";
import jwt from "jsonwebtoken";
import books from "./booksdb.js";

// rutas que acceden usuarios autorizados /the routes which an authorized user can access.
const regd_users = express.Router();

export let users = [];

export const isValid = (username)=>{ //returns boolean
 //write code to check is the username is valid
 let userNameSame= users.filter((user)=>{
   return user.username === username
 })
 if(userNameSame.length > 0){
   return true;
 } else {
   return false;
 }
}

regd_users.post("/register", (req,res) => {
  const {username, password} = req.body;
  const userNew = {"username": username, "password": password} 
  if(username && password && username != " " && password != " "){// verifica si se ingreso data
    if(isValid(username)){ //nombre usuario ya existe 
      return res.status(404).json({message: "User already exists!"});
    }else{
      users.push(userNew)
      res.send(JSON.stringify(users))
      return
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

const authenticatedUser = (username, password) => {
  // Verifica si existe un usuario con el nombre de usuario y la contraseña proporcionados
  const userMatch = users.find(user => user.username == username && user.password == password);
  // Si userMatch es undefined, no se encontró ningún usuario que coincida
  return userMatch !== undefined;
}
//only registered users can login
regd_users.post("/login", (req,res) => {
  const {username, password} = req.body
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username, password)) {
   const accessToken = jwt.sign({"data": password}, 'access');
   req.session.accessToken = accessToken;
   req.session.username = username;
   res.status(200).send("User successfully logged in!" +"------ "+ "your data: "+ JSON.stringify(req.session));
   return
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
 }
});
regd_users.get("/get", (req, res) => {
  const dato = JSON.stringify(req.session);
  res.send('El dato almacenado en la sesión es: ' + dato );
})

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const {review} = req.body;
  const book = books[isbn];
  const  {username} =  req.session;
  if (!review) { //Verifica haya una review
    return res.status(404).json({message: "provide a review"});
  }
  if (!book) { //Verifica que el isbn exista
    return res.status(404).json({message: "Invalid isbn. Check the number"});
  }
  if(!username){ //Verificar que este logeado
    return res.status(401).json({ message: "Unauthorized. Please log in." })
  }
  const bookReview = book.reviews
  const existingReview = bookReview.find((objet) => objet.username == username)
    if(existingReview){ //Verificar si el usuario tiene review, modifica sino crea
      existingReview.review = review;
      return res.send("Un exito actualizado"+ JSON.stringify(book))
   } else{
    bookReview.push({ username, review });
      return res.send("Un exito creado"+ JSON.stringify(book))

  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const {isbn} = req.params;
  const book = books[isbn];
  const  {username} =  req.session;
  const bookReview = book.reviews
  const reviewIndex = bookReview.findIndex((objet) => objet.username == username) //encontrar indice
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  if(!username){ 
    return res.status(401).json({ message: "Unauthorized. Please log in." })
  }
  if(reviewIndex >= 0) { 
    bookReview.splice(reviewIndex, 1) //elimina uno por el indice dado
    return res.status(200).json({ message: "Review deleted", book });
  }
})

export default regd_users


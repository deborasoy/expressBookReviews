import express, { json } from "express";
import books from "./booksdb.js";
import axios from "axios"

//rutas que pueden acceder los usuarios generales / the routes which a general user can access.

const public_users = express.Router();

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Enviar la lista de libros como respuesta
    return res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de libros' });
  }
});

// Get book details based on ISBN/ codigo identificador del libro 
//ahora esta por el numero que identifica el libro en el objeto 
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const  { isbn } =  req.params;
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error al obtener el libro por ISBN' });
  }
 });
  
// Get book details based on author or title/ tanto las dos condiciones como por uno u otro
public_users.get('/books', async function (req, res) {
  try {
    const { title, author } = req.query;

    let filteredBooks = Object.values(books); //retorna un array sin las claves del objeto, solo los valores
    // Filtrar por título si se proporciona
    if (title) {
      filteredBooks = filteredBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    }
    // Filtrar por autor si se proporciona
    if (author) {
      filteredBooks = filteredBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    }
    return res.json(filteredBooks);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de libros' });
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  try {
    const  { isbn } =  req.params;
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book.reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el libro por ISBN' });
  }
});

export default public_users
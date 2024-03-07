const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// In-memory storage for the library
let library = [];

// Middleware to parse JSON in the request body
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// POST method to add a book to the library
app.post("/addBook", (req, res) => {
  try {
    const { book } = req.body;

    if (!book || typeof book !== "string") {
      throw new Error("Invalid book title");
    }

    if (library.includes(book)) {
      throw new Error("Duplicate book title");
    }

    library.push(book);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE method to remove a book from the library
app.delete("/removeBook", (req, res) => {
  try {
    const { book } = req.body;

    if (!book || typeof book !== "string") {
      throw new Error("Invalid book title");
    }

    const index = library.indexOf(book);

    if (index === -1) {
      throw new Error("Book not found");
    }

    library.splice(index, 1);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PATCH method to update the name of an existing book
app.patch("/updateBook", (req, res) => {
  try {
    const { original_book, new_book } = req.body;

    if (
      !original_book ||
      typeof original_book !== "string" ||
      !new_book ||
      typeof new_book !== "string"
    ) {
      throw new Error("Invalid book titles");
    }

    const index = library.indexOf(original_book);

    if (index === -1) {
      throw new Error("Book not found");
    }

    if (library.includes(new_book)) {
      throw new Error("Duplicate book title");
    }

    library[index] = new_book;
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET method to retrieve the full contents of the library
app.get("/getLibrary", (req, res) => {
  try {
    function getBookList(list, index, callback) {
      if (index < list.length) {
        setTimeout(() => {
          callback(list[index]);
          getBookList(list, index + 1, callback);
        }, 100); // Simulating delay with setTimeout
      } else {
        res.json({ library: list.join(", ") });
      }
    }

    getBookList(library, 0, (book) => console.log(book));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT method to simulate asynchronous persistence to a database
app.put("/saveToDatabase", (req, res) => {
  try {
    const responseObj = {};

    function saveItemOnDatabase(name, callback) {
      const startTime = Date.now();
      setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        responseObj[name] = elapsedTime;
        callback();
      }, Math.random() * name.length * 100); // Simulating delay with setTimeout and Math.random
    }

    const savePromises = library.map((book) => {
      return new Promise((resolve) => {
        saveItemOnDatabase(book, resolve);
      });
    });

    // Wait for all save operations to complete
    Promise.all(savePromises).then(() => {
      res.json(responseObj);
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

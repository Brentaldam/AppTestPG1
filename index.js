const express = require("express");
const path = require("path");
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: "postgres://jwxmhdkv:bFnoV1Toj4Sq5Ks41cPh8RWV2X9AyPbu@lallah.db.elephantsql.com/jwxmhdkv",
    ssl: {
        rejectUnauthorized: false
    },
    max: 2
});

console.log("Successful connection to the database");
// Creating the Express server
const app = express();

// Server configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration

// Creating the Books table (Book_ID, Title, Author, Comments)
const sql_create = `CREATE TABLE IF NOT EXISTS Books (
  Book_ID SERIAL PRIMARY KEY,
  Title VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Comments TEXT
);`;


// Starting the server
app.listen(3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

// GET /
app.get("/", (req, res) => {
    // res.send("Hello world...");
    res.render("index");
});

// GET /about
app.get("/about", (req, res) => {
    res.render("about");
});

// GET /data
app.get("/data", (req, res) => {
    const test = {
        titre: "Test",
        items: ["one", "two", "three"]
    };
    res.render("data", { model: test });
});

//GET /books
app.get("/books", (req, res) => {
    const sql = "SELECT * FROM Books ORDER BY Title"
    pool.query(sql, [], (err, result) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("books", { model: result.rows });
    });
});

// GET /edit/5
app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
        // if (err) ...
        res.render("edit", { model: result.rows[0] });
    });
});
// POST /edit/5
app.post("/edit/:id", (req, res) => {
    const id = req.params.id;
    const book = [req.body.title, req.body.author, req.body.comments, id];
    const sql = "UPDATE Books SET Title = $1, Author = $2, Comments = $3 WHERE (Book_ID = $4)";
    pool.query(sql, book, (err, result) => {
        // if (err) ...
        res.redirect("/books");
    });
});

// GET /create
app.get("/create", (req, res) => {
    res.render("create", { model: {} });
});
// POST /create
app.post("/create", (req, res) => {
    const sql = "INSERT INTO Books (Title, Author, Comments) VALUES ($1, $2, $3)";
    const book = [req.body.title, req.body.author, req.body.comments];
    pool.query(sql, book, (err, result) => {
        // if (err) ...
        res.redirect("/books");
    });
});

// GET /delete/5
app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
        // if (err) ...
        res.render("delete", { model: result.rows[0] });
    });
});
// POST /delete/5
app.post("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Books WHERE Book_ID = $1";
    pool.query(sql, [id], (err, result) => {
        // if (err) ...
        res.redirect("/books");
    });
});
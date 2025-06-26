const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
require("dotenv").config();

const con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

con.connect((err) => {
  if (err) {
    console.log("database connection failed : " + err.stack);
    process.exit(1);
  }
  console.log("database connected successfully");
});

router.get("/", (req, res) => {
  res.render("index");
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  con.query(query, [username, password], (error, result) => {
    if (error) return res.status(500).send("Database error");
    if (result.length > 0) {
      res.send("Login successful");
    } else {
      res.send("Invalid username or password");
    }
  });
});

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/add/user", (req, res) => {
  const { name, username, email, password, phone, city, gender } = req.body;
  const hobby = JSON.stringify(req.body.hobby);
  const query =
    "INSERT INTO users(name, username, email, password, phone, city, hobby, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  con.query(
    query,
    [name, username, email, password, phone, city, hobby, gender],
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Insert failed");
      }
      res.redirect("/");
    }
  );
});

module.exports = router;

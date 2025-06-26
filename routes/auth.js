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

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/");
  }
}

router.get("/", (req, res) => {
  res.render("index", { isValid: false, message: "", username: "" });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  con.query(query, [username, password], (error, result) => {
    if (error) return res.status(500).send("Database error");
    if (result.length > 0) {
      req.session.user = result[0];
      res.redirect("/dashboard");
    } else {
      res.redirect("/?error=Invalid credentials");
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

router.get("/dashboard", isAuthenticated, (req, res) => {
  const userData = {
    name: req.session.user.name,
  };
  const userid = req.session.user.id;

  const query = "SELECT * FROM contacts where userid = ?";
  con.query(query, [userid], (err, contacts) => {
    if (err) return res.status(500).send("Database error");
    res.render("index", {
      isValid: true,
      user: userData,
      contacts,
      username: req.session.user.username,
    });
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.get("/add-contact", (req, res) => {
  res.render("addContact");
});

router.post("/add/contact", isAuthenticated, (req, res) => {
  const { name, email = "", phone } = req.body;
  const userid = req.session.user.id;

  const query =
    "INSERT INTO contacts(userid, name, email, phone) VALUES (?, ?, ?, ?)";

  con.query(query, [userid, name, email, phone], (err) => {
    if (err) return res.status(500).send("Error adding contact");
    res.redirect("/dashboard");
  });
});

module.exports = router;

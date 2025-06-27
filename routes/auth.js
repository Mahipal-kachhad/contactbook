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
  const name = req.session.user.name;
  const userid = req.session.user.id;
  const editingId = parseInt(req.query.edit);
  const query = "SELECT * FROM contacts where userid = ?";
  con.query(query, [userid], (err, contacts) => {
    if (err) return res.status(500).send("Database error");
    res.render("index", {
      isValid: true,
      name, 
      contacts,
      username: req.session.user.username,
      editingId: editingId || null,
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

router.get("/delete/contact/:id", (req, res) => {
  const id = req.params.id;
  const query = "delete from contacts where id = ?";
  con.query(query, [id], (err) => {
    if (err) console.log("database err" + err);
    res.redirect("/dashboard");
  });
});

router.post("/update/contact/:id", isAuthenticated, (req, res) => {
  const contactId = req.params.id;
  const { name, email = "", phone } = req.body;
  const query =
    "UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ? AND userid = ?";

  con.query(
    query,
    [name, email, phone, contactId, req.session.user.id],
    (err) => {
      if (err) return res.status(500).send("Error updating contact");
      res.redirect("/dashboard");
    }
  );
});

router.get("/account", isAuthenticated, (req, res) => {
  res.render("manageAccount", { user: req.session.user });
});

router.post("/update-account", isAuthenticated, (req, res) => {
  const { name, email, phone, password } = req.body;
  const userId = req.session.user.id;

  let query, params;
  if (password) {
    query =
      "UPDATE users SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?";
    params = [name, email, phone, password, userId];
  } else {
    query = "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?";
    params = [name, email, phone, userId];
  }

  con.query(query, params, (err) => {
    if (err) return res.status(500).send("Error updating account");

    req.session.user.name = name;
    req.session.user.email = email;
    req.session.user.phone = phone;
    if (password) req.session.user.password = password;

    res.redirect("/account");
  });
});

module.exports = router;

const mysql = require("mysql2");
const path = require("path");
const express = require("express");
const app = express();
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;
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
  console.log("connected to the database.");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "select * from user where username = ? and password = ?";

  con.query(query, [username, password], (error, result) => {
    if (error) return res.status(500).send("database err");
    if (result.length > 0) {
      res.send("login successfull");
    } else {
      res.send("invalid username or password");
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/add/user", (req, res) => {
  const { name, username, email, password, phone, city, gender } = req.body;
  const hobby = JSON.stringify(req.body.hobby);
  const query =
    "insert into users(name, username, email, password, phone, city, hobby, gender) values(?,?,?,?,?,?,?,?)";

  con.query(
    query,
    [name, username, email, password, phone, city, hobby, gender],
    (err) => {
      if (err) console.log(err);
      res.redirect("/");
    }
  );
});

app.listen(port, () => {
  console.log(`server running on http://${process.env.DB_HOST}:${port}`);
});

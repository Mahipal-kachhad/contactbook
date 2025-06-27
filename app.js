const path = require("path");
const express = require("express");
const session = require("express-session");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(session({
  secret: "yourSecretKey123",
  resave: false,
  saveUninitialized: false, 
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

app.listen(port, () => { 
  console.log(`server running on http://${process.env.DB_HOST}:${port}`);
});

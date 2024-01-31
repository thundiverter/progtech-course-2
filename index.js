const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const parser = require("body-parser");

// настройка сервера
const app = express();
app.set("view engine", "ejs");
app.use(express.static('node_modules/bootstrap/dist'));
app.use(parser.urlencoded({extended: true}));
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true
}));

// подключение логики для каждой из ролей
const loginRouter = require("./routes/login");
const waiterRouter = require("./routes/waiter");
const bartenderRouter = require("./routes/bartender");
const adminRouter = require("./routes/admin");
app.use("/", loginRouter);
app.use("/", waiterRouter);
app.use("/", bartenderRouter);
app.use("/", adminRouter);

// 404
app.get("*", (req, res) => res.redirect("/login"));

// запуск сервера
app.listen(3000, () => console.log("Сервер запущен"));
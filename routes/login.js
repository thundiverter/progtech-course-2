const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const router = express.Router();

const database = new sqlite3.Database("./database.db");

// создание таблиц в базе данных
async function initDatabase() {
    // для сотрудников
    database.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL
    )`);
    // для напитков
    database.run(`CREATE TABLE IF NOT EXISTS drinks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        components TEXT,
        price INTEGER NOT NULL
    )`);
    // для заказов
    database.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list TEXT NOT NULL,
        status INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date TEXT NOT NULL
    )`);
    // для компонентов (заказы админа сохраняются сюда)
    database.run(`CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        amount INTEGER NOT NULL
    )`);
    // для меню
    database.run(`CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        drinkid INTEGER NOT NULL
    )`);

    // создаётся аккаунт администратора
    const salt = await bcrypt.genSalt();
    database.run(`INSERT OR IGNORE INTO users (
        username, password, salt, first_name, last_name, role
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
        'admin',
        await bcrypt.hash('password', salt),
        salt,
        'Иван',
        'Иванов',
        'admin'
    ]);
}
initDatabase();

// страница входа в аккаунт
router.get("/login", (req, res) => {
    if (!req.session.data) {
        res.render("login");
    }
    else {
        res.redirect("/");
    }
})
// принятие данных из формы, вход в аккаунт
router.post("/login", (req, res) => {
    database.get(
        "SELECT * FROM users WHERE username = ?",
        req.body.username,
        async (err, row) => {
            // ошибка сервера
            if (err) {
                res.status(500).send("Ошибка сервера: ", err);
            }
            // пользователь не найден
            else if (!row) {
                res.redirect("/?error=user");
            }
            // неправильный пароль
            else if (!await bcrypt.compare(req.body.password, row['password'])) {
                res.redirect("/?error=password");
            }
            else {
                req.session.data = row;
                res.redirect("/");
            }
        }
    )
})

// выход из аккаунта
router.post("/logout", (req, res) => {
    if (req.session.data) {
        req.session.data = undefined;
    }
    res.redirect("/");
})

// вынес повторяющийся код в отдельную функцию
// возвращает клиенту страницу и подставляет передаваемые данные
function renderIndex(res, user, title, view, data) {
    res.render("index", {
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        title: title,
        view: view,
        data: data
    });
}

// главная страница
router.get("/", (req, res) => {
    // если пользователь не вошёл в аккаунт
    if (!req.session.data) {
        database.all("SELECT * FROM menu", async (err, rows) => {
            database.all("SELECT * FROM drinks", async (err2, rows2) => {
                res.render("menu", {
                    menu: rows,
                    drinks: rows2
                })
            })
        })
    }
    // если пользователь вошёл в аккаунт
    else {
        const user = req.session.data;
        let title = "";
        let view = "";
        let data = undefined;
        // в зависимости от роли, будут происходить разные действия
        switch (req.session.data.role) {
            // для официанта
            case "waiter":
                title = "Заказы";
                view = "waiter/orders";
                database.all("SELECT * FROM orders WHERE status != 2", async (err, rows) => {
                    database.all("SELECT * FROM drinks", async (err2, rows2) => {
                        renderIndex(res, user, title, view, {
                            orders: rows,
                            drinks: rows2
                        })
                    })
                })
                break;
            // для бармена
            case "bartender":
                title = "Напитки";
                view = "bartender/drinks";
                database.all("SELECT * FROM drinks", async (err, rows) => {
                    renderIndex(res, user, title, view, rows);
                })
                break;
            // для администратора
            case "admin":
                title = "Пользователи";
                view = "admin/users";
                database.all("SELECT * FROM users ORDER BY username ASC", async (err, rows) => {
                    renderIndex(res, user, title, view, rows);
                })
                break;
        }
    }
})

module.exports = router;
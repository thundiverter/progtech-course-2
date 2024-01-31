const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const router = express.Router();

const database = new sqlite3.Database("./database.db");

// форма для регистрации нового сотрудника
router.get("/new-user", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        res.render("index", {
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            title: "Новый сотрудник",
            view: "admin/new-user",
            data: undefined
        });
    }
    else {
        res.redirect("/");
    }
});

// добавить сотрудника (принятие данных от админа)
router.post("/new-user", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all(`SELECT * FROM users WHERE username = '${req.body.username}'`, async (err, rows) => {
            if (rows?.length != 0) {
                res.redirect("/new-user/?error=user");
                return;
            }
            const salt = await bcrypt.genSalt();
            database.run(
                "INSERT INTO users (username, password, salt, first_name, last_name, role) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    req.body.username,
                    await bcrypt.hash(req.body.password, salt),
                    salt,
                    req.body.first_name,
                    req.body.last_name,
                    req.body.role
                ], () => {
                    res.redirect("/");
                }
            )
        })
    }
    else {
        res.redirect("/");
    }
})

// удалить пользователя
router.post("/delete-user", async (req, res) => {
    database.run(`DELETE FROM users WHERE username = '${req.body.username}'`, () => res.redirect("/"));
})

// страница "меню"
router.get("/menu", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all("SELECT * FROM menu", async (err, rows) => {
            database.all("SELECT * FROM drinks", async (err2, rows2) => {
                res.render("index", {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    title: "Меню",
                    view: "admin/menu",
                    data: {
                        menu: rows,
                        drinks: rows2
                    }
                });
            })
        })
    }
    else {
        res.redirect("/");
    }
});

// страница с формой для добавления напитка в меню
router.get("/add-menu", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all(`SELECT * FROM drinks`, async (err, rows) => {
            res.render("index", {
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                title: "Добавить напиток в меню",
                view: "admin/add-menu",
                data: rows
            });
        })
    }
    else {
        res.redirect("/");
    }
});

// добавить напиток в меню (принятие данных от админа)
router.post("/add-menu", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all(`SELECT * FROM menu WHERE drinkid = ${req.body.drinkid}`, async (err, rows) => {
            if (rows?.length != 0) {
                res.redirect("/add-menu/?error=name");
                return;
            }
            const salt = await bcrypt.genSalt();
            database.run(
                "INSERT INTO menu (drinkid) VALUES (?)",
                [
                    req.body.drinkid
                ], () => {
                    res.redirect("/menu");
                }
            )
        })
    }
    else {
        res.redirect("/");
    }
})

// удалить пользователя
router.post("/delete-menu", async (req, res) => {
    database.run(`DELETE FROM menu WHERE drinkid = '${req.body.drinkid}'`, () => res.redirect("/menu"));
})

// страница "заказ компонентов"
router.get("/components", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all(`SELECT * FROM components ORDER BY id DESC`, async (err, rows) => {
            res.render("index", {
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                title: "Заказ компонентов",
                view: "admin/order-components",
                data: rows
            });
        })
        
    }
    else {
        res.redirect("/");
    }
});

// заказ компонента (принятие данных от админа)
router.post("/add-component", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.run(
            "INSERT INTO components (name, amount) VALUES (?, ?)",
            [
                req.body.name,
                req.body.amount
            ], () => {
                res.redirect("/components");
            }
        )
    }
    else {
        res.redirect("/");
    }
})
// удалить заказ
router.post("/delete-component", async (req, res) => {
    database.run(`DELETE FROM components WHERE id = '${req.body.orderid}'`, () => res.redirect("/components"));
})

// страница "выручка"
router.get("/income", (req, res) => {
    const user = req.session.data;
    if (user?.role == "admin") {
        database.all(`SELECT id, date, SUM(total) AS summa FROM orders WHERE status = 2 GROUP BY date ORDER BY id DESC`, async (err, rows) => {
            res.render("index", {
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                title: "Выручка",
                view: "admin/income",
                data: rows
            });
        })
        
    }
    else {
        res.redirect("/");
    }
});

module.exports = router;
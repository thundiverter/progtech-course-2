const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const router = express.Router();

const database = new sqlite3.Database("./database.db");

// вывод страницы с формой для создания нового напитка
router.get("/new-drink", (req, res) => {
    const user = req.session.data;
    if (user?.role == "bartender") {
        res.render("index", {
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            title: "Новый напиток",
            view: "bartender/new-drink",
            data: undefined
        });
    }
    else {
        res.redirect("/");
    }
});

// добавить напиток (принятие данных от пользователя)
router.post("/new-drink", (req, res) => {
    const user = req.session.data;
    if (user?.role == "bartender") {
        database.all(`SELECT * FROM drinks WHERE name = '${req.body.name}'`, async (err, rows) => {
            if (rows?.length != 0) {
                res.redirect("/new-drink/?error=name");
                return;
            }
            database.run("INSERT INTO drinks (name, components, price) VALUES (?, ?, ?)",
            [
                req.body.name,
                req.body.components,
                req.body.price
            ],
            () => res.redirect("/"));
        })
    }
    else {
        res.redirect("/");
    }
})

// удалить напиток
router.post("/delete-drink", async (req, res) => {
    database.run(`DELETE FROM drinks WHERE name = '${req.body.name}'`, () => res.redirect("/"));
})

// страница "заказы" (чтобы начинать их выполнять)
router.get("/orders", (req, res) => {
    const user = req.session.data;
    if (user?.role == "bartender") {
        database.all("SELECT * FROM orders ORDER BY status ASC", async (err, rows) => {
            database.all("SELECT * FROM drinks", async (err2, rows2) => {
                res.render("index", {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    title: "Заказы",
                    view: "bartender/orders",
                    data: {
                        orders: rows,
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

// начать выполнение заказа
router.post("/start-order", async (req, res) => {
    database.run(`UPDATE orders SET status = 1 WHERE id = '${req.body.orderid}'`, () => res.redirect("/orders"));
})
// отметить как выполненный
router.post("/finish-order", async (req, res) => {
    database.run(`UPDATE orders SET status = 2 WHERE id = '${req.body.orderid}'`, () => res.redirect("/orders"));
})

module.exports = router;
const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const router = express.Router();

const database = new sqlite3.Database("./database.db");

// вывод страницы с формой для создания нового заказа
router.get("/new-order", (req, res) => {
    const user = req.session.data;
    if (user?.role == "waiter") {
        database.all("SELECT * FROM orders", async (err, rows) => {
            database.all("SELECT * FROM drinks", async (err2, rows2) => {
                res.render("index", {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    title: "Новый заказ",
                    view: "waiter/new-order",
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

// добавить напиток (принятие данных от пользователя)
router.post("/new-order", (req, res) => {
    const user = req.session.data;
    if (user?.role == "waiter") {
        const list = req.body.formList;

        database.all("SELECT * FROM drinks", (err, rows) => {
            database.run("INSERT INTO orders (list, status, total, date) VALUES (?, ?, ?, ?)",
            [
                list,
                0,
                JSON.parse(list).reduce( (acc, item) => acc + (rows.find((d) => d.id == item.id).price * item.amount), 0 ),
                `${new Date().getDate().toString().padStart(2, "0")}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}-${new Date().getFullYear()}`,
            ], () => res.redirect("/"));
        });
    }
    else {
        res.redirect("/");
    }
})

// удалить напиток
router.post("/delete-order", async (req, res) => {
    database.run(`DELETE FROM orders WHERE id = '${req.body.orderid}'`, () => res.redirect("/"));
})

module.exports = router;
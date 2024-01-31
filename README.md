## Курсовая работа по дисциплине «Технологии программирования». Сайт для бара

Сайт, написанный в процессе выполнения курсовой работы по дисциплине «Технологии программирования» на тему «Бар».

При разработке были использованы следующие технологии:
* Языки HTML, CSS, JavaScript;
* Фреймворк Bootstrap 5;
* Среда выполнения Node.js (пакеты ``bcrypt``, ``body-parser``, ``boostrap``, ``ejs``, ``express``, ``express-session``, ``sqlite3``);
* База данных SQLite.

### Скриншоты

<img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-main.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-auth.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-admin.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-waiter-1.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-waiter-2.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-bartender-1.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-bartender-2.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-admin-2.png" width="25%" /> <img src="https://github.com/thundiverter/progtech-course-2/blob/main/screenshots/screenshot-admin-3.png" width="25%" />


## Требования

* Node.js

## Установка

Клонируйте репозиторий и установите зависимости.

```
git clone https://github.com/thundiverter/progtech-course-2.git
```

```
npm install
```

## Запуск
Для запуска локального сервера:
```
npm run dev
```
После этого нужно в браузере перейти на [localhost:3000](localhost:3000).

## Начало

По умолчанию создаётся база данных с пустыми таблицами. В таблицу ``users`` (пользователи) автоматически добавляется администратор со следующими данными для входа:
* имя пользователя — ``admin``;
* пароль — ``password``.

Остальные пользователи могут быть зарегистрированы в личном кабинете администратора.

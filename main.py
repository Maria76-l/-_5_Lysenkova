# Блок импорта зависимостей
from flask import Flask, render_template
# Flask       — класс для создания веб-приложения
# render_template — функция для рендеринга HTML-шаблона из папки /templates


# Блок инициализации приложения
app = Flask(__name__)
# Flask(__name__) — создаёт экземпляр приложения; __name__ — имя текущего модуля


# Блок маршрутизации
@app.route("/")
# @app.route('/') — декоратор, который связывает URL-адрес с функцией hello_world
def hello_world():
    return render_template("index.html")
    # return render_template("index.html") — возвращает HTML-шаблон из папки /templates


# Блок запуска приложения
app.run("0.0.0.0")
# app.run("0.0.0.0") — запускает приложение на всех доступных IP-адресах

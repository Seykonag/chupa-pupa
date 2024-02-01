from flask import Flask, render_template, jsonify, request
import sqlite3 as sq


app = Flask(__name__)

database = sq.connect('C://Users/realy/Desktop/Chupa games project/' +
                      'ChupiGames/data/chupa_games.db', check_same_thread=False)
cur = database.cursor()


@app.route('/', methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route('/balanceValue/<int:user_id>', methods=["GET", "POST"])
def balance(user_id):
    result = cur.execute(f"SELECT * FROM profile WHERE user_id='{user_id}'").fetchone()
    return jsonify({"balance": result[1]})


@app.route('/editValue', methods=["GET", "POST"])
def edit():
    data = request.get_json()
    user_id = data[0]
    value = data[1]
    cur.execute("UPDATE profile SET balance = (balance + ?) WHERE user_id == ? ",
                (value, user_id))
    database.commit()
    return {'status': 'ok', 'error': False}


if __name__ == "__main__":
    app.run(debug=True)

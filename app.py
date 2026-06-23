from flask import Flask, request
import sqlite3
from datetime import datetime

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect("analytics.db")
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY,
        timestamp TEXT,
        page TEXT,
        ip_hash TEXT,
        referrer TEXT
    )
    """)

    conn.commit()
    conn.close()

init_db()

@app.route("/visit", methods=["POST"])
def visit():

    data = request.get_json()

    conn = sqlite3.connect("analytics.db")
    c = conn.cursor()

    c.execute("""
    INSERT INTO visits
    (timestamp,page,ip_hash,referrer)
    VALUES (?,?,?,?)
    """,(
        datetime.utcnow().isoformat(),
        data.get("page"),
        "anonymous",
        data.get("referrer")
    ))

    conn.commit()
    conn.close()

    return {"status":"ok"}

if __name__ == "__main__":
    app.run()

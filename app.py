from flask import Flask, jsonify
import os

app = Flask(__name__)

# The version is baked into the image at build time (see Dockerfile).
# This is what lets you SEE the switch happen during a deploy.
VERSION = os.environ.get("APP_VERSION", "v1")

STUDENTS = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"},
]


@app.route("/")
def home():
    return f"App is running — version {VERSION}\n"


@app.route("/students")
def students():
    return jsonify(STUDENTS)


@app.route("/stats")
def stats():
    return jsonify({"version": VERSION, "student_count": len(STUDENTS)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

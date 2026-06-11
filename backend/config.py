import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

Application = Flask(__name__)

CORS(
    Application,
    origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    supports_credentials=True,
)

base_dir = os.path.abspath(os.path.dirname(__file__))
instance_dir = os.path.join(base_dir, "instance")
os.makedirs(instance_dir, exist_ok=True)
database_path = os.path.join(instance_dir, "database.db")
Application.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{database_path.replace('\\', '/')}"
Application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Application.config["SECRET_KEY"] = "nuvo-secret-key-change-in-production"

Database = SQLAlchemy(Application)

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

Application = Flask(__name__)

CORS(Application, origins=["http://localhost:5173"], supports_credentials=True)

Application.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
Application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Application.config["SECRET_KEY"] = "nuvo-secret-key-change-in-production"

db = SQLAlchemy(Application)

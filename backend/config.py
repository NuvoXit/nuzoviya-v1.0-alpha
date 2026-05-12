from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)  

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///nuvo.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "nuvo-secret-key-change-in-production" 

db = SQLAlchemy(app)

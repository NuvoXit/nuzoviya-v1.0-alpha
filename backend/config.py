"""
=============================================================================
Nuzoviya MEDICAL PLATFORM - BACKEND CONFIGURATION
=============================================================================
Module: config.py
Description: Initializes the Flask application instance, Cross-Origin Resource
             Sharing (CORS), and SQLAlchemy database configurations.
=============================================================================
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS


# =============================================================================
# FLASK APPLICATION INITIALIZATION
# =============================================================================

Application = Flask(__name__)


# =============================================================================
# CORS (CROSS-ORIGIN RESOURCE SHARING) CONFIGURATION
# =============================================================================

# Allows requests from Vite / React frontend dev and production servers
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


# =============================================================================
# DATABASE & STORAGE CONFIGURATION
# =============================================================================

# Define base and instance directories for SQLite database storage
base_dir = os.path.abspath(os.path.dirname(__file__))
instance_dir = os.path.join(base_dir, "instance")
os.makedirs(instance_dir, exist_ok=True)

database_path = os.path.join(instance_dir, "database.db")
clean_db_path = database_path.replace("\\", "/")

# SQLAlchemy configurations
Application.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{clean_db_path}"
Application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Application.config["SECRET_KEY"] = "Nuzoviya-secret-key-change-in-production"


# =============================================================================
# DATABASE INSTANCE
# =============================================================================

Database = SQLAlchemy(Application)

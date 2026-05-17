from flask import request, jsonify
from models import Patient, Booking, Login, UserRole
from config import Application, Database


def login_access(Application):

    @Application.route("/login", methods=["POST"])
    def login():
        try:
            data = request.get_json()

            username = data.get("username")
            password = data.get("password")
            role = data.get("role")

            # Check required fields
            if not all([username, password, role]):
                return jsonify({"error": "Missing required fields"}), 400

            # Check user in database
            existing_user = Login.query.filter_by(username=username,password=password,role=role).first()

            # If user exists
            if existing_user:
                return jsonify({"message": "Successfully Logged In"}), 200

            # If user not found
            return jsonify({"error": "Invalid username, password, or role"}), 401

        except Exception as e:
            Database.session.rollback()
            return jsonify({"error": str(e)}), 500
            



# @loginacess.route("/login", methods=["POST"])
# def login():
#     try:
#         data = request.get_json()
#
#         username = data.get("username")
#         password = data.get("password")
#         role = data.get("role")
#
#         # Check required fields
#         if not all([username, password, role]):
#             return jsonify({"error": "Missing required fields"}), 400
#
#         # Check user in database
#         existing_user = Login.query.filter_by(username=username, password=password, role=role).first()
#
#         # Login success
#         if existing_user:
#             # Buyer access
#             if role == "Doctor":
#                 return jsonify({
#                     "message": "Successfully Logged In",
#                     "allowed_pages": [
#                         "http://localhost:5183",
#                         "http://localhost:5183/patient"
#                     ]}), 200
#
#         # Invalid login
#         return jsonify({"error": "Invalid username, password or role"}), 401
#
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"error": str(e)}), 500
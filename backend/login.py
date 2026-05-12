from flask import request, jsonify, session
from flask.views import MethodView
from config import app, db 
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
        }


class LoginView(MethodView):
    def post(self):
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'user')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        user = User.query.filter_by(username=username).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401

        if user.role != role:
            return jsonify({'error': f'Account does not have the "{role}" role'}), 403

        # store in session
        session['user_id'] = user.id
        session['role'] = user.role

        return jsonify({
            'message': f'Welcome, {user.username}!',
            'user': user.to_json(),   # <-- frontend reads role from here
        }), 200


class LogoutView(MethodView):
    def post(self):
        session.clear()
        return jsonify({'message': 'Logged out successfully'}), 200


class RegisterView(MethodView):
    def post(self):
        data = request.json or {}
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'user')

        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400

        if role not in ('user', 'admin', 'guest'):
            return jsonify({'error': 'Invalid role'}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409

        new_user = User(username=username, role=role)
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({'message': 'User registered successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


# register routes
app.add_url_rule('/login',    view_func=LoginView.as_view('login'))
app.add_url_rule('/logout',   view_func=LogoutView.as_view('logout'))
app.add_url_rule('/register', view_func=RegisterView.as_view('register'))

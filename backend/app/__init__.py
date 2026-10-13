# APP INITIALISATION
# Creates the Flask app, registers extensions, and wires up all blueprints

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os


# ─── ENVIRONMENT ──────────────────────────────────────────────────────────────
# load_dotenv reads the .env file and makes its values available via os.getenv
load_dotenv()


# ─── APP SETUP ────────────────────────────────────────────────────────────────
app = Flask(__name__)

# CORS allows the Next.js frontend on port 3000 to make requests to Flask
# supports_credentials=True is required for session cookies to work cross-origin
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# SocketIO enables real-time features — not heavily used yet but wired in early
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

# bcrypt is used for hashing and checking passwords across the auth routes
bcrypt = Bcrypt(app)


# ─── SESSION CONFIG ───────────────────────────────────────────────────────────
# SECRET_KEY signs the session cookie — keep this secret in production
app.config['SECRET_KEY']              = os.getenv('SECRET_KEY', 'dev-secret-key')
# HttpOnly prevents JavaScript from reading the cookie — protects against XSS
app.config['SESSION_COOKIE_HTTPONLY'] = True
# Lax allows the cookie to be sent on same-site navigation but not cross-site
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'


# ─── UTILITY ROUTES ───────────────────────────────────────────────────────────
# Health check — confirms Flask is running
@app.route("/api/health")
def health():
    return {"status": "ok", "message": "Flask is running"}

# Debug route — lists all registered URL rules, useful during development
@app.route("/api/debug/routes")
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append(str(rule))
    return {"routes": routes}


# ─── BLUEPRINTS ───────────────────────────────────────────────────────────────
# Each blueprint is a separate file that handles one feature area
# Importing here rather than at the top avoids circular import errors

from app.routes.auth import auth_bp
app.register_blueprint(auth_bp)

from app.routes.onboarding import onboarding_bp
app.register_blueprint(onboarding_bp)

from app.routes.cart import cart_bp
app.register_blueprint(cart_bp)

from app.routes.caregiver import caregiver_bp
app.register_blueprint(caregiver_bp)

from app.routes.products import products_bp
app.register_blueprint(products_bp)

from app.routes.orders import orders_bp
app.register_blueprint(orders_bp)

from app.routes.wishlist import wishlist_bp
app.register_blueprint(wishlist_bp)

from app.routes.admin import admin_bp
app.register_blueprint(admin_bp)

from app.routes.reviews import reviews_bp
app.register_blueprint(reviews_bp)

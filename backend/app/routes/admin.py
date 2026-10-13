# ADMIN ROUTES
# Handles... sorting out the admin page and rights

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from flask import Blueprint, jsonify, request
from app.db import SessionLocal
from app.models import Product

# ─── BLUEPRINT ────────────────────────────────────────────────────────────────
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/products/<int:id>/verify', methods=['PATCH'])
def verify_product(id):
    db = SessionLocal()
    try:
        data = request.get_json()
        if 'verified' not in data:
            return jsonify({'error': 'missing verified field'}), 400
        product = db.query(Product).filter(Product.id == id).first()

        if product is None:
            return jsonify({'error': 'not found'}), 404
        
        product.is_verified = data['verified']
        db.commit()
        return jsonify({'id': product.id, 'verified': product.is_verified}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()
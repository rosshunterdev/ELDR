# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from flask import Blueprint, request, jsonify
from app.db import SessionLocal
from app.models import WishlistItem, Product


# ─── BLUEPRINT ────────────────────────────────────────────────────────────────
wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/wishlist')


@wishlist_bp.route('/<int:user_id>', methods=['GET'])
def get_wishlist(user_id):
    db = SessionLocal()
    try:
        items = db.query(WishlistItem).filter_by(user_id=user_id).all()
        result = []
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            result.append({
                'id':         item.id,
                'product_id': item.product_id,
                'name':       product.title if product else 'Unknown Product',
                'price':      float(product.price) if product else 0,
                'image':      product.image if product else None
            })
        return jsonify({'wishlist': result}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()


@wishlist_bp.route('/add', methods=['POST'])
def add_wishlist():
    data       = request.get_json()
    user_id    = data.get('user_id')
    product_id = data.get('product_id')

    if not user_id or not product_id:
        return jsonify({'error': 'user_id and product_id are required'}), 400

    db = SessionLocal()
    try:
        new_item = WishlistItem(
            user_id=user_id,
            product_id=product_id
        )
        db.add(new_item)
        db.commit()
        return jsonify({'message': 'Added to wishlist', 'id': new_item.id}), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()


@wishlist_bp.route('/remove', methods=['DELETE'])
def remove_wishlist():
    data       = request.get_json()
    user_id    = data.get('user_id')
    product_id = data.get('product_id')

    if not user_id or not product_id:
        return jsonify({'error': 'user_id and product_id are required'}), 400

    db = SessionLocal()
    try:
        item = db.query(WishlistItem).filter_by(user_id=user_id, product_id=product_id).first()

        if not item:
            return jsonify({'error': 'Wishlist item not found'}), 404

        db.delete(item)
        db.commit()
        return jsonify({'message': 'Removed from wishlist'}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()

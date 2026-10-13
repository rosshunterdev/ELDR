# CART ROUTES
# Handles add, view, remove, and checkout for the shopping cart

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from flask import Blueprint, request, jsonify
from app.db import SessionLocal
from app.models import CartItem, Order, OrderItem, Product


# ─── BLUEPRINT ────────────────────────────────────────────────────────────────
cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')


# ─── EP-45: Add to Cart  ──────────────────────────────────────────────────────
@cart_bp.route('/add', methods=['POST'])
def add_to_cart():
    data       = request.get_json()
    user_id    = data.get('user_id')
    product_id = data.get('product_id')
    quantity   = data.get('quantity', 1)

    if not user_id or not product_id:
        return jsonify({'error': 'user_id and product_id are required'}), 400

    db = SessionLocal()
    try:
        existing = db.query(CartItem).filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()

        if existing:
            existing.quantity += quantity
        else:
            new_item = CartItem(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            db.add(new_item)

        db.commit()
        return jsonify({'message': 'Cart updated successfully'}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()


# ─── EP-46: View Cart  ────────────────────────────────────────────────────────
@cart_bp.route('/<int:user_id>', methods=['GET'])
def get_cart(user_id):
    db = SessionLocal()
    try:
        items = db.query(CartItem).filter_by(user_id=user_id).all()

        result = []
        for item in items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            result.append({
                'id':         item.id,
                'product_id': item.product_id,
                'quantity':   item.quantity,
                'name':       product.title if product else 'Unknown Product',
                'price':      float(product.price) if product else 0
            })

        return jsonify({'cart': result}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()


# ─── EP-153: Remove from Cart  ────────────────────────────────────────────────
@cart_bp.route('/remove/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    db = SessionLocal()
    try:
        item = db.query(CartItem).filter_by(id=item_id).first()

        if not item:
            return jsonify({'error': 'Cart item not found'}), 404

        db.delete(item)
        db.commit()
        return jsonify({'message': 'Item removed from cart'}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()


# ─── EP-47: Checkout  ─────────────────────────────────────────────────────────
@cart_bp.route('/checkout', methods=['POST'])
def checkout():
    data    = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    db = SessionLocal()
    try:
        cart_items = db.query(CartItem).filter_by(user_id=user_id).all()

        if not cart_items:
            return jsonify({'error': 'Cart is empty'}), 400

        product_ids = [item.product_id for item in cart_items]
        products    = db.query(Product).filter(Product.id.in_(product_ids)).all()
        product_map = {product.id: product for product in products}

        total = 0
        for item in cart_items:
            product = product_map[item.product_id]
            total  += product.price * item.quantity

        recipient_id = data.get('recipient_id', None)

        new_order = Order(
            buyer_id     = user_id,
            total_amount = total,
            recipient_id = recipient_id,
            status       = 'pending'
        )
        db.add(new_order)
        db.flush()

        for item in cart_items:
            product    = product_map[item.product_id]
            order_item = OrderItem(
                order_id          = new_order.id,
                product_id        = item.product_id,
                quantity          = item.quantity,
                price_at_purchase = product.price
            )
            db.add(order_item)

        for item in cart_items:
            db.delete(item)

        db.commit()

        return jsonify({
            'message':  'Order placed successfully',
            'order_id': new_order.id,
            'total':    float(total)
        }), 201

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()
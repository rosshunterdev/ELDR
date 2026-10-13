# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from flask import Blueprint, jsonify, request, session
from app.db import SessionLocal
from app.models import Review, User


# ─── BLUEPRINT ────────────────────────────────────────────────────────────────
# url_prefix means every route here starts with /api/reviews
reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')


# ─── SHOW PRODUCT REVIEWS ─────────────────────────────────────────────────────
# This is public — no login required to read reviews
@reviews_bp.route('/<int:product_id>', methods=['GET'])
def get_reviews(product_id):
   
    db = SessionLocal()
    try:
        reviews = db.query(Review).filter_by(product_id=product_id).all()
      
        result = []
        for review in reviews:

      
            if review.user_id:
                user = db.query(User).filter(User.id == review.user_id).first()
            else:
                user = None

            if user:
                display_name = f"{user.first_name} {user.last_name[0]}."
            else:
                display_name = "Anonymous"

            result.append({
                'id':           review.id,
                'rating':       review.rating,
                'comment':      review.comment,
                'reviewer':     display_name,
                'created_at':   review.created_at.isoformat() if review.created_at else None,
           })

        return jsonify({'reviews': result, 'count': len(result)}), 200

    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    
    finally:
        db.close()    

# ─── POST A REVIEW ────────────────────────────────────────────────────────────
# Requires login - reads user_id from session
# Validates rating, checks for duplicate, then inserts

@reviews_bp.route('/<int:product_id>', methods=['POST'])
def post_review(product_id):

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'You must be logged in to leave a review'}), 401

    data    = request.get_json()
    rating  = data.get('rating')
    comment = data.get('comment', '').strip() or None
   
    # Validate rating — must be present and between 1 and 5
    if rating is None:
        return jsonify({'error': 'Rating is required'}), 400

    if not isinstance(rating, int) or not (1 <= rating <= 5):
        return jsonify({'error': 'Rating must be a whole number between 1 and 5'}), 400
   
    db = SessionLocal()
    try:
        # Check for duplicate — same user, same product
        existing = db.query(Review).filter_by(
            user_id=user_id,
            product_id=product_id
        ).first()

        if existing:
            return jsonify({'error': 'You have already reviewed this product'}), 409
  
        new_review = Review(
            user_id    = user_id,
            product_id = product_id,
            rating     = rating,
            comment    = comment
        )
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
    
        return jsonify({
            'message':    'Review submitted successfully',
            'review_id':  new_review.id
        }), 201


    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500

    finally:
        db.close()
    
# MODELS
# Defines all database tables as SQLAlchemy classes
# Each class maps to one table in the Neon PostgreSQL database

# ─── IMPORTS ──────────────────────────────────────────────────────────────────
from app.db import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, ForeignKey, Boolean
from sqlalchemy.sql import func


# ─── USER ─────────────────────────────────────────────────────────────────────
# Stores all user accounts — elders, caregivers, family members, and sellers
class User(Base):
    __tablename__ = "users"

    id                  = Column(Integer, primary_key=True)
    role                = Column(String(50), nullable=False, default="elder")
    first_name          = Column(String(100), nullable=False)
    last_name           = Column(String(100), nullable=False)
    password_hash       = Column(String(255), nullable=False)
    email               = Column(String(255), unique=True, nullable=False)
    phone_number        = Column(String(20))

    # Onboarding preference columns — set during the elder onboarding flow
    needs_mobility      = Column(Boolean, default=False)
    needs_vision        = Column(Boolean, default=False)
    onboarding_complete = Column(Boolean, default=False)

    created_at          = Column(DateTime(timezone=True), server_default=func.now())


# ─── PRODUCT ──────────────────────────────────────────────────────────────────
# Stores all product listings on the platform
class Product(Base):
    __tablename__ = "products"

    id             = Column(Integer, primary_key=True)
    # seller_id is nullable — allows admin-created products with no seller
    seller_id      = Column(Integer, ForeignKey('users.id'), nullable=True)
    title          = Column(String(255), nullable=False)
    description    = Column(String, nullable=True)
    price          = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    is_verified    = Column(Boolean, default=False)
    image          = Column(String(255), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())


# ─── CART ITEM ────────────────────────────────────────────────────────────────
# Stores items a user has added to their cart but not yet purchased
class CartItem(Base):
    __tablename__ = "cart_items"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity   = Column(Integer, nullable=False, default=1)


# ─── ORDER ────────────────────────────────────────────────────────────────────
# Stores completed orders placed through checkout
class Order(Base):
    __tablename__ = "orders"

    id           = Column(Integer, primary_key=True)
    buyer_id     = Column(Integer, ForeignKey('users.id'), nullable=False)
    # recipient_id is set when a caregiver shops on behalf of an elder — nullable means optional
    recipient_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status       = Column(String(50), nullable=False, default='pending')
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


# ─── ORDER ITEM ───────────────────────────────────────────────────────────────
# Stores the individual products inside each order
# price_at_purchase captures the price at the time of buying — not the current price
class OrderItem(Base):
    __tablename__ = "order_items"

    id                = Column(Integer, primary_key=True)
    order_id          = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id        = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity          = Column(Integer, nullable=False)
    price_at_purchase = Column(Numeric(10, 2), nullable=False)


# ─── USER LINK ────────────────────────────────────────────────────────────────
# Stores the relationships between elders and their caregivers or family members
# status starts as 'pending' and becomes 'accepted' once the elder approves
class UserLink(Base):
    __tablename__ = "user_links"

    id           = Column(Integer, primary_key=True)
    elder_id     = Column(Integer, ForeignKey('users.id'), nullable=False)
    helper_id    = Column(Integer, ForeignKey('users.id'), nullable=False)
    relationship = Column(String(50), nullable=False, default='family')
    status       = Column(String(50), nullable=False, default='pending')
    created_at   = Column(DateTime(timezone=True), server_default=func.now())


# ─── WISHLIST ────────────────────────────────────────────────────────────────
# ---
# ---
class WishlistItem(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ─── REVIEW ───────────────────────────────────────────────────────────────────
# Stores elderly-specific reviews left on product pages
# user_id is nullable — ON DELETE SET NULL means reviews survive account deletion
# rating is constrained to 1–5 by the database CHECK constraint
class Review(Base):
    __tablename__ = "reviews"

    id         = Column(Integer, primary_key=True)
    user_id    = Column(Integer, ForeignKey('users.id'), nullable=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    rating     = Column(Integer, nullable=False)
    comment    = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# ─── PRODUCT NEED ─────────────────────────────────────────────────────────────
# One row per product = its accessibility category (mobility, vision, etc.)
# The GET endpoint joins this in as 'category'; we insert into it on create
class ProductNeed(Base):
    __tablename__ = "product_needs"

    product_id = Column(Integer, ForeignKey('products.id'), primary_key=True)
    need       = Column(String(100), primary_key=True)




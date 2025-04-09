from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app.api import bp
from app import db
from app.utils import format_date

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # 检查是否已存在用户
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
    
    # 创建新用户
    new_user = User(
        username=data['username'],
        email=data['email']
    )
    new_user.password = data['password']  # 使用密码设置器
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"msg": "Registration successful"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Login attempt: {data.get('username')}")  # 添加调试输出
    
    # 查找用户
    user = User.query.filter_by(username=data['username']).first()
    
    # 验证密码
    if user and user.verify_password(data['password']):
        # 创建访问令牌
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    
    print(f"Login failed for: {data.get('username')}")  # 添加调试输出
    return jsonify({"error": "Invalid username or password"}), 401

@bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    # 获取当前用户
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": format_date(user.created_at)  # 格式化创建日期
    }), 200
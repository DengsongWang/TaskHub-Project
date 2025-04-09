from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Create extensions
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='development'):
    """Application factory function"""
    app = Flask(__name__)
    
    # Load configuration
    from app.config.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Simple health check route
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}
    
    return app

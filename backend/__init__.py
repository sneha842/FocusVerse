from flask import Flask 

def create_app():
    app = Flask(__name__,
        static_folder='static',
        template_folder='templates')

    from .routes.dashboard_routes import dashboard_bp

    app.register_blueprint(dashboard_bp)
 

    return app
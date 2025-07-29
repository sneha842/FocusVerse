import os
from flask import Flask

def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))

    app = Flask(
        __name__,
        static_folder=os.path.join(base_dir, 'static'),
        template_folder=os.path.join(base_dir, 'templates')
    )

    from .routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    return app

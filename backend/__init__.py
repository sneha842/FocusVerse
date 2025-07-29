from flask import Flask

def create_app():
    app = Flask(_name_)  # don't set paths here

    from .routes.dashboard_routes import dashboard_bp
    app.register_blueprint(dashboard_bp)

    return app

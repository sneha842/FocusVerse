from flask import Flask, render_template, send_from_directory 
import os
from dotenv import load_dotenv
import logging
from backend.routes.voice_journal_routers import voice_journal_bp
from backend.routes.ambient_sound_routes import ambient_sound_bp

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, template_folder='backend/templates', static_folder='backend/static')

app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "default-secret")
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(app.static_folder, 'audio')

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.INFO)

app.register_blueprint(voice_journal_bp)
app.register_blueprint(ambient_sound_bp)

@app.route('/')
def index():
    """Main page - could be focus timer or dashboard"""
    return render_template('index.html')

@app.route('/voice-journal')
def voice_journal():
    """Voice journal page"""
    return render_template('voice_journal.html')

@app.route('/static/audio/<filename>')
def uploaded_audio(filename):
    """Serve uploaded audio files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.errorhandler(413)
def too_large(e):
    return {"error": "File too large. Maximum size is 50MB."}, 413

@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    app.logger.error(f'Server Error: {e}')
    return {"error": "Internal server error"}, 500



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  
    app.run(debug=True, host='0.0.0.0', port=port)

import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

class StorageService:
    """Handle file storage operations safely"""
    
    ALLOWED_EXTENSIONS = {'webm', 'mp3', 'wav', 'ogg', 'm4a'}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    @staticmethod
    def is_allowed_file(filename):
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in StorageService.ALLOWED_EXTENSIONS
    
    @staticmethod
    def get_audio_directory():
        """Get the audio storage directory, create if it doesn't exist"""
        audio_dir = os.path.join(current_app.static_folder, 'audio')
        if not os.path.exists(audio_dir):
            os.makedirs(audio_dir, exist_ok=True)
        return audio_dir
    
    @staticmethod
    def generate_unique_filename(original_filename):
        """Generate a unique filename while preserving extension"""
        if not original_filename:
            return f"{uuid.uuid4().hex}.webm"
        
        # Secure the filename
        filename = secure_filename(original_filename)
        
        # Get extension
        if '.' in filename:
            extension = filename.rsplit('.', 1)[1].lower()
        else:
            extension = 'webm'  # Default extension
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4().hex}.{extension}"
        return unique_filename
    
    @staticmethod
    def save_audio_file(file_obj, filename=None):
        """
        Save audio file and return the relative path
        Returns: (success: bool, path: str, error: str)
        """
        try:
            # Validate file
            if not file_obj or file_obj.filename == '':
                return False, None, "No file provided"
            
            if not StorageService.is_allowed_file(file_obj.filename):
                return False, None, f"File type not allowed. Allowed: {', '.join(StorageService.ALLOWED_EXTENSIONS)}"
            
            # Generate unique filename
            unique_filename = filename or StorageService.generate_unique_filename(file_obj.filename)
            
            # Get storage directory
            audio_dir = StorageService.get_audio_directory()
            file_path = os.path.join(audio_dir, unique_filename)
            
            # Save file
            file_obj.save(file_path)
            
            # Return relative path for database storage
            relative_path = f"static/audio/{unique_filename}"
            
            return True, relative_path, None
            
        except Exception as e:
            current_app.logger.error(f"File save error: {str(e)}")
            return False, None, f"Failed to save file: {str(e)}"
    
    @staticmethod
    def delete_audio_file(file_path):
        """
        Delete audio file from storage
        Args:
            file_path: relative path like "static/audio/filename.webm"
        Returns: (success: bool, error: str)
        """
        try:
            if not file_path:
                return False, "No file path provided"
            
            # Convert relative path to absolute
            if file_path.startswith('static/'):
                abs_path = os.path.join(current_app.static_folder, file_path[7:])  # Remove 'static/' prefix
            else:
                abs_path = file_path
            
            # Check if file exists and delete
            if os.path.exists(abs_path):
                os.remove(abs_path)
                return True, None
            else:
                return False, "File not found"
                
        except Exception as e:
            current_app.logger.error(f"File delete error: {str(e)}")
            return False, f"Failed to delete file: {str(e)}"
    
    @staticmethod
    def get_file_size(file_path):
        """Get file size in bytes"""
        try:
            if file_path.startswith('static/'):
                abs_path = os.path.join(current_app.static_folder, file_path[7:])
            else:
                abs_path = file_path
            
            if os.path.exists(abs_path):
                return os.path.getsize(abs_path)
            return 0
        except:
            return 0
    
    @staticmethod
    def file_exists(file_path):
        """Check if file exists"""
        try:
            if file_path.startswith('static/'):
                abs_path = os.path.join(current_app.static_folder, file_path[7:])
            else:
                abs_path = file_path
            
            return os.path.exists(abs_path)
        except:
            return False
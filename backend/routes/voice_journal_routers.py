from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import json
from storage import StorageService

voice_journal_bp = Blueprint('voice_journal', __name__)

# In-memory storage for MVP (replace with database later)
voice_journals = []

@voice_journal_bp.route('/api/voice-journal/upload', methods=['POST'])
def upload_voice_journal():
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Use StorageService to save file
        success, file_path, error = StorageService.save_audio_file(audio_file)
        if not success:
            return jsonify({'error': error}), 400
        
        # Get form data
        title = request.form.get('title', '').strip()
        transcript_text = request.form.get('transcript_text', '').strip()
        language = request.form.get('language', 'en-US')
        duration_sec = request.form.get('duration_sec', type=int)
        
        # Get file size
        file_size = StorageService.get_file_size(file_path)
        
        # Create entry
        entry = {
            'id': len(voice_journals) + 1,
            'user_id': request.form.get('user_id'),  # Optional for MVP
            'file_path': file_path,
            'title': title if title else f"Voice Note {len(voice_journals) + 1}",
            'transcript_text': transcript_text,
            'language': language,
            'duration_sec': duration_sec,
            'created_at': datetime.now().isoformat(),
            'file_size': file_size
        }
        
        voice_journals.append(entry)
        
        current_app.logger.info(f"Voice journal uploaded: {entry['id']}")
        
        return jsonify({
            'success': True,
            'entry': entry
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Upload failed'}), 500

@voice_journal_bp.route('/api/voice-journal/list', methods=['GET'])
def list_voice_journals():
    try:
        user_id = request.args.get('user_id')
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
        
        # Filter by user_id if provided
        filtered_journals = voice_journals
        if user_id:
            filtered_journals = [j for j in voice_journals if j.get('user_id') == user_id]
        
        # Sort by created_at descending
        sorted_journals = sorted(filtered_journals, 
                               key=lambda x: x['created_at'], 
                               reverse=True)
        
        # Simple pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated = sorted_journals[start:end]
        
        return jsonify({
            'success': True,
            'entries': paginated,
            'total': len(filtered_journals),
            'page': page,
            'per_page': per_page,
            'has_next': end < len(filtered_journals),
            'has_prev': page > 1
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"List error: {str(e)}")
        return jsonify({'error': 'Failed to fetch entries'}), 500

@voice_journal_bp.route('/api/voice-journal/<int:entry_id>', methods=['GET'])
def get_voice_journal(entry_id):
    try:
        entry = next((j for j in voice_journals if j['id'] == entry_id), None)
        
        if not entry:
            return jsonify({'error': 'Entry not found'}), 404
        
        # Check if file still exists
        if not StorageService.file_exists(entry['file_path']):
            current_app.logger.warning(f"Audio file not found for entry {entry_id}")
            return jsonify({'error': 'Audio file not found'}), 404
            
        return jsonify({
            'success': True,
            'entry': entry
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get entry error: {str(e)}")
        return jsonify({'error': 'Failed to fetch entry'}), 500

@voice_journal_bp.route('/api/voice-journal/<int:entry_id>', methods=['DELETE'])
def delete_voice_journal(entry_id):
    try:
        entry_index = next((i for i, j in enumerate(voice_journals) 
                           if j['id'] == entry_id), None)
        
        if entry_index is None:
            return jsonify({'error': 'Entry not found'}), 404
            
        entry = voice_journals[entry_index]
        
        # Delete file using StorageService
        success, error = StorageService.delete_audio_file(entry['file_path'])
        if not success:
            current_app.logger.warning(f"Failed to delete file for entry {entry_id}: {error}")
            # Continue with database deletion even if file deletion fails
        
        # Remove from memory
        voice_journals.pop(entry_index)
        
        current_app.logger.info(f"Voice journal deleted: {entry_id}")
        
        return jsonify({
            'success': True,
            'message': 'Entry deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Delete error: {str(e)}")
        return jsonify({'error': 'Failed to delete entry'}), 500

@voice_journal_bp.route('/api/voice-journal/<int:entry_id>/update', methods=['PUT'])
def update_voice_journal(entry_id):
    try:
        entry = next((j for j in voice_journals if j['id'] == entry_id), None)
        
        if not entry:
            return jsonify({'error': 'Entry not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update allowed fields
        if 'title' in data:
            title = data['title'].strip()
            entry['title'] = title if title else f"Voice Note {entry['id']}"
        
        if 'transcript_text' in data:
            entry['transcript_text'] = data['transcript_text'].strip()
        
        # Add updated timestamp
        entry['updated_at'] = datetime.now().isoformat()
        
        current_app.logger.info(f"Voice journal updated: {entry_id}")
        
        return jsonify({
            'success': True,
            'entry': entry
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Update error: {str(e)}")
        return jsonify({'error': 'Failed to update entry'}), 500

@voice_journal_bp.route('/api/voice-journal/search', methods=['GET'])
def search_voice_journals():
    """Search voice journals by title or transcript"""
    try:
        query = request.args.get('q', '').strip().lower()
        user_id = request.args.get('user_id')
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)
        
        if not query:
            return jsonify({'error': 'No search query provided'}), 400
        
        # Filter by user_id if provided
        filtered_journals = voice_journals
        if user_id:
            filtered_journals = [j for j in voice_journals if j.get('user_id') == user_id]
        
        # Search in title and transcript
        search_results = []
        for entry in filtered_journals:
            title_match = query in (entry.get('title', '') or '').lower()
            transcript_match = query in (entry.get('transcript_text', '') or '').lower()
            
            if title_match or transcript_match:
                search_results.append(entry)
        
        # Sort by created_at descending
        search_results.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Pagination
        start = (page - 1) * per_page
        end = start + per_page
        paginated = search_results[start:end]
        
        return jsonify({
            'success': True,
            'entries': paginated,
            'total': len(search_results),
            'query': query,
            'page': page,
            'per_page': per_page,
            'has_next': end < len(search_results),
            'has_prev': page > 1
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Search error: {str(e)}")
        return jsonify({'error': 'Search failed'}), 500

@voice_journal_bp.route('/api/voice-journal/stats', methods=['GET'])
def get_voice_journal_stats():
    """Get statistics about voice journals"""
    try:
        user_id = request.args.get('user_id')
        
        # Filter by user_id if provided
        filtered_journals = voice_journals
        if user_id:
            filtered_journals = [j for j in voice_journals if j.get('user_id') == user_id]
        
        if not filtered_journals:
            return jsonify({
                'success': True,
                'stats': {
                    'total_entries': 0,
                    'total_duration': 0,
                    'total_size': 0,
                    'languages': {},
                    'entries_this_month': 0
                }
            }), 200
        
        # Calculate stats
        total_entries = len(filtered_journals)
        total_duration = sum(entry.get('duration_sec', 0) for entry in filtered_journals)
        total_size = sum(entry.get('file_size', 0) for entry in filtered_journals)
        
        # Language distribution
        languages = {}
        for entry in filtered_journals:
            lang = entry.get('language', 'en-US')
            languages[lang] = languages.get(lang, 0) + 1
        
        # Entries this month
        current_month = datetime.now().strftime('%Y-%m')
        entries_this_month = sum(1 for entry in filtered_journals 
                               if entry['created_at'].startswith(current_month))
        
        return jsonify({
            'success': True,
            'stats': {
                'total_entries': total_entries,
                'total_duration': total_duration,
                'total_size': total_size,
                'languages': languages,
                'entries_this_month': entries_this_month
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Stats error: {str(e)}")
        return jsonify({'error': 'Failed to get stats'}), 500
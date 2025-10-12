from flask import Blueprint, request, jsonify, render_template
import json
import os

ambient_sound_bp = Blueprint('ambient_sound', __name__)

# Ambient sound configurations with online audio URLs
AMBIENT_SOUNDS = {
    'rain': {
        'name': 'Rain',
        'icon': '🌧️',
        'description': 'Gentle rain sounds',
        'file': 'https://www.bensound.com/bensound-music/bensound-rain.mp3',
        'fallback': 'https://www.soundjay.com/misc/sounds/rain-01.mp3',
        'default_volume': 0.3
    },
    'forest': {
        'name': 'Forest',
        'icon': '🌲',
        'description': 'Forest ambiance with birds',
        'file': 'https://www.bensound.com/bensound-music/bensound-forest.mp3',
        'fallback': 'https://www.soundjay.com/nature/sounds/forest-01.mp3',
        'default_volume': 0.4
    },
    'cafe': {
        'name': 'Cafe',
        'icon': '☕',
        'description': 'Coffee shop atmosphere',
        'file': 'https://www.bensound.com/bensound-music/bensound-cafe.mp3',
        'fallback': 'https://www.soundjay.com/misc/sounds/cafe-01.mp3',
        'default_volume': 0.2
    },
    'fire': {
        'name': 'Fireplace',
        'icon': '🔥',
        'description': 'Crackling fire sounds',
        'file': 'https://www.bensound.com/bensound-music/bensound-fire.mp3',
        'fallback': 'https://www.soundjay.com/misc/sounds/fire-01.mp3',
        'default_volume': 0.3
    },
    'ocean': {
        'name': 'Ocean',
        'icon': '🌊',
        'description': 'Ocean waves',
        'file': 'https://www.bensound.com/bensound-music/bensound-ocean.mp3',
        'fallback': 'https://www.soundjay.com/nature/sounds/ocean-01.mp3',
        'default_volume': 0.4
    },
    'typing': {
        'name': 'Typing',
        'icon': '⌨️',
        'description': 'Keyboard typing sounds',
        'file': 'https://www.bensound.com/bensound-music/bensound-typing.mp3',
        'fallback': 'https://www.soundjay.com/misc/sounds/typing-01.mp3',
        'default_volume': 0.2
    },
    'thunder': {
        'name': 'Thunder',
        'icon': '⛈️',
        'description': 'Distant thunder',
        'file': 'https://www.bensound.com/bensound-music/bensound-thunder.mp3',
        'fallback': 'https://www.soundjay.com/nature/sounds/thunder-01.mp3',
        'default_volume': 0.3
    },
    'wind': {
        'name': 'Wind',
        'icon': '💨',
        'description': 'Gentle wind sounds',
        'file': 'https://www.bensound.com/bensound-music/bensound-wind.mp3',
        'fallback': 'https://www.soundjay.com/nature/sounds/wind-01.mp3',
        'default_volume': 0.3
    }
}

@ambient_sound_bp.route('/api/ambient-sounds', methods=['GET'])
def get_ambient_sounds():
    """Get all available ambient sounds"""
    return jsonify(AMBIENT_SOUNDS)

@ambient_sound_bp.route('/api/ambient-sounds/<sound_id>', methods=['GET'])
def get_ambient_sound(sound_id):
    """Get specific ambient sound configuration"""
    if sound_id in AMBIENT_SOUNDS:
        return jsonify(AMBIENT_SOUNDS[sound_id])
    return jsonify({'error': 'Sound not found'}), 404

@ambient_sound_bp.route('/api/ambient-mixes', methods=['GET'])
def get_saved_mixes():
    """Get user's saved ambient sound mixes"""
    # In a real app, this would come from a database
    # For now, we'll use a simple file-based storage
    mixes_file = 'ambient_mixes.json'
    if os.path.exists(mixes_file):
        try:
            with open(mixes_file, 'r') as f:
                return jsonify(json.load(f))
        except:
            return jsonify([])
    return jsonify([])

@ambient_sound_bp.route('/api/ambient-mixes', methods=['POST'])
def save_mix():
    """Save a new ambient sound mix"""
    data = request.get_json()
    
    if not data or 'name' not in data or 'sounds' not in data:
        return jsonify({'error': 'Invalid mix data'}), 400
    
    mix = {
        'id': len(get_saved_mixes().get_json()) + 1,
        'name': data['name'],
        'sounds': data['sounds'],
        'created_at': data.get('created_at', '')
    }
    
    # Save to file (in production, use a proper database)
    mixes_file = 'ambient_mixes.json'
    mixes = []
    if os.path.exists(mixes_file):
        try:
            with open(mixes_file, 'r') as f:
                mixes = json.load(f)
        except:
            mixes = []
    
    mixes.append(mix)
    
    with open(mixes_file, 'w') as f:
        json.dump(mixes, f, indent=2)
    
    return jsonify(mix), 201

@ambient_sound_bp.route('/api/ambient-mixes/<int:mix_id>', methods=['DELETE'])
def delete_mix(mix_id):
    """Delete a saved ambient sound mix"""
    mixes_file = 'ambient_mixes.json'
    if os.path.exists(mixes_file):
        try:
            with open(mixes_file, 'r') as f:
                mixes = json.load(f)
            
            mixes = [mix for mix in mixes if mix['id'] != mix_id]
            
            with open(mixes_file, 'w') as f:
                json.dump(mixes, f, indent=2)
            
            return jsonify({'message': 'Mix deleted successfully'})
        except:
            return jsonify({'error': 'Failed to delete mix'}), 500
    
    return jsonify({'error': 'Mix not found'}), 404

@ambient_sound_bp.route('/api/ambient-mixes/<int:mix_id>/play', methods=['POST'])
def play_mix(mix_id):
    """Start playing a saved ambient sound mix"""
    mixes_file = 'ambient_mixes.json'
    if os.path.exists(mixes_file):
        try:
            with open(mixes_file, 'r') as f:
                mixes = json.load(f)
            
            mix = next((m for m in mixes if m['id'] == mix_id), None)
            if mix:
                return jsonify(mix)
        except:
            pass
    
    return jsonify({'error': 'Mix not found'}), 404

# Ambient Sound Files

This directory is reserved for local ambient sound files for the FocusVerse application.

## Current Implementation

The application currently uses **online audio sources** with fallback support:

### Primary Sources (Bensound)
- Rain: `https://www.bensound.com/bensound-music/bensound-rain.mp3`
- Forest: `https://www.bensound.com/bensound-music/bensound-forest.mp3`
- Cafe: `https://www.bensound.com/bensound-music/bensound-cafe.mp3`
- Fire: `https://www.bensound.com/bensound-music/bensound-fire.mp3`
- Ocean: `https://www.bensound.com/bensound-music/bensound-ocean.mp3`
- Typing: `https://www.bensound.com/bensound-music/bensound-typing.mp3`
- Thunder: `https://www.bensound.com/bensound-music/bensound-thunder.mp3`
- Wind: `https://www.bensound.com/bensound-music/bensound-wind.mp3`

### Fallback Sources (SoundJay)
- Rain: `https://www.soundjay.com/misc/sounds/rain-01.mp3`
- Forest: `https://www.soundjay.com/nature/sounds/forest-01.mp3`
- Cafe: `https://www.soundjay.com/misc/sounds/cafe-01.mp3`
- Fire: `https://www.soundjay.com/misc/sounds/fire-01.mp3`
- Ocean: `https://www.soundjay.com/nature/sounds/ocean-01.mp3`
- Typing: `https://www.soundjay.com/misc/sounds/typing-01.mp3`
- Thunder: `https://www.soundjay.com/nature/sounds/thunder-01.mp3`
- Wind: `https://www.soundjay.com/nature/sounds/wind-01.mp3`

## Local File Support

If you want to use local audio files instead of online sources:

1. Add the audio files to this directory
2. Update the `AMBIENT_SOUNDS` configuration in `backend/routes/ambient_sound_routes.py`
3. Change the `file` property to use local paths (e.g., `/static/audio/rain.mp3`)

## File Requirements (for local files)

- Format: MP3
- Duration: 3-10 minutes (will be looped)
- Quality: 128kbps or higher
- Size: Under 5MB per file

## Adding New Sounds

To add new ambient sounds:

1. Add the audio file to this directory (for local) or update URLs (for online)
2. Update the `AMBIENT_SOUNDS` configuration in `backend/routes/ambient_sound_routes.py`
3. Add the corresponding icon and description

## Sample Sounds

For development purposes, you can use royalty-free ambient sounds from:
- Freesound.org
- Zapsplat.com
- YouTube Audio Library
- BBC Sound Effects Library
- Bensound.com (currently used)
- SoundJay.com (fallback)

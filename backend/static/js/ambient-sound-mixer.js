// Ambient Sound Mixer JavaScript
class AmbientSoundMixer {
    constructor() {
        this.sounds = {};
        this.audioElements = {};
        this.isCollapsed = false;
        this.savedMixes = [];
        this.currentMix = null;
        
        this.init();
    }
    
    async init() {
        await this.loadSounds();
        this.setupEventListeners();
        this.loadSavedMixes();
        this.render();
    }
    
    async loadSounds() {
        try {
            const response = await fetch('/api/ambient-sounds');
            this.sounds = await response.json();
        } catch (error) {
            console.error('Failed to load sounds:', error);
        }
    }
    
    setupEventListeners() {
        // These will be set up in setupDynamicEventListeners after render
        console.log('🎵 Setting up event listeners...');
    }
    
    render() {
        const container = document.getElementById('ambient-sound-container');
        if (!container) {
            console.error('❌ Ambient sound container not found!');
            return;
        }
        console.log('🎵 Rendering ambient sound mixer...');
        
        // Create default sounds if none loaded
        if (Object.keys(this.sounds).length === 0) {
            this.sounds = {
                rain: {
                    name: "Rain",
                    description: "Gentle rain sounds",
                    icon: "🌧️",
                    file: "https://www.soundjay.com/misc/sounds/rain-01.mp3",
                    default_volume: 0.3
                },
                forest: {
                    name: "Forest",
                    description: "Birds and nature",
                    icon: "🌲",
                    file: "https://www.soundjay.com/misc/sounds/forest-01.mp3",
                    default_volume: 0.3
                },
                cafe: {
                    name: "Coffee Shop",
                    description: "Ambient cafe sounds",
                    icon: "☕",
                    file: "https://www.soundjay.com/misc/sounds/cafe-01.mp3",
                    default_volume: 0.3
                },
                ocean: {
                    name: "Ocean Waves",
                    description: "Calming ocean sounds",
                    icon: "🌊",
                    file: "https://www.soundjay.com/misc/sounds/ocean-01.mp3",
                    default_volume: 0.3
                }
            };
        }
        
        let html = `
            <div class="ambient-sound-mixer ${this.isCollapsed ? 'collapsed' : ''}">
                <div class="ambient-sound-header">
                    <h3 class="ambient-sound-title">🎵 Ambient Sounds</h3>
                    <button id="ambient-sound-toggle" class="ambient-sound-toggle ${this.isCollapsed ? 'collapsed' : ''}">
                        ${this.isCollapsed ? '🎵' : '−'}
                    </button>
                </div>
                
                <div class="mixer-content">
                    <div class="sound-controls" id="sound-controls">
                        ${this.renderSoundControls()}
                    </div>
                    
                    <div class="mixer-actions">
                        <button id="save-mix-btn" class="mixer-btn secondary">💾 Save Mix</button>
                        <button id="clear-all-btn" class="mixer-btn secondary">🗑️ Clear All</button>
                        <button id="auto-start-btn" class="mixer-btn primary">▶️ Auto-Start</button>
                    </div>
                    
                    <div class="save-mix-form" id="save-mix-form">
                        <input type="text" id="mix-name-input" placeholder="Enter mix name..." maxlength="50">
                        <div class="form-actions">
                            <button id="confirm-save-btn" class="save-btn">Save</button>
                            <button id="cancel-save-btn" class="cancel-btn">Cancel</button>
                        </div>
                    </div>
                    
                    <div class="saved-mixes" id="saved-mixes">
                        ${this.renderSavedMixes()}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        this.setupDynamicEventListeners();
        console.log('✅ Ambient sound mixer rendered successfully!');
    }
    
    renderSoundControls() {
        return Object.entries(this.sounds).map(([id, sound]) => `
            <div class="sound-item" data-sound-id="${id}">
                <div class="sound-icon">${sound.icon}</div>
                <div class="sound-info">
                    <div class="sound-name">${sound.name}</div>
                    <div class="sound-description">${sound.description}</div>
                </div>
                <div class="sound-controls-row">
                    <button class="sound-toggle" data-sound-id="${id}"></button>
                    <input type="range" class="volume-slider" data-sound-id="${id}" 
                           min="0" max="100" value="${sound.default_volume * 100}" 
                           ${!this.audioElements[id] ? 'disabled' : ''}>
                </div>
            </div>
        `).join('');
    }
    
    renderSavedMixes() {
        if (this.savedMixes.length === 0) {
            return '<p style="text-align: center; color: #666; font-size: 0.9rem;">No saved mixes yet</p>';
        }
        
        return `
            <h4>Saved Mixes</h4>
            ${this.savedMixes.map(mix => `
                <div class="mix-item" data-mix-id="${mix.id}">
                    <div class="mix-name">${mix.name}</div>
                    <div class="mix-actions">
                        <button class="mix-btn play" data-mix-id="${mix.id}" title="Play">▶️</button>
                        <button class="mix-btn delete" data-mix-id="${mix.id}" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    setupDynamicEventListeners() {
        console.log('🎵 Setting up dynamic event listeners...');
        
        // Toggle mixer visibility
        const toggleBtn = document.getElementById('ambient-sound-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleCollapsed();
            });
        }
        
        // Sound toggles
        document.querySelectorAll('.sound-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const soundId = e.target.dataset.soundId;
                this.toggleSound(soundId);
            });
        });
        
        // Volume sliders
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const soundId = e.target.dataset.soundId;
                const volume = e.target.value / 100;
                this.setVolume(soundId, volume);
            });
        });
        
        // Save mix button
        const saveBtn = document.getElementById('save-mix-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.showSaveMixForm();
            });
        }
        
        // Clear all button
        const clearBtn = document.getElementById('clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllSounds();
            });
        }
        
        // Auto-start button
        const autoStartBtn = document.getElementById('auto-start-btn');
        if (autoStartBtn) {
            autoStartBtn.addEventListener('click', () => {
                this.autoStartWithTimer();
            });
        }
        
        // Save mix form
        const confirmSaveBtn = document.getElementById('confirm-save-btn');
        if (confirmSaveBtn) {
            confirmSaveBtn.addEventListener('click', () => {
                this.saveCurrentMix();
            });
        }
        
        const cancelSaveBtn = document.getElementById('cancel-save-btn');
        if (cancelSaveBtn) {
            cancelSaveBtn.addEventListener('click', () => {
                this.hideSaveMixForm();
            });
        }
        
        // Saved mix actions
        document.querySelectorAll('.mix-btn.play').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mixId = parseInt(e.target.dataset.mixId);
                this.playMix(mixId);
            });
        });
        
        document.querySelectorAll('.mix-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mixId = parseInt(e.target.dataset.mixId);
                this.deleteMix(mixId);
            });
        });
        
        console.log('✅ Dynamic event listeners set up successfully!');
    }
    
    toggleSound(soundId) {
        const sound = this.sounds[soundId];
        if (!sound) return;
        
        if (this.audioElements[soundId]) {
            // Sound is playing, stop it
            this.audioElements[soundId].pause();
            this.audioElements[soundId].currentTime = 0;
            delete this.audioElements[soundId];
            this.updateSoundToggle(soundId, false);
        } else {
            // Start playing sound
            this.playSound(soundId);
        }
    }
    
    playSound(soundId) {
        const sound = this.sounds[soundId];
        if (!sound) return;
        
        // Create audio element with online URL
        const audio = new Audio(sound.file);
        audio.loop = true;
        audio.volume = sound.default_volume;
        
        // Add error handling with fallback
        audio.addEventListener('error', () => {
            console.warn(`Failed to load ${sound.name}, trying fallback...`);
            if (sound.fallback) {
                audio.src = sound.fallback;
                audio.load();
            } else {
                console.error(`No fallback available for ${sound.name}`);
                this.updateSoundToggle(soundId, false);
            }
        });
        
        audio.addEventListener('canplaythrough', () => {
            audio.play().catch(e => {
                console.error('Failed to play sound:', e);
                this.updateSoundToggle(soundId, false);
            });
        });
        
        this.audioElements[soundId] = audio;
        this.updateSoundToggle(soundId, true);
    }
    
    setVolume(soundId, volume) {
        if (this.audioElements[soundId]) {
            this.audioElements[soundId].volume = volume;
        }
    }
    
    updateSoundToggle(soundId, isActive) {
        const toggle = document.querySelector(`.sound-toggle[data-sound-id="${soundId}"]`);
        const slider = document.querySelector(`.volume-slider[data-sound-id="${soundId}"]`);
        
        if (toggle) {
            toggle.classList.toggle('active', isActive);
        }
        
        if (slider) {
            slider.disabled = !isActive;
        }
    }
    
    clearAllSounds() {
        Object.keys(this.audioElements).forEach(soundId => {
            this.audioElements[soundId].pause();
            this.audioElements[soundId].currentTime = 0;
            this.updateSoundToggle(soundId, false);
        });
        this.audioElements = {};
    }
    
    showSaveMixForm() {
        const form = document.getElementById('save-mix-form');
        if (form) {
            form.classList.add('active');
            document.getElementById('mix-name-input').focus();
        }
    }
    
    hideSaveMixForm() {
        const form = document.getElementById('save-mix-form');
        if (form) {
            form.classList.remove('active');
            document.getElementById('mix-name-input').value = '';
        }
    }
    
    async saveCurrentMix() {
        const mixName = document.getElementById('mix-name-input').value.trim();
        if (!mixName) {
            alert('Please enter a mix name');
            return;
        }
        
        const activeSounds = {};
        Object.entries(this.audioElements).forEach(([soundId, audio]) => {
            activeSounds[soundId] = {
                volume: audio.volume,
                playing: true
            };
        });
        
        if (Object.keys(activeSounds).length === 0) {
            alert('Please select some sounds to save!\n\n1. Toggle on the sounds you want\n2. Adjust their volumes\n3. Then save the mix');
            return;
        }
        
        const mix = {
            name: mixName,
            sounds: activeSounds,
            created_at: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/api/ambient-mixes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mix)
            });
            
            if (response.ok) {
                this.loadSavedMixes();
                this.hideSaveMixForm();
                this.render();
                
                // Show success message with saved sounds
                const soundNames = Object.keys(activeSounds).map(soundId => this.sounds[soundId].name).join(', ');
                alert(`✅ Mix Saved Successfully!\n\nMix Name: "${mixName}"\nSounds: ${soundNames}\n\nYou can now load this mix anytime from the "Saved Mixes" section.`);
            } else {
                alert('Failed to save mix');
            }
        } catch (error) {
            console.error('Failed to save mix:', error);
            alert('Failed to save mix');
        }
    }
    
    async loadSavedMixes() {
        try {
            const response = await fetch('/api/ambient-mixes');
            this.savedMixes = await response.json();
        } catch (error) {
            console.error('Failed to load saved mixes:', error);
            this.savedMixes = [];
        }
    }
    
    async playMix(mixId) {
        try {
            const response = await fetch(`/api/ambient-mixes/${mixId}/play`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const mix = await response.json();
                this.loadMix(mix);
            }
        } catch (error) {
            console.error('Failed to play mix:', error);
        }
    }
    
    loadMix(mix) {
        // Clear current sounds
        this.clearAllSounds();
        
        // Load mix sounds
        Object.entries(mix.sounds).forEach(([soundId, soundData]) => {
            if (soundData.playing) {
                this.playSound(soundId);
                setTimeout(() => {
                    this.setVolume(soundId, soundData.volume);
                }, 100);
            }
        });
    }
    
    async deleteMix(mixId) {
        if (!confirm('Are you sure you want to delete this mix?')) return;
        
        try {
            const response = await fetch(`/api/ambient-mixes/${mixId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.loadSavedMixes();
                this.render();
            } else {
                alert('Failed to delete mix');
            }
        } catch (error) {
            console.error('Failed to delete mix:', error);
            alert('Failed to delete mix');
        }
    }
    
    autoStartWithTimer() {
        // This will be called when the focus timer starts
        // For now, just start playing the current mix
        const activeSounds = Object.keys(this.audioElements);
        if (activeSounds.length === 0) {
            alert('Please select some ambient sounds first!\n\n1. Toggle on the sounds you want\n2. Adjust their volumes\n3. Then click Auto-Start');
            return;
        }
        
        // Store the current mix for auto-start
        this.currentMix = Object.keys(this.audioElements).reduce((acc, soundId) => {
            acc[soundId] = {
                volume: this.audioElements[soundId].volume,
                playing: true
            };
            return acc;
        }, {});
        
        // Show success message with selected sounds
        const soundNames = Object.keys(this.currentMix).map(soundId => this.sounds[soundId].name).join(', ');
        alert(`✅ Auto-Start Enabled!\n\nSelected sounds: ${soundNames}\n\nYour ambient sounds will start automatically when you begin your next focus session!`);
    }
    
    toggleCollapsed() {
        this.isCollapsed = !this.isCollapsed;
        const mixer = document.querySelector('.ambient-sound-mixer');
        if (mixer) {
            mixer.classList.toggle('collapsed', this.isCollapsed);
            const toggleBtn = document.getElementById('ambient-sound-toggle');
            if (toggleBtn) {
                toggleBtn.textContent = this.isCollapsed ? '🎵' : '−';
                toggleBtn.classList.toggle('collapsed', this.isCollapsed);
            }
        }
        console.log(`🎵 Mixer ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
    }
    
    // Method to be called when focus timer starts
    startWithTimer() {
        if (this.currentMix) {
            this.loadMix({ sounds: this.currentMix });
        }
    }
    
    // Method to be called when focus timer stops
    stopWithTimer() {
        // Optionally stop all sounds when timer stops
        // this.clearAllSounds();
    }
}

// Initialize the ambient sound mixer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 Initializing Ambient Sound Mixer...');
    try {
        // Wait a bit for the page to fully load
        setTimeout(() => {
            window.ambientSoundMixer = new AmbientSoundMixer();
            console.log('✅ Ambient Sound Mixer initialized successfully!');
        }, 500);
    } catch (error) {
        console.error('❌ Failed to initialize Ambient Sound Mixer:', error);
    }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    console.log('🎵 DOM already loaded, initializing Ambient Sound Mixer...');
    try {
        setTimeout(() => {
            window.ambientSoundMixer = new AmbientSoundMixer();
            console.log('✅ Ambient Sound Mixer initialized successfully!');
        }, 500);
    } catch (error) {
        console.error('❌ Failed to initialize Ambient Sound Mixer:', error);
    }
}

class VoiceRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.isPaused = false;
        this.recognition = null;
        this.startTime = null;
        this.timerInterval = null;
        this.audioBlob = null;
        this.audioUrl = null;
        
        // DOM elements
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.playBtn = document.getElementById('playBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.transcriptText = document.getElementById('transcriptText');
        this.titleInput = document.getElementById('titleInput');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.recordingTimer = document.getElementById('recordingTimer');
        this.languageSelect = document.getElementById('languageSelect');
        
        this.initializeRecorder();
        this.initializeSpeechRecognition();
        this.bindEvents();
    }

    async initializeRecorder() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            // Check for supported MIME types
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/ogg;codecs=opus'
            ];
            
            let selectedMimeType = 'audio/webm';
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType;
                    break;
                }
            }
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: selectedMimeType
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: selectedMimeType });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
                this.audioPlayer.src = this.audioUrl;
                this.updateUI('stopped');
            };
            
            this.mediaRecorder.onstart = () => {
                this.audioChunks = [];
                this.startTime = Date.now();
                this.startTimer();
                this.updateUI('recording');
            };
            
        } catch (error) {
            console.error('Error initializing recorder:', error);
            this.showError('Microphone access denied or not available');
        }
    }

    initializeSpeechRecognition() {
        // Check for browser support
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('Speech recognition not supported');
            return;
        }
        
        if (this.recognition) {
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.languageSelect.value || 'en-US';
            
            let finalTranscript = '';
            let interimTranscript = '';
            
            this.recognition.onresult = (event) => {
                finalTranscript = '';
                interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                this.transcriptText.value = finalTranscript + interimTranscript;
                this.transcriptText.scrollTop = this.transcriptText.scrollHeight;
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') {
                    this.showStatus('No speech detected, but recording continues...', 'warning');
                }
            };
        }
    }

    bindEvents() {
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.playBtn.addEventListener('click', () => this.playRecording());
        this.saveBtn.addEventListener('click', () => this.saveRecording());
        this.cancelBtn.addEventListener('click', () => this.cancelRecording());
        
        this.languageSelect.addEventListener('change', () => {
            if (this.recognition) {
                this.recognition.lang = this.languageSelect.value;
            }
        });
        
        // Auto-resize transcript textarea
        this.transcriptText.addEventListener('input', () => {
            this.transcriptText.style.height = 'auto';
            this.transcriptText.style.height = this.transcriptText.scrollHeight + 'px';
        });
    }

    startRecording() {
        if (!this.mediaRecorder) {
            this.showError('Recorder not initialized');
            return;
        }
        
        if (this.mediaRecorder.state === 'inactive') {
            this.isRecording = true;
            this.transcriptText.value = '';
            
            // Start speech recognition
            if (this.recognition) {
                try {
                    this.recognition.start();
                } catch (error) {
                    console.warn('Speech recognition failed to start:', error);
                }
            }
            
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.showStatus('Recording...', 'recording');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.isRecording = false;
            this.mediaRecorder.stop();
            
            if (this.recognition) {
                this.recognition.stop();
            }
            
            this.stopTimer();
            this.showStatus('Recording stopped', 'stopped');
        }
    }

    playRecording() {
        if (this.audioPlayer.src) {
            if (this.audioPlayer.paused) {
                this.audioPlayer.play();
                this.playBtn.textContent = ' Pause';
            } else {
                this.audioPlayer.pause();
                this.playBtn.textContent = ' Play';
            }
        }
    }

    async saveRecording() {
        if (!this.audioBlob) {
            this.showError('No recording to save');
            return;
        }
        
        const title = this.titleInput.value.trim();
        const transcript = this.transcriptText.value.trim();
        const language = this.languageSelect.value;
        const duration = this.audioPlayer.duration || 0;
        
        const formData = new FormData();
        formData.append('audio', this.audioBlob, `voice-note-${Date.now()}.webm`);
        formData.append('title', title);
        formData.append('transcript_text', transcript);
        formData.append('language', language);
        formData.append('duration_sec', Math.round(duration));
        
        try {
            this.saveBtn.disabled = true;
            this.saveBtn.textContent = 'Saving...';
            
            const response = await fetch('/api/voice-journal/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showStatus('Recording saved successfully!', 'success');
                this.resetRecorder();
                this.refreshJournalList();
            } else {
                throw new Error(result.error || 'Save failed');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showError('Failed to save recording: ' + error.message);
        } finally {
            this.saveBtn.disabled = false;
            this.saveBtn.textContent = ' Save Recording';
        }
    }

    cancelRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            if (this.recognition) {
                this.recognition.stop();
            }
            this.stopTimer();
        }
        this.resetRecorder();
    }

    resetRecorder() {
        this.audioChunks = [];
        this.audioBlob = null;
        this.isRecording = false;
        
        if (this.audioUrl) {
            URL.revokeObjectURL(this.audioUrl);
            this.audioUrl = null;
        }
        
        this.audioPlayer.src = '';
        this.transcriptText.value = '';
        this.titleInput.value = '';
        this.recordingTimer.textContent = '00:00';
        
        this.updateUI('ready');
        this.showStatus('Ready to record', 'ready');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.startTime) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.recordingTimer.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateUI(state) {
        // Reset all buttons
        this.recordBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.playBtn.disabled = true;
        this.saveBtn.disabled = true;
        this.cancelBtn.disabled = false;
        this.playBtn.textContent = ' Play';
        
        switch (state) {
            case 'ready':
                break;
            case 'recording':
                this.recordBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.playBtn.disabled = true;
                this.saveBtn.disabled = true;
                break;
            case 'stopped':
                this.playBtn.disabled = false;
                this.saveBtn.disabled = false;
                break;
        }
        
        // Update audio player events
        if (this.audioPlayer) {
            this.audioPlayer.onended = () => {
                this.playBtn.textContent = ' Play';
            };
            
            this.audioPlayer.onplay = () => {
                this.playBtn.textContent = ' Pause';
            };
            
            this.audioPlayer.onpause = () => {
                this.playBtn.textContent = ' Play';
            };
        }
    }

    showStatus(message, type = 'info') {
        this.recordingStatus.textContent = message;
        this.recordingStatus.className = `status status-${type}`;
        
        // Auto-hide non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (this.recordingStatus.textContent === message) {
                    this.recordingStatus.textContent = '';
                    this.recordingStatus.className = 'status';
                }
            }, 3000);
        }
    }

    showError(message) {
        this.showStatus(message, 'error');
        console.error('VoiceRecorder Error:', message);
    }

    refreshJournalList() {
        // Trigger refresh of journal list
        if (window.journalManager) {
            window.journalManager.loadJournals();
        }
    }
}
class JournalManager {
    constructor() {
        this.journals = [];
        this.currentPage = 1;
        this.perPage = 10;
        this.totalEntries = 0;
        this.currentSort = 'newest';
        this.searchQuery = '';
        
        // DOM elements
        this.journalList = document.getElementById('journalList');
        this.pagination = document.getElementById('pagination');
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.refreshBtn = document.getElementById('refreshBtn');
        
        // Modal elements
        this.modal = document.getElementById('entryModal');
        this.modalClose = document.getElementById('modalClose');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalAudio = document.getElementById('modalAudio');
        this.modalMeta = document.getElementById('modalMeta');
        this.modalTranscript = document.getElementById('modalTranscript');
        this.editEntryBtn = document.getElementById('editEntryBtn');
        this.copyTranscriptBtn = document.getElementById('copyTranscriptBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.deleteEntryBtn = document.getElementById('deleteEntryBtn');
        
        this.currentEntry = null;
        
        this.bindEvents();
        this.loadJournals();
    }

    bindEvents() {
        // Search and sort
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.filterAndDisplayJournals();
        });
        
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.currentPage = 1;
            this.filterAndDisplayJournals();
        });
        
        this.refreshBtn.addEventListener('click', () => {
            this.loadJournals();
        });
        
        // Modal events
        this.modalClose.addEventListener('click', () => {
            this.closeModal();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
        
        // Modal actions
        this.copyTranscriptBtn.addEventListener('click', () => {
            this.copyTranscript();
        });
        
        this.downloadBtn.addEventListener('click', () => {
            this.downloadAudio();
        });
        
        this.deleteEntryBtn.addEventListener('click', () => {
            this.deleteEntry();
        });
        
        this.editEntryBtn.addEventListener('click', () => {
            this.editEntry();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    async loadJournals() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/voice-journal/list');
            const result = await response.json();
            
            if (result.success) {
                this.journals = result.entries;
                this.totalEntries = result.total;
                this.filterAndDisplayJournals();
            } else {
                throw new Error(result.error || 'Failed to load journals');
            }
            
        } catch (error) {
            console.error('Load error:', error);
            this.showError('Failed to load voice notes');
            this.showEmptyState('Failed to load your voice notes. Please try refreshing the page.');
        }
    }

    filterAndDisplayJournals() {
        let filtered = [...this.journals];
        
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(entry => 
                (entry.title && entry.title.toLowerCase().includes(this.searchQuery)) ||
                (entry.transcript_text && entry.transcript_text.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'duration':
                    return (b.duration_sec || 0) - (a.duration_sec || 0);
                default:
                    return 0;
            }
        });
        
        // Apply pagination
        const start = (this.currentPage - 1) * this.perPage;
        const end = start + this.perPage;
        const paginated = filtered.slice(start, end);
        
        this.displayJournals(paginated, filtered.length);
        this.updatePagination(filtered.length);
    }

    displayJournals(journals, totalFiltered) {
        if (journals.length === 0) {
            if (this.searchQuery) {
                this.showEmptyState('No voice notes match your search.');
            } else {
                this.showEmptyState('No voice notes yet. Start by recording your first one!');
            }
            return;
        }
        
        const html = journals.map(entry => this.createEntryHTML(entry)).join('');
        this.journalList.innerHTML = html;
        
        // Bind click events
        this.journalList.querySelectorAll('.journal-entry').forEach((element, index) => {
            const entry = journals[index];
            
            element.addEventListener('click', (e) => {
                // Don't open modal if clicking on action buttons
                if (e.target.closest('.entry-actions')) return;
                this.openModal(entry);
            });
            
            // Bind action buttons
            const playBtn = element.querySelector('.play-btn');
            const quickDeleteBtn = element.querySelector('.quick-delete-btn');
            
            if (playBtn) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.playAudio(entry);
                });
            }
            
            if (quickDeleteBtn) {
                quickDeleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.confirmDelete(entry);
                });
            }
        });
    }

    createEntryHTML(entry) {
        const date = new Date(entry.created_at);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const duration = entry.duration_sec ? this.formatDuration(entry.duration_sec) : 'Unknown';
        const transcriptPreview = entry.transcript_text 
            ? entry.transcript_text.substring(0, 150) + (entry.transcript_text.length > 150 ? '...' : '')
            : 'No transcript available';
        
        return `
            <div class="journal-entry" data-id="${entry.id}">
                <div class="entry-header">
                    <h3 class="entry-title">${this.escapeHtml(entry.title || 'Untitled Voice Note')}</h3>
                    <div class="entry-meta">
                        <span> Date: ${formattedDate}</span>
                        <span> Time: ${formattedTime}</span>
                        <span> Duration: ${duration}</span>
                        <span> Language: ${entry.language || 'en-US'}</span>
                    </div>
                </div>
                
                <div class="entry-transcript">
                    ${this.escapeHtml(transcriptPreview)}
                </div>
                
                <div class="entry-actions">
                    <button class="btn btn-secondary play-btn"> Play</button>
                    <button class="btn btn-secondary quick-delete-btn"> Delete</button>
                </div>
            </div>
        `;
    }

    updatePagination(totalFiltered) {
        const totalPages = Math.ceil(totalFiltered / this.perPage);
        
        if (totalPages <= 1) {
            this.pagination.innerHTML = '';
            return;
        }
        
        let html = '';
        
        // Previous button
        if (this.currentPage > 1) {
            html += `<button class="btn btn-secondary" onclick="journalManager.goToPage(${this.currentPage - 1})">« Previous</button>`;
        }
        
        // Page info
        html += `<span class="page-info">Page ${this.currentPage} of ${totalPages}</span>`;
        
        // Next button
        if (this.currentPage < totalPages) {
            html += `<button class="btn btn-secondary" onclick="journalManager.goToPage(${this.currentPage + 1})">Next »</button>`;
        }
        
        this.pagination.innerHTML = html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.filterAndDisplayJournals();
    }

    openModal(entry) {
        this.currentEntry = entry;
        
        this.modalTitle.textContent = entry.title || 'Untitled Voice Note';
        this.modalAudio.src = '/' + entry.file_path;
        
        // Update meta information
        const date = new Date(entry.created_at);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        const duration = entry.duration_sec ? this.formatDuration(entry.duration_sec) : 'Unknown';
        const fileSize = entry.file_size ? this.formatFileSize(entry.file_size) : 'Unknown';
        
        this.modalMeta.innerHTML = `
            <div><strong> Date:</strong> ${formattedDate} at ${formattedTime}</div>
            <div><strong> Duration:</strong> ${duration}</div>
            <div><strong> Language:</strong> ${entry.language || 'en-US'}</div>
            <div><strong> Size:</strong> ${fileSize}</div>
        `;
        
        // Update transcript
        this.modalTranscript.textContent = entry.transcript_text || 'No transcript available';
        
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        
        // Pause audio if playing
        if (this.modalAudio && !this.modalAudio.paused) {
            this.modalAudio.pause();
        }
        
        this.currentEntry = null;
    }

    playAudio(entry) {
        // Create a temporary audio element to play the entry
        const audio = new Audio('/' + entry.file_path);
        audio.play().catch(error => {
            console.error('Play error:', error);
            this.showToast('Failed to play audio', 'error');
        });
    }

    copyTranscript() {
        if (!this.currentEntry || !this.currentEntry.transcript_text) {
            this.showToast('No transcript to copy', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(this.currentEntry.transcript_text)
            .then(() => {
                this.showToast('Transcript copied to clipboard!', 'success');
            })
            .catch(error => {
                console.error('Copy error:', error);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = this.currentEntry.transcript_text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    this.showToast('Transcript copied to clipboard!', 'success');
                } catch (err) {
                    this.showToast('Failed to copy transcript', 'error');
                }
                document.body.removeChild(textArea);
            });
    }

    downloadAudio() {
        if (!this.currentEntry) {
            this.showToast('No entry selected', 'error');
            return;
        }
        
        const link = document.createElement('a');
        link.href = '/' + this.currentEntry.file_path;
        link.download = `${this.currentEntry.title || 'voice-note'}-${this.currentEntry.id}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Download started!', 'success');
    }

    editEntry() {
        if (!this.currentEntry) {
            this.showToast('No entry selected', 'error');
            return;
        }
        
        // Create inline edit form
        const newTitle = prompt('Edit title:', this.currentEntry.title || '');
        if (newTitle === null) return; // User cancelled
        
        const newTranscript = prompt('Edit transcript:', this.currentEntry.transcript_text || '');
        if (newTranscript === null) return; // User cancelled
        
        this.updateEntry(this.currentEntry.id, {
            title: newTitle.trim(),
            transcript_text: newTranscript.trim()
        });
    }

    async updateEntry(entryId, data) {
        try {
            const response = await fetch(`/api/voice-journal/${entryId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('Entry updated successfully!', 'success');
                
                // Update current entry
                this.currentEntry = result.entry;
                
                // Update modal display
                this.modalTitle.textContent = result.entry.title || 'Untitled Voice Note';
                this.modalTranscript.textContent = result.entry.transcript_text || 'No transcript available';
                
                // Refresh list
                this.loadJournals();
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            this.showToast('Failed to update entry: ' + error.message, 'error');
        }
    }

    confirmDelete(entry) {
        if (confirm(`Are you sure you want to delete "${entry.title || 'this voice note'}"?\n\nThis action cannot be undone.`)) {
            this.deleteEntryById(entry.id);
        }
    }

    deleteEntry() {
        if (!this.currentEntry) {
            this.showToast('No entry selected', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to delete "${this.currentEntry.title || 'this voice note'}"?\n\nThis action cannot be undone.`)) {
            this.deleteEntryById(this.currentEntry.id);
        }
    }

    async deleteEntryById(entryId) {
        try {
            const response = await fetch(`/api/voice-journal/${entryId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showToast('Entry deleted successfully!', 'success');
                
                // Close modal if it's open
                if (this.currentEntry && this.currentEntry.id === entryId) {
                    this.closeModal();
                }
                
                // Refresh list
                this.loadJournals();
            } else {
                throw new Error(result.error || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.showToast('Failed to delete entry: ' + error.message, 'error');
        }
    }

    showLoading() {
        this.journalList.innerHTML = '<div class="loading">Loading your voice notes...</div>';
        this.pagination.innerHTML = '';
    }

    showEmptyState(message) {
        this.journalList.innerHTML = `
            <div class="empty-state">
                <h3> ${message}</h3>
                <p>Your voice notes will appear here once you start recording.</p>
            </div>
        `;
        this.pagination.innerHTML = '';
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast') || this.createToast();
        
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }

    createToast() {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.style.display = 'none';
        document.body.appendChild(toast);
        return toast;
    }

    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}
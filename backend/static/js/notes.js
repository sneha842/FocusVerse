// Focus Notes Sidebar JavaScript

// Notes data and state
let notes = JSON.parse(localStorage.getItem('focusverse-notes') || '[]');
let noteIdCounter = parseInt(localStorage.getItem('focusverse-note-id-counter') || '0');

// Initialize notes on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
});

// Toggle notes sidebar visibility
function toggleNotesSidebar() {
    const sidebar = document.getElementById('notesSidebar');
    sidebar.classList.toggle('open');
}

// Add a new note
function addNewNote() {
    const note = {
        id: ++noteIdCounter,
        type: 'note',
        content: '',
        timestamp: new Date().toLocaleString(),
        completed: false
    };
    notes.unshift(note);
    saveNotes();
    renderNotes();
    
    // Focus on the new note
    setTimeout(() => {
        const newNoteElement = document.querySelector(`[data-note-id="${note.id}"] .note-content`);
        if (newNoteElement) {
            newNoteElement.focus();
        }
    }, 100);
}

// Add a new task
function addNewTask() {
    const task = {
        id: ++noteIdCounter,
        type: 'task',
        content: '',
        timestamp: new Date().toLocaleString(),
        completed: false
    };
    notes.unshift(task);
    saveNotes();
    renderNotes();
    
    // Focus on the new task
    setTimeout(() => {
        const newTaskElement = document.querySelector(`[data-note-id="${task.id}"] .note-content`);
        if (newTaskElement) {
            newTaskElement.focus();
        }
    }, 100);
}

// Update note content
function updateNoteContent(id, content) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.content = content;
        saveNotes();
    }
}

// Toggle task completion status
function toggleTaskCompletion(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.completed = !note.completed;
        saveNotes();
        renderNotes();
    }
}

// Delete a note
function deleteNote(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        renderNotes();
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('focusverse-notes', JSON.stringify(notes));
    localStorage.setItem('focusverse-note-id-counter', noteIdCounter.toString());
}

// Load notes from localStorage
function loadNotes() {
    renderNotes();
}

// Render all notes in the container
function renderNotes() {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    if (notes.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No notes yet. Add one to get started!</div>';
        return;
    }

    container.innerHTML = notes.map(note => `
        <div class="note-card ${note.type} ${note.completed ? 'completed' : ''}" data-note-id="${note.id}">
            ${note.type === 'task' ? `<input type="checkbox" class="task-checkbox" ${note.completed ? 'checked' : ''} onchange="toggleTaskCompletion(${note.id})">` : ''}
            <textarea class="note-content" placeholder="${note.type === 'task' ? 'Enter task...' : 'Enter note...'}" onblur="updateNoteContent(${note.id}, this.value)">${note.content}</textarea>
            <div class="note-actions">
                <span class="note-timestamp">${note.timestamp}</span>
                <div class="note-buttons">
                    <button class="note-btn" onclick="deleteNote(${note.id})" title="Delete">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Auto-save notes when typing
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('note-content')) {
        const noteId = parseInt(e.target.closest('.note-card').dataset.noteId);
        updateNoteContent(noteId, e.target.value);
    }
});

// Close sidebar when clicking outside
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('notesSidebar');
    const toggleBtn = document.getElementById('notesToggle');
    
    if (sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('open');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N to add new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addNewNote();
    }
    
    // Ctrl/Cmd + Shift + N to add new task
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        addNewTask();
    }
    
    // Escape to close sidebar
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('notesSidebar');
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// Export functions for global access
window.toggleNotesSidebar = toggleNotesSidebar;
window.addNewNote = addNewNote;
window.addNewTask = addNewTask;
window.updateNoteContent = updateNoteContent;
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteNote = deleteNote;

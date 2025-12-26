// Task management application
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        
        this.initializeElements();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.taskInput = document.getElementById('taskInput');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.taskCount = document.getElementById('taskCount');
        this.emptyState = document.getElementById('emptyState');
    }

    bindEvents() {
        // Add task events
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter events
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Task list events (event delegation)
        this.taskList.addEventListener('click', (e) => this.handleTaskClick(e));
        this.taskList.addEventListener('keypress', (e) => this.handleTaskKeypress(e));
        this.taskList.addEventListener('blur', (e) => this.handleTaskBlur(e), true);
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveToStorage();
        this.taskInput.value = '';
        this.render();
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        if (taskElement) {
            taskElement.classList.add('removing');
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== id);
                this.saveToStorage();
                this.render();
            }, 300);
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    editTask(id) {
        if (this.editingTaskId === id) return;
        
        this.editingTaskId = id;
        const taskElement = document.querySelector(`[data-id="${id}"] .task-text`);
        if (taskElement) {
            taskElement.contentEditable = true;
            taskElement.classList.add('editing');
            taskElement.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(taskElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    saveTaskEdit(id, newText) {
        const task = this.tasks.find(task => task.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.saveToStorage();
        }
        this.editingTaskId = null;
        this.render();
    }

    cancelTaskEdit() {
        this.editingTaskId = null;
        this.render();
    }

    handleTaskClick(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;

        const taskId = parseInt(taskItem.dataset.id);

        if (e.target.classList.contains('task-checkbox')) {
            this.toggleTask(taskId);
        } else if (e.target.classList.contains('edit-btn')) {
            this.editTask(taskId);
        } else if (e.target.classList.contains('delete-btn')) {
            this.deleteTask(taskId);
        } else if (e.target.classList.contains('task-text') && !e.target.classList.contains('editing')) {
            this.editTask(taskId);
        }
    }

    handleTaskKeypress(e) {
        if (e.key === 'Enter' && e.target.classList.contains('task-text')) {
            e.preventDefault();
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            this.saveTaskEdit(taskId, e.target.textContent);
        }
    }

    handleTaskBlur(e) {
        if (e.target.classList.contains('task-text') && e.target.classList.contains('editing')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            this.saveTaskEdit(taskId, e.target.textContent);
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    updateTaskCount() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        let countText = '';
        switch (this.currentFilter) {
            case 'completed':
                countText = `${completedTasks} completed ${completedTasks === 1 ? 'task' : 'tasks'}`;
                break;
            case 'pending':
                countText = `${pendingTasks} pending ${pendingTasks === 1 ? 'task' : 'tasks'}`;
                break;
            default:
                countText = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
                break;
        }

        this.taskCount.textContent = countText;
    }

    renderTask(task) {
        const isEditing = this.editingTaskId === task.id;
        
        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="task-text ${isEditing ? 'editing' : ''}" 
                     contenteditable="${isEditing}">${task.text}</div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" title="Delete task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.taskList.innerHTML = '';
            this.emptyState.classList.add('show');
        } else {
            this.emptyState.classList.remove('show');
            this.taskList.innerHTML = filteredTasks.map(task => this.renderTask(task)).join('');
        }
        
        this.updateTaskCount();
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
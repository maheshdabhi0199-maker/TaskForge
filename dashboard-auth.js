// Add this script to the beginning of dashboard.html (after opening <script> tag or in a separate file)

// Check if user is logged in
window.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(sessionStorage.getItem('taskforge_current_user') || 'null');
  
  if (!currentUser) {
    // Redirect to login if not logged in
    window.location.href = 'login.html';
    return;
  }

  // Update welcome message with user's name
  const titleElement = document.querySelector('.header .title');
  if (titleElement && currentUser.name) {
    const firstName = currentUser.name.split(' ')[0];
    titleElement.innerHTML = `Welcome, ${firstName}! <span>Task</span><span style="color: var(--pink)">Forge</span>`;
  }
});

// Handle sign out
const signOutBtn = document.querySelector('.sign-out-cta');
if (signOutBtn) {
  signOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Confirm sign out
    if (confirm('Are you sure you want to sign out?')) {
      // Clear current user
      sessionStorage.removeItem('taskforge_current_user');
      
      // Redirect to login
      window.location.href = 'login.html';
    }
  });
}

// Handle contact form submission
const contactForm = document.querySelector('.contact-view');
if (contactForm) {
  const contactBtn = contactForm.querySelector('.contact-btn');
  const nameInput = contactForm.querySelector('#uname');
  const emailInput = contactForm.querySelector('#email');
  const messageInput = contactForm.querySelector('#message');
  
  if (contactBtn && nameInput && emailInput && messageInput) {
    // Pre-fill with user data
    const currentUser = JSON.parse(sessionStorage.getItem('taskforge_current_user') || 'null');
    if (currentUser) {
      nameInput.value = currentUser.name;
      emailInput.value = currentUser.email;
    }

    contactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      
      // Basic validation
      if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      if (message.length < 10) {
        alert('Message must be at least 10 characters');
        return;
      }
      
      // Store contact message in memory
      const contacts = JSON.parse(sessionStorage.getItem('taskforge_contacts') || '[]');
      contacts.push({
        id: Date.now(),
        name: name,
        email: email,
        message: message,
        submittedAt: new Date().toISOString()
      });
      sessionStorage.setItem('taskforge_contacts', JSON.stringify(contacts));
      
      // Show success notification
      const notification = document.getElementById('notification');
      if (notification) {
        notification.innerHTML = `
          <iconify-icon icon="mdi:check-circle-outline" style="color: black" width="24" height="24"></iconify-icon>
          <p>Message sent successfully!</p>
        `;
        notification.classList.add('show');
        
        setTimeout(() => {
          notification.classList.remove('show');
        }, 3000);
      }
      
      // Clear form
      messageInput.value = '';
      
      // Optionally switch back to list view
      setTimeout(() => {
        const listRadio = document.getElementById('list');
        if (listRadio) {
          listRadio.checked = true;
          listRadio.dispatchEvent(new Event('change'));
        }
      }, 3000);
    });
  }
}

// Enhanced task management with user association
const addTaskForm = document.querySelector('#set-task-overlay form');
if (addTaskForm) {
  addTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentUser = JSON.parse(sessionStorage.getItem('taskforge_current_user') || 'null');
    if (!currentUser) return;
    
    const nameInput = addTaskForm.querySelector('#name');
    const descriptionInput = addTaskForm.querySelector('#description');
    const dateInput = addTaskForm.querySelector('#date');
    const statusInput = addTaskForm.querySelector('#status-option');
    
    const taskName = nameInput.value.trim();
    const taskDescription = descriptionInput.value.trim();
    const taskDate = dateInput.value.trim();
    const taskStatus = statusInput.value;
    
    if (!taskName || !taskDescription || !taskDate) {
      alert('Please fill in all fields');
      return;
    }
    
    // Get user's tasks
    const userTasks = JSON.parse(sessionStorage.getItem(`taskforge_tasks_${currentUser.id}`) || '[]');
    
    // Create new task
    const newTask = {
      id: Date.now(),
      name: taskName,
      description: taskDescription,
      dueDate: taskDate,
      status: taskStatus,
      createdAt: new Date().toISOString(),
      userId: currentUser.id
    };
    
    userTasks.push(newTask);
    
    // Save tasks
    sessionStorage.setItem(`taskforge_tasks_${currentUser.id}`, JSON.stringify(userTasks));
    
    // Show success notification
    const notification = document.getElementById('notification');
    if (notification) {
      notification.innerHTML = `
        <iconify-icon icon="mdi:check-circle-outline" style="color: black" width="24" height="24"></iconify-icon>
        <p>Task added successfully!</p>
      `;
      notification.classList.remove('green-background');
      notification.classList.add('blue-background');
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.remove('blue-background');
        notification.classList.add('green-background');
      }, 3000);
    }
    
    // Clear form
    nameInput.value = '';
    descriptionInput.value = '';
    dateInput.value = '';
    statusInput.value = 'to-do';
    
    // Close overlay
    const overlay = document.getElementById('set-task-overlay');
    if (overlay) {
      overlay.classList.add('hide');
      document.body.classList.remove('overflow-hidden');
    }
    
    // Note: In a real application, you would reload the tasks list here
    // For this demo, tasks are static in the HTML
  });
}
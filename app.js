// Demo data
const demoData = {
  questions: [
    {
      question: "What is the remote work policy?",
      answer: "According to the Employee Handbook, remote work is allowed up to 3 days per week with manager approval. Remote work arrangements must be documented and reviewed quarterly. All remote workers must maintain secure internet connections and follow IT security protocols.",
      source: "Employee Handbook, Section 2.2",
      responseTime: "1.2s",
      accuracy: "94%",
      sourceCount: "2"
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password: 1) Go to the company intranet password reset page, 2) Enter your employee ID and email address, 3) Check your email for reset instructions, 4) Follow the link and create a new password. If issues persist, contact IT support at ext. 4357.",
      source: "IT Security Policy, Section 2.3",
      responseTime: "0.8s",
      accuracy: "97%",
      sourceCount: "1"
    },
    {
      question: "What are my vacation entitlements?",
      answer: "Full-time employees earn 15 days of vacation in their first year, increasing to 20 days after 5 years of service. Vacation requests must be submitted at least 2 weeks in advance and are subject to manager approval based on business needs.",
      source: "Employee Handbook, Section 6.1",
      responseTime: "1.1s",
      accuracy: "92%",
      sourceCount: "1"
    },
    {
      question: "Who should I contact for IT support?",
      answer: "For technical support, contact the IT helpdesk at it-support@acme.com or call ext. 4357. Support hours are 8:00 AM to 6:00 PM, Monday through Friday. For after-hours emergencies, call 1-800-555-HELP.",
      source: "IT Security Policy, Section 8.2",
      responseTime: "0.9s",
      accuracy: "96%",
      sourceCount: "1"
    }
  ]
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing RAG Demo Application...');
  
  // Initialize all functionality
  initNavigation();
  initDemo();
  initFAQ();
  initCodeTabs();
  initContactHandlers();
  
  console.log('RAG Demo Application initialized successfully!');
});

// Navigation functionality
function initNavigation() {
  console.log('Initializing navigation...');
  
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');
  
  if (navButtons.length === 0) {
    console.error('No navigation buttons found');
    return;
  }
  
  if (sections.length === 0) {
    console.error('No sections found');
    return;
  }
  
  navButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const targetSection = button.getAttribute('data-section');
      console.log('Navigation clicked:', targetSection);
      navigateToSection(targetSection);
      updateActiveNavButton(button);
    });
  });

  // Handle navigation from CTA buttons
  const ctaButtons = document.querySelectorAll('[data-section]');
  ctaButtons.forEach(button => {
    if (!button.classList.contains('nav-btn')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = button.getAttribute('data-section');
        console.log('CTA clicked:', targetSection);
        navigateToSection(targetSection);
        updateActiveNavButtonBySection(targetSection);
      });
    }
  });
  
  console.log('Navigation initialized with', navButtons.length, 'buttons and', sections.length, 'sections');
}

function navigateToSection(sectionId) {
  console.log('Navigating to section:', sectionId);
  
  const sections = document.querySelectorAll('.section');
  const targetSection = document.getElementById(sectionId);
  
  if (!targetSection) {
    console.error('Target section not found:', sectionId);
    return;
  }

  // Hide all sections
  sections.forEach(section => {
    section.classList.remove('active');
  });

  // Show target section
  targetSection.classList.add('active');
  
  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  console.log('Successfully navigated to:', sectionId);
}

function updateActiveNavButton(activeButton) {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.classList.remove('active');
  });
  activeButton.classList.add('active');
}

function updateActiveNavButtonBySection(sectionId) {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.classList.remove('active');
    if (button.getAttribute('data-section') === sectionId) {
      button.classList.add('active');
    }
  });
}

// Demo functionality
function initDemo() {
  console.log('Initializing demo...');
  
  const questionButtons = document.querySelectorAll('.question-btn');
  
  if (questionButtons.length === 0) {
    console.warn('No question buttons found');
    return;
  }
  
  questionButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
      console.log('Question clicked:', index);
      handleQuestionClick(index);
    });
  });
  
  console.log('Demo initialized with', questionButtons.length, 'question buttons');
}

function handleQuestionClick(questionIndex) {
  const questionData = demoData.questions[questionIndex];
  const queryDisplay = document.getElementById('current-query');
  const answerDisplay = document.getElementById('answer-display');
  const responseTimeElement = document.getElementById('response-time');
  const accuracyScoreElement = document.getElementById('accuracy-score');
  const sourceCountElement = document.getElementById('source-count');

  if (!queryDisplay || !answerDisplay) {
    console.error('Demo display elements not found');
    return;
  }

  // Update query
  queryDisplay.textContent = questionData.question;

  // Show loading state
  answerDisplay.innerHTML = '<div class="loading-answer">Processing query<span class="loading-dots"></span></div>';
  
  if (responseTimeElement) responseTimeElement.textContent = '--';
  if (accuracyScoreElement) accuracyScoreElement.textContent = '--';
  if (sourceCountElement) sourceCountElement.textContent = '--';

  // Simulate processing delay
  setTimeout(() => {
    // Update answer
    answerDisplay.innerHTML = `
      <div class="answer-text">${questionData.answer}</div>
      <div class="source-info">
        <strong>Source:</strong> ${questionData.source}
      </div>
    `;

    // Update metrics
    if (responseTimeElement) responseTimeElement.textContent = questionData.responseTime;
    if (accuracyScoreElement) accuracyScoreElement.textContent = questionData.accuracy;
    if (sourceCountElement) sourceCountElement.textContent = questionData.sourceCount;

    console.log('Demo answer displayed for question:', questionIndex);
  }, 1500);
}

// FAQ functionality
function initFAQ() {
  console.log('Initializing FAQ...');
  
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  if (faqQuestions.length === 0) {
    console.warn('No FAQ questions found');
    return;
  }
  
  faqQuestions.forEach((question, index) => {
    question.addEventListener('click', function() {
      console.log('FAQ clicked:', index);
      const faqItem = question.parentElement;
      const isActive = faqItem.classList.contains('active');

      // Close all FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      // Toggle current item
      if (!isActive) {
        faqItem.classList.add('active');
      }
    });
  });
  
  console.log('FAQ initialized with', faqQuestions.length, 'questions');
}

// Code tabs functionality
function initCodeTabs() {
  console.log('Initializing code tabs...');
  
  const codeTabs = document.querySelectorAll('.code-tab');
  const codePanels = document.querySelectorAll('.code-panel');
  
  if (codeTabs.length === 0) {
    console.warn('No code tabs found');
    return;
  }
  
  codeTabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      const targetTab = tab.getAttribute('data-tab');
      console.log('Code tab clicked:', targetTab);
      
      // Update active tab
      codeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active panel
      codePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetTab) {
          panel.classList.add('active');
        }
      });
    });
  });
  
  console.log('Code tabs initialized with', codeTabs.length, 'tabs');
}

// Contact form handlers (simulation)
function initContactHandlers() {
  console.log('Initializing contact handlers...');
  
  const contactButtons = document.querySelectorAll('.contact-buttons .btn');
  
  contactButtons.forEach((button, index) => {
    button.addEventListener('click', function() {
      const action = button.textContent.trim();
      console.log('Contact button clicked:', action);
      
      if (action.includes('Demo')) {
        showNotification('Demo scheduled! We will contact you within 24 hours.', 'success');
      } else if (action.includes('Technical')) {
        showNotification('Technical documentation sent to your email!', 'info');
      }
    });
  });
  
  console.log('Contact handlers initialized with', contactButtons.length, 'buttons');
}

// Notification system
function showNotification(message, type = 'info') {
  console.log('Showing notification:', message, type);
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;

  // Add styles for notification if not already present
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-base);
        padding: var(--space-16);
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: var(--space-12);
        max-width: 400px;
        transform: translateX(100%);
        transition: transform var(--duration-normal) var(--ease-standard);
      }
      
      .notification--success {
        border-left: 4px solid var(--color-success);
      }
      
      .notification--info {
        border-left: 4px solid var(--color-info);
      }
      
      .notification-close {
        background: none;
        border: none;
        font-size: var(--font-size-lg);
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: 0;
        margin-left: auto;
      }
    `;
    document.head.appendChild(style);
  }

  // Add to document
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  // Close button functionality
  const closeButton = notification.querySelector('.notification-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      removeNotification(notification);
    });
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeNotification(notification);
  }, 5000);
}

function removeNotification(notification) {
  if (notification && notification.parentElement) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
    }, 300);
  }
}

// Error handling
window.addEventListener('error', function(e) {
  console.error('Application error:', e.error);
});

// Export functions for debugging
window.RAGDemo = {
  navigateToSection,
  showNotification,
  demoData,
  handleQuestionClick
};
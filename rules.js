// Rules page JavaScript for tab navigation
document.addEventListener('DOMContentLoaded', function() {
    initializeRulesTabs();
});

function initializeRulesTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const ruleSections = document.querySelectorAll('.rule-section');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            
            // Remove active class from all tabs and sections
            tabButtons.forEach(btn => btn.classList.remove('active'));
            ruleSections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            button.classList.add('active');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// Smooth scroll to top when switching tabs
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const activeTab = document.querySelector('.tab-button.active');
        const allTabs = Array.from(document.querySelectorAll('.tab-button'));
        const currentIndex = allTabs.indexOf(activeTab);
        
        let newIndex;
        if (e.key === 'ArrowLeft') {
            newIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
        } else {
            newIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        allTabs[newIndex].click();
        scrollToTop();
    }
});

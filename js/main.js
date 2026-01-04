document.addEventListener('DOMContentLoaded', function () {

    /**
     * Fetches HTML content from a file and injects it into a specified element.
     * @param {string} filePath - The path to the HTML file to load.
     * @param {string} elementId - The ID of the element to inject the content into.
     * @param {function} [callback] - An optional function to run after the content is loaded.
     */
    const loadHTML = (filePath, elementId, callback) => {
        fetch(filePath)
            .then(response => response.ok ? response.text() : Promise.reject('File not found.'))
            .then(data => {
                const element = document.getElementById(elementId);
                if (element) element.innerHTML = data;
                if (callback) callback();
            })
            .catch(error => console.error(`Error loading ${filePath}:`, error));
    };

    // Sets up the interactive toggle for the mobile navigation menu.
    const initializeMobileMenu = () => {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        }
    };

    /**
     * Sets up the interactive accordion functionality for the FAQ page.
     */
    const initializeFaqAccordion = () => {
        const faqToggles = document.querySelectorAll('.faq-toggle');

        faqToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling;
                const icon = toggle.querySelector('svg');

                // Toggle the content's visibility
                content.classList.toggle('hidden');

                // Rotate the icon to indicate state
                icon.classList.toggle('rotate-180');
            });
        });
    };

    /**
     * Sets up the interactive tab functionality.
     */
    const initializeTabs = () => {
        const tabButtons = document.querySelectorAll('.tab-button');
        if (tabButtons.length === 0) return; // Don't run if no tabs on page

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPanel = document.querySelector(button.dataset.tabTarget);

                // Deactivate all buttons and hide all panels
                tabButtons.forEach(btn => {
                    btn.classList.remove('text-[#EA0264]', 'border-[#EA0264]');
                    btn.classList.add('text-gray-500', 'border-transparent');

                    const panel = document.querySelector(btn.dataset.tabTarget);
                    if (panel) panel.classList.add('hidden');
                });

                // Activate the clicked button and show its panel
                button.classList.add('text-[#EA0264]', 'border-[#EA0264]');
                button.classList.remove('text-gray-500', 'border-transparent');

                if (targetPanel) targetPanel.classList.remove('hidden');
            });
        });
    };

    // Load the navbar, then initialize its mobile menu functionality.
    if (document.getElementById('navbar-placeholder')) {
        loadHTML('navbar.html', 'navbar-placeholder', initializeMobileMenu);
    } else {
        initializeMobileMenu();
    }
    // Footer loading removed - using static footer now

    // Initialize the FAQ accordion on pages that have it.
    initializeFaqAccordion();

    // Initialize the tabs on pages that have them.
    initializeTabs();
});
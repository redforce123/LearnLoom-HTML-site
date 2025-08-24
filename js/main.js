document.addEventListener('DOMContentLoaded', function() {

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

    // Load the navbar, then initialize its mobile menu functionality.
    loadHTML('navbar.html', 'navbar-placeholder', initializeMobileMenu);
    // Load the footer. (Assuming you have a footer.html file)
    loadHTML('footer.html', 'footer-placeholder');
});

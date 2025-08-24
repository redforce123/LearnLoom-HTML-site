document.addEventListener('DOMContentLoaded', () => {

    /**
     * Dynamically adds a favicon to the document's head.
     * This avoids having to add the <link> tag to every HTML file.
     */
    const addFavicon = () => {
        const faviconUrl = 'Images/LearnLoom_Logo.png'; // Define the path once here
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
    };
    /**
     * Fetches an HTML component and replaces a placeholder element with its content.
     * @param {string} placeholderId The ID of the element to replace.
     * @param {string} componentUrl The relative URL of the HTML component to load.
     */
    const loadComponent = async (placeholderId, componentUrl) => {
        try {
            const placeholder = document.getElementById(placeholderId);
            if (!placeholder) return;

            const response = await fetch(componentUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${componentUrl}: ${response.statusText}`);
            }
            const html = await response.text();
            // Use outerHTML to replace the placeholder itself, preventing nested <header> or <footer> tags.
            placeholder.outerHTML = html;
        } catch (error) {
            console.error(`Error loading component from ${componentUrl}:`, error);
            placeholder.innerHTML = `<p style="color:red;text-align:center;">Failed to load ${componentUrl}</p>`;
        }
    };

    /**
     * Sets the 'active' state on the navigation link corresponding to the current page.
     */
    const setActiveNavLink = () => {
        const navLinks = document.querySelectorAll('header nav a');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            const linkPage = new URL(link.href).pathname.split('/').pop();
            if (link.classList.contains('bg-[#EA0264]')) return; // Skip the "Book Demo" button

            if (linkPage === currentPage) {
                link.classList.remove('text-[#7A7A7A]');
                link.classList.add('text-[#EA0264]', 'font-semibold');
                link.setAttribute('aria-current', 'page'); // Important for accessibility
            }
        });
    };

    const initializePage = async () => {
        addFavicon(); // Add the favicon to the page
        await Promise.all([
            loadComponent('navbar-placeholder', 'navbar.html'),
            loadComponent('footer-placeholder', 'footer.html')
        ]);
        setActiveNavLink(); // Set active link after components are loaded
    };

    initializePage();
});

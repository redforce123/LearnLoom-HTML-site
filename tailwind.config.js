/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html", // Scans all HTML files in the root (e.g., index.html)
    "./navbar.html", // Explicitly scan the navbar partial
    "./footer.html", // Explicitly scan the footer partial
    "./blogs/**/*.html", // Scans all HTML files in the blogs folder
    "./js/**/*.js" // Scans all JavaScript files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

class ThemeController {
    constructor() {
        // Paths relative to screen_home.html location
        this.lightThemePath = '../style/colors/colors.css';
        this.darkThemePath = '../style/colors/night/colors.css';
        this.init();
    }

    init() {
        // Check if theme link already exists to avoid duplicates
        const existingTheme = document.querySelector('link[data-theme]');
        if (existingTheme) {
            this.colorLink = existingTheme;
        } else {
            // Create a new link element for theme colors
            this.colorLink = document.createElement('link');
            this.colorLink.rel = 'stylesheet';
            this.colorLink.setAttribute('data-theme', 'true');
            
            // Add it to the head
            document.head.appendChild(this.colorLink);
        }

        // Initial theme check
        this.checkAndApplyTheme();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.checkAndApplyTheme();
        });
    }

    checkAndApplyTheme() {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.colorLink.href = isDarkMode ? this.darkThemePath : this.lightThemePath;
    }

    // Manual theme override if needed
    setTheme(isDark) {
        this.colorLink.href = isDark ? this.darkThemePath : this.lightThemePath;
    }
}

// Initialize theme controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeController = new ThemeController();
});

// Export for use in other modules if needed
module.exports = ThemeController;
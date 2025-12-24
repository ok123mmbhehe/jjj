// ======= SECURITY & FEATURES =======

// ======= DETECT DEVTOOLS OPEN =======
let devtools = { open: false };
const threshold = 160;

setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
            devtools.open = true;
            console.warn('Developer Tools detected');
        }
    } else {
        devtools.open = false;
    }
}, 500);

console.log('Deramirum Security & Features Loaded ✓');

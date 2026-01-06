// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// ===== ANIMATED COUNTER =====
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Trigger counters when section is visible
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
            });
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.download-stats');
if (statsSection) {
    observer.observe(statsSection);
}

// ===== DOWNLOAD FUNCTIONALITY =====
const modal = document.getElementById('downloadModal');
const closeBtn = document.querySelector('.close');
const downloadPlatformSpan = document.getElementById('downloadPlatform');

// Download tracking data
let downloadStats = {
    android: 0,
    ios: 0,
    total: 0
};

// Load download stats from localStorage
function loadDownloadStats() {
    const saved = localStorage.getItem('strayConnectedDownloads');
    if (saved) {
        downloadStats = JSON.parse(saved);
    }
}

// Save download stats to localStorage
function saveDownloadStats() {
    localStorage.setItem('strayConnectedDownloads', JSON.stringify(downloadStats));
}

// Initialize stats
loadDownloadStats();

// Download function
async function downloadApp(platform) {
    // Show modal
    modal.style.display = 'block';
    downloadPlatformSpan.textContent = platform === 'android' ? 'Android' : 'iOS';
    
    // Update download stats
    downloadStats[platform]++;
    downloadStats.total++;
    saveDownloadStats();
    
    // Track download event (you can send this to your backend)
    trackDownload(platform);
    
    // Simulate download preparation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start actual download
    const downloadUrl = getDownloadUrl(platform);
    
    if (downloadUrl) {
        // Create temporary link and trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `StrayConnected_${platform}.${platform === 'android' ? 'apk' : 'ipa'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        document.querySelector('.download-message').textContent = 'Download started! Check your downloads folder.';
    } else {
        // Show error message
        document.querySelector('.download-message').textContent = 'Download link not available. Please contact support.';
    }
}

// Get download URL based on platform
function getDownloadUrl(platform) {
    // Replace these with your actual download URLs
    const urls = {
        android: './downloads/StrayConnected.apk',  // Update with actual URL
        ios: './downloads/StrayConnected.ipa'        // Update with actual URL
    };
    
    return urls[platform] || null;
}

// Track download event (send to backend/analytics)
async function trackDownload(platform) {
    const downloadData = {
        platform: platform,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        screenResolution: `${window.screen.width}x${window.screen.height}`
    };
    
    // Log to console (in production, send to your backend API)
    console.log('Download tracked:', downloadData);
    
    // Example: Send to backend API
    try {
        // Uncomment and update with your actual API endpoint
        /*
        const response = await fetch('/api/track-download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(downloadData)
        });
        
        if (response.ok) {
            console.log('Download tracked successfully');
        }
        */
    } catch (error) {
        console.error('Error tracking download:', error);
    }
}

// Close modal
closeBtn.onclick = function() {
    modal.style.display = 'none';
    // Reset message
    document.querySelector('.download-message').textContent = 'Your download will start shortly...';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        document.querySelector('.download-message').textContent = 'Your download will start shortly...';
    }
}

// ===== FEATURE CARDS ANIMATION =====
const featureCards = document.querySelectorAll('.feature-card, .highlight-item');

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            cardObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

featureCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    cardObserver.observe(card);
});

// ===== PLATFORM DETECTION =====
function detectPlatform() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    if (/android/i.test(userAgent)) {
        return 'android';
    }
    
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return 'ios';
    }
    
    return 'desktop';
}

// Highlight recommended platform
window.addEventListener('load', () => {
    const platform = detectPlatform();
    
    if (platform === 'android') {
        const androidBtn = document.querySelector('.android-btn');
        if (androidBtn) {
            androidBtn.style.border = '3px solid #3DDC84';
            androidBtn.style.transform = 'scale(1.05)';
        }
    } else if (platform === 'ios') {
        const iosBtn = document.querySelector('.ios-btn');
        if (iosBtn) {
            iosBtn.style.border = '3px solid #000000';
            iosBtn.style.transform = 'scale(1.05)';
        }
    }
});

// ===== UTILITY FUNCTIONS =====

// Get download statistics
function getDownloadStats() {
    loadDownloadStats();
    return downloadStats;
}

// Export stats for admin dashboard
function exportDownloadStats() {
    const stats = getDownloadStats();
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `download-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'D' to focus on download section
    if (e.key === 'd' || e.key === 'D') {
        if (!e.ctrlKey && !e.metaKey) {
            const downloadSection = document.getElementById('download');
            if (downloadSection) {
                downloadSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
    
    // Press ESC to close modal
    if (e.key === 'Escape') {
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
            document.querySelector('.download-message').textContent = 'Your download will start shortly...';
        }
    }
});

// ===== CONSOLE EASTER EGG =====
console.log('%c🐾 StrayConnected', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cThanks for checking out the console!', 'font-size: 14px; color: #764ba2;');
console.log('%cWant to see download stats? Type: getDownloadStats()', 'font-size: 12px; color: #666;');
console.log('%cExport stats? Type: exportDownloadStats()', 'font-size: 12px; color: #666;');

// Make functions available in console
window.getDownloadStats = getDownloadStats;
window.exportDownloadStats = exportDownloadStats;

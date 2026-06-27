// നിങ്ങളുടെ ഗൂഗിൾ ആപ്പ് സ്ക്രിപ്റ്റ് വെബ് ആപ്പ് URL ഇവിടെ നൽകണം 
// (ഉദാഹരണത്തിന്: https://script.google.com/macros/s/AKfycbw.../exec)
const WEB_APP_URL = "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE"; 

let currentImageData = [];
let currentIndex = 0;
let autoScrollInterval;
let captionTimeout;
let touchStartX = 0;

// Navbar Auto-Collapse (Links & Outside Clicks)
document.addEventListener('click', function (event) {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');

    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const isClickInsideMenu = navbarCollapse.contains(event.target);
        const isClickOnToggler = navbarToggler.contains(event.target);
        const isClickOnLink = event.target.classList.contains('nav-link');

        if (isClickOnLink || (!isClickInsideMenu && !isClickOnToggler)) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse) || new bootstrap.Collapse(navbarCollapse);
            bsCollapse.hide();
        }
    }
});

// Fetching Gallery from Web App instead of google.script.run
document.addEventListener('DOMContentLoaded', () => {
    if (WEB_APP_URL !== "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE") {
        fetch(WEB_APP_URL)
            .then(response => response.json())
            .then(data => initGallery(data))
            .catch(error => {
                console.error('Error fetching gallery:', error);
                document.getElementById('loadingText').innerHTML = "Failed to load gallery.";
            });
    } else {
        document.getElementById('loadingText').innerHTML = "Please add Web App URL in script.js";
    }
});

function initGallery(images) {
    currentImageData = images;
    const galleryDiv = document.getElementById('imageGallery');
    const loadingText = document.getElementById('loadingText');
    
    if (!images || images.length === 0) { 
        loadingText.innerHTML = "No images found."; 
        return; 
    }
    
    loadingText.style.display = 'none';
    
    // Cache busting timestamp added here (&t=...)
    const timestamp = new Date().getTime(); 

    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const imgUrl = 'https://drive.google.com/thumbnail?id=' + img.id + '&sz=w1000&t=' + timestamp;
        
        item.innerHTML = `
            <div class="gallery-img-container shadow-sm mb-2" onclick="openLightbox(${index})">
                <img src="${imgUrl}" alt="${img.caption}">
            </div>
            <p class="small fw-bold text-secondary text-center">${img.caption}</p>
        `;
        galleryDiv.appendChild(item);
    });
    
    startAutoScroll();
}

function startAutoScroll() {
    const container = document.getElementById('imageGallery');
    autoScrollInterval = setInterval(() => {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) { 
            container.scrollTo({ left: 0, behavior: 'smooth' }); 
        } else { 
            container.scrollBy({ left: 300, behavior: 'smooth' }); 
        }
    }, 2500);
}

function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    document.getElementById('customLightbox').style.display = 'flex';
    clearInterval(autoScrollInterval);
    flashCaption();
}

function closeLightbox() { 
    document.getElementById('customLightbox').style.display = 'none'; 
    startAutoScroll(); 
}

function changeImage(step) { 
    currentIndex = (currentIndex + step + currentImageData.length) % currentImageData.length; 
    updateLightboxImage(); 
    flashCaption(); 
}

function updateLightboxImage() {
    const img = currentImageData[currentIndex];
    const timestamp = new Date().getTime(); // Cache busting for Lightbox
    document.getElementById('lightboxImg').src = 'https://drive.google.com/thumbnail?id=' + img.id + '&sz=w1000&t=' + timestamp;
    document.getElementById('lightboxCaption').innerText = img.caption;
}

function flashCaption() {
    const cp = document.getElementById('lightboxCaption');
    cp.classList.add('show');
    clearTimeout(captionTimeout);
    captionTimeout = setTimeout(() => cp.classList.remove('show'), 2000);
}

function toggleZoom() {
    const img = document.getElementById('lightboxImg');
    if (img.style.transform === "scale(1.5)") {
        img.style.transform = "scale(1)";
        img.style.cursor = "zoom-in";
    } else {
        img.style.transform = "scale(1.5)";
        img.style.cursor = "zoom-out";
    }
    img.style.transition = "transform 0.3s ease";
}

const lb = document.getElementById('customLightbox');
lb.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
lb.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].screenX;
    if (endX < touchStartX - 50) changeImage(1);
    if (endX > touchStartX + 50) changeImage(-1);
});
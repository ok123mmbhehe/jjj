// Minimal interactions for Deramirum pages
// Features: cart panel, add-to-cart, scroll buttons, fade-on-scroll, product search filter

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

function formatPrice(value) {
    return currencyFormatter.format(value || 0);
}

function parsePrice(text) {
    return parseInt((text || '').replace(/[^0-9]/g, ''), 10) || 0;
}

function initCart() {
    const cartBtn = document.querySelector('.cart-btn');
    if (!cartBtn) return;

    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    const panel = document.createElement('div');
    panel.className = 'cart-panel';
    panel.innerHTML = [
        '<div class="cart-panel-header">',
        '  <h3>Giỏ hàng</h3>',
        '  <button class="cart-close" aria-label="Đóng giỏ hàng">&times;</button>',
        '</div>',
        '<div class="cart-items"></div>',
        '<div class="cart-summary">',
        '  <div class="cart-total">',
        '    <span>Tổng cộng</span>',
        '    <span class="cart-total-value">0₫</span>',
        '  </div>',
        '  <button class="cart-checkout" disabled>Tiếp tục thanh toán</button>',
        '</div>'
    ].join('');

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    const itemsBox = panel.querySelector('.cart-items');
    const totalBox = panel.querySelector('.cart-total-value');
    const closeBtn = panel.querySelector('.cart-close');
    const checkoutBtn = panel.querySelector('.cart-checkout');
    let cartItems = [];

    function renderCart() {
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartBtn.textContent = count > 0 ? `🛒 (${count})` : '🛒';

        if (!cartItems.length) {
            itemsBox.innerHTML = '<div class="cart-empty">Chưa có sản phẩm nào.</div>';
            totalBox.textContent = formatPrice(0);
            checkoutBtn.disabled = true;
            return;
        }

        checkoutBtn.disabled = false;
        itemsBox.innerHTML = cartItems.map(item => [
            '<div class="cart-item">',
            '  <div class="cart-item-header">',
            `    <p class="cart-item-name">${item.name}</p>`,
            `    <span class="cart-item-price">${formatPrice(item.price)}</span>`,
            '  </div>',
            '  <div class="cart-item-actions">',
            `    <div class="cart-qty-controls" data-name="${item.name}">`,
            '      <button class="cart-qty-btn cart-qty-minus" aria-label="Giảm">-</button>',
            `      <span>${item.quantity}</span>`,
            '      <button class="cart-qty-btn cart-qty-plus" aria-label="Tăng">+</button>',
            '    </div>',
            `    <button class="cart-remove" data-name="${item.name}">Xóa</button>`,
            '  </div>',
            '</div>'
        ].join('')).join('');

        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        totalBox.textContent = formatPrice(total);
    }

    function addItem(name, price) {
        const existing = cartItems.find(i => i.name === name);
        if (existing) {
            existing.quantity += 1;
        } else {
            cartItems.push({ name, price, quantity: 1 });
        }
        renderCart();
    }

    itemsBox.addEventListener('click', (e) => {
        const minus = e.target.closest('.cart-qty-minus');
        const plus = e.target.closest('.cart-qty-plus');
        const removeBtn = e.target.closest('.cart-remove');
        if (!minus && !plus && !removeBtn) return;

        const name = (minus || plus || removeBtn)?.dataset.name
            || e.target.closest('.cart-qty-controls')?.dataset.name;
        const item = cartItems.find(i => i.name === name);
        if (!item) return;

        if (minus) item.quantity = Math.max(1, item.quantity - 1);
        if (plus) item.quantity += 1;
        if (removeBtn) cartItems = cartItems.filter(i => i.name !== name);
        renderCart();
    });

    function openCart() {
        overlay.classList.add('active');
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        overlay.classList.remove('active');
        panel.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartBtn.addEventListener('click', openCart);
    overlay.addEventListener('click', closeCart);
    closeBtn.addEventListener('click', closeCart);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

    checkoutBtn.addEventListener('click', () => {
        alert('Tính năng thanh toán sẽ sớm có mặt.');
    });

    const addBtns = document.querySelectorAll('.add-to-cart');
    addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.product-card');
            const name = card?.querySelector('h3')?.textContent?.trim() || 'Sản phẩm';
            const saleText = card?.querySelector('.price .sale')?.textContent;
            const originalText = card?.querySelector('.price .original')?.textContent;
            const price = parsePrice(saleText || originalText);
            addItem(name, price);
            openCart();
        });
    });

    renderCart();
}

function initScrollButtons() {
    const topBtn = document.createElement('button');
    topBtn.className = 'scroll-btn scroll-btn-up hidden';
    topBtn.setAttribute('aria-label', 'Lên đầu trang');
    topBtn.textContent = '↑';

    const bottomBtn = document.createElement('button');
    bottomBtn.className = 'scroll-btn scroll-btn-down hidden';
    bottomBtn.setAttribute('aria-label', 'Xuống cuối trang');
    bottomBtn.textContent = '↓';

    document.body.appendChild(topBtn);
    document.body.appendChild(bottomBtn);

    function updateButtons() {
        const y = window.scrollY || window.pageYOffset;
        const max = document.documentElement.scrollHeight - window.innerHeight - 10;
        topBtn.classList.toggle('hidden', y <= 120);
        bottomBtn.classList.toggle('hidden', y >= max);
    }

    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    bottomBtn.addEventListener('click', () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }));
    window.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
}

function initScrollFade() {
    const elements = Array.from(document.querySelectorAll('.product-card, .principle-card, .blog-card, .info-box, .category-btn'));
    if (!elements.length) return;
    elements.forEach(el => el.classList.add('scroll-fade'));

    function handleFade() {
        const center = window.innerHeight / 2;
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            const dist = Math.abs(mid - center);
            const ratio = Math.min(dist / center, 1);
            const opacity = 1 - ratio * 0.3;
            const scale = 1 - ratio * 0.02;
            const blur = ratio * 1.2;
            el.style.opacity = opacity.toFixed(2);
            el.style.transform = `scale(${scale})`;
            el.style.filter = `blur(${blur}px)`;
        });
    }

    window.addEventListener('scroll', handleFade);
    window.addEventListener('resize', handleFade);
    handleFade();
}

function initProductSearch() {
    const searchInput = document.querySelector('.product-search');
    if (!searchInput) return;
    const cards = Array.from(document.querySelectorAll('.product-card'));

    const filter = () => {
        const q = searchInput.value.trim().toLowerCase();
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(q) ? '' : 'none';
        });
    };

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        searchInput.value = q;
    }
    filter();

    searchInput.addEventListener('input', filter);
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
}

// Init
initCart();
initScrollButtons();
initScrollFade();
initProductSearch();
initMobileMenu();
initNavBubble();
initProductSliders();
initHeroSlider();

function initNavBubble() {
    const nav = document.querySelector('.nav.nav-main');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a'));
    if (!links.length) return;

    const bubble = document.createElement('div');
    bubble.className = 'nav-bubble';
    nav.appendChild(bubble);

    let current = links.find(l => l.classList.contains('active')) || links[0];

    const moveTo = (el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const width = rect.width;
        const left = rect.left - navRect.left;
        bubble.style.width = `${width}px`;
        bubble.style.transform = `translateX(${left}px)`;
        bubble.classList.add('visible');
    };

    moveTo(current);

    links.forEach(link => {
        link.addEventListener('mouseenter', () => moveTo(link));
        link.addEventListener('focus', () => moveTo(link));
        link.addEventListener('click', () => {
            current = link;
            moveTo(link);
        });
    });

    nav.addEventListener('mouseleave', () => moveTo(current));
    window.addEventListener('resize', () => moveTo(current));
}

function initProductSliders() {
    const medias = document.querySelectorAll('.product-media');
    medias.forEach(media => {
        const data = media.dataset.images || '';
        const images = data.split(',').map(i => i.trim()).filter(Boolean);
        if (!images.length) return;

        const track = media.querySelector('.slider-track');
        const prev = media.querySelector('.slider-prev');
        const next = media.querySelector('.slider-next');
        images.forEach(src => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            const img = document.createElement('img');
            img.src = src;
            img.alt = media.dataset.title || 'Product image';
            slide.appendChild(img);
            track.appendChild(slide);
        });

        let index = 0;
        let timer;
        const update = () => {
            track.style.transform = `translateX(-${index * 100}%)`;
        };
        const start = () => {
            stop();
            if (images.length <= 1) return;
            timer = setInterval(() => {
                index = (index + 1) % images.length;
                update();
            }, 3000);
        };
        const stop = () => timer && clearInterval(timer);

        prev?.addEventListener('click', () => {
            index = (index - 1 + images.length) % images.length;
            update();
        });
        next?.addEventListener('click', () => {
            index = (index + 1) % images.length;
            update();
        });

        media.addEventListener('mouseenter', stop);
        media.addEventListener('mouseleave', start);

        update();
        start();
    });
}

function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    const track = slider?.querySelector('.hero-track');
    if (!slider || !track) return;

    const images = (slider.dataset.images || '').split(',').map(i => i.trim()).filter(Boolean);
    if (!images.length) return;

    images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Hero banner';
        slide.appendChild(img);
        track.appendChild(slide);
    });

    let index = 0;
    const update = () => track.style.transform = `translateX(-${index * 100}%)`;
    const prevBtn = slider.querySelector('.hero-prev');
    const nextBtn = slider.querySelector('.hero-next');
    const go = (delta) => {
        index = (index + delta + images.length) % images.length;
        update();
    };

    prevBtn?.addEventListener('click', () => go(-1));
    nextBtn?.addEventListener('click', () => go(1));

    let timer;
    const start = () => {
        stop();
        timer = setInterval(() => go(1), 3000);
    };
    const stop = () => timer && clearInterval(timer);

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    update();
    start();
}

function initMobileMenu() {
    const headerContainer = document.querySelector('.header-top .container');
    const navMainList = document.querySelector('.nav-main ul');
    if (!headerContainer || !navMainList) return;

    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.setAttribute('aria-label', 'Mở menu');
    toggle.innerHTML = '<span></span><span></span><span></span>';

    const overlay = document.createElement('div');
    overlay.className = 'mobile-nav-overlay';

    const panel = document.createElement('div');
    panel.className = 'mobile-nav-panel';

    const panelHeader = document.createElement('div');
    panelHeader.className = 'mobile-nav-header';
    const title = document.createElement('span');
    title.className = 'mobile-nav-title';
    title.textContent = 'Menu';
    const backBtn = document.createElement('button');
    backBtn.className = 'mobile-nav-close';
    backBtn.setAttribute('aria-label', 'Đóng menu');
    backBtn.textContent = '<';
    panelHeader.appendChild(title);
    panelHeader.appendChild(backBtn);

    const mobileList = navMainList.cloneNode(true);
    mobileList.classList.add('mobile-nav-list');

    panel.appendChild(panelHeader);
    panel.appendChild(mobileList);
    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    headerContainer.insertBefore(toggle, headerContainer.firstChild);

    const releaseScrollIfIdle = () => {
        const cartOpen = document.querySelector('.cart-panel.open');
        if (!cartOpen) {
            document.body.style.overflow = '';
        }
    };

    const openMenu = () => {
        overlay.classList.add('active');
        panel.classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
        overlay.classList.remove('active');
        panel.classList.remove('open');
        releaseScrollIfIdle();
    };

    toggle.addEventListener('click', openMenu);
    backBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    mobileList.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            closeMenu();
        }
    });
}

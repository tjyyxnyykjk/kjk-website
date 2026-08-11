/* ============================================================
   科教科网站共享脚本 —— 导航/页脚注入 + 通用功能
   ============================================================ */

// ===== 当前页面高亮 =====
function highlightNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
        if (a.getAttribute('href') === path) a.classList.add('active');
    });
}

// ===== 移动端菜单 =====
function toggleNav() {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.nav-toggle');
    if (menu) menu.classList.toggle('active');
    if (toggle) toggle.classList.toggle('active');
}

// ===== 回到顶部 =====
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 300);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== 轮播图 =====
let currentSlide = 0;
let slideTimer = null;

function initSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dots .dot');
    if (!slides.length) return;

    function showSlide(idx) {
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        currentSlide = idx;
    }

    function nextSlide() { showSlide((currentSlide + 1) % slides.length); }
    function prevSlide() { showSlide((currentSlide - 1 + slides.length) % slides.length); }

    // 自动播放
    slideTimer = setInterval(nextSlide, 5000);

    // 点击圆点
    dots.forEach((d, i) => d.addEventListener('click', () => {
        clearInterval(slideTimer);
        showSlide(i);
        slideTimer = setInterval(nextSlide, 5000);
    }));

    // 箭头
    const prevBtn = document.querySelector('.hero-arrow.prev');
    const nextBtn = document.querySelector('.hero-arrow.next');
    if (prevBtn) prevBtn.addEventListener('click', () => {
        clearInterval(slideTimer);
        prevSlide();
        slideTimer = setInterval(nextSlide, 5000);
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
        clearInterval(slideTimer);
        nextSlide();
        slideTimer = setInterval(nextSlide, 5000);
    });
}

// ===== 日期显示 =====
function initDate() {
    const el = document.getElementById('currentDate');
    if (!el) return;
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    const now = new Date();
    el.textContent = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日 ${days[now.getDay()]}`;
}

// ===== 通用列表渲染 =====
function renderNoticeList(containerId, items, showSummary) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!items.length) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>暂无内容</p></div>';
        return;
    }
    container.innerHTML = items.map(item => `
        <li onclick="openDetail('notice', ${item.id})">
            <span class="item-tag ${item.tagClass}">${item.tag}</span>
            <span class="item-title">${item.title}</span>
            <span class="item-date">${item.date}</span>
        </li>
    `).join('');
}

function renderNewsCards(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!items.length) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>暂无内容</p></div>';
        return;
    }
    container.innerHTML = items.map(item => `
        <div class="news-card" onclick="openDetail('news', ${item.id})">
            <div class="card-img">
                <div class="placeholder" style="background:${item.cover}">
                    <span>${item.tag.charAt(0)}</span>
                </div>
            </div>
            <div class="card-body">
                <span class="card-tag item-tag ${item.tagClass}">${item.tag}</span>
                <h4 class="card-title">${item.title}</h4>
                <div class="card-meta">
                    <span>${item.date}</span>
                    <span>${item.author}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== 详情模态框 =====
function openDetail(type, id) {
    const data = type === 'notice' ? notices : newsItems;
    const item = data.find(d => d.id === id);
    if (!item) return;

    const modal = document.getElementById('detailModal');
    const titleEl = document.getElementById('modalTitle');
    const metaEl = document.getElementById('modalMeta');
    const bodyEl = document.getElementById('modalBody');

    titleEl.textContent = item.title;
    metaEl.innerHTML = `<span>📅 ${item.date}</span><span>👤 ${item.author || '科教科'}</span><span>🏷️ ${item.tag}</span>`;

    let bodyHtml = '';
    // 摘要
    if (item.summary) {
        bodyHtml += `<p style="color:var(--text-light);font-size:14px;border-left:3px solid var(--primary);padding-left:12px;margin-bottom:16px">${item.summary}</p>`;
    }
    // 正文
    if (item.content) {
        bodyHtml += item.content.split('\n').filter(l => l.trim()).map(l => `<p>${l}</p>`).join('');
    }
    // 图片
    if (item.images && item.images.length) {
        bodyHtml += item.images.map(src => `<img src="${src}" alt="${item.title}" loading="lazy">`).join('');
    }
    // 附件
    if (item.attachment) {
        const fname = item.attachment.split('/').pop();
        bodyHtml += `<a href="${item.attachment}" download class="attachment">📎 点击下载：${fname}</a>`;
    }

    bodyEl.innerHTML = bodyHtml;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    const modal = document.getElementById('detailModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== 分页 =====
let currentPage = 1;
const pageSize = 6;

function renderPagedList(type, filterTag, keyword) {
    let data = type === 'notice' ? [...notices] : [...newsItems];

    // 筛选
    if (filterTag && filterTag !== '全部') {
        data = data.filter(d => d.tag === filterTag);
    }
    // 搜索
    if (keyword) {
        const kw = keyword.toLowerCase();
        data = data.filter(d =>
            d.title.toLowerCase().includes(kw) ||
            (d.summary && d.summary.toLowerCase().includes(kw)) ||
            (d.content && d.content.toLowerCase().includes(kw))
        );
    }

    const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * pageSize;
    const pageData = data.slice(start, start + pageSize);

    // 渲染列表
    if (type === 'notice') {
        renderNoticeList('pagedList', pageData);
    } else {
        renderNewsCards('pagedList', pageData);
    }

    // 渲染分页
    const pagination = document.getElementById('pagination');
    if (pagination) {
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        let html = '';
        html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
        pagination.innerHTML = html;
    }
}

function changePage(page) {
    currentPage = page;
    const activeFilter = document.querySelector('.filter-tag.active');
    const filterTag = activeFilter ? activeFilter.dataset.tag : '全部';
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput ? searchInput.value.trim() : '';
    const type = document.body.dataset.type || 'notice';
    renderPagedList(type, filterTag, keyword);
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

// ===== 筛选 =====
function initFilters(type) {
    const tags = document.querySelectorAll('.filter-tag');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    tags.forEach(tag => {
        tag.addEventListener('click', () => {
            tags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            currentPage = 1;
            const keyword = searchInput ? searchInput.value.trim() : '';
            renderPagedList(type, tag.dataset.tag, keyword);
        });
    });

    if (searchInput) {
        let searchTimer = null;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentPage = 1;
                const activeFilter = document.querySelector('.filter-tag.active');
                const filterTag = activeFilter ? activeFilter.dataset.tag : '全部';
                renderPagedList(type, filterTag, searchInput.value.trim());
            }, 300);
        });
    }
}

// ===== 教学管理渲染 =====
function renderTeachingPanels(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = data.map(panel => `
        <div class="panel">
            <div class="panel-header">
                <h3><span class="panel-icon">${panel.icon}</span> ${panel.title}</h3>
            </div>
            <div class="panel-body">
                ${panel.items.map(item => `
                    <div class="info-row">
                        <span class="info-label">${item.label}</span>
                        <span class="info-value">${item.value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ===== 科研管理渲染（同教学管理） =====
function renderResearchPanels(containerId, data) {
    renderTeachingPanels(containerId, data);
}

// ===== 规章制度渲染 =====
function renderRegulations(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = data.map(cat => `
        <div class="reg-category">
            <h3>${cat.category}</h3>
            <ul class="reg-list">
                ${cat.items.map(item => `
                    <li>
                        <span class="reg-name">${item.name}</span>
                        <span class="reg-meta">${item.date}</span>
                        ${item.file
                            ? `<a href="${item.file}" download class="reg-link">下载</a>`
                            : `<span class="reg-link" style="color:var(--text-lighter);cursor:default">即将上线</span>`
                        }
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}

// ===== 科室简介渲染 =====
function renderDeptInfo() {
    // 统计数据
    const statsEl = document.getElementById('deptStats');
    if (statsEl && deptInfo.stats) {
        statsEl.innerHTML = deptInfo.stats.map(s => `
            <div class="stat-item">
                <div class="stat-num">${s.num}</div>
                <div class="stat-label">${s.label}</div>
            </div>
        `).join('');
    }

    // 职能列表
    const funcEl = document.getElementById('deptFunctions');
    if (funcEl && deptInfo.functions) {
        funcEl.innerHTML = deptInfo.functions.map((f, i) => `
            <li style="padding:10px 0;border-bottom:1px dashed var(--border)">
                <span style="color:var(--primary);font-weight:600;margin-right:8px">${i+1}.</span>${f}
            </li>
        `).join('');
    }

    // 团队
    const teamEl = document.getElementById('deptTeam');
    if (teamEl && deptInfo.team) {
        teamEl.innerHTML = deptInfo.team.map(member => `
            <div class="team-card">
                <div class="avatar" style="background:${member.color}">${member.name.charAt(0)}</div>
                <div class="team-name">${member.name}</div>
                <div class="team-role">${member.role}</div>
                <div class="team-desc">${member.desc}</div>
            </div>
        `).join('');
    }

    // 联系方式
    const contactEl = document.getElementById('deptContact');
    if (contactEl && deptInfo.contact) {
        contactEl.innerHTML = deptInfo.contact.map(c => `
            <div class="contact-item">
                <span class="icon">${c.icon}</span>
                <div>
                    <div class="label">${c.label}</div>
                    <div class="value">${c.value}</div>
                </div>
            </div>
        `).join('');
    }

    // 简介
    const descEl = document.getElementById('deptDesc');
    if (descEl && deptInfo.description) {
        descEl.innerHTML = `<p>${deptInfo.description}</p>`;
    }
}

// ===== 首页渲染 =====
function renderHomePage() {
    // 轮播
    const sliderEl = document.getElementById('heroSlider');
    if (sliderEl && typeof slides !== 'undefined') {
        sliderEl.innerHTML = slides.map((s, i) => `
            <div class="hero-slide ${i === 0 ? 'active' : ''}">
                <div class="slide-bg" style="background:${s.bg}"></div>
                <div class="slide-content">
                    <h2>${s.title}</h2>
                    <p>${s.subtitle}</p>
                </div>
            </div>
        `).join('');
        const dotsEl = document.getElementById('heroDots');
        if (dotsEl) {
            dotsEl.innerHTML = slides.map((s, i) =>
                `<span class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`
            ).join('');
        }
    }

    // 首页通知（最新4条）
    renderNoticeList('homeNotices', notices.slice(0, 4));

    // 首页新闻（最新3条）
    renderNewsCards('homeNews', newsItems.slice(0, 3));

    // 统计
    const statsEl = document.getElementById('homeStats');
    if (statsEl && deptInfo.stats) {
        statsEl.innerHTML = deptInfo.stats.map(s => `
            <div class="stat-item">
                <div class="stat-num">${s.num}</div>
                <div class="stat-label">${s.label}</div>
            </div>
        `).join('');
    }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initDate();
    highlightNav();
    initBackToTop();
    initSlider();
    renderHomePage();
    renderDeptInfo();

    // 模态框关闭
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeDetail();
        });
    }
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeDetail();
    });
});

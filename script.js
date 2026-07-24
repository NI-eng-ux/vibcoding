// ============================================================
// Vibcoding 热门作品分析 — 渲染脚本
// 从 data.json 加载数据并渲染页面
// ============================================================

fetch('data.json')
  .then(res => res.json())
  .then(data => {
    const { githubProjects, viralWorks, techStats } = data;

    // --- Render GitHub Projects ---
    const githubGrid = document.getElementById('githubGrid');
    const githubCount = document.getElementById('githubCount');
    githubCount.textContent = githubProjects.length + ' 个项目';

    githubProjects.forEach((project, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.setAttribute('data-card-idx', idx);
      card.setAttribute('data-category', project.category || '');
      const catBadge = project.category
        ? `<span class="category-badge">${project.category}</span>`
        : '';
      card.innerHTML = `
        <div class="card-header">
          <div>
            <div class="card-name">
              <a href="${project.url}" target="_blank" rel="noopener">${project.name}</a>
            </div>
            <div class="card-fullname">${project.fullName}</div>
          </div>
          <div class="card-stars">
            <i class="fa-regular fa-star"></i> ${project.stars}
          </div>
        </div>
        <div class="card-desc">${project.description}</div>
        ${catBadge ? `<div class="card-meta">${catBadge}</div>` : ''}
        <div class="card-highlights">✨ ${project.highlights}</div>
        <div class="card-inspiration">
          <span class="inspiration-icon">💡</span>
          <span>${project.inspiration}</span>
        </div>
        <div class="card-tags">
          ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <a href="${project.url}" target="_blank" rel="noopener" class="card-btn">
          <i class="fa-brands fa-github"></i> 查看项目
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      `;
      githubGrid.appendChild(card);
    });

    // --- Render GitHub Filter Chips ---
    const githubCategories = [...new Set(githubProjects.map(p => p.category))].filter(Boolean);
    const githubFiltersEl = document.getElementById('githubFilters');
    githubFiltersEl.innerHTML = `<button class="chip active" data-cat="all">全部</button>` +
      githubCategories.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('');

    // --- Render Viral Works ---
    const viralGrid = document.getElementById('viralGrid');
    const viralCount = document.getElementById('viralCount');
    viralCount.textContent = viralWorks.length + ' 个案例';

    const icons = ['fa-lightbulb', 'fa-rocket', 'fa-bolt', 'fa-wand-magic-sparkles', 'fa-star', 'fa-compass', 'fa-gem', 'fa-gamepad'];

    viralWorks.forEach((work, i) => {
      const card = document.createElement('div');
      card.className = 'viral-card';
      card.setAttribute('data-category', work.category || '');

      // 视频链接按钮: 所有视频统一用 watchUrl 外链（无 iframe 嵌入）
      let videoHtml = '';
      if (work.watchUrl) {
        const isBilibili = work.watchUrl.includes('bilibili');
        const icon = isBilibili ? 'fa-brands fa-bilibili' : 'fa-solid fa-play';
        const label = isBilibili ? '在 B 站观看' : '观看视频/了解更多';
        videoHtml = `
          <a href="${work.watchUrl}" target="_blank" rel="noopener" class="video-link-btn">
            <i class="${icon}"></i> ${label}
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        `;
      }

      card.innerHTML = `
        <div class="card-icon" style="color: var(--accent)">
          <i class="fa-solid ${icons[i % icons.length]}"></i>
        </div>
        <h3>${work.name}</h3>
        <div class="author">${work.author}</div>
        <span class="category-badge" style="display:inline-block;margin-bottom:4px">${work.category || ''}</span>
        <div class="desc">${work.description}</div>
        ${videoHtml}
        <a href="${work.url}" target="_blank" rel="noopener" class="link">
          了解更多 <i class="fa-solid fa-arrow-right"></i>
        </a>
      `;
      viralGrid.appendChild(card);
    });

    // --- Render Viral Filter Chips ---
    const viralCategories = [...new Set(viralWorks.map(w => w.category))].filter(Boolean);
    const viralFiltersEl = document.getElementById('viralFilters');
    viralFiltersEl.innerHTML = `<button class="chip active" data-cat="all">全部</button>` +
      viralCategories.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join('');

    // --- Render Stats ---
    const maxCount = Math.max(...techStats.map(s => s.count));
    const statsContainer = document.getElementById('statsContainer');

    techStats.forEach(stat => {
      const barWidth = Math.max((stat.count / maxCount) * 100, 10);
      const item = document.createElement('div');
      item.className = 'stat-bar-item';
      item.innerHTML = `
        <span class="stat-name">${stat.name}</span>
        <span class="stat-bar" style="width: ${barWidth}px"></span>
        <span class="stat-count">${stat.count}</span>
      `;
      statsContainer.appendChild(item);
    });

    // --- Hero Stats ---
    document.getElementById('statProjects').textContent = githubProjects.length;
    document.getElementById('statWorks').textContent = viralWorks.length;
    const totalStars = githubProjects.reduce((sum, p) => {
      const num = parseFloat(p.stars.replace('k', '')) * (p.stars.includes('k') ? 1000 : 1);
      return sum + num;
    }, 0);
    document.getElementById('statTotalStars').textContent = (totalStars / 1000).toFixed(0) + 'k+';

    // --- Filter Chips Logic ---
    function setupFilterChips(containerId, gridId, items, getCategoryFn) {
      const container = document.getElementById(containerId);
      const grid = document.getElementById(gridId);
      if (!container || !grid) return;

      container.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        // Update active state
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const cat = chip.dataset.cat;
        const cards = grid.querySelectorAll(cat === 'all'
          ? '.card, .viral-card'
          : `[data-category="${cat}"]`);

        // Hide all, show matching
        grid.querySelectorAll('.card, .viral-card').forEach(c => c.style.display = 'none');
        cards.forEach(c => c.style.display = '');
      });
    }

    setupFilterChips('githubFilters', 'githubGrid', githubProjects, p => p.category);
    setupFilterChips('viralFilters', 'viralGrid', viralWorks, w => w.category);

    // --- Shuffle Filter Chips ---
    const shuffleCategories = ['all', ...new Set([
      ...githubProjects.map(p => p.category),
      ...viralWorks.map(w => w.category)
    ])].filter(Boolean);

    const shuffleFilterEl = document.getElementById('shuffleFilter');
    shuffleCategories.forEach(cat => {
      if (cat === 'all') return; // "全部" already exists
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.dataset.cat = cat;
      btn.textContent = cat;
      shuffleFilterEl.appendChild(btn);
    });

    let shuffleCategory = 'all';
    shuffleFilterEl.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      shuffleFilterEl.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      shuffleCategory = chip.dataset.cat;
    });
    const allItems = [
      ...githubProjects.map((p, i) => ({ type: 'github', data: p, idx: i, category: p.category })),
      ...viralWorks.map((w, i) => ({ type: 'viral', data: w, idx: i, category: w.category }))
    ];

    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.addEventListener('click', () => {
      // 按分类过滤
      const pool = shuffleCategory === 'all'
        ? allItems
        : allItems.filter(item => item.category === shuffleCategory);

      if (pool.length === 0) return;

      // 随机选一个
      const pick = pool[Math.floor(Math.random() * pool.length)];

      // 确保对应的 filter 也切换到正确分类
      const filterContainerId = pick.type === 'github' ? 'githubFilters' : 'viralFilters';
      const filterContainer = document.getElementById(filterContainerId);
      if (filterContainer) {
        filterContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        const matchChip = filterContainer.querySelector(`[data-cat="${pick.category}"]`);
        if (matchChip) matchChip.classList.add('active');
        else {
          const allChip = filterContainer.querySelector('[data-cat="all"]');
          if (allChip) allChip.classList.add('active');
        }
      }

      // 显示对应分类的卡片
      const gridId = pick.type === 'github' ? 'githubGrid' : 'viralGrid';
      const grid = document.getElementById(gridId);
      if (grid) {
        grid.querySelectorAll('.card, .viral-card').forEach(c => c.style.display = 'none');
        const selector = pick.category
          ? `[data-category="${pick.category}"]`
          : '.card, .viral-card';
        grid.querySelectorAll(selector).forEach(c => c.style.display = '');
      }

      // 滚动到对应区域
      const targetSection = pick.type === 'github' ? 'github' : 'viral';
      const sectionEl = document.getElementById(targetSection);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 高亮对应卡片
      setTimeout(() => {
        const cardSelector = pick.type === 'github'
          ? `#githubGrid .card[data-card-idx="${pick.idx}"]`
          : `#viralGrid .viral-card:nth-child(${pick.idx + 1})`;

        const card = document.querySelector(cardSelector);
        if (card) {
          // 移除之前的亮点
          document.querySelectorAll('.card-spotlight, .viral-spotlight').forEach(el => {
            el.classList.remove('card-spotlight', 'viral-spotlight');
          });

          // 添加亮点动画
          const cls = pick.type === 'github' ? 'card-spotlight' : 'viral-spotlight';
          card.classList.add(cls);

          // 让卡片进入视野
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // 更新按钮文案
          const name = pick.data.name || pick.data.fullName || '';
          const shortName = name.length > 18 ? name.slice(0, 18) + '…' : name;
          shuffleBtn.innerHTML = `<i class="fa-solid fa-shuffle"></i> 🎯 ${shortName}`;
          shuffleBtn.classList.add('shuffle-hit');

          setTimeout(() => {
            shuffleBtn.innerHTML = `<i class="fa-solid fa-shuffle"></i> 随手翻一个 💡`;
            shuffleBtn.classList.remove('shuffle-hit');
            card.classList.remove(cls);
          }, 4000);
        }
      }, 400);
    });

    // 支持键盘快捷键: 按 R 键随机翻
    document.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        // 不在输入框中才触发
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
        shuffleBtn.click();
      }
    });
  })
  .catch(err => {
    console.error('加载 data.json 失败:', err);
  });

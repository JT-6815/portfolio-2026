(function () {
  const data = window.PORTFOLIO_DATA || {};
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const visualCards = Array.isArray(data.visualCards) ? data.visualCards : [];

  const projectList = document.getElementById("project-list");
  const visualGrid = document.getElementById("visual-grid");
  const sectionIndex = document.getElementById("section-index");

  function formatPageNumber(page) {
    return String(page).padStart(2, "0");
  }

  function formatPageRange(pages) {
    if (!Array.isArray(pages) || !pages.length) return "";
    if (pages.length === 1) return `P${formatPageNumber(pages[0])}`;
    return `P${formatPageNumber(pages[0])}-${formatPageNumber(pages[pages.length - 1])}`;
  }

  function renderSectionIndex() {
    if (!sectionIndex) return;
    sectionIndex.innerHTML = projects.map((_, index) => `<span>${String(index + 1).padStart(2, "0")}</span>`).join("");
  }

  function renderProjects() {
    projectList.innerHTML = projects.map((project) => `
      <article class="project-card reveal" id="project-${project.id}">
        <div class="project-copy">
          <div class="project-head">
            <div class="number-badge" aria-hidden="true">${project.number}</div>
            <div class="project-heading">
              <div class="project-meta">
                <span>${project.category}</span>
                <span>${project.role}</span>
                <span>${project.period}</span>
              </div>
              <h3>${project.title}</h3>
              <div class="project-subtitle">${project.subtitle}</div>
            </div>
          </div>

          <div class="project-tags">
            ${project.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>

          <p class="project-summary">${project.summary}</p>

          <ul class="project-highlights">
            ${project.highlights.map((item) => `<li>${item}</li>`).join("")}
          </ul>

          <div class="project-actions">
            <button class="button button-primary" type="button" data-open-project="${project.id}">查看原作品页</button>
            <a class="button button-secondary" href="#contact">联系我</a>
          </div>
        </div>

        <div class="project-visual">
          <div class="project-preview">
            <img src="${project.preview}" alt="${project.title} 网页展示图" loading="lazy" decoding="async">
          </div>
          <div class="project-note">
            <span>原作品集页数：${project.pages[0]} - ${project.pages[project.pages.length - 1]}</span>
            <span>完成时间：${project.duration}</span>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderVisualCards() {
    visualGrid.innerHTML = visualCards.map((item) => `
      <article class="visual-card reveal">
        <div class="visual-thumb">
          <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async">
        </div>
        <div class="visual-copy">
          <div class="visual-meta">${item.meta} · ${formatPageRange(item.pages)}</div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div class="visual-actions">
            <button class="button button-secondary" type="button" data-open-card="${item.id}">查看作品页</button>
            ${item.externalUrl ? `<a class="button button-secondary" href="${item.externalUrl}" target="_blank" rel="noreferrer">${item.externalLabel || "延伸阅读"}</a>` : ""}
          </div>
        </div>
      </article>
    `).join("");
  }

  renderSectionIndex();
  renderProjects();
  renderVisualCards();

  const viewer = document.getElementById("viewer");
  const viewerTitle = document.getElementById("viewer-title");
  const viewerSubtitle = document.getElementById("viewer-subtitle");
  const viewerStatus = document.getElementById("viewer-status");
  const viewerImage = document.getElementById("viewer-image");
  const viewerThumbs = document.getElementById("viewer-thumbs");
  const prevButton = document.getElementById("viewer-prev");
  const nextButton = document.getElementById("viewer-next");

  let activeProject = null;
  let activeIndex = 0;

  function getProjectById(projectId) {
    return projects.find((project) => project.id === projectId) || null;
  }

  function getCardById(cardId) {
    return visualCards.find((item) => item.id === cardId) || null;
  }

  function updateViewer() {
    if (!activeProject) return;

    const page = activeProject.pages[activeIndex];
    const pageFile = formatPageNumber(page);
    viewerTitle.textContent = activeProject.title;
    viewerSubtitle.textContent = `${activeProject.category} · 原作品集页面`;
    viewerStatus.textContent = `${activeIndex + 1} / ${activeProject.pages.length}`;
    viewerImage.src = `web-renders/page-${pageFile}.jpg`;
    viewerImage.alt = `${activeProject.title} 第 ${page} 页`;

    Array.from(viewerThumbs.querySelectorAll(".thumb")).forEach((thumb, index) => {
      thumb.classList.toggle("is-active", index === activeIndex);
    });

    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === activeProject.pages.length - 1;
  }

  function renderThumbs() {
    if (!activeProject) return;

    viewerThumbs.innerHTML = activeProject.pages.map((page, index) => `
      <button class="thumb ${index === activeIndex ? "is-active" : ""}" type="button" data-thumb-index="${index}">
        <img src="web-renders/page-${formatPageNumber(page)}.jpg" alt="${activeProject.title} 第 ${page} 页缩略图" loading="lazy" decoding="async">
        <span class="thumb-label">P${formatPageNumber(page)}</span>
      </button>
    `).join("");
  }

  function openViewerWithEntry(entry, page) {
    if (!entry || !Array.isArray(entry.pages) || !entry.pages.length) return;

    activeProject = {
      title: entry.title,
      category: entry.category || entry.meta || "作品页",
      pages: entry.pages
    };
    activeIndex = Math.max(0, page ? activeProject.pages.indexOf(page) : 0);
    if (activeIndex < 0) activeIndex = 0;

    renderThumbs();
    updateViewer();
    viewer.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  }

  function openViewer(projectId, page) {
    openViewerWithEntry(getProjectById(projectId), page);
  }

  function openViewerForCard(cardId) {
    openViewerWithEntry(getCardById(cardId));
  }

  function closeViewer() {
    viewer.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  function moveViewer(step) {
    if (!activeProject) return;
    const nextIndex = activeIndex + step;
    if (nextIndex < 0 || nextIndex >= activeProject.pages.length) return;
    activeIndex = nextIndex;
    updateViewer();
  }

  document.addEventListener("click", (event) => {
    const cardButton = event.target.closest("[data-open-card]");
    if (cardButton) {
      openViewerForCard(cardButton.getAttribute("data-open-card"));
      return;
    }

    const openButton = event.target.closest("[data-open-project]");
    if (openButton) {
      const projectId = openButton.getAttribute("data-open-project");
      const page = Number(openButton.getAttribute("data-open-page")) || undefined;
      openViewer(projectId, page);
      return;
    }

    if (event.target.closest("[data-viewer-close]")) {
      closeViewer();
      return;
    }

    const thumbButton = event.target.closest("[data-thumb-index]");
    if (thumbButton) {
      activeIndex = Number(thumbButton.getAttribute("data-thumb-index"));
      updateViewer();
    }
  });

  prevButton.addEventListener("click", () => moveViewer(-1));
  nextButton.addEventListener("click", () => moveViewer(1));

  document.addEventListener("keydown", (event) => {
    if (viewer.classList.contains("is-hidden")) return;

    if (event.key === "Escape") {
      closeViewer();
    } else if (event.key === "ArrowLeft") {
      moveViewer(-1);
    } else if (event.key === "ArrowRight") {
      moveViewer(1);
    }
  });

  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px"
  });

  revealItems.forEach((item) => observer.observe(item));
})();

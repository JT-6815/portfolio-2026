(function () {
  const data = window.PORTFOLIO_DATA || {};
  const projects = Array.isArray(data.projects) ? data.projects : [];
  const visualCards = Array.isArray(data.visualCards) ? data.visualCards : [];
  const ASSET_VERSION = "20260612-align3";

  const projectList = document.getElementById("project-list");
  const actualProjectGrid = document.getElementById("actual-project-grid");
  const culturalProductGrid = document.getElementById("cultural-product-grid");
  const sectionIndex = document.getElementById("section-index");

  function withVersion(url) {
    if (!url) return url;
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}v=${ASSET_VERSION}`;
  }

  function formatPageNumber(page) {
    return String(page).padStart(2, "0");
  }

  function formatPageRange(pages) {
    if (!Array.isArray(pages) || !pages.length) return "";
    const sortedPages = [...pages].sort((a, b) => a - b);
    if (sortedPages.length === 1) return `P${formatPageNumber(sortedPages[0])}`;
    return `P${formatPageNumber(sortedPages[0])}-${formatPageNumber(sortedPages[sortedPages.length - 1])}`;
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

          <div class="project-actions ${project.externalUrl ? "project-actions-with-external" : ""}">
            <button class="button button-primary" type="button" data-open-project="${project.id}">查看原作品页</button>
            ${!project.externalUrl ? `<a class="button button-secondary project-contact-link" href="#contact">联系我</a>` : ""}
            ${project.externalUrl ? `
              <a class="project-link-card" href="${project.externalUrl}" target="_blank" rel="noreferrer">
                <span class="project-link-kicker">独立链接</span>
                <span class="project-link-title">${project.externalLabel || "延伸项目页"}</span>
              </a>
            ` : ""}
          </div>
        </div>

        <div class="project-visual">
          <div class="project-preview">
            <img src="${withVersion(project.preview)}" alt="${project.title} 网页展示图" loading="lazy" decoding="async">
          </div>
          <div class="project-note">
            <span>原作品集页数：${project.pages[0]} - ${project.pages[project.pages.length - 1]}</span>
            <span>完成时间：${project.duration}</span>
          </div>
        </div>
      </article>
    `).join("");
  }

  function buildVisualCardMarkup(item) {
    return `
      <article class="visual-card reveal">
        <div class="visual-thumb">
          <img src="${withVersion(item.image)}" alt="${item.title}" loading="lazy" decoding="async">
        </div>
        <div class="visual-copy">
          <div class="visual-meta">${item.meta} · ${formatPageRange(item.pages)}</div>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
          <div class="visual-actions">
            <button class="button button-secondary" type="button" data-open-card="${item.id}">查看作品页</button>
            ${item.externalUrl ? `
              <a class="button ${item.externalVariant === "independent" ? "button-link-standalone" : "button-secondary"}" href="${item.externalUrl}" target="_blank" rel="noreferrer">
                ${item.externalVariant === "independent" ? `<span class="button-kicker">独立链接</span>` : ""}
                <span>${item.externalLabel || "延伸阅读"}</span>
              </a>
            ` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderVisualCards() {
    const actualCards = visualCards.filter((item) => item.meta.startsWith("06"));
    const culturalCards = visualCards.filter((item) => item.meta.startsWith("07"));

    if (actualProjectGrid) {
      actualProjectGrid.innerHTML = actualCards.map((item) => buildVisualCardMarkup(item)).join("");
    }

    if (culturalProductGrid) {
      culturalProductGrid.innerHTML = culturalCards.map((item) => buildVisualCardMarkup(item)).join("");
    }
  }

  function syncProjectTitleJustify() {
    document.querySelectorAll(".project-heading h3").forEach((title) => {
      title.classList.remove("project-title-justified");

      const lineHeight = parseFloat(window.getComputedStyle(title).lineHeight);
      if (!Number.isFinite(lineHeight) || lineHeight <= 0) return;

      const titleHeight = title.getBoundingClientRect().height;
      const lineCount = Math.round(titleHeight / lineHeight);
      const text = (title.textContent || "").trim();
      const isPureCjk = /^[\u3400-\u9fffA-Za-z0-9·\s]+$/.test(text) && !/[A-Za-z]/.test(text);
      const compactText = text.replace(/\s+/g, "");
      const averageCharsPerLine = compactText.length / Math.max(1, lineCount);
      const canJustify = lineCount > 1 && isPureCjk && compactText.length >= 10 && averageCharsPerLine >= 8;

      title.classList.toggle("project-title-justified", canJustify);
    });
  }

  renderSectionIndex();
  renderProjects();
  renderVisualCards();
  syncProjectTitleJustify();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      syncProjectTitleJustify();
    });
  }

  let titleSyncFrame = 0;
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(titleSyncFrame);
    titleSyncFrame = window.requestAnimationFrame(() => {
      syncProjectTitleJustify();
    });
  }, { passive: true });

  function initFallbackReveal() {
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
  }

  function initMotionCards(gsapLib, reduceMotion) {
    const cards = Array.from(document.querySelectorAll(".info-card, .project-copy, .project-visual, .visual-card, .contact-meta div"));
    const cleanups = [];
    const hasFinePointer = window.matchMedia("(pointer:fine)").matches;

    cards.forEach((card) => {
      if (card.dataset.motionCardReady !== "true") {
        card.dataset.motionCardReady = "true";
        card.classList.add("motion-card");

        const glowNode = document.createElement("span");
        glowNode.className = "motion-card-glow";
        glowNode.setAttribute("aria-hidden", "true");
        card.prepend(glowNode);
      }

      const glow = card.querySelector(".motion-card-glow");
      if (!glow) return;

      if (reduceMotion || !hasFinePointer) {
        gsapLib.set(card, {
          "--motion-outline-opacity": 0.56,
          "--motion-sheen-opacity": 0.16
        });
        return;
      }

      gsapLib.set(glow, { x: 0, y: 0, autoAlpha: 0, scale: 0.68 });
      gsapLib.set(card, {
        "--motion-outline-opacity": 0.48,
        "--motion-sheen-opacity": 0.16
      });

      const glowXTo = gsapLib.quickTo(glow, "x", { duration: 0.38, ease: "power3.out" });
      const glowYTo = gsapLib.quickTo(glow, "y", { duration: 0.38, ease: "power3.out" });

      const onEnter = () => {
        gsapLib.to(card, {
          y: -4,
          "--motion-outline-opacity": 1.06,
          "--motion-sheen-opacity": 0.34,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
        gsapLib.to(glow, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
      };

      const onMove = (event) => {
        const rect = card.getBoundingClientRect();
        const px = `${((event.clientX - rect.left) / rect.width) * 100}%`;
        const py = `${((event.clientY - rect.top) / rect.height) * 100}%`;
        card.style.setProperty("--motion-sheen-x", px);
        card.style.setProperty("--motion-sheen-y", py);
        glowXTo(event.clientX - rect.left - rect.width / 2);
        glowYTo(event.clientY - rect.top - rect.height / 2);
      };

      const onLeave = () => {
        gsapLib.to(card, {
          y: 0,
          "--motion-outline-opacity": 0.48,
          "--motion-sheen-opacity": 0.16,
          duration: 0.42,
          ease: "power3.out",
          overwrite: "auto"
        });
        gsapLib.to(glow, {
          autoAlpha: 0,
          scale: 0.7,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
        glowXTo(0);
        glowYTo(0);
        card.style.setProperty("--motion-sheen-x", "50%");
        card.style.setProperty("--motion-sheen-y", "50%");
      };

      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);

      cleanups.push(() => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }

  function initGsapMotion() {
    const gsapLib = window.gsap;
    if (!gsapLib) {
      initFallbackReveal();
      return;
    }

    const ScrollTriggerLib = window.ScrollTrigger;
    if (ScrollTriggerLib) {
      gsapLib.registerPlugin(ScrollTriggerLib);
    }

    const heroCopy = document.querySelector(".hero-copy");
    const heroTitleBlock = document.querySelector(".hero-title-block");
    const heroAmbient = document.querySelector(".hero-ambient");
    const heroLockup = document.querySelector(".hero-lockup");
    const heroTitleImage = document.querySelector(".headline-big img");
    const heroNameImage = document.querySelector(".headline-name img");
    const revealTargets = Array.from(document.querySelectorAll(".reveal")).filter((item) => !item.closest(".hero"));

    if (heroCopy) {
      heroCopy.classList.add("is-visible");
      gsapLib.set(heroCopy, { autoAlpha: 1, y: 0 });
    }

    function initAboutPageRecreationMotion(reduceMotion) {
      const scene = document.querySelector(".about-page-recreation");
      if (!scene) return null;

      const topRibbon = scene.querySelector(".about-page-ribbon-top");
      const middleRibbon = scene.querySelector(".about-page-ribbon-line");
      const bottomRibbon = scene.querySelector(".about-page-ribbon-bottom");
      const ribbons = [topRibbon, middleRibbon, bottomRibbon].filter(Boolean);
      const headlineDrops = Array.from(scene.querySelectorAll(".about-page-headline .about-page-drop"));
      const accentDrops = Array.from(scene.querySelectorAll(".about-page-quote, .about-page-subline, .about-page-hello, .about-page-arrow"));
      const cleanupFns = [];

      if (reduceMotion) {
        scene.classList.remove("is-flowing");
        gsapLib.set(ribbons, { clearProps: "transform", autoAlpha: 1 });
        gsapLib.set([...headlineDrops, ...accentDrops], { clearProps: "transform", autoAlpha: 1 });
        return () => cleanupFns.forEach((cleanup) => cleanup());
      }

      scene.classList.remove("is-flowing");
      gsapLib.set(ribbons, { autoAlpha: 0 });
      gsapLib.set(headlineDrops, {
        autoAlpha: 0,
        y: -72,
        scaleX: 1.01,
        scaleY: 1.08,
        transformOrigin: "50% 100%"
      });
      gsapLib.set(accentDrops, {
        autoAlpha: 0,
        y: -34,
        rotation: (index) => index % 2 === 0 ? -1.2 : 1.2
      });

      const introTimeline = gsapLib.timeline({
        paused: true,
        defaults: { ease: "power3.out" }
      });

      if (topRibbon) {
        introTimeline.fromTo(topRibbon, {
          clipPath: "inset(0 100% 0 0 round 999px)",
          backgroundPosition: "0% 50%",
          x: -18
        }, {
          autoAlpha: 1,
          clipPath: "inset(0 0% 0 0 round 999px)",
          backgroundPosition: "56% 50%",
          x: 0,
          duration: 0.96
        }, 0);
      }

      if (middleRibbon) {
        introTimeline.fromTo(middleRibbon, {
          clipPath: "inset(0 0 0 100% round 999px)",
          backgroundPosition: "100% 50%",
          x: 14
        }, {
          autoAlpha: 1,
          clipPath: "inset(0 0 0 0 round 999px)",
          backgroundPosition: "44% 50%",
          x: 0,
          duration: 0.82
        }, 0.12);
      }

      if (bottomRibbon) {
        introTimeline.fromTo(bottomRibbon, {
          clipPath: "inset(0 100% 0 0 round 999px)",
          backgroundPosition: "0% 50%",
          x: -22
        }, {
          autoAlpha: 1,
          clipPath: "inset(0 0% 0 0 round 999px)",
          backgroundPosition: "58% 50%",
          x: 0,
          duration: 1.08
        }, 0.08);
      }

      introTimeline
        .to(headlineDrops, {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          ease: "power2.in",
          stagger: 0.06
        }, 0.18)
        .to(headlineDrops, {
          y: 8,
          scaleX: 1.02,
          scaleY: 0.96,
          duration: 0.14,
          ease: "power1.out",
          stagger: 0.04
        }, 0.86)
        .to(headlineDrops, {
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.42,
          ease: "back.out(0.72)",
          stagger: 0.04
        }, 1.02)
        .to(accentDrops, {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.72,
          ease: "power2.in",
          stagger: 0.05
        }, 0.42);

      const loopTweens = [
        gsapLib.to(".about-page-hello", {
          y: -3,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        }),
        gsapLib.to(".about-page-arrow", {
          y: -5,
          x: 2,
          rotation: 1.6,
          scale: 1.02,
          transformOrigin: "50% 50%",
          duration: 4.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      ];

      loopTweens.forEach((tween) => tween.pause(0));

      const playLoops = () => {
        scene.classList.add("is-flowing");
        loopTweens.forEach((tween) => tween.play());
      };
      const pauseLoops = () => {
        scene.classList.remove("is-flowing");
        loopTweens.forEach((tween) => tween.pause());
      };

      if (ScrollTriggerLib) {
        let introPlayed = false;
        const trigger = ScrollTriggerLib.create({
          trigger: scene,
          start: "top 88%",
          end: "bottom top",
          onEnter: () => {
            if (!introPlayed) {
              introPlayed = true;
              introTimeline.play(0);
            }
            playLoops();
          },
          onEnterBack: playLoops,
          onLeave: pauseLoops,
          onLeaveBack: pauseLoops
        });
        cleanupFns.push(() => trigger.kill());
      } else {
        introTimeline.play(0);
        playLoops();
      }

      cleanupFns.push(() => {
        scene.classList.remove("is-flowing");
        introTimeline.kill();
        loopTweens.forEach((tween) => tween.kill());
      });

      return () => cleanupFns.forEach((cleanup) => cleanup());
    }

    const mm = gsapLib.matchMedia();
    mm.add(
      {
        isDesktop: "(min-width: 821px)",
        isMobile: "(max-width: 820px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions;
        const cleanupFns = [];
        const hasFinePointer = window.matchMedia("(pointer:fine)").matches;

        if (reduceMotion) {
          gsapLib.set(".reveal", { clearProps: "all", autoAlpha: 1, y: 0 });
          document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
          const aboutPageCleanup = initAboutPageRecreationMotion(true);
          if (aboutPageCleanup) cleanupFns.push(aboutPageCleanup);
          const motionCleanup = initMotionCards(gsapLib, true);
          if (motionCleanup) cleanupFns.push(motionCleanup);
          return () => cleanupFns.forEach((cleanup) => cleanup());
        }

        gsapLib.defaults({ ease: "power2.out", duration: 0.7 });

        if (ScrollTriggerLib && revealTargets.length) {
          gsapLib.set(revealTargets, { autoAlpha: 0, y: 24 });
          ScrollTriggerLib.batch(revealTargets, {
            start: "top 86%",
            once: true,
            onEnter: (batch) => gsapLib.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              overwrite: true
            })
          });
        } else {
          initFallbackReveal();
        }

        const aboutPageCleanup = initAboutPageRecreationMotion(false);
        if (aboutPageCleanup) cleanupFns.push(aboutPageCleanup);

        const heroIntroTimeline = gsapLib.timeline({
          defaults: { ease: "power3.out" }
        });

        heroIntroTimeline
          .from(".hero-ambient-blob", {
            autoAlpha: 0,
            scale: 0.62,
            duration: 1.2,
            stagger: 0.12
          }, 0)
          .from(".hero .eyebrow", {
            y: 18,
            autoAlpha: 0,
            duration: 0.72
          }, 0.08)
          .from(".headline-big", {
            y: 30,
            autoAlpha: 0,
            duration: 1.05
          }, 0.14)
          .from(".headline-big img", {
            scaleX: 0.82,
            scaleY: 1.18,
            rotation: -1.4,
            duration: 1.08,
            ease: "expo.out"
          }, 0.14)
          .from(".headline-name", {
            y: 18,
            x: -18,
            autoAlpha: 0,
            duration: 0.82
          }, 0.3)
          .from(".headline-name img", {
            scaleX: 1.14,
            scaleY: 0.84,
            rotation: -1.2,
            duration: 0.86,
            ease: "back.out(1.2)"
          }, 0.32)
          .from(".hero-pills span", {
            y: 16,
            autoAlpha: 0,
            duration: 0.55,
            stagger: 0.06
          }, 0.62)
          .from(".hero-actions .button", {
            y: 12,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.08
          }, 0.72);

        gsapLib.to(".hero-ambient-blob-a", {
          x: 22,
          y: -14,
          scale: 1.04,
          duration: 10.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsapLib.to(".hero-ambient-blob-b", {
          x: -18,
          y: 18,
          scale: 0.98,
          duration: 9.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
        gsapLib.to(".hero-ambient-blob-c", {
          y: -10,
          scale: 1.03,
          duration: 11.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });

        if (heroLockup) {
          gsapLib.to(heroLockup, {
            y: -4,
            duration: 4.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }
        if (isDesktop && hasFinePointer && heroTitleBlock && heroAmbient && heroLockup) {
          const ambientXTo = gsapLib.quickTo(heroAmbient, "x", { duration: 0.9, ease: "power3.out" });
          const ambientYTo = gsapLib.quickTo(heroAmbient, "y", { duration: 0.9, ease: "power3.out" });
          const lockupXTo = gsapLib.quickTo(heroLockup, "x", { duration: 0.9, ease: "power3.out" });
          const lockupYTo = gsapLib.quickTo(heroLockup, "y", { duration: 0.9, ease: "power3.out" });
          const lockupRotateTo = gsapLib.quickTo(heroLockup, "rotation", { duration: 0.9, ease: "power3.out" });

          const onHeroMove = (event) => {
            const rect = heroTitleBlock.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const relativeY = event.clientY - rect.top;
            const moveX = gsapLib.utils.mapRange(0, rect.width, -12, 12, relativeX);
            const moveY = gsapLib.utils.mapRange(0, rect.height, -8, 8, relativeY);
            ambientXTo(moveX * 0.72);
            ambientYTo(moveY * 0.72);
            lockupXTo(moveX * 0.18);
            lockupYTo(moveY * 0.12 - 4);
            lockupRotateTo(moveX * 0.016);
          };

          const onHeroLeave = () => {
            ambientXTo(0);
            ambientYTo(0);
            lockupXTo(0);
            lockupYTo(-4);
            lockupRotateTo(0);
          };

          heroTitleBlock.addEventListener("pointermove", onHeroMove);
          heroTitleBlock.addEventListener("pointerleave", onHeroLeave);
          cleanupFns.push(() => {
            heroTitleBlock.removeEventListener("pointermove", onHeroMove);
            heroTitleBlock.removeEventListener("pointerleave", onHeroLeave);
          });
        }

        const motionCleanup = initMotionCards(gsapLib, false);
        if (motionCleanup) cleanupFns.push(motionCleanup);

        return () => cleanupFns.forEach((cleanup) => cleanup());
      }
    );
  }

  initGsapMotion();

  const overlayGsap = window.gsap || null;
  const aboutSheetOverlay = document.getElementById("about-sheet-overlay");
  const projectSpotlightOverlay = document.getElementById("project-spotlight-overlay");
  const viewer = document.getElementById("viewer");
  const viewerTitle = document.getElementById("viewer-title");
  const viewerSubtitle = document.getElementById("viewer-subtitle");
  const viewerStatus = document.getElementById("viewer-status");
  const viewerImage = document.getElementById("viewer-image");
  const viewerThumbs = document.getElementById("viewer-thumbs");
  const prevButton = document.getElementById("viewer-prev");
  const nextButton = document.getElementById("viewer-next");
  const managedOverlays = [aboutSheetOverlay, projectSpotlightOverlay, viewer].filter(Boolean);

  let activeProject = null;
  let activeIndex = 0;

  function syncBodyScrollLock() {
    const hasOpenOverlay = managedOverlays.some((overlay) => !overlay.classList.contains("is-hidden"));
    document.body.style.overflow = hasOpenOverlay ? "hidden" : "";
  }

  function getOverlayParts(overlay) {
    if (!overlay) return { panel: null, backdrop: null };
    return {
      panel: overlay.querySelector(".story-overlay-panel, .viewer-panel"),
      backdrop: overlay.querySelector(".story-overlay-backdrop, .viewer-backdrop")
    };
  }

  function openOverlay(overlay) {
    if (!overlay || !overlay.classList.contains("is-hidden")) return;
    const { panel, backdrop } = getOverlayParts(overlay);
    overlay.classList.remove("is-hidden");
    syncBodyScrollLock();

    if (!overlayGsap || !panel || !backdrop) return;

    overlayGsap.killTweensOf([panel, backdrop]);
    overlayGsap.set(backdrop, { autoAlpha: 0 });
    overlayGsap.set(panel, { autoAlpha: 0, y: 26, scale: 0.985 });
    overlayGsap.timeline({ defaults: { ease: "power3.out" } })
      .to(backdrop, { autoAlpha: 1, duration: 0.22 }, 0)
      .to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.42 }, 0.04);
  }

  function closeOverlay(overlay) {
    if (!overlay || overlay.classList.contains("is-hidden")) return;
    const { panel, backdrop } = getOverlayParts(overlay);

    if (!overlayGsap || !panel || !backdrop) {
      overlay.classList.add("is-hidden");
      syncBodyScrollLock();
      return;
    }

    overlayGsap.killTweensOf([panel, backdrop]);
    overlayGsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        overlay.classList.add("is-hidden");
        overlayGsap.set([panel, backdrop], { clearProps: "all" });
        syncBodyScrollLock();
      }
    })
      .to(panel, { autoAlpha: 0, y: 18, scale: 0.988, duration: 0.22 }, 0)
      .to(backdrop, { autoAlpha: 0, duration: 0.18 }, 0.02);
  }

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
    viewerImage.src = withVersion(`web-renders/page-${pageFile}.jpg`);
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
        <img src="${withVersion(`web-renders/page-${formatPageNumber(page)}.jpg`)}" alt="${activeProject.title} 第 ${page} 页缩略图" loading="lazy" decoding="async">
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
    openOverlay(viewer);
  }

  function openViewer(projectId, page) {
    openViewerWithEntry(getProjectById(projectId), page);
  }

  function openViewerForCard(cardId) {
    openViewerWithEntry(getCardById(cardId));
  }

  function closeViewer() {
    closeOverlay(viewer);
  }

  function moveViewer(step) {
    if (!activeProject) return;
    const nextIndex = activeIndex + step;
    if (nextIndex < 0 || nextIndex >= activeProject.pages.length) return;
    activeIndex = nextIndex;
    updateViewer();
  }

  document.addEventListener("click", (event) => {
    const aboutButton = event.target.closest("[data-open-about-sheet]");
    if (aboutButton) {
      openOverlay(aboutSheetOverlay);
      return;
    }

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

    const storyClose = event.target.closest("[data-story-close]");
    if (storyClose) {
      const target = storyClose.getAttribute("data-story-close");
      if (target === "about") {
        closeOverlay(aboutSheetOverlay);
      } else if (target === "spotlight") {
        closeOverlay(projectSpotlightOverlay);
      }
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
    if (event.key === "Escape") {
      if (viewer && !viewer.classList.contains("is-hidden")) {
        closeViewer();
      } else if (projectSpotlightOverlay && !projectSpotlightOverlay.classList.contains("is-hidden")) {
        closeOverlay(projectSpotlightOverlay);
      } else if (aboutSheetOverlay && !aboutSheetOverlay.classList.contains("is-hidden")) {
        closeOverlay(aboutSheetOverlay);
      }
    } else if (event.key === "ArrowLeft" && viewer && !viewer.classList.contains("is-hidden")) {
      moveViewer(-1);
    } else if (event.key === "ArrowRight" && viewer && !viewer.classList.contains("is-hidden")) {
      moveViewer(1);
    }
  });

})();

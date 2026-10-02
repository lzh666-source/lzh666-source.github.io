(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const progress = document.querySelector(".scroll-progress span");
  const header = document.querySelector(".site-header");

  const projectData = {
    lavid: {
      index: "01",
      type: "RESEARCH / AUDIO-VISUAL AI",
      title: "LAVID",
      summary: "面向资源受限场景的轻量级音视频深度伪造检测。",
      detail: "独立训练视觉分支与 mouth-mel 同步分支，再以受控权重融合同步异常信号，避免模型退化为只依赖视觉的判别器。研究重点不是简单增加音频输入，而是验证模型是否真正使用跨模态一致性。",
      tags: ["PyTorch", "MobileNetV2", "Audio-Visual Sync"]
    },
    dasc: {
      index: "02",
      type: "RESEARCH / GRAPH AI",
      title: "DASC-GNN",
      summary: "识别同时进行特征伪装与关系伪装的欺诈节点。",
      detail: "面向图欺诈检测中的特征伪装与关系伪装，结合标签增强节点表示、密度感知子结构对比损失和多关系聚合器。作为共同作者参与研究，论文正在 IEEE TDSC 审稿。",
      tags: ["GNN", "Contrastive Learning", "Fraud Detection"]
    },
    aigc: {
      index: "03",
      type: "ENGINEERING / TRUSTWORTHY AI",
      title: "AIGC-Trust",
      summary: "把 AIGC 检测扩展成可验证、可追踪、可部署的内容安全系统。",
      detail: "融合图像、视频和文本 AIGC 检测，结合频域异常、时序一致性、SM2/SM3 与审计哈希链，让一次检测结果不再只是分数，而是可以复核与追踪的证据。",
      tags: ["ViT / BERT", "FastAPI", "SM2 / SM3"]
    },
    avcd: {
      index: "04",
      type: "REPRODUCTION / AUDIO-VISUAL AI",
      title: "AVCD",
      summary: "从完整复现出发，建立后续轻量化研究基础。",
      detail: "复现音视频耦合网络及数据预处理、声谱特征、口型区域提取、训练和评估流程，为后续轻量化研究建立可重复的实验基础。",
      tags: ["Python", "Librosa", "OpenCV"]
    },
    mnist: {
      index: "05",
      type: "ENGINEERING / COMPUTER VISION",
      title: "MNIST CNN",
      summary: "手写数字识别、训练与结果可视化。",
      detail: "使用 TensorFlow 完成数据增强、卷积网络设计、训练与可视化分析，测试准确率约 98%。",
      tags: ["TensorFlow", "CNN", "Visualization"]
    },
    qt: {
      index: "06",
      type: "ENGINEERING / DESKTOP APP",
      title: "Qt Minesweeper",
      summary: "把经典算法做成稳定、完整的桌面应用。",
      detail: "使用 C++ / Qt 实现递归展开、多难度计时、主题切换和模块化界面。",
      tags: ["C++", "Qt", "Recursion"]
    }
  };

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, ratio * 100)}%`;
    header.classList.toggle("is-scrolled", window.scrollY > 24);

    const sections = [...document.querySelectorAll("main section[id]")];
    let active = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 180) active = section.id;
    });
    document.querySelectorAll(".desktop-nav a").forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${active}`);
    });
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  updateScroll();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  document.querySelectorAll("[data-reveal]").forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
  });

  const menuToggle = document.querySelector("#menuToggle");
  const mobileMenu = document.querySelector("#mobileMenu");
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    mobileMenu.classList.remove("open");
    body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.classList.toggle("open", open);
    body.classList.toggle("menu-open", open);
  });
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const themeToggle = document.querySelector("#themeToggle");
  const storedTheme = localStorage.getItem("leo-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    root.dataset.theme = localStorage.getItem("leo-theme-version") === "2" ? storedTheme : (storedTheme === "dark" ? "light" : "dark");
  }
  localStorage.setItem("leo-theme", root.dataset.theme);
  localStorage.setItem("leo-theme-version", "2");
  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("leo-theme", root.dataset.theme);
  });

  const langToggle = document.querySelector("#langToggle");
  let language = localStorage.getItem("leo-language") || "zh";
  const applyLanguage = () => {
    root.lang = language === "zh" ? "zh-CN" : "en";
    langToggle.textContent = language === "zh" ? "EN" : "中";
    document.querySelectorAll("[data-zh][data-en]").forEach((element) => {
      element.innerHTML = element.dataset[language];
    });
  };
  langToggle.addEventListener("click", () => {
    language = language === "zh" ? "en" : "zh";
    localStorage.setItem("leo-language", language);
    applyLanguage();
  });
  applyLanguage();

  if (finePointer && !reducedMotion) {
    const dot = document.querySelector(".cursor-dot");
    const orbit = document.querySelector(".cursor-orbit");
    const cursorLabel = orbit.querySelector("span");
    let mouseX = -100;
    let mouseY = -100;
    let orbitX = -100;
    let orbitY = -100;

    window.addEventListener("pointermove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      root.style.setProperty("--mx", `${mouseX}px`);
      root.style.setProperty("--my", `${mouseY}px`);
      dot.style.opacity = "1";
      orbit.style.opacity = "1";
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    const animateCursor = () => {
      orbitX += (mouseX - orbitX) * 0.14;
      orbitY += (mouseY - orbitY) * 0.14;
      orbit.style.transform = `translate3d(${orbitX}px, ${orbitY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    document.querySelectorAll("a, button, [data-cursor]").forEach((element) => {
      element.addEventListener("pointerenter", () => {
        orbit.classList.add("is-active");
        cursorLabel.textContent = element.dataset.cursor || "GO";
      });
      element.addEventListener("pointerleave", () => orbit.classList.remove("is-active"));
    });

    document.querySelectorAll(".magnetic").forEach((element) => {
      element.addEventListener("pointermove", (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      element.addEventListener("pointerleave", () => {
        element.style.transform = "";
      });
    });

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const range = card.classList.contains("project") ? 2.5 : 5;
        card.style.transform = `perspective(1000px) rotateX(${-y * range}deg) rotateY(${x * range}deg)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

  }

  const metricObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const decimal = String(target).includes(".");
      const started = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progressValue = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        const value = target * eased;
        element.textContent = decimal ? value.toFixed(1) : Math.round(value);
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      metricObserver.unobserve(element);
    });
  }, { threshold: 0.55 });
  document.querySelectorAll("[data-count]").forEach((metric) => metricObserver.observe(metric));

  const dialog = document.querySelector("#projectDialog");
  const dialogClose = dialog.querySelector(".dialog-close");

  const openProject = (key) => {
    const data = projectData[key];
    if (!data) return;
    document.querySelector("#dialogIndex").textContent = data.index;
    document.querySelector("#dialogType").textContent = data.type;
    document.querySelector("#dialogTitle").textContent = data.title;
    document.querySelector("#dialogSummary").textContent = data.summary;
    document.querySelector("#dialogDetail").textContent = data.detail;
    document.querySelector("#dialogTags").innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join("");
    dialog.showModal();
    body.classList.add("dialog-open");
  };

  document.querySelectorAll("[data-project]").forEach((element) => {
    element.addEventListener("click", () => openProject(element.dataset.project));
    element.addEventListener("keydown", (event) => {
      if (element.tagName !== "BUTTON" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        openProject(element.dataset.project);
      }
    });
  });

  const closeDialog = () => {
    dialog.close();
    body.classList.remove("dialog-open");
  };
  dialogClose.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", () => body.classList.remove("dialog-open"));
})();

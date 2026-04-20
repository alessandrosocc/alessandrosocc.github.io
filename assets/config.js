const CONFIG_PATH = "assets/config.yaml";

const setMetaContent = (selector, value) => {
  const el = document.querySelector(selector);
  if (el && value) {
    el.setAttribute("content", value);
  }
};

const setTextOrHtml = (el, value) => {
  if (!el || value == null) return;
  el.innerHTML = value;
};

const clearChildren = (el) => {
  if (!el) return;
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
};

const countIndent = (line) => {
  const match = line.match(/^ */);
  return match ? match[0].length : 0;
};

const extractChildKeyOrder = (yamlText, parentKey) => {
  if (!yamlText || !parentKey) return [];

  const lines = yamlText.split(/\r?\n/);
  const escapedParentKey = parentKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parentPattern = new RegExp(`^${escapedParentKey}:\\s*$`);
  let parentIndent = null;
  let insideParent = false;
  const keys = [];

  for (const line of lines) {
    if (!insideParent) {
      if (parentPattern.test(line)) {
        insideParent = true;
        parentIndent = 0;
      }
      continue;
    }

    if (!line.trim() || line.trimStart().startsWith("#")) {
      continue;
    }

    const indent = countIndent(line);
    if (indent <= parentIndent) {
      break;
    }

    const trimmed = line.trim();
    if (indent === parentIndent + 2 && /^[A-Za-z0-9_-]+:\s*/.test(trimmed)) {
      keys.push(trimmed.split(":")[0]);
    }
  }

  return keys;
};

const applyCustomFont = (fontName) => {
  const rootStyle = document.documentElement.style;

  if (!fontName || typeof fontName !== "string" || !fontName.trim()) {
    rootStyle.removeProperty("--font-body");
    rootStyle.removeProperty("--font-mono");
    return;
  }

  const familyName = JSON.stringify(fontName.trim());
  rootStyle.setProperty(
    "--font-body",
    `${familyName}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  );
  rootStyle.setProperty(
    "--font-mono",
    `${familyName}, 'SFMono-Regular', Consolas, 'Liberation Mono', monospace`
  );
};

const createSectionElement = (key, title) => {
  const section = document.createElement("section");
  section.className = "mb-5";
  section.dataset.section = key;

  const heading = document.createElement("h2");
  heading.className = "section-title";
  heading.textContent = title || "";
  section.appendChild(heading);

  return section;
};

const renderHeader = (header = {}) => {
  const profileImage = document.getElementById("profile-image");
  if (profileImage && header.profile_image) {
    profileImage.src = header.profile_image;
  }
  if (profileImage && header.profile_alt) {
    profileImage.alt = header.profile_alt;
  }

  setTextOrHtml(document.getElementById("profile-name"), header.name_html);
  setTextOrHtml(document.getElementById("profile-meta"), header.meta_html);
  setTextOrHtml(document.getElementById("about-body"), header.body_html);

  const keywordsContainer = document.getElementById("about-keywords");
  if (keywordsContainer) {
    clearChildren(keywordsContainer);
    (header.keywords || []).forEach((keyword) => {
      const span = document.createElement("span");
      span.className = "keyword-tag";
      span.textContent = keyword;
      keywordsContainer.appendChild(span);
    });
  }

  const linksContainer = document.getElementById("profile-links");
  if (linksContainer) {
    clearChildren(linksContainer);
    (header.links || []).forEach((link) => {
      const a = document.createElement("a");
      a.textContent = link.label || "";
      a.href = link.href || "#";
      if (link.target) {
        a.target = link.target;
      }
      linksContainer.appendChild(a);
    });
  }
};

const renderPublicationItems = (items = [], container) => {
  items.forEach((item) => {
    const pub = document.createElement("div");
    pub.className = "publication";

    const title = document.createElement("div");
    title.className = "pub-title";
    const titleHref = item.url || "#";
    title.innerHTML = `<a href="${titleHref}">${item.title || ""}</a>`;

    const authors = document.createElement("div");
    authors.className = "pub-authors";
    authors.innerHTML = item.authors || "";

    const venue = document.createElement("div");
    venue.className = "pub-venue";
    venue.textContent = item.venue || "";

    const links = document.createElement("div");
    links.className = "pub-links";
    (item.links || []).forEach((link) => {
      const a = document.createElement("a");
      a.href = link.url || "#";
      a.target = "_blank";
      a.textContent = link.label || "";
      links.appendChild(a);
    });

    pub.appendChild(title);
    pub.appendChild(authors);
    pub.appendChild(venue);
    pub.appendChild(links);
    container.appendChild(pub);
  });
};

const parseMonthYear = (value) => {
  if (!value || typeof value !== "string") return null;
  const [monthRaw, yearRaw] = value.trim().split("/");
  const month = Number.parseInt(monthRaw, 10);
  const year = Number.parseInt(yearRaw, 10);
  if (!Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (month < 1 || month > 12) return null;
  return { year, month };
};

const buildDurationLabel = (months) => {
  if (!Number.isFinite(months) || months < 0) return "";
  if (months === 0) return "Less than 1 mo";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [];

  if (years > 0) {
    parts.push(`${years} ${years === 1 ? "yr" : "yrs"}`);
  }
  if (remainingMonths > 0) {
    parts.push(`${remainingMonths} ${remainingMonths === 1 ? "mo" : "mos"}`);
  }

  return parts.join(" ");
};

const getElapsedLabel = (dateText) => {
  if (!dateText || typeof dateText !== "string") return "";

  const parts = dateText.split("-").map((part) => part.trim());
  if (parts.length < 2) return "";

  const start = parseMonthYear(parts[0]);
  if (!start) return "";

  const isPresent = /present/i.test(parts[1]);
  const end = isPresent
    ? { year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
    : parseMonthYear(parts[1]);

  if (!end) return "";

  const startIndex = start.year * 12 + start.month;
  const endIndex = end.year * 12 + end.month;
  const months = endIndex - startIndex;
  const duration = buildDurationLabel(months);
  if (!duration) return "";

  return isPresent ? `Elapsed: ${duration}` : `Duration: ${duration}`;
};

const renderTimelineItems = (items = [], container, showDuration = true) => {
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "experience-row";

    const logo = document.createElement("div");
    logo.className = "exp-logo";
    if (item.logo) {
      const img = document.createElement("img");
      img.src = item.logo;
      img.alt = item.logo_alt || "";
      logo.appendChild(img);
    }

    const info = document.createElement("div");
    info.className = "exp-info";

    const role = document.createElement("div");
    role.className = "exp-role";
    role.textContent = item.role || "";

    const place = document.createElement("div");
    place.className = "exp-place";
    if (item.place_url) {
      const a = document.createElement("a");
      a.href = item.place_url;
      a.target = "_blank";
      a.textContent = item.place || "";
      place.appendChild(a);
    } else {
      place.textContent = item.place || "";
    }

    info.appendChild(role);
    info.appendChild(place);

    const date = document.createElement("div");
    date.className = "exp-date";

    const dateText = document.createElement("div");
    dateText.className = "exp-date-text";
    dateText.textContent = item.date || "";
    date.appendChild(dateText);

    if (showDuration) {
      const durationText = getElapsedLabel(item.date || "");
      if (durationText) {
        const duration = document.createElement("div");
        duration.className = "exp-duration";
        duration.textContent = durationText;
        date.appendChild(duration);
      }
    }

    row.appendChild(logo);
    row.appendChild(info);
    row.appendChild(date);
    container.appendChild(row);
  });
};

const renderNewsItems = (items = [], container) => {
  const scrollBox = document.createElement("div");
  scrollBox.className = "updates-scroll-box";

  items.forEach((item) => {
    const wrapper = document.createElement("div");
    wrapper.className = "news-item";

    const date = document.createElement("div");
    date.className = "news-date";
    date.textContent = item.date || "";

    const text = document.createElement("div");
    text.className = "news-text";
    text.innerHTML = item.html || "";

    wrapper.appendChild(date);
    wrapper.appendChild(text);
    scrollBox.appendChild(wrapper);
  });

  container.appendChild(scrollBox);
};

const renderSimpleListItems = (items = [], container) => {
  const list = document.createElement("div");

  items.forEach((item) => {
    const entry = document.createElement("div");
    entry.className = "publication";

    if (typeof item === "string") {
      entry.textContent = item;
    } else if (item && typeof item === "object") {
      if (item.html) {
        entry.innerHTML = item.html;
      } else if (item.text) {
        entry.textContent = item.text;
      } else {
        entry.textContent = Object.values(item).filter(Boolean).join(" - ");
      }
    }

    list.appendChild(entry);
  });

  container.appendChild(list);
};

const renderScholarLink = (item, container) => {
  if (!item) return;

  const linkWrap = document.createElement("div");
  linkWrap.className = "mt-2 text-left";

  const link = document.createElement("a");
  link.className = "more-papers-link";
  link.href = item.href || "#";
  link.target = "_blank";
  link.textContent = item.label || "";

  linkWrap.appendChild(link);
  container.appendChild(linkWrap);
  container.appendChild(document.createElement("br"));
};

const getOrderedSectionEntries = (data = {}, orderedKeys = []) => {
  const seen = new Set();
  const entries = [];

  orderedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      entries.push([key, data[key]]);
      seen.add(key);
    }
  });

  Object.entries(data).forEach(([key, value]) => {
    if (!seen.has(key)) {
      entries.push([key, value]);
    }
  });

  return entries;
};

const isTimelineDurationEnabled = (config) => {
  if (!config || typeof config !== "object") return true;
  return config.show_timeline_duration !== false;
};

const sectionRenderers = {
  publications: (data, section) => {
    const orderedEntries = getOrderedSectionEntries(
      data,
      (data && data.__fieldOrder) || []
    );

    orderedEntries.forEach(([key, value]) => {
      if (key === "papers" || key === "items") {
        renderPublicationItems(value || [], section);
      } else if (key === "scholar_link") {
        renderScholarLink(value, section);
      }
    });
  },
  conference_tutorials: (data, section) => {
    renderPublicationItems(data.items || [], section);
  },
  program_committee: (data, section) => {
    renderSimpleListItems(Array.isArray(data) ? data : data.items || [], section);
  },
  experience: (data, section, config) => {
    renderTimelineItems(
      Array.isArray(data) ? data : data.items || [],
      section,
      isTimelineDurationEnabled(config)
    );
  },
  education: (data, section, config) => {
    renderTimelineItems(
      Array.isArray(data) ? data : data.items || [],
      section,
      isTimelineDurationEnabled(config)
    );
  },
  news: (data, section) => {
    renderNewsItems(Array.isArray(data) ? data : data.items || [], section);
  },
};

const renderSections = (config) => {
  const sectionsContainer = document.getElementById("dynamic-sections");
  if (!sectionsContainer) return;

  clearChildren(sectionsContainer);

  Object.entries(config.sections || {}).forEach(([sectionKey, title]) => {
    const sectionData = config[sectionKey];
    if (sectionData == null) return;

    const section = createSectionElement(sectionKey, title);
    const renderer = sectionRenderers[sectionKey];

    if (renderer) {
      renderer(sectionData, section, config);
    } else {
      const fallback = document.createElement("pre");
      fallback.textContent = typeof sectionData === "string"
        ? sectionData
        : JSON.stringify(sectionData, null, 2);
      section.appendChild(fallback);
    }

    sectionsContainer.appendChild(section);
  });
};

const applyConfig = (config) => {
  if (!config) return;

  if (config.site) {
    if (config.site.title) {
      document.title = config.site.title;
    }
    setMetaContent("#meta-description", config.site.meta_description);
    setMetaContent("#meta-author", config.site.meta_author);
  }

  applyCustomFont(config["custom-font"]);
  renderHeader(config.header || {});
  renderSections(config);

  if (config.footer) {
    setTextOrHtml(document.getElementById("site-footer"), config.footer);
  }
};

const loadConfig = async () => {
  try {
    const response = await fetch(CONFIG_PATH, { cache: "no-store" });
    if (!response.ok) return;

    const yamlText = await response.text();
    const config = jsyaml.load(yamlText);
    if (config && config.publications && typeof config.publications === "object") {
      Object.defineProperty(config.publications, "__fieldOrder", {
        value: extractChildKeyOrder(yamlText, "publications"),
        enumerable: false,
      });
    }
    applyConfig(config);
  } catch (error) {
    console.error("Failed to load config.yaml", error);
  }
};

loadConfig();

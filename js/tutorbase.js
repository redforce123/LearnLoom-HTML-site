(() => {
  const READY_STATES = new Set(["complete", "interactive"]);
  const INITIAL_WIDTH = 120;
  const INITIAL_HEIGHT = 120;
  const READY_TIMEOUT = 1000;
  const VIEWPORT_DEBOUNCE = 120;
  const MAX_Z_INDEX = 2147483000;
  const LOG_PREFIX = "[Tutorbase widget]";
  let BASE_WIDTH = null;
  let BASE_HEIGHT = null;

  function getScriptElement() {
    if (document.currentScript) {
      return document.currentScript;
    }
    const scripts = document.querySelectorAll("script[src]");
    for (let i = scripts.length - 1; i >= 0; i -= 1) {
      const src = scripts[i].src || "";
      if (src.includes("/widget.js")) {
        return scripts[i];
      }
    }
    return null;
  }

  function setStyle(element, property, value) {
    if (!element) return;
    element.style.setProperty(property, value, "important");
  }

  function getLayoutWidth() {
    try {
      const candidates = [];
      const doc = document.documentElement;
      const body = document.body;
      if (doc && typeof doc.clientWidth === "number") candidates.push(doc.clientWidth);
      if (body && typeof body.clientWidth === "number") candidates.push(body.clientWidth);
      if (body && typeof body.getBoundingClientRect === "function") {
        const rect = body.getBoundingClientRect();
        if (rect && typeof rect.width === "number") candidates.push(rect.width);
      }
      if (body && typeof window.getComputedStyle === "function") {
        const computed = window.getComputedStyle(body);
        const parsed = computed?.width ? parseFloat(computed.width) : NaN;
        if (Number.isFinite(parsed)) {
          candidates.push(parsed);
        }
      }
      return candidates.length ? Math.max(...candidates) : null;
    } catch (error) {
      return null;
    }
  }

  function getViewportMetrics() {
    const pickFirstFinite = (values) =>
      values.find((value) => typeof value === "number" && Number.isFinite(value)) ?? null;

    // Prioritize layout viewport, then visual viewport, then screen fallbacks.
    const measuredWidth = pickFirstFinite([
      window.innerWidth,
      document?.documentElement?.clientWidth,
      window.visualViewport?.width,
      window.screen?.width,
      window.screen?.availWidth,
    ]);

    // For height, prefer layout viewport first, then visual viewport, then screen.
    const rawHeight = pickFirstFinite([
      window.innerHeight,
      document?.documentElement?.clientHeight,
      window.visualViewport?.height,
      window.screen?.height,
      window.screen?.availHeight,
    ]);

    const widthShifted =
      typeof measuredWidth === "number" &&
      typeof BASE_WIDTH === "number" &&
      Math.abs(measuredWidth - BASE_WIDTH) > 160;

    if (widthShifted) {
      BASE_WIDTH = measuredWidth;
      BASE_HEIGHT = rawHeight;
    } else {
      if (typeof measuredWidth === "number" && (BASE_WIDTH == null || measuredWidth > BASE_WIDTH)) {
        BASE_WIDTH = measuredWidth;
      }
      if (typeof rawHeight === "number" && (BASE_HEIGHT == null || rawHeight > BASE_HEIGHT)) {
        BASE_HEIGHT = rawHeight;
      }
    }

    const layoutWidth = getLayoutWidth();
    let width = measuredWidth;
    const shouldClampToLayout =
      typeof layoutWidth === "number" &&
      typeof width === "number" &&
      layoutWidth < width &&
      layoutWidth <= 500 &&
      width - layoutWidth >= 24;

    if (shouldClampToLayout) {
      width = layoutWidth;
    }

    let height = rawHeight;
    if (typeof BASE_HEIGHT === "number") {
      if (typeof rawHeight === "number" && rawHeight < BASE_HEIGHT * 0.7) {
        height = BASE_HEIGHT;
      } else if (rawHeight == null) {
        height = BASE_HEIGHT;
      }
    }

    return {
      width,
      height,
    };
  }

  function postViewportMetrics(targetWindow, slug, origin) {
    if (!targetWindow || typeof targetWindow.postMessage !== "function") {
      return;
    }
    const metrics = getViewportMetrics();
    if (!metrics.width || !metrics.height) {
      return;
    }
    targetWindow.postMessage(
      {
        type: "TB_HOST_VIEWPORT",
        slug,
        width: Math.max(1, Math.floor(metrics.width)),
        height: Math.max(1, Math.floor(metrics.height)),
      },
      origin
    );
  }

  function appendNode(target, node) {
    if (!target || !node) return false;
    try {
      target.appendChild(node);
      return true;
    } catch (error) {
      return false;
    }
  }

  function findFooterTarget() {
    const candidates = document.querySelectorAll(
      "footer, [role='contentinfo'], .site-footer, .footer"
    );
    for (let i = 0; i < candidates.length; i += 1) {
      const el = candidates[i];
      if (!isHostLayoutHostile(el)) {
        return el;
      }
    }
    return null;
  }

  function findAttributionTargetFromScript(scriptEl) {
    if (!scriptEl) return null;
    const selector =
      scriptEl.getAttribute("data-tutorbase-attrib-selector") ||
      scriptEl.getAttribute("data-tb-attrib-selector");
    if (!selector) return null;
    try {
      return document.querySelector(selector);
    } catch (error) {
      return null;
    }
  }

  function isHostLayoutHostile(element) {
    if (!element || !window.getComputedStyle) return false;
    const computed = window.getComputedStyle(element);
    const display = (computed && computed.display) || "";
    return display.includes("flex") || display.includes("grid");
  }

  function observeForFooter(node) {
    if (!window.MutationObserver || !node) return;
    const observer = new MutationObserver(() => {
      const footer = findFooterTarget();
      if (footer && node.parentNode !== footer) {
        appendNode(footer, node);
      }
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => observer.disconnect(), 30000);
  }

  function createAttributionNode() {
    const existing = document.querySelector("[data-tb-attribution='true']");
    if (existing) return null;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-tb-attribution", "true");
    wrapper.setAttribute("role", "contentinfo");
    wrapper.className = "tb-attrib-wrapper";
    setStyle(wrapper, "box-sizing", "border-box");
    setStyle(wrapper, "width", "100%");
    setStyle(wrapper, "display", "block");
    setStyle(wrapper, "position", "relative");
    setStyle(wrapper, "padding", "10px 14px 16px 14px");
    setStyle(wrapper, "text-align", "center");
    setStyle(wrapper, "background", "transparent");
    setStyle(wrapper, "color", "#4b5563");

    const link = document.createElement("a");
    link.href = "https://tutorbase.com/whatsapp-widget";
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", "Powered by Tutorbase");
    link.className = "tb-attrib-link";
    setStyle(link, "display", "inline-flex");
    setStyle(link, "align-items", "center");
    setStyle(link, "gap", "6px");
    setStyle(link, "padding", "5px 12px");
    setStyle(link, "font-size", "12px");
    setStyle(
      link,
      "font-family",
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
    );
    setStyle(link, "font-weight", "500");
    setStyle(link, "line-height", "1.35");
    setStyle(link, "color", "inherit");
    setStyle(link, "background", "rgba(255, 255, 255, 0.62)");
    setStyle(link, "border-radius", "9999px");
    setStyle(link, "text-decoration", "none");
    setStyle(link, "white-space", "nowrap");
    setStyle(link, "max-width", "320px");
    setStyle(link, "box-shadow", "0 2px 6px rgba(15, 23, 42, 0.08)");
    setStyle(link, "transition", "background-color 120ms ease, opacity 120ms ease");

    const icon = document.createElement("img");
    icon.src =
      "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2060%2055'%3E%3Cpath%20d='M6.95%200.01C5.02%200.01%203.34%201.3%202.84%203.16L0%2013.73H20.97L9.92%2054.92H20.45C22.38%2054.92%2024.06%2053.63%2024.56%2051.77L34.77%2013.73H52.38C54.31%2013.73%2056%2012.44%2056.49%2010.57L59.32%200H6.94Z'%20fill='black'/%3E%3Cpath%20d='M46.85%2034.36H36.34L40.05%2020.59H50.11C51.98%2020.59%2053.34%2022.36%2052.85%2024.17L50.95%2031.21C50.45%2033.07%2048.76%2034.36%2046.84%2034.36'%20fill='black'/%3E%3Cpath%20d='M41.36%2054.95H30.85L34.56%2041.18H44.62C46.49%2041.18%2047.85%2042.95%2047.36%2044.76L45.46%2051.8C44.96%2053.66%2043.27%2054.95%2041.35%2054.95'%20fill='black'/%3E%3C/svg%3E";
    icon.alt = "Tutorbase";
    icon.width = 14;
    icon.height = 14;
    icon.decoding = "async";
    icon.loading = "lazy";
    setStyle(icon, "display", "block");
    setStyle(icon, "border-radius", "4px");

    link.appendChild(icon);
    link.appendChild(document.createTextNode("Powered by Tutorbase"));

    link.addEventListener("mouseenter", () => {
      setStyle(link, "background", "rgba(255, 255, 255, 0.72)");
    });
    link.addEventListener("mouseleave", () => {
      setStyle(link, "background", "rgba(255, 255, 255, 0.62)");
    });

    wrapper.appendChild(link);
    return wrapper;
  }

  function placeAttribution(scriptEl) {
    if (document.querySelector("[data-tb-attribution='true']")) return;
    const node = createAttributionNode();
    if (!node) return;

    const explicitTarget = findAttributionTargetFromScript(scriptEl);
    if (explicitTarget && appendNode(explicitTarget, node)) {
      observeForFooter(node);
      return;
    }

    const footer = findFooterTarget();
    if (footer && appendNode(footer, node)) {
      observeForFooter(node);
      return;
    }

    const body = document.body;
    const html = document.documentElement;
    const bodyHostile = isHostLayoutHostile(body);
    const htmlHostile = isHostLayoutHostile(html);

    if (!body || bodyHostile) {
      // Prefer html when body is missing or hostile.
      if (html) {
        appendNode(html, node);
      }
    } else {
      appendNode(body, node);
    }

    if (htmlHostile && html && node.parentNode !== html) {
      const container = document.createElement("div");
      container.setAttribute("data-tb-attrib-container", "true");
      setStyle(container, "display", "block");
      setStyle(container, "width", "100%");
      setStyle(container, "position", "relative");
      setStyle(container, "flex", "0 0 auto");
      setStyle(container, "align-self", "stretch");
      appendNode(html, container);
      appendNode(container, node);
    }

    observeForFooter(node);
  }

  function init() {
    const scriptEl = getScriptElement();
    if (!scriptEl) {
      console.warn(LOG_PREFIX, "unable to locate script element.");
      return;
    }
    if (scriptEl.dataset && scriptEl.dataset.tbWidgetInitialized === "true") {
      return;
    }
    scriptEl.dataset.tbWidgetInitialized = "true";
    try {
      const origin = "https://tutorbase.com";
      const baseUrl = origin;
      const slug = "7s8yadcz";
      fetchConfig(baseUrl, slug)
        .then((payload) => {
          if (!payload || !payload.data) {
            console.info(LOG_PREFIX, "no active widget found for", slug);
            return;
          }
          // Defer placement slightly to ensure host styles are applied.
          window.requestAnimationFrame(() => {
            // placeAttribution removed
          });
          mountWidget({
            baseUrl,
            origin,
            slug,
            config: payload.data,
            scriptEl,
          });
        })
        .catch((error) => {
          console.error(LOG_PREFIX, "widget failed to load", error);
        });
    } catch (error) {
      console.error(LOG_PREFIX, "invalid script URL", error);
    }
  }

  function fetchConfig(baseUrl, slug) {
    const endpoint = baseUrl + "/api/embed/" + encodeURIComponent(slug);
    return fetch(endpoint, { credentials: "omit" }).then((response) => {
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    });
  }

  function mountWidget({ baseUrl, origin, slug, config, scriptEl }) {
    let iframeReadyForViewportMessages = false;
    let viewportTimer = null;
    let isRevealed = false;

    const wrapper = document.createElement("div");
    setStyle(wrapper, "position", "fixed");
    setStyle(wrapper, "bottom", "calc(12px + env(safe-area-inset-bottom, 0px))");
    if (config && config.position === "left") {
      setStyle(wrapper, "left", "calc(12px + env(safe-area-inset-left, 0px))");
      setStyle(wrapper, "right", "auto");
    } else {
      setStyle(wrapper, "right", "calc(12px + env(safe-area-inset-right, 0px))");
      setStyle(wrapper, "left", "auto");
    }
    setStyle(wrapper, "z-index", String(MAX_Z_INDEX));
    setStyle(wrapper, "opacity", "0");
    setStyle(wrapper, "pointer-events", "none");
    setStyle(wrapper, "background", "transparent");
    setStyle(wrapper, "overflow", "visible");
    setStyle(wrapper, "width", INITIAL_WIDTH + "px");
    setStyle(wrapper, "height", INITIAL_HEIGHT + "px");
    setStyle(wrapper, "max-width", "100vw");
    setStyle(
      wrapper,
      "transition",
      "width 200ms ease, height 200ms ease, opacity 150ms ease"
    );

    const iframe = document.createElement("iframe");
    iframe.src = baseUrl + "/widget/embed?slug=" + encodeURIComponent(slug);
    iframe.allow = "clipboard-write";
    iframe.title = "Tutorbase WhatsApp Widget";
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("aria-label", "WhatsApp chat widget");
    iframe.loading = "lazy";
    setStyle(iframe, "position", "absolute");
    setStyle(iframe, "border", "none");
    setStyle(iframe, "background", "transparent");
    setStyle(iframe, "touch-action", "manipulation");
    setStyle(iframe, "overflow", "visible");
    setStyle(iframe, "inset", "0");
    setStyle(iframe, "width", "100%");
    setStyle(iframe, "height", "100%");
    setStyle(iframe, "max-width", "none");
    setStyle(iframe, "max-height", "none");
    setStyle(iframe, "min-width", "0");
    setStyle(iframe, "min-height", "0");

    wrapper.appendChild(iframe);

    const append = () => {
      if (document.body && !document.body.contains(wrapper)) {
        document.body.appendChild(wrapper);
      }
    };
    if (!document.body) {
      window.addEventListener("load", append, { once: true });
    } else {
      append();
    }

    const revealIframe = () => {
      if (isRevealed) return;
      isRevealed = true;
      setStyle(wrapper, "opacity", "1");
      setStyle(wrapper, "pointer-events", "auto");
    };

    const applySize = (width, height) => {
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        return;
      }
      setStyle(wrapper, "width", Math.max(1, Math.ceil(width)) + "px");
      setStyle(wrapper, "height", Math.max(1, Math.ceil(height)) + "px");
    };

    const applyWidgetState = (isOpen) => {
      if (typeof isOpen !== "boolean") return;
      wrapper.setAttribute("data-tb-widget-open", isOpen ? "true" : "false");
      const attribution = document.querySelector("[data-tb-attribution='true']");
      if (attribution) {
        attribution.setAttribute("data-tb-widget-open", isOpen ? "true" : "false");
      }
    };

    const notifyViewport = () => {
      if (!iframeReadyForViewportMessages) return;
      postViewportMetrics(iframe.contentWindow, slug, origin);
    };

    const scheduleViewportNotification = () => {
      if (!iframeReadyForViewportMessages) return;
      if (viewportTimer) {
        window.clearTimeout(viewportTimer);
      }
      viewportTimer = window.setTimeout(notifyViewport, VIEWPORT_DEBOUNCE);
    };

    const onIframeLoad = () => {
      iframeReadyForViewportMessages = true;
      notifyViewport();
    };
    iframe.addEventListener("load", onIframeLoad, { once: true });

    const onHostResize = () => {
      scheduleViewportNotification();
    };
    window.addEventListener("resize", onHostResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", onHostResize);
    }
    window.addEventListener("orientationchange", onHostResize);

    const fallbackTimer = window.setTimeout(() => {
      revealIframe();
    }, READY_TIMEOUT);

    const onMessage = (event) => {
      if (event.origin !== origin) return;
      const data = event.data || {};
      if (data.slug && data.slug !== slug) return;
      if (data.type === "TB_REQUEST_HOST_VIEWPORT") {
        postViewportMetrics(event.source, slug, origin);
        return;
      }
      if (data.type === "TB_WIDGET_STATE" && typeof data.isOpen === "boolean") {
        applyWidgetState(data.isOpen);
        return;
      }
      if (
        data.type === "TB_WIDGET_SIZE" &&
        typeof data.width === "number" &&
        typeof data.height === "number"
      ) {
        applySize(data.width, data.height);
        if (typeof data.isOpen === "boolean") {
          applyWidgetState(data.isOpen);
        }
        if (!isRevealed) {
          window.clearTimeout(fallbackTimer);
          revealIframe();
        }
        return;
      }
    };

    window.addEventListener("message", onMessage);
  }

  if (READY_STATES.has(document.readyState)) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();



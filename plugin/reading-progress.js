/* Reading progress for PDF views: a thin accent line along the top of each view (primary and split
   secondary) showing how far the view is scrolled. Click or drag it to jump; hovering shows the page and
   percentage at that point. Zotero only has this for EPUB. The bar lives in the reader document, outside
   the PDF frame, so pointer input on it never reaches PDF.js text selection or annotation tools. */
(function (scope) {
  "use strict";
  const strings = {
    zh: { label: "阅读进度", position: (page, pages, percent) => `第 ${page} / ${pages} 页 · ${percent}%` },
    en: { label: "Reading progress", position: (page, pages, percent) => `Page ${page} of ${pages} · ${percent}%` }
  };
  // Scroll state along the axis PDF.js scrolls (horizontal scrolling mode scrolls sideways).
  function metrics(container) {
    const vertical = container.scrollHeight - container.clientHeight;
    const horizontal = container.scrollWidth - container.clientWidth;
    const sideways = horizontal > vertical;
    return {
      sideways,
      max: Math.max(sideways ? horizontal : vertical, 0),
      position: sideways ? container.scrollLeft : container.scrollTop,
      viewport: sideways ? container.clientWidth : container.clientHeight
    };
  }
  function fraction({ max, position }) {
    return max > 0 ? Math.min(Math.max(position / max, 0), 1) : 0;
  }
  // 1-based number of the page under the middle of the viewport when scrolled to `at` (0–1).
  function pageAt(pages, { max, viewport, sideways }, at) {
    const point = at * max + viewport / 2;
    let page = 1;
    pages.forEach((node, index) => {
      if ((sideways ? node.offsetLeft : node.offsetTop) <= point) page = index + 1;
    });
    return Math.min(page, Math.max(pages.length, 1));
  }
  function attach({ viewerDoc, host, locale }) {
    const container = viewerDoc.getElementById("viewerContainer");
    const viewerWin = viewerDoc.defaultView;
    const doc = host?.ownerDocument;
    if (!container || !viewerWin || !doc) return null;
    const t = strings[String(locale || "").startsWith("zh") ? "zh" : "en"];
    const bar = doc.createElement("div");
    bar.className = "mzt-progress";
    bar.setAttribute("role", "meter");
    bar.setAttribute("aria-label", t.label);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    const fill = doc.createElement("div");
    fill.className = "mzt-progress-fill";
    bar.append(fill);
    host.append(bar);

    let frame = 0;
    const render = () => {
      frame = 0;
      const state = metrics(container);
      const value = fraction(state);
      bar.style.setProperty("--mzt-progress", String(value));
      bar.setAttribute("aria-valuenow", String(Math.round(value * 100)));
      bar.hidden = state.max <= 0;
    };
    const schedule = () => { if (!frame) frame = viewerWin.requestAnimationFrame(render); };
    const pointerAt = event => {
      const rect = bar.getBoundingClientRect();
      if (!rect.width) return 0;
      const rtl = doc.defaultView.getComputedStyle(bar).direction === "rtl";
      const offset = rtl ? rect.right - event.clientX : event.clientX - rect.left;
      return Math.min(Math.max(offset / rect.width, 0), 1);
    };
    const seek = at => {
      const state = metrics(container);
      container[state.sideways ? "scrollLeft" : "scrollTop"] = at * state.max;
    };
    const describe = at => {
      const state = metrics(container);
      const pages = Array.from(viewerDoc.querySelectorAll(".pdfViewer .page"));
      bar.title = t.position(pageAt(pages, state, at), pages.length, Math.round(at * 100));
    };
    let dragging = null;
    const down = event => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      dragging = event.pointerId;
      // Keeps the drag going outside the bar; not essential, so a refused capture doesn't stop the jump.
      try { bar.setPointerCapture(event.pointerId); }
      catch (error) { /* Pointer no longer active. */ }
      bar.toggleAttribute("data-dragging", true);
      seek(pointerAt(event));
    };
    const move = event => {
      const at = pointerAt(event);
      describe(at);
      if (dragging === event.pointerId) seek(at);
    };
    const up = event => {
      if (dragging !== event.pointerId) return;
      dragging = null;
      bar.toggleAttribute("data-dragging", false);
      if (bar.hasPointerCapture(event.pointerId)) bar.releasePointerCapture(event.pointerId);
    };
    container.addEventListener("scroll", schedule, { passive: true });
    viewerWin.addEventListener("resize", schedule);
    bar.addEventListener("pointerdown", down);
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
    bar.addEventListener("pointercancel", up);
    render();
    return {
      bar,
      remove() {
        if (frame) viewerWin.cancelAnimationFrame(frame);
        try {
          container.removeEventListener("scroll", schedule);
          viewerWin.removeEventListener("resize", schedule);
        }
        catch (error) { /* PDF view already unloaded. */ }
        bar.remove();
      }
    };
  }
  scope.MZTReadingProgress = Object.freeze({ attach, metrics, fraction, pageAt, strings });
  if (typeof module !== "undefined") module.exports = scope.MZTReadingProgress;
})(this);

(function attachCourseDemos(global) {
  "use strict";

  const colors = {
    ink: "#1b2830",
    muted: "#607180",
    paper: "#fcf8f0",
    teal: "#0e7278",
    teal2: "#2b9892",
    orange: "#d16f2b",
    rust: "#b6421f",
    line: "rgba(27,40,48,0.38)",
    faintLine: "rgba(27,40,48,0.10)",
    field: "rgba(96,113,128,0.48)"
  };

  const mathDelimiters = [
    { left: "$$", right: "$$", display: true },
    { left: "\\[", right: "\\]", display: true },
    { left: "\\(", right: "\\)", display: false },
    { left: "$", right: "$", display: false }
  ];

  const mathMacros = {
    "\\dv": "\\frac{d#1}{d#2}",
    "\\dddot": "\\dot{\\ddot{#1}}",
    "\\Lag": "\\mathcal{L}",
    "\\Ham": "\\mathcal{H}",
    "\\Can": "\\Theta",
    "\\Symp": "\\omega",
    "\\Veff": "V_{\\mathrm{eff}}",
    "\\Pois": "\\left\\{#1,#2\\right\\}"
  };

  function renderMath(root, options = {}) {
    if (!global.renderMathInElement || !root) return;
    global.renderMathInElement(root, {
      delimiters: mathDelimiters,
      macros: { ...mathMacros, ...(options.macros || {}) }
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function remap(value, inMin, inMax, outMin, outMax) {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }

  function range(start, end, step) {
    const values = [];
    const epsilon = Math.abs(step) * 0.001;
    if (step === 0) return values;
    if (step > 0) {
      for (let value = start; value <= end + epsilon; value += step) values.push(value);
    } else {
      for (let value = start; value >= end - epsilon; value += step) values.push(value);
    }
    return values;
  }

  function formatSigned(value, digits = 2) {
    const rounded = Math.abs(value) < 10 ** -(digits + 1) ? 0 : value;
    return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(digits)}`;
  }

  function responsiveHeight(width, rules, fallback) {
    const match = rules.find((rule) => width < rule.max);
    return match ? match.height : fallback;
  }

  function drawArrow(p, x1, y1, x2, y2, color, weight = 1.6, options = {}) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = options.headSize || 7;
    p.stroke(color);
    p.strokeWeight(weight);
    p.line(x1, y1, x2, y2);
    p.line(
      x2,
      y2,
      x2 - size * Math.cos(angle - Math.PI / 6),
      y2 - size * Math.sin(angle - Math.PI / 6)
    );
    p.line(
      x2,
      y2,
      x2 - size * Math.cos(angle + Math.PI / 6),
      y2 - size * Math.sin(angle + Math.PI / 6)
    );
  }

  function setButtonVariant(button, active) {
    if (!button) return;
    button.classList.add("btn");
    button.classList.toggle("secondary", !active);
  }

  function syncButtons(buttonsByKey, activeKey) {
    Object.entries(buttonsByKey).forEach(([key, button]) => {
      setButtonVariant(button, key === activeKey);
    });
  }

  function setupP5Canvas(p, host, height, options = {}) {
    const resolvedHeight = typeof height === "function" ? height(host.clientWidth, p) : height;
    const canvas = p.createCanvas(host.clientWidth, resolvedHeight);
    canvas.parent(host);
    p.pixelDensity(options.pixelDensity || 2);
    if (options.font) p.textFont(options.font);
    if (options.onSetup) options.onSetup(p);
    return canvas;
  }

  function resizeP5Canvas(p, host, height) {
    const resolvedHeight = typeof height === "function" ? height(host.clientWidth, p) : height;
    p.resizeCanvas(host.clientWidth, resolvedHeight);
  }

  function createP5Demo(host, config) {
    if (!host || !global.p5) return null;

    const sketch = (p) => {
      const height = (width) => {
        if (typeof config.height === "function") return config.height(width, p);
        return config.height;
      };

      p.setup = () => {
        setupP5Canvas(p, host, height, {
          font: config.font,
          pixelDensity: config.pixelDensity,
          onSetup: config.setup
        });
      };

      p.windowResized = () => {
        resizeP5Canvas(p, host, height);
        if (config.resize) config.resize(p);
      };

      p.draw = () => {
        const dt = Math.min(p.deltaTime * 0.001, config.maxDt || 1 / 24);
        if (config.clear !== false) p.clear();
        if (config.background !== false) p.background(config.background || colors.paper);
        config.draw(p, { dt, host });
      };
    };

    return new global.p5(sketch);
  }

  class Viewport2D {
    constructor(p, bounds, domain) {
      this.p = p;
      this.bounds = bounds;
      this.domain = domain;
    }

    sx(x) {
      return remap(x, this.domain.x[0], this.domain.x[1], this.bounds.left, this.bounds.right);
    }

    sy(y) {
      return remap(y, this.domain.y[0], this.domain.y[1], this.bounds.bottom, this.bounds.top);
    }

    point(point) {
      return { x: this.sx(point.x), y: this.sy(point.y) };
    }

    screenDirection(vector) {
      const dx = this.sx(vector.x) - this.sx(0);
      const dy = this.sy(vector.y) - this.sy(0);
      const norm = Math.hypot(dx, dy);
      if (!norm) return { x: 0, y: 0, norm: 0 };
      return { x: dx / norm, y: dy / norm, norm };
    }

    drawGrid(options = {}) {
      const p = this.p;
      const xTicks = options.xTicks || range(this.domain.x[0], this.domain.x[1], 0.5);
      const yTicks = options.yTicks || range(this.domain.y[0], this.domain.y[1], 0.5);
      p.stroke(options.color || "rgba(27,40,48,0.10)");
      p.strokeWeight(options.weight || 1);
      xTicks.forEach((x) => p.line(this.sx(x), this.bounds.top, this.sx(x), this.bounds.bottom));
      yTicks.forEach((y) => p.line(this.bounds.left, this.sy(y), this.bounds.right, this.sy(y)));
    }

    drawAxes(options = {}) {
      const p = this.p;
      p.stroke(options.color || "rgba(27,40,48,0.28)");
      p.strokeWeight(options.weight || 1.3);
      if (this.domain.y[0] <= 0 && this.domain.y[1] >= 0) {
        p.line(this.bounds.left, this.sy(0), this.bounds.right, this.sy(0));
      }
      if (this.domain.x[0] <= 0 && this.domain.x[1] >= 0) {
        p.line(this.sx(0), this.bounds.top, this.sx(0), this.bounds.bottom);
      }
    }

    drawVector(point, vector, options = {}) {
      const p = this.p;
      const screenPoint = this.point(point);
      const direction = this.screenDirection(vector);
      if (!direction.norm) return;
      const length = options.length || 24;
      const anchor = options.anchor || "center";
      const before = anchor === "tail" ? 0 : length * 0.5;
      const after = anchor === "head" ? 0 : length * 0.5;
      drawArrow(
        p,
        screenPoint.x - direction.x * before,
        screenPoint.y - direction.y * before,
        screenPoint.x + direction.x * after,
        screenPoint.y + direction.y * after,
        options.color || colors.field,
        options.weight || 1.25,
        options
      );
    }

    drawPoint(point, options = {}) {
      const p = this.p;
      const screenPoint = this.point(point);
      p.noStroke();
      p.fill(options.color || colors.teal);
      p.circle(screenPoint.x, screenPoint.y, options.radius || 10);
      return screenPoint;
    }

    drawSegment(a, b, options = {}) {
      const p = this.p;
      const start = this.point(a);
      const end = this.point(b);
      p.stroke(options.color || colors.teal);
      p.strokeWeight(options.weight || 2);
      p.line(start.x, start.y, end.x, end.y);
    }

    drawCurve(points, options = {}) {
      const p = this.p;
      if (!points.length) return;
      p.noFill();
      p.stroke(options.color || colors.ink);
      p.strokeWeight(options.weight || 2);
      p.beginShape();
      points.forEach((point) => {
        const screenPoint = this.point(point);
        p.vertex(screenPoint.x, screenPoint.y);
      });
      p.endShape();
    }
  }

  function drawVectorField(p, viewport, options) {
    const xs = options.xs || range(viewport.domain.x[0], viewport.domain.x[1], options.stepX || 0.5);
    const ys = options.ys || range(viewport.domain.y[0], viewport.domain.y[1], options.stepY || 0.5);
    xs.forEach((x) => {
      ys.forEach((y) => {
        const point = { x, y };
        const vector = options.field(point);
        const norm = Math.hypot(vector.x, vector.y);
        if (options.skip && options.skip({ point, vector, norm })) return;
        const length = typeof options.length === "function"
          ? options.length({ point, vector, norm })
          : options.length;
        viewport.drawVector(point, vector, {
          color: options.color,
          weight: options.weight,
          length: length || 24,
          anchor: options.anchor || "center",
          headSize: options.headSize
        });
      });
    });
  }

  function sampleCurve(count, sampler) {
    const points = [];
    for (let i = 0; i <= count; i += 1) points.push(sampler(i / count, i));
    return points;
  }

  function exponentialToward(start, target, rate, time) {
    const decay = Math.exp(-rate * time);
    return {
      x: target.x + (start.x - target.x) * decay,
      y: target.y + (start.y - target.y) * decay
    };
  }

  function addScaled(state, delta, factor) {
    return Object.fromEntries(
      Object.keys(state).map((key) => [key, state[key] + delta[key] * factor])
    );
  }

  function rk4Object(state, dt, derivative) {
    const k1 = derivative(state);
    const k2 = derivative(addScaled(state, k1, dt / 2));
    const k3 = derivative(addScaled(state, k2, dt / 2));
    const k4 = derivative(addScaled(state, k3, dt));

    return Object.fromEntries(
      Object.keys(state).map((key) => [
        key,
        state[key] + (dt / 6) * (k1[key] + 2 * k2[key] + 2 * k3[key] + k4[key])
      ])
    );
  }

  function panelFrame(p, x, y, w, h, options = {}) {
    p.noStroke();
    p.fill(options.fill || "rgba(255,255,255,0.66)");
    p.rect(x, y, w, h, options.radius || 18);
    if (options.stroke !== false) {
      p.stroke(options.stroke || "rgba(27,40,48,0.08)");
      p.strokeWeight(options.weight || 1);
      p.noFill();
      p.rect(x, y, w, h, options.radius || 18);
    }
  }

  function createSvg(host, height) {
    if (!host || !global.d3) return null;
    host.innerHTML = "";
    const width = host.clientWidth;
    return global.d3
      .select(host)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height);
  }

  function svgPanel(svg, options) {
    svg
      .append("rect")
      .attr("x", options.x)
      .attr("y", options.y)
      .attr("width", options.w)
      .attr("height", options.h)
      .attr("rx", options.radius || 18)
      .attr("fill", options.fill || "rgba(255,255,255,0.62)")
      .attr("stroke", options.stroke || "rgba(27,40,48,0.08)");

    if (options.title) {
      svg
        .append("text")
        .attr("x", options.x + (options.padX || 16))
        .attr("y", options.y + (options.titleY || 24))
        .attr("fill", options.titleColor || colors.ink)
        .attr("font-size", options.titleSize || 12)
        .attr("font-weight", options.titleWeight || 800)
        .text(options.title);
    }

    if (options.subtitle) {
      svg
        .append("text")
        .attr("x", options.x + (options.padX || 16))
        .attr("y", options.y + (options.subtitleY || 44))
        .attr("fill", options.subtitleColor || colors.muted)
        .attr("font-size", options.subtitleSize || 11)
        .text(options.subtitle);
    }
  }

  function addSvgArrowMarker(svg, id, options = {}) {
    svg
      .append("defs")
      .append("marker")
      .attr("id", id)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", options.refX || 8)
      .attr("refY", options.refY || 5)
      .attr("markerWidth", options.width || 5)
      .attr("markerHeight", options.height || 5)
      .attr("orient", options.orient || "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", options.fill || "context-stroke");
  }

  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgNode(tag, attrs = {}, children = []) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    children.forEach((child) => node.appendChild(child));
    return node;
  }

  function svgText(x, y, value, attrs = {}) {
    const node = svgNode("text", {
      x,
      y,
      fill: attrs.fill || colors.muted,
      "font-size": attrs.size || 13,
      "font-weight": attrs.weight || 700,
      "text-anchor": attrs.anchor || "start"
    });
    node.textContent = value;
    return node;
  }

  function svgLine(x1, y1, x2, y2, attrs = {}) {
    return svgNode("line", {
      x1,
      y1,
      x2,
      y2,
      stroke: attrs.stroke || colors.faintLine,
      "stroke-width": attrs.width || 1.2,
      "stroke-linecap": "round",
      "marker-end": attrs.arrow ? `url(#${attrs.arrow})` : null
    });
  }

  function svgPath(d, attrs = {}) {
    return svgNode("path", {
      d,
      fill: attrs.fill || "none",
      stroke: attrs.stroke || colors.ink,
      "stroke-width": attrs.width || 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-dasharray": attrs.dash || null,
      opacity: attrs.opacity || null,
      "marker-end": attrs.arrow ? `url(#${attrs.arrow})` : null
    });
  }

  function svgCircle(cx, cy, r, attrs = {}) {
    return svgNode("circle", {
      cx,
      cy,
      r,
      fill: attrs.fill || colors.teal,
      stroke: attrs.stroke || "none",
      "stroke-width": attrs.width || null,
      opacity: attrs.opacity || null
    });
  }

  function svgRect(x, y, width, height, attrs = {}) {
    return svgNode("rect", {
      x,
      y,
      width,
      height,
      rx: attrs.rx || 18,
      fill: attrs.fill || "rgba(255,255,255,0.68)",
      stroke: attrs.stroke || "rgba(27,40,48,0.08)",
      "stroke-width": attrs.strokeWidth || 1
    });
  }

  function createPlainSvg(host, height = 380) {
    if (!host) return null;
    host.innerHTML = "";
    const svg = svgNode("svg", {
      viewBox: `0 0 760 ${height}`,
      width: "100%",
      height: "100%",
      role: "img"
    });
    const arrow = `arrow-${Math.random().toString(16).slice(2)}`;
    const defs = svgNode("defs");
    defs.appendChild(svgNode("marker", {
      id: arrow,
      viewBox: "0 0 10 10",
      refX: 8,
      refY: 5,
      markerWidth: 5,
      markerHeight: 5,
      orient: "auto-start-reverse"
    }, [svgPath("M 0 0 L 10 5 L 0 10 z", { fill: colors.ink, stroke: "none" })]));
    svg.appendChild(defs);
    host.appendChild(svg);
    return { svg, arrow };
  }

  function svgScale(domain, target) {
    return (value) => target[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (target[1] - target[0]);
  }

  function svgPanelFrame(svg, x, y, width, height, title, subtitle) {
    svg.appendChild(svgRect(x, y, width, height));
    svg.appendChild(svgText(x + 18, y + 28, title, { fill: colors.ink, size: 15, weight: 800 }));
    if (subtitle) svg.appendChild(svgText(x + 18, y + 50, subtitle, { size: 12, weight: 600 }));
  }

  function svgAxes(svg, area, labels = {}) {
    const { x, y, w, h } = area;
    svg.appendChild(svgLine(x + 28, y + h / 2, x + w - 26, y + h / 2, { stroke: "rgba(27,40,48,0.16)" }));
    svg.appendChild(svgLine(x + w / 2, y + 60, x + w / 2, y + h - 26, { stroke: "rgba(27,40,48,0.16)" }));
    if (labels.x) svg.appendChild(svgText(x + w - 42, y + h / 2 - 10, labels.x, { size: 12 }));
    if (labels.y) svg.appendChild(svgText(x + w / 2 + 8, y + 76, labels.y, { size: 12 }));
  }

  function svgVectorField(svg, area, field, options = {}) {
    const sx = svgScale(options.xDomain || [-2, 2], [area.x + 38, area.x + area.w - 34]);
    const sy = svgScale(options.yDomain || [-2, 2], [area.y + area.h - 34, area.y + 62]);
    const xs = options.xs || [-1.5, -0.75, 0, 0.75, 1.5];
    const ys = options.ys || [-1.5, -0.75, 0, 0.75, 1.5];
    xs.forEach((x) => {
      ys.forEach((y) => {
        const vector = field(x, y);
        const norm = Math.hypot(vector.x, vector.y);
        if (!norm) return;
        const len = options.length || 23;
        const dx = (vector.x / norm) * len;
        const dy = -(vector.y / norm) * len;
        const px = sx(x);
        const py = sy(y);
        svg.appendChild(svgLine(px - dx * 0.45, py - dy * 0.45, px + dx * 0.45, py + dy * 0.45, {
          stroke: options.stroke || colors.field,
          width: options.width || 1.8,
          arrow: options.arrow
        }));
      });
    });
    return { sx, sy };
  }

  global.CourseDemos = {
    colors,
    renderMath,
    clamp,
    lerp,
    remap,
    range,
    formatSigned,
    responsiveHeight,
    drawArrow,
    setButtonVariant,
    syncButtons,
    setupP5Canvas,
    resizeP5Canvas,
    createP5Demo,
    Viewport2D,
    drawVectorField,
    sampleCurve,
    exponentialToward,
    rk4Object,
    panelFrame,
    createSvg,
    svgPanel,
    addSvgArrowMarker,
    svgKit: {
      node: svgNode,
      text: svgText,
      line: svgLine,
      path: svgPath,
      circle: svgCircle,
      rect: svgRect,
      create: createPlainSvg,
      scale: svgScale,
      panel: svgPanelFrame,
      axes: svgAxes,
      vectorField: svgVectorField
    }
  };
})(window);

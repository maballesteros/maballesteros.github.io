(function attachConstructiveDemos(global) {
  "use strict";

  const Demo = global.CourseDemos || {};
  const colors = Demo.colors || {
    ink: "#1b2830",
    muted: "#607180",
    teal: "#0e7278",
    orange: "#d16f2b",
    rust: "#b6421f",
    field: "rgba(96,113,128,0.48)",
    faintLine: "rgba(27,40,48,0.10)"
  };
  const Svg = Demo.svgKit;
  if (!Svg) return;

  const {
    node: svgEl,
    text,
    line,
    path,
    circle,
    rect,
    create: createSvg,
    scale,
    panel,
    axes,
    vectorField: drawField
  } = Svg;

  const state = new Map();

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function setReadout(id, value) {
    const node = $(`[data-demo-readout="${id}"]`);
    if (node) node.textContent = value;
  }

  function setDemoValue(id, value) {
    $all(`[data-demo-value="${id}"]`).forEach((node) => {
      node.textContent = value;
    });
  }

  function setChoiceButtons(id, active) {
    $all(`[data-demo-choice="${id}"]`).forEach((button) => {
      const isActive = button.dataset.value === active;
      button.classList.toggle("secondary", !isActive);
    });
  }

  function initControls(id, defaults, render) {
    const local = { ...defaults };
    state.set(id, local);
    $all(`[data-demo-choice="${id}"]`).forEach((button) => {
      button.addEventListener("click", () => {
        local.choice = button.dataset.value;
        setChoiceButtons(id, local.choice);
        render();
      });
    });
    $all(`[data-demo-slider="${id}"]`).forEach((input) => {
      const key = input.dataset.param || "slider";
      if (local[key] === undefined) local[key] = Number(input.value);
      input.addEventListener("input", () => {
        local[key] = Number(input.value);
        render();
      });
    });
    $all(`[data-demo-reset="${id}"]`).forEach((button) => {
      button.addEventListener("click", () => {
        Object.assign(local, defaults);
        $all(`[data-demo-slider="${id}"]`).forEach((input) => {
          const key = input.dataset.param || "slider";
          input.value = String(defaults[key] ?? input.defaultValue);
        });
        setChoiceButtons(id, local.choice);
        render();
      });
    });
    setChoiceButtons(id, local.choice);
    return local;
  }

  function renderFieldExamples(host) {
    let local;
    const render = () => {
      const strength = local.strength;
      const sample = { q: 0.82, eta: 0.65 };
      const cases = [
        {
          key: "free",
          title: "Inercial",
          subtitle: "X=(eta,0)",
          stroke: "rgba(14,114,120,0.42)",
          field: (q, eta) => ({ x: eta, y: 0 })
        },
        {
          key: "anchor",
          title: "Con centro",
          subtitle: "X=(eta,-k q)",
          stroke: "rgba(209,111,43,0.38)",
          field: (q, eta) => ({ x: eta, y: -strength * q })
        },
        {
          key: "medium",
          title: "Con reposo especial",
          subtitle: "X=(eta,-gamma eta)",
          stroke: "rgba(96,113,128,0.46)",
          field: (q, eta) => ({ x: eta, y: -strength * eta })
        },
        {
          key: "uniform",
          title: "Con aceleracion fija",
          subtitle: "X=(eta,a)",
          stroke: "rgba(182,66,31,0.38)",
          field: (q, eta) => ({ x: eta, y: strength })
        }
      ];
      const frames = [
        { x: 34, y: 34, w: 330, h: 224 },
        { x: 396, y: 34, w: 330, h: 224 },
        { x: 34, y: 292, w: 330, h: 224 },
        { x: 396, y: 292, w: 330, h: 224 }
      ];
      const { svg, arrow } = createSvg(host, 620);
      const fmt = (v) => `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`;

      cases.forEach((item, index) => {
        const area = frames[index];
        panel(svg, area.x, area.y, area.w, area.h, item.title, item.subtitle);
        axes(svg, area, { x: "q", y: "eta" });
        drawField(svg, area, item.field, {
          arrow,
          xs: [-1.5, -0.75, 0, 0.75, 1.5],
          ys: [-1.1, -0.45, 0.2, 0.85, 1.5],
          stroke: item.stroke,
          length: 19
        });

        const sx = scale([-2, 2], [area.x + 42, area.x + area.w - 34]);
        const sy = scale([-2, 2], [area.y + area.h - 34, area.y + 62]);
        const vector = item.field(sample.q, sample.eta);
        const norm = Math.hypot(vector.x, vector.y) || 1;
        const length = 48;
        const x0 = sx(sample.q);
        const y0 = sy(sample.eta);
        svg.appendChild(circle(x0, y0, 8, { fill: colors.teal }));
        svg.appendChild(line(
          x0,
          y0,
          x0 + (vector.x / norm) * length,
          y0 - (vector.y / norm) * length,
          { stroke: colors.orange, width: 4.5, arrow }
        ));
        svg.appendChild(text(x0 + 10, y0 + 26, "s", { fill: colors.teal, size: 12, weight: 800 }));
        svg.appendChild(text(area.x + 20, area.y + area.h - 16, `X_s=${fmt(vector)}`, {
          fill: colors.ink,
          size: 12,
          weight: 800
        }));

        if (item.key === "anchor") {
          svg.appendChild(line(sx(0), area.y + 62, sx(0), area.y + area.h - 32, {
            stroke: "rgba(209,111,43,0.28)",
            width: 2
          }));
          svg.appendChild(circle(sx(0), sy(0), 12, { fill: "rgba(209,111,43,0.10)", stroke: colors.orange, width: 3 }));
          svg.appendChild(text(sx(0) + 16, sy(0) + 4, "C", { fill: colors.orange, size: 13, weight: 800 }));
        }
        if (item.key === "medium") {
          svg.appendChild(line(area.x + 42, sy(0), area.x + area.w - 34, sy(0), {
            stroke: "rgba(209,111,43,0.34)",
            width: 2.5
          }));
          svg.appendChild(text(area.x + 172, sy(0) - 10, "eta=0", { fill: colors.orange, size: 12, weight: 800 }));
        }
        if (item.key === "uniform") {
          svg.appendChild(line(area.x + area.w - 58, area.y + 156, area.x + area.w - 58, area.y + 96, {
            stroke: colors.orange,
            width: 5,
            arrow
          }));
          svg.appendChild(text(area.x + area.w - 92, area.y + 180, "a fijo", { fill: colors.orange, size: 12, weight: 800 }));
        }

        setDemoValue(`field-${item.key}-vector`, fmt(vector));
      });

      panel(
        svg,
        34,
        548,
        692,
        44,
        "La misma gramatica, cuatro mundos distintos",
        "Un campo es la tabla completa de continuaciones locales: cada presente s recibe una flecha X_s."
      );
      setDemoValue("field-strength", strength.toFixed(2));
      setDemoValue("field-sample", `(${sample.q.toFixed(2)}, ${sample.eta.toFixed(2)})`);
    };
    local = initControls("field-examples", { strength: 0.85 }, render);
    render();
  }

  function renderAnnexFlow(host) {
    let local;
    const render = () => {
      const time = local.time;
      const { svg, arrow } = createSvg(host, 430);
      const area = { x: 34, y: 34, w: 692, h: 318 };
      panel(svg, area.x, area.y, area.w, area.h, "Campo X y flujo phi_t^X", "las flechas son la regla local; la curva es la pelicula al seguirlas");
      axes(svg, area, { x: "q", y: "eta" });

      const sx = scale([-1.35, 1.35], [area.x + 44, area.x + area.w - 34]);
      const sy = scale([-1.35, 1.35], [area.y + area.h - 40, area.y + 62]);
      const point = (p) => ({ x: sx(p.x), y: sy(p.y) });
      const rotate = (p, a) => ({
        x: p.x * Math.cos(a) - p.y * Math.sin(a),
        y: p.x * Math.sin(a) + p.y * Math.cos(a)
      });
      const field = (q, eta) => ({ x: -eta, y: q });
      const s0 = { x: 0.88, y: 0.18 };
      const xs = field(s0.x, s0.y);
      const tinyTip = { x: s0.x + 0.28 * xs.x, y: s0.y + 0.28 * xs.y };
      const end = rotate(s0, time);
      const samples = [];
      for (let i = 0; i <= 70; i += 1) {
        samples.push(point(rotate(s0, (time * i) / 70)));
      }
      const curve = samples.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

      drawField(svg, area, field, {
        arrow,
        xs: [-1.05, -0.55, -0.05, 0.45, 0.95],
        ys: [-0.95, -0.45, 0.05, 0.55, 1.05],
        stroke: "rgba(96,113,128,0.35)"
      });
      svg.appendChild(path(curve, { stroke: colors.teal, width: 4 }));
      const p0 = point(s0);
      const pTiny = point(tinyTip);
      const pEnd = point(end);
      svg.appendChild(line(p0.x, p0.y, pTiny.x, pTiny.y, { stroke: colors.orange, width: 5, arrow }));
      svg.appendChild(circle(p0.x, p0.y, 8, { fill: colors.teal }));
      svg.appendChild(circle(pEnd.x, pEnd.y, 9, { fill: colors.orange }));
      svg.appendChild(text(p0.x + 12, p0.y + 22, "s", { fill: colors.teal, size: 14, weight: 800 }));
      svg.appendChild(text(pTiny.x + 8, pTiny.y - 10, "X_s", { fill: colors.orange, size: 13, weight: 800 }));
      svg.appendChild(text(pEnd.x + 12, pEnd.y - 12, "phi_t^X(s)", { fill: colors.orange, size: 13, weight: 800 }));
      panel(svg, 34, 372, 692, 36, "Lectura", "el campo no es una trayectoria: es la regla que permite generar todas las trayectorias");

      setDemoValue("annex-flow-time", time.toFixed(2));
      setDemoValue("annex-flow-start", `(${s0.x.toFixed(2)}, ${s0.y.toFixed(2)})`);
      setDemoValue("annex-flow-vector", `(${xs.x.toFixed(2)}, ${xs.y.toFixed(2)})`);
      setDemoValue("annex-flow-end", `(${end.x.toFixed(2)}, ${end.y.toFixed(2)})`);
    };
    local = initControls("annex-flow", { time: 1.15 }, render);
    render();
  }

  function renderAnnexPushforward(host) {
    let local;
    const render = () => {
      const angle = local.angle;
      const stretch = local.stretch;
      const { svg, arrow } = createSvg(host, 440);
      const left = { x: 34, y: 46, w: 308, h: 286 };
      const right = { x: 418, y: 46, w: 308, h: 286 };
      panel(svg, 34, 24, 692, 332, "Pushforward: transportar una flecha", "Phi mueve la cola y tambien la punta de una pelicula minima");
      panel(svg, left.x, left.y, left.w, left.h, "Antes", "cola s, punta s+epsilon v");
      panel(svg, right.x, right.y, right.w, right.h, "Despues de Phi", "cola Phi(s), punta Phi(s+epsilon v)");
      axes(svg, left, { x: "q", y: "eta" });
      axes(svg, right, { x: "q", y: "eta" });

      const transform = (p) => {
        const x = stretch * p.x;
        const y = p.y;
        return {
          x: x * Math.cos(angle) - y * Math.sin(angle),
          y: x * Math.sin(angle) + y * Math.cos(angle)
        };
      };
      const makeScale = (frame) => ({
        sx: scale([-1.35, 1.35], [frame.x + 38, frame.x + frame.w - 30]),
        sy: scale([-1.35, 1.35], [frame.y + frame.h - 34, frame.y + 62])
      });
      const place = (scales, p) => ({ x: scales.sx(p.x), y: scales.sy(p.y) });
      const ls = makeScale(left);
      const rs = makeScale(right);
      const s = { x: -0.34, y: -0.22 };
      const v = { x: 0.74, y: 0.42 };
      const eps = 0.72;
      const tip = { x: s.x + eps * v.x, y: s.y + eps * v.y };
      const phiS = transform(s);
      const phiTip = transform(tip);
      const phiV = { x: (phiTip.x - phiS.x) / eps, y: (phiTip.y - phiS.y) / eps };
      const a = place(ls, s);
      const b = place(ls, tip);
      const c = place(rs, phiS);
      const d = place(rs, phiTip);

      svg.appendChild(line(a.x, a.y, b.x, b.y, { stroke: colors.teal, width: 5, arrow }));
      svg.appendChild(circle(a.x, a.y, 8, { fill: colors.teal }));
      svg.appendChild(circle(b.x, b.y, 6, { fill: "white", stroke: colors.teal, width: 3 }));
      svg.appendChild(text(a.x - 18, a.y + 26, "s", { fill: colors.teal, size: 14, weight: 800 }));
      svg.appendChild(text(b.x + 8, b.y - 10, "s+eps v", { fill: colors.teal, size: 12, weight: 800 }));

      svg.appendChild(path(`M ${a.x + 12} ${a.y - 28} C 356 86 388 86 ${c.x - 10} ${c.y - 28}`, { stroke: colors.muted, width: 2.4, dash: "6 6", arrow }));
      svg.appendChild(path(`M ${b.x + 12} ${b.y - 24} C 356 120 388 120 ${d.x - 10} ${d.y - 24}`, { stroke: colors.teal, width: 2.4, dash: "6 6", arrow }));
      svg.appendChild(text(380, 102, "aplica Phi a ambos extremos", { anchor: "middle", fill: colors.muted, size: 13, weight: 800 }));

      svg.appendChild(line(c.x, c.y, d.x, d.y, { stroke: colors.orange, width: 5, arrow }));
      svg.appendChild(circle(c.x, c.y, 8, { fill: colors.orange }));
      svg.appendChild(circle(d.x, d.y, 6, { fill: "white", stroke: colors.orange, width: 3 }));
      svg.appendChild(text(c.x + 10, c.y + 28, "Phi(s)", { fill: colors.orange, size: 14, weight: 800 }));
      svg.appendChild(text(d.x + 8, d.y - 10, "Phi(s+eps v)", { fill: colors.orange, size: 12, weight: 800 }));
      panel(svg, 34, 378, 692, 38, "Resultado", "la flecha transportada es el desplazamiento entre las dos imagenes: Phi_*v");

      setDemoValue("annex-push-angle", angle.toFixed(2));
      setDemoValue("annex-push-stretch", stretch.toFixed(2));
      setDemoValue("annex-push-v", `(${v.x.toFixed(2)}, ${v.y.toFixed(2)})`);
      setDemoValue("annex-push-phiv", `(${phiV.x.toFixed(2)}, ${phiV.y.toFixed(2)})`);
    };
    local = initControls("annex-pushforward", { angle: 0.55, stretch: 1.25 }, render);
    render();
  }

  function renderAnnexBracket(host) {
    let local;
    const render = () => {
      const eps = local.eps;
      const lambda = local.lambda;
      const fails = local.choice === "fail";
      const { svg, arrow } = createSvg(host, 430);
      const area = { x: 34, y: 34, w: 692, h: 318 };
      panel(svg, area.x, area.y, area.w, area.h, fails ? "El rectangulo no cierra" : "El rectangulo cierra", "dos pasos pequenos: primero X luego Y, o primero Y luego X");
      axes(svg, area, { x: "q", y: "eta" });
      const sx = scale([-0.10, 1.75], [area.x + 54, area.x + area.w - 54]);
      const sy = scale([-0.10, 1.55], [area.y + area.h - 44, area.y + 58]);
      const p = (point) => ({ x: sx(point.x), y: sy(point.y) });
      const start = { x: 0.28, y: 0.22 };
      const stepX = (point) => ({ x: point.x + eps, y: point.y });
      const stepY = fails
        ? ((point) => ({ x: point.x, y: point.y + lambda * point.x }))
        : ((point) => ({ x: point.x, y: point.y + lambda }));
      const a1 = stepX(start);
      const a2 = stepY(a1);
      const b1 = stepY(start);
      const b2 = stepX(b1);
      const gap = { x: a2.x - b2.x, y: a2.y - b2.y };
      const drawArrow = (from, to, color, width = 4, dash = null) => {
        const f = p(from);
        const t = p(to);
        svg.appendChild(line(f.x, f.y, t.x, t.y, { stroke: color, width, dash, arrow }));
      };

      drawArrow(start, a1, colors.teal, 5);
      drawArrow(a1, a2, colors.teal, 5);
      drawArrow(start, b1, colors.orange, 4, "6 6");
      drawArrow(b1, b2, colors.orange, 4, "6 6");
      const ps = p(start);
      const pa = p(a2);
      const pb = p(b2);
      svg.appendChild(circle(ps.x, ps.y, 8, { fill: colors.ink }));
      svg.appendChild(circle(pa.x, pa.y, 8, { fill: colors.teal }));
      svg.appendChild(circle(pb.x, pb.y, 8, { fill: fails ? colors.orange : colors.teal, stroke: fails ? "none" : "white", width: 2 }));
      svg.appendChild(text(ps.x - 12, ps.y + 26, "s", { fill: colors.ink, size: 14, weight: 800 }));
      svg.appendChild(text(p(a1).x - 2, p(a1).y - 16, "X", { fill: colors.teal, size: 13, weight: 800 }));
      svg.appendChild(text(p(b1).x - 26, p(b1).y - 4, "Y", { fill: colors.orange, size: 13, weight: 800 }));
      svg.appendChild(text(pa.x + 12, pa.y - 12, "X luego Y", { fill: colors.teal, size: 13, weight: 800 }));
      if (fails) {
        svg.appendChild(text(pb.x + 12, pb.y + 22, "Y luego X", { fill: colors.orange, size: 13, weight: 800 }));
        svg.appendChild(line(pb.x, pb.y, pa.x, pa.y, { stroke: colors.rust, width: 3, dash: "4 5", arrow }));
        svg.appendChild(text((pa.x + pb.x) / 2 + 12, (pa.y + pb.y) / 2, "hueco", { fill: colors.rust, size: 13, weight: 800 }));
      }
      panel(svg, 34, 372, 692, 36, "Lectura", fails ? "el hueco es de orden epsilon lambda: ahi vive el corchete" : "si las rutas cierran, el corchete se anula");

      setDemoValue("annex-bracket-eps", eps.toFixed(2));
      setDemoValue("annex-bracket-lambda", lambda.toFixed(2));
      setDemoValue("annex-bracket-gap", `(${gap.x.toFixed(2)}, ${gap.y.toFixed(2)})`);
      setDemoValue("annex-bracket-verdict", fails ? "las rutas dejan un hueco" : "las rutas cierran");
      setDemoValue("annex-bracket-field", fails ? "vertical proporcional a q" : "vertical constante");
    };
    local = initControls("annex-bracket", { choice: "fail", eps: 0.72, lambda: 0.72 }, render);
    render();
  }

  function renderEquivariantField(host) {
    let local;
    const render = () => {
      const angle = local.slider;
      const compatible = local.choice === "compatible";
      const { svg, arrow } = createSvg(host, 640);
      const area = { x: 34, y: 34, w: 692, h: 460 };
      panel(
        svg,
        area.x,
        area.y,
        area.w,
        area.h,
        compatible ? "Las dos rutas dan la misma flecha" : "Las dos rutas dan flechas distintas",
        "ruta A: avanzar y transformar; ruta B: transformar y avanzar"
      );
      const left = { x: 66, y: 116, w: 260, h: 260 };
      const right = { x: 434, y: 116, w: 260, h: 260 };
      panel(svg, left.x, left.y, left.w, left.h, "Ruta A. Avanza en s", "la ley pinta X_s y una punta cercana");
      panel(svg, right.x, right.y, right.w, right.h, "Ruta B. Compara en Phi(s)", "teal = ruta A transportada; naranja = ley directa");
      axes(svg, left, { x: "q", y: "eta" });
      axes(svg, right, { x: "q", y: "eta" });

      const rotate = (point, a = angle) => ({
        x: point.x * Math.cos(a) - point.y * Math.sin(a),
        y: point.x * Math.sin(a) + point.y * Math.cos(a)
      });
      const field = compatible
        ? ((x, y) => ({ x: -y, y: x }))
        : (() => ({ x: 0.88, y: 0 }));
      const makeScale = (frame) => ({
        sx: scale([-1.35, 1.35], [frame.x + 34, frame.x + frame.w - 28]),
        sy: scale([-1.35, 1.35], [frame.y + frame.h - 34, frame.y + 62])
      });
      const leftScale = makeScale(left);
      const rightScale = makeScale(right);
      const eps = 0.55;
      const s = { x: 0.58, y: 0.28 };
      const phi = rotate(s);
      const xs = field(s.x, s.y);
      const tip = { x: s.x + eps * xs.x, y: s.y + eps * xs.y };
      const transportedTip = rotate(tip);
      const direct = field(phi.x, phi.y);
      const directTip = { x: phi.x + eps * direct.x, y: phi.y + eps * direct.y };
      const fmt = (point) => `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
      const pointAt = (scales, point) => ({ x: scales.sx(point.x), y: scales.sy(point.y) });
      const drawStep = (scales, from, to, color, width, options = {}) => {
        const a = pointAt(scales, from);
        const b = pointAt(scales, to);
        const ox = options.offset?.x || 0;
        const oy = options.offset?.y || 0;
        svg.appendChild(line(a.x + ox, a.y + oy, b.x + ox, b.y + oy, { stroke: color, width, arrow }));
      };

      const fieldOptions = {
        arrow,
        xs: [-0.95, -0.35, 0.25, 0.85],
        ys: [-0.75, -0.15, 0.45, 1.05],
        stroke: compatible ? "rgba(96,113,128,0.34)" : "rgba(209,111,43,0.30)"
      };
      drawField(svg, left, field, fieldOptions);
      drawField(svg, right, field, fieldOptions);

      const s0 = pointAt(leftScale, s);
      const s1 = pointAt(leftScale, tip);
      const p0 = pointAt(rightScale, phi);
      const p1 = pointAt(rightScale, transportedTip);
      const d1 = pointAt(rightScale, directTip);
      svg.appendChild(path(`M ${s0.x + 8} ${s0.y - 28} C 350 72 396 72 ${p0.x - 8} ${p0.y - 28}`, { stroke: colors.muted, width: 2.4, dash: "6 6", arrow }));
      svg.appendChild(path(`M ${s1.x + 8} ${s1.y - 22} C 350 96 396 96 ${p1.x - 8} ${p1.y - 22}`, { stroke: colors.teal, width: 2.4, dash: "6 6", arrow }));
      svg.appendChild(text(380, 88, "Phi mueve la cola y tambien la punta", { anchor: "middle", fill: colors.muted, size: 13, weight: 800 }));

      svg.appendChild(circle(s0.x, s0.y, 8, { fill: colors.teal }));
      svg.appendChild(circle(s1.x, s1.y, 6, { fill: "white", stroke: colors.teal, width: 3 }));
      drawStep(leftScale, s, tip, colors.teal, 5);
      svg.appendChild(text(s0.x - 18, s0.y + 30, "s", { fill: colors.teal, size: 14, weight: 800 }));
      svg.appendChild(text(s1.x + 10, s1.y - 10, "s+eps X_s", { fill: colors.teal, size: 12, weight: 800 }));
      svg.appendChild(text((s0.x + s1.x) / 2 + 22, (s0.y + s1.y) / 2 - 18, "X_s", { fill: colors.teal, size: 13, weight: 800 }));

      svg.appendChild(circle(p0.x, p0.y, 9, { fill: colors.orange }));
      svg.appendChild(circle(p1.x, p1.y, 6, { fill: "white", stroke: colors.teal, width: 3 }));
      if (!compatible) {
        svg.appendChild(circle(d1.x, d1.y, 6, { fill: "white", stroke: colors.orange, width: 3 }));
      }
      drawStep(rightScale, phi, directTip, colors.orange, compatible ? 6 : 5, compatible ? { offset: { x: 4, y: 4 } } : {});
      drawStep(rightScale, phi, transportedTip, colors.teal, compatible ? 3.2 : 5, compatible ? { offset: { x: -4, y: -4 } } : {});
      svg.appendChild(text(p0.x + 10, p0.y + 30, "Phi(s)", { fill: colors.orange, size: 14, weight: 800 }));
      svg.appendChild(text(p1.x + 10, p1.y - 14, "Phi(s+eps X_s)", { fill: colors.teal, size: 12, weight: 800 }));
      svg.appendChild(text(p0.x + 34, p0.y - 40, "ruta A: Phi_*X_s", { fill: colors.teal, size: 13, weight: 800 }));
      svg.appendChild(text(p0.x + 34, p0.y - 18, "ruta B: X_{Phi(s)}", { fill: colors.orange, size: 13, weight: 800 }));

      panel(svg, 34, 528, 692, 72, "Condicion local de simetria", compatible ? "Phi_*X_s = X_{Phi(s)}: la pelicula transformada sigue el mismo campo." : "Phi_*X_s != X_{Phi(s)}: la pelicula transformada ya no sigue el mismo campo.");
      svg.appendChild(line(88, 588, 150, 588, { stroke: colors.teal, width: 5, arrow }));
      svg.appendChild(text(162, 593, "flecha que sale de transformar el paso", { fill: colors.teal, size: 13, weight: 800 }));
      svg.appendChild(line(420, 588, 482, 588, { stroke: colors.orange, width: 5, arrow }));
      svg.appendChild(text(494, 593, "flecha que dicta la ley", { fill: colors.orange, size: 13, weight: 800 }));

      setDemoValue("equiv-s", fmt(s));
      setDemoValue("equiv-xs", fmt(xs));
      setDemoValue("equiv-tip", fmt(tip));
      setDemoValue("equiv-phi", fmt(phi));
      setDemoValue("equiv-transported-tip", fmt(transportedTip));
      setDemoValue("equiv-direct", fmt(direct));
      setDemoValue("equiv-direct-tip", fmt(directTip));
      setDemoValue("equiv-angle", angle.toFixed(2));
      setDemoValue("equiv-verdict", compatible
        ? "las dos flechas coinciden"
        : "las dos flechas no coinciden");
      setDemoValue("equiv-reason", compatible
        ? "La pelicula transformada sigue obedeciendo la misma ley."
        : "La ley mantiene una direccion horizontal fija: al rotar la pelicula, la ley no rota con ella.");
    };
    local = initControls("equivariant-field", { choice: "compatible", slider: 0.75 }, render);
    render();
  }

  function renderSymmetryFilters(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 390);
      const area = { x: 34, y: 34, w: 690, h: 296 };
      panel(svg, area.x, area.y, area.w, area.h, "Campo candidato sobre el espacio", "la flecha revela que estructura has introducido");
      axes(svg, area, { x: "x", y: "y" });
      if (local.choice === "anchor") {
        drawField(svg, area, (x, y) => ({ x: -x, y: -y }), { arrow, xs: [-1.6, -0.8, 0, 0.8, 1.6], ys: [-1.2, -0.4, 0.4, 1.2] });
        svg.appendChild(circle(379, 182, 15, { fill: "rgba(209,111,43,0.22)", stroke: colors.orange, width: 3 }));
        svg.appendChild(text(402, 178, "A", { fill: colors.orange, size: 18, weight: 800 }));
        setReadout("symmetry-filters", "Un atractor marca un lugar especial A. Es legitimo si hay un anclaje, un medio o un campo externo; no lo es para espacio vacio homogeneo.");
      } else if (local.choice === "drift") {
        drawField(svg, area, () => ({ x: 1, y: 0.1 }), { arrow, xs: [-1.6, -0.8, 0, 0.8, 1.6], ys: [-1.2, -0.4, 0.4, 1.2], stroke: "rgba(209,111,43,0.62)" });
        setReadout("symmetry-filters", "Una deriva universal incorpora un sentido espacial. Puede modelar viento o flujo de medio, pero no una particula libre sin estructura adicional.");
      } else {
        drawField(svg, area, () => ({ x: 1, y: 0 }), { arrow, xs: [-1.6, -0.8, 0, 0.8, 1.6], ys: [-1.2, -0.4, 0.4, 1.2], stroke: "rgba(14,114,120,0.62)" });
        svg.appendChild(text(62, 350, "Si eta forma parte del estado, una misma velocidad uniforme puede continuar sin marcar un punto especial.", { size: 13 }));
        setReadout("symmetry-filters", "La version libre necesita memoria de cambio en el presente. La configuracion sola no puede recordar como fue lanzada.");
      }
    };
    local = initControls("symmetry-filters", { choice: "anchor" }, render);
    render();
  }

  function renderCovectorPairing(host) {
    let local;
    const render = () => {
      const a = local.slider;
      const q = 0.55;
      const dq = 0.32;
      const p = 1.45;
      const jac = 1 + 2 * a * q;
      const dQ = jac * dq;
      const P = p / jac;
      const invariant = p * dq;
      const { svg, arrow } = createSvg(host, 360);
      panel(svg, 34, 34, 692, 264, "Cambio de etiqueta Q=q+a q^2", "dq cambia; p cambia de forma dual");
      const y1 = 145;
      const y2 = 225;
      svg.appendChild(line(95, y1, 665, y1, { stroke: "rgba(27,40,48,0.20)" }));
      svg.appendChild(line(95, y2, 665, y2, { stroke: "rgba(27,40,48,0.20)" }));
      const qx = 290;
      const qdx = qx + dq * 230;
      const q2x = 290;
      const q2dx = q2x + dQ * 230;
      svg.appendChild(circle(qx, y1, 7, { fill: colors.teal }));
      svg.appendChild(line(qx, y1, qdx, y1, { stroke: colors.teal, width: 4, arrow }));
      svg.appendChild(text(qx - 26, y1 - 28, "dq", { fill: colors.teal, size: 14 }));
      svg.appendChild(circle(q2x, y2, 7, { fill: colors.orange }));
      svg.appendChild(line(q2x, y2, q2dx, y2, { stroke: colors.orange, width: 4, arrow }));
      svg.appendChild(text(q2x - 30, y2 - 28, "dQ", { fill: colors.orange, size: 14 }));
      svg.appendChild(text(105, 89, `jacobiano dQ/dq = ${jac.toFixed(2)}`, { fill: colors.ink, size: 15, weight: 800 }));
      svg.appendChild(text(105, 318, `p = ${p.toFixed(2)}   P = ${P.toFixed(2)}`, { size: 13 }));
      setReadout("covector-pairing", `p dq = ${invariant.toFixed(3)} y P dQ = ${(P * dQ).toFixed(3)}. Cambia la etiqueta, no el emparejamiento.`);
    };
    local = initControls("covector-pairing", { slider: 0.32 }, render);
    render();
  }

  function renderHamiltonianField(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 390);
      const area = { x: 34, y: 34, w: 690, h: 296 };
      panel(svg, area.x, area.y, area.w, area.h, "Niveles de H y campo X_H", local.choice === "oscillator" ? "H=(q^2+p^2)/2" : "H=p^2/2 + q p/3");
      axes(svg, area, { x: "q", y: "p" });
      const sx = scale([-2, 2], [area.x + 38, area.x + area.w - 34]);
      const sy = scale([-2, 2], [area.y + area.h - 34, area.y + 62]);
      if (local.choice === "oscillator") {
        [0.55, 1.05, 1.55].forEach((r) => {
          svg.appendChild(svgEl("ellipse", {
            cx: sx(0), cy: sy(0), rx: sx(r) - sx(0), ry: sy(0) - sy(r),
            fill: "none", stroke: "rgba(14,114,120,0.26)", "stroke-width": 2
          }));
        });
        drawField(svg, area, (q, p) => ({ x: p, y: -q }), { arrow });
      } else {
        [-1.2, -0.4, 0.4, 1.2].forEach((b) => {
          svg.appendChild(path(`M ${sx(-1.8)} ${sy((-1.8) * 0.45 + b)} C ${sx(-0.6)} ${sy((-0.6) * 0.25 + b)} ${sx(0.8)} ${sy((0.8) * -0.2 + b)} ${sx(1.8)} ${sy((1.8) * -0.45 + b)}`, { stroke: "rgba(14,114,120,0.24)", width: 2 }));
        });
        drawField(svg, area, (q, p) => ({ x: p + q / 3, y: -p / 3 }), { arrow });
      }
    };
    local = initControls("hamiltonian-field", { choice: "oscillator" }, render);
    render();
  }

  function renderGeneratorLab(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 390);
      const area = { x: 34, y: 34, w: 690, h: 296 };
      panel(svg, area.x, area.y, area.w, area.h, "Campo generado por G", "una funcion actua moviendo estados");
      axes(svg, area, { x: "q", y: "p" });
      let field;
      if (local.choice === "translation") {
        field = () => ({ x: 1, y: 0 });
        setReadout("generator-lab", "G=p genera desplazamientos de q: cambia la posicion, deja p fijo.");
      } else if (local.choice === "rotation") {
        field = (q, p) => ({ x: -p, y: q });
        setReadout("generator-lab", "G=L rota simultaneamente la configuracion y el dato conjugado.");
      } else {
        field = (q, p) => ({ x: p, y: -q });
        setReadout("generator-lab", "G=H genera avance temporal para el oscilador: la evolucion misma es un flujo de fase.");
      }
      drawField(svg, area, field, { arrow });
      const sx = scale([-2, 2], [area.x + 38, area.x + area.w - 34]);
      const sy = scale([-2, 2], [area.y + area.h - 34, area.y + 62]);
      [[-0.6, -0.2], [-0.2, 0.3], [0.2, -0.4], [0.55, 0.18]].forEach(([q, p]) => {
        svg.appendChild(circle(sx(q), sy(p), 7, { fill: colors.orange }));
      });
    };
    local = initControls("generator-lab", { choice: "translation" }, render);
    render();
  }

  function renderFreeHamiltonianBoost(host) {
    let local;
    const render = () => {
      const m = local.slider;
      const { svg } = createSvg(host, 360);
      panel(svg, 34, 34, 692, 264, "H(p) fijado por dH/dp=p/m", "la pendiente es la velocidad compatible con boosts");
      const sx = scale([-3, 3], [82, 690]);
      const sy = scale([0, 4.2], [274, 82]);
      svg.appendChild(line(82, 274, 690, 274, { stroke: "rgba(27,40,48,0.20)" }));
      svg.appendChild(line(386, 282, 386, 76, { stroke: "rgba(27,40,48,0.15)" }));
      let d = "";
      for (let i = 0; i <= 140; i += 1) {
        const p = -3 + (6 * i) / 140;
        const h = (p * p) / (2 * m);
        d += `${i === 0 ? "M" : "L"} ${sx(p)} ${sy(h)} `;
      }
      svg.appendChild(path(d, { stroke: colors.teal, width: 4 }));
      [-2, -1, 1, 2].forEach((p) => {
        const h = (p * p) / (2 * m);
        svg.appendChild(circle(sx(p), sy(h), 5, { fill: colors.orange }));
      });
      svg.appendChild(text(94, 103, "H = p^2 / 2m + constante", { fill: colors.ink, size: 18, weight: 800 }));
      setReadout("free-hamiltonian-boost", `Con m=${m.toFixed(2)}, la pendiente dH/dp en p=1 es ${(1 / m).toFixed(2)}. Integrar esa pendiente da la parabola.`);
    };
    local = initControls("free-hamiltonian-boost", { slider: 1.25 }, render);
    render();
  }

  function renderCanonicalAction(host) {
    let local;
    const render = () => {
      const offset = local.slider;
      const { svg } = createSvg(host, 390);
      panel(svg, 34, 34, 692, 296, "Familia de historias en fase", "la curva fisica sigue el campo; las vecinas tienen residuo");
      const sx = scale([0, 6.28], [92, 680]);
      const sy = scale([-1.8, 1.8], [282, 94]);
      svg.appendChild(line(92, 188, 680, 188, { stroke: "rgba(27,40,48,0.15)" }));
      for (let k = -2; k <= 2; k += 1) {
        const amp = offset * 0.28 * k;
        let d = "";
        for (let i = 0; i <= 120; i += 1) {
          const t = (6.28 * i) / 120;
          const q = Math.cos(t) + amp * Math.sin(2 * t);
          d += `${i === 0 ? "M" : "L"} ${sx(t)} ${sy(q)} `;
        }
        svg.appendChild(path(d, { stroke: k === 0 ? colors.teal : "rgba(96,113,128,0.28)", width: k === 0 ? 4 : 2 }));
      }
      const residual = Math.abs(offset);
      svg.appendChild(text(96, 315, "azul: curva fisica; grises: variaciones cercanas", { size: 13 }));
      setReadout("canonical-action", `desvio = ${offset.toFixed(2)}; residuo lineal relativo ≈ ${residual.toFixed(2)}. En la curva central, la primera variacion se anula.`);
    };
    local = initControls("canonical-action", { slider: 0.45 }, render);
    render();
  }

  function renderEliminateP(host) {
    let local;
    const render = () => {
      const { svg } = createSvg(host, 360);
      panel(svg, 34, 34, 692, 264, "Mapa p -> qdot", "regular si cada velocidad viene de un p unico");
      const sx = scale([-2.4, 2.4], [106, 674]);
      const sy = scale([-2.4, 2.4], [270, 92]);
      svg.appendChild(line(106, 181, 674, 181, { stroke: "rgba(27,40,48,0.18)" }));
      svg.appendChild(line(390, 278, 390, 84, { stroke: "rgba(27,40,48,0.14)" }));
      let d = "";
      for (let i = 0; i <= 120; i += 1) {
        const p = -2.2 + (4.4 * i) / 120;
        const v = local.choice === "regular" ? p : Math.tanh(2.8 * p);
        d += `${i === 0 ? "M" : "L"} ${sx(p)} ${sy(v)} `;
      }
      svg.appendChild(path(d, { stroke: colors.teal, width: 4 }));
      svg.appendChild(text(110, 100, local.choice === "regular" ? "qdot = p/m: invertible" : "qdot = tanh(kp): satura y pierde escala", { fill: colors.ink, size: 17, weight: 800 }));
      if (local.choice === "regular") {
        setReadout("eliminate-p", "Regular: una velocidad determina un p unico. La accion en fase puede proyectarse a una accion en configuracion.");
      } else {
        svg.appendChild(line(sx(1.05), sy(0.99), sx(2.15), sy(0.99), { stroke: colors.orange, width: 4 }));
        setReadout("eliminate-p", "Degenerado: velocidades casi iguales pueden venir de p muy distintos. Eliminar p colapsa informacion de fase.");
      }
    };
    local = initControls("eliminate-p", { choice: "regular" }, render);
    render();
  }

  function renderLiouvilleCloud(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 390);
      const area = { x: 34, y: 34, w: 690, h: 296 };
      panel(svg, area.x, area.y, area.w, area.h, "Nube de estados", local.choice === "hamiltonian" ? "rotacion hamiltoniana: area conservada" : "atractor disipativo: area comprimida");
      axes(svg, area, { x: "q", y: "p" });
      const sx = scale([-2, 2], [area.x + 38, area.x + area.w - 34]);
      const sy = scale([-2, 2], [area.y + area.h - 34, area.y + 62]);
      const pts = [];
      for (let i = 0; i < 42; i += 1) {
        const a = (Math.PI * 2 * i) / 42;
        const r = 0.45 + 0.08 * Math.sin(5 * a);
        let q = -0.35 + r * Math.cos(a);
        let p = 0.15 + r * Math.sin(a);
        if (local.choice === "hamiltonian") {
          const t = 1.15;
          const nq = q * Math.cos(t) + p * Math.sin(t);
          const np = -q * Math.sin(t) + p * Math.cos(t);
          q = nq * 1.25;
          p = np / 1.25;
        } else {
          q *= 0.38;
          p *= 0.22;
        }
        pts.push([q, p]);
      }
      drawField(svg, area, local.choice === "hamiltonian" ? ((q, p) => ({ x: p, y: -q })) : ((q, p) => ({ x: -q, y: -p })), { arrow, stroke: "rgba(96,113,128,0.42)" });
      pts.forEach(([q, p]) => svg.appendChild(circle(sx(q), sy(p), 5, { fill: local.choice === "hamiltonian" ? colors.teal : colors.orange, opacity: 0.78 })));
      setReadout("liouville-cloud", local.choice === "hamiltonian"
        ? "La nube puede estirarse y girar, pero no colapsa area de fase."
        : "La nube cae hacia un atractor: esto modela disipacion efectiva, no un nucleo hamiltoniano cerrado.");
    };
    local = initControls("liouville-cloud", { choice: "hamiltonian" }, render);
    render();
  }

  function renderStationaryPhase(host) {
    let local;
    const render = () => {
      const hbar = local.slider;
      const { svg } = createSvg(host, 390);
      panel(svg, 34, 34, 692, 296, "Suma de fasores por historias vecinas", "cerca del estacionario las fases apuntan casi juntas");
      const cx1 = 220;
      const cx2 = 540;
      const cy = 190;
      let sumNear = { x: 0, y: 0 };
      let sumFar = { x: 0, y: 0 };
      for (let i = -10; i <= 10; i += 1) {
        const lambda = i / 10;
        const phaseNear = (0.18 * lambda * lambda) / hbar;
        const phaseFar = (1.45 * lambda + 0.18 * lambda * lambda) / hbar;
        const near = { x: Math.cos(phaseNear), y: Math.sin(phaseNear) };
        const far = { x: Math.cos(phaseFar), y: Math.sin(phaseFar) };
        sumNear.x += near.x; sumNear.y += near.y;
        sumFar.x += far.x; sumFar.y += far.y;
        svg.appendChild(line(cx1, cy, cx1 + 42 * far.x, cy - 42 * far.y, { stroke: "rgba(209,111,43,0.38)", width: 1.8 }));
        svg.appendChild(line(cx2, cy, cx2 + 42 * near.x, cy - 42 * near.y, { stroke: "rgba(14,114,120,0.38)", width: 1.8 }));
      }
      svg.appendChild(circle(cx1, cy, 5, { fill: colors.orange }));
      svg.appendChild(circle(cx2, cy, 5, { fill: colors.teal }));
      svg.appendChild(line(cx1, cy, cx1 + 6 * sumFar.x, cy - 6 * sumFar.y, { stroke: colors.orange, width: 5 }));
      svg.appendChild(line(cx2, cy, cx2 + 6 * sumNear.x, cy - 6 * sumNear.y, { stroke: colors.teal, width: 5 }));
      svg.appendChild(text(cx1 - 92, 95, "lejos del estacionario", { fill: colors.orange, size: 15, weight: 800 }));
      svg.appendChild(text(cx2 - 92, 95, "cerca del estacionario", { fill: colors.teal, size: 15, weight: 800 }));
      const nearNorm = Math.hypot(sumNear.x, sumNear.y) / 21;
      const farNorm = Math.hypot(sumFar.x, sumFar.y) / 21;
      setReadout("stationary-phase", `coherencia cerca = ${nearNorm.toFixed(2)}; lejos = ${farNorm.toFixed(2)}. Menor hbar hace mas dura la cancelacion.`);
    };
    local = initControls("stationary-phase", { slider: 0.34 }, render);
    render();
  }

  function box(svg, x, y, w, h, label, attrs = {}) {
    svg.appendChild(rect(x, y, w, h, {
      rx: attrs.rx || 18,
      fill: attrs.fill || "rgba(255,255,255,0.72)",
      stroke: attrs.stroke || "rgba(27,40,48,0.10)"
    }));
    svg.appendChild(text(x + w / 2, y + h / 2 + 5, label, {
      fill: attrs.color || colors.ink,
      size: attrs.size || 15,
      weight: 800,
      anchor: "middle"
    }));
  }

  function renderStateLawQuestion(host) {
    let local;
    const render = () => {
      const a = local.slider;
      const { svg, arrow } = createSvg(host, 640);
      const top = { x: 34, y: 34, w: 692, h: 260 };
      const bottom = { x: 34, y: 330, w: 692, h: 260 };
      panel(svg, top.x, top.y, top.w, top.h, "Compatible", "Phi_a traslada; las flechas se trasladan con el estado");
      panel(svg, bottom.x, bottom.y, bottom.w, bottom.h, "Anclaje oculto", "el campo apunta hacia A: aparece un lugar especial");
      axes(svg, top, { x: "q", y: "eta" });
      axes(svg, bottom, { x: "q", y: "eta" });

      const drawCase = (area, field, options) => {
        const sx = scale([-2, 2], [area.x + 48, area.x + area.w - 40]);
        const sy = scale([-2, 2], [area.y + area.h - 36, area.y + 62]);
        drawField(svg, area, field, {
          arrow,
          stroke: options.fieldStroke,
          xs: [-1.5, -0.9, -0.3, 0.3, 0.9, 1.5],
          ys: [-1.2, -0.4, 0.4, 1.2],
          length: 18
        });

        const s = { q: -0.75, eta: 0.55 };
        const phi = { q: Math.min(1.65, s.q + a), eta: s.eta };
        const arrowAt = (point, color) => {
          const v = field(point.q, point.eta);
          const n = Math.hypot(v.x, v.y);
          const len = 42;
          const dx = (v.x / n) * len;
          const dy = -(v.y / n) * len;
          const px = sx(point.q);
          const py = sy(point.eta);
          svg.appendChild(line(px, py, px + dx, py + dy, { stroke: color, width: 4.5, arrow }));
        };

        svg.appendChild(circle(sx(s.q), sy(s.eta), 8, { fill: colors.teal }));
        svg.appendChild(circle(sx(phi.q), sy(phi.eta), 8, { fill: colors.orange }));
        arrowAt(s, colors.teal);
        arrowAt(phi, colors.orange);
        svg.appendChild(path(`M ${sx(s.q) + 14} ${sy(s.eta) - 34} C ${sx(s.q + a * 0.35)} ${sy(1.48)} ${sx(s.q + a * 0.65)} ${sy(1.48)} ${sx(phi.q) - 14} ${sy(phi.eta) - 34}`, { stroke: colors.muted, width: 2, dash: "5 6", arrow }));
        svg.appendChild(text((sx(s.q) + sx(phi.q)) / 2, sy(1.66), `Phi_a, a=${a.toFixed(2)}`, { anchor: "middle", size: 12, weight: 800 }));
        svg.appendChild(text(sx(s.q) - 14, sy(s.eta) + 28, "s", { fill: colors.teal, size: 13, weight: 800 }));
        svg.appendChild(text(sx(phi.q) - 26, sy(phi.eta) + 28, "Phi_a(s)", { fill: colors.orange, size: 13, weight: 800 }));

        if (options.anchor) {
          svg.appendChild(circle(sx(0), sy(0), 14, { fill: "rgba(209,111,43,0.12)", stroke: colors.orange, width: 3 }));
          svg.appendChild(text(sx(0) + 20, sy(0) + 5, "A", { fill: colors.orange, size: 16, weight: 800 }));
        }

        return { s, phi, xs: field(s.q, s.eta), xphi: field(phi.q, phi.eta) };
      };

      const compatible = drawCase(top, () => ({ x: 0.92, y: 0.25 }), {
        fieldStroke: "rgba(14,114,120,0.42)"
      });
      const anchored = drawCase(bottom, (q, eta) => ({ x: -q, y: -eta }), {
        fieldStroke: "rgba(209,111,43,0.42)",
        anchor: true
      });

      const pair = (point) => `(${point.q.toFixed(2)}, ${point.eta.toFixed(2)})`;
      const vector = (point) => `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`;
      setDemoValue("state-law-a", a.toFixed(2));
      setDemoValue("state-law-s", pair(compatible.s));
      setDemoValue("state-law-phi", pair(compatible.phi));
      setDemoValue("state-law-compatible-vector", vector(compatible.xs));
      setDemoValue("state-law-anchor-point", "(0.00, 0.00)");
      setDemoValue("state-law-anchor-xs", vector(anchored.xs));
      setDemoValue("state-law-anchor-xphi", vector(anchored.xphi));
    };
    local = initControls("state-law-question", { slider: 1.15 }, render);
    render();
  }

  function renderCoordinateCovariance(host) {
    let local;
    const render = () => {
      const angle = local.angle;
      const stretch = local.stretch;
      const wrong = local.choice === "wrong";
      const vector = { x: 0.95, y: 0.55 };
      const tail = { x: -0.72, y: -0.52 };
      const u1 = { x: Math.cos(angle), y: Math.sin(angle) };
      const u2 = { x: -Math.sin(angle), y: Math.cos(angle) };
      const E1 = { x: stretch * u1.x, y: stretch * u1.y };
      const E2 = { x: u2.x, y: u2.y };
      const qComponents = [vector.x, vector.y];
      const qNew = [
        (vector.x * u1.x + vector.y * u1.y) / stretch,
        vector.x * u2.x + vector.y * u2.y
      ];
      const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
      const scaleVector = (v, k) => ({ x: v.x * k, y: v.y * k });
      const tip = add(tail, vector);
      const mid = add(tail, scaleVector(E1, qNew[0]));
      const reconstructed = add(mid, scaleVector(E2, qNew[1]));
      const copied = add(add(tail, scaleVector(E1, qComponents[0])), scaleVector(E2, qComponents[1]));
      const { svg, arrow } = createSvg(host, 560);
      const area = { x: 34, y: 34, w: 692, h: 392 };
      const read = { x: 34, y: 452, w: 692, h: 68 };
      panel(
        svg,
        area.x,
        area.y,
        area.w,
        area.h,
        wrong ? "Copiar componentes cambia el vector" : "El vector no sabe de coordenadas",
        "azul: flecha fisica; naranja: la misma flecha descompuesta en otra base"
      );
      panel(svg, read.x, read.y, read.w, read.h, "Lectura", wrong
        ? "Si copias los numeros de una base a otra, construyes otra flecha."
        : "La flecha azul no se mueve; cambian los numeros que la describen.");

      const sx = scale([-2.35, 2.35], [area.x + 54, area.x + area.w - 48]);
      const sy = scale([-2.05, 2.05], [area.y + area.h - 42, area.y + 76]);
      const at = (p) => ({ x: sx(p.x), y: sy(p.y) });
      const drawArrow = (from, to, color, width, options = {}) => {
        const a = at(from);
        const b = at(to);
        svg.appendChild(line(a.x, a.y, b.x, b.y, {
          stroke: color,
          width,
          arrow,
          dash: options.dash
        }));
      };
      const drawVectorFrom = (from, v, color, width, options = {}) => {
        drawArrow(from, add(from, v), color, width, options);
      };
      const drawAxis = (basis, color, label, scaleFactor = 1) => {
        const before = add(tail, scaleVector(basis, -1.55 * scaleFactor));
        const after = add(tail, scaleVector(basis, 1.55 * scaleFactor));
        drawArrow(before, after, color, 1.8, { dash: "5 7" });
        const end = add(tail, scaleVector(basis, 0.72 * scaleFactor));
        drawVectorFrom(tail, scaleVector(basis, 0.58 * scaleFactor), color, 3.4);
        const labelPoint = at(end);
        svg.appendChild(text(labelPoint.x + 8, labelPoint.y - 8, label, {
          fill: color,
          size: 13,
          weight: 800
        }));
      };

      drawAxis({ x: 1, y: 0 }, "rgba(96,113,128,0.52)", "e1", 1);
      drawAxis({ x: 0, y: 1 }, "rgba(96,113,128,0.52)", "e2", 1);
      drawAxis(E1, "rgba(209,111,43,0.58)", "E1", 1 / Math.max(stretch, 0.8));
      drawAxis(E2, "rgba(209,111,43,0.58)", "E2", 1);

      const tailScreen = at(tail);
      svg.appendChild(circle(tailScreen.x, tailScreen.y, 8, { fill: colors.ink }));
      svg.appendChild(text(tailScreen.x - 18, tailScreen.y + 30, "s", {
        fill: colors.ink,
        size: 13,
        weight: 800
      }));
      drawArrow(tail, tip, colors.teal, 6);
      const tipScreen = at(tip);
      svg.appendChild(text(tipScreen.x + 12, tipScreen.y - 12, "vector v", {
        fill: colors.teal,
        size: 14,
        weight: 800
      }));

      if (wrong) {
        drawArrow(tail, copied, colors.rust, 5, { dash: "7 6" });
        const copiedScreen = at(copied);
        svg.appendChild(circle(copiedScreen.x, copiedScreen.y, 6, { fill: "white", stroke: colors.rust, width: 3 }));
        svg.appendChild(text(copiedScreen.x + 10, copiedScreen.y + 20, "copiar numeros", {
          fill: colors.rust,
          size: 13,
          weight: 800
        }));
      } else {
        drawArrow(tail, mid, colors.orange, 3.6, { dash: "7 6" });
        drawArrow(mid, reconstructed, colors.orange, 3.6, { dash: "7 6" });
        const midScreen = at(mid);
        svg.appendChild(circle(midScreen.x, midScreen.y, 5, { fill: colors.orange }));
        svg.appendChild(text(midScreen.x + 10, midScreen.y - 10, "v_Q^1 E1", {
          fill: colors.orange,
          size: 12,
          weight: 800
        }));
      }

      box(svg, area.x + 52, area.y + area.h - 52, 178, 34, `[v]_q=(${qComponents[0].toFixed(2)}, ${qComponents[1].toFixed(2)})`, {
        size: 12,
        color: colors.teal,
        rx: 12
      });
      box(svg, area.x + 252, area.y + area.h - 52, 178, 34, `[v]_Q=(${qNew[0].toFixed(2)}, ${qNew[1].toFixed(2)})`, {
        size: 12,
        color: colors.orange,
        rx: 12
      });
      box(svg, area.x + 452, area.y + area.h - 52, 210, 34, wrong ? "mismos numeros: otro vector" : "mismo vector: otros numeros", {
        size: 12,
        color: wrong ? colors.rust : colors.ink,
        fill: wrong ? "rgba(182,66,31,0.08)" : "rgba(14,114,120,0.08)",
        rx: 12
      });

      svg.appendChild(text(area.x + 62, area.y + 80, "base gris: descripcion q", {
        fill: colors.muted,
        size: 13,
        weight: 800
      }));
      svg.appendChild(text(area.x + 62, area.y + 102, "base naranja: descripcion Q", {
        fill: colors.orange,
        size: 13,
        weight: 800
      }));
      svg.appendChild(text(area.x + 62, area.y + 124, `giro=${angle.toFixed(2)}, escala E1=${stretch.toFixed(2)}`, {
        fill: colors.muted,
        size: 12,
        weight: 700
      }));

      setDemoValue("cov-angle", angle.toFixed(2));
      setDemoValue("cov-stretch", stretch.toFixed(2));
      setDemoValue("cov-vq", `(${qComponents[0].toFixed(2)}, ${qComponents[1].toFixed(2)})`);
      setDemoValue("cov-vQ", `(${qNew[0].toFixed(2)}, ${qNew[1].toFixed(2)})`);
      setDemoValue("cov-copied", `(${copied.x - tail.x >= 0 ? "+" : ""}${(copied.x - tail.x).toFixed(2)}, ${(copied.y - tail.y).toFixed(2)})`);
      setDemoValue("cov-verdict", wrong
        ? "copiar componentes produce otra flecha"
        : "el vector permanece; cambian sus componentes");
    };
    local = initControls("coordinate-covariance", { choice: "correct", angle: 0.55, stretch: 1.35 }, render);
    render();
  }

  function renderPhysicalSymmetry(host) {
    const { svg, arrow } = createSvg(host, 560);
    const top = { x: 34, y: 34, w: 692, h: 220 };
    const bottom = { x: 34, y: 296, w: 692, h: 220 };
    panel(svg, top.x, top.y, top.w, top.h, "Traslacion de una particula libre", "X(x,eta)=(eta,0): la flecha viaja con el estado");
    panel(svg, bottom.x, bottom.y, bottom.w, bottom.h, "Traslacion con anclaje", "X(x,eta)=(eta,-kx): la ley mira al origen A");

    const drawSymmetryCase = (area, anchored) => {
      axes(svg, area, { x: "x", y: "eta" });
      const sx = scale([-2, 2], [area.x + 46, area.x + area.w - 44]);
      const sy = scale([-1.4, 1.4], [area.y + area.h - 42, area.y + 66]);
      const s = { x: -0.92, eta: 0.58 };
      const a = 1.35;
      const phi = { x: s.x + a, eta: s.eta };
      const vector = anchored ? ((point) => ({ x: point.eta, y: -0.82 * point.x })) : (() => ({ x: 0.9, y: 0 }));
      const arrowAt = (point, color) => {
        const v = vector(point);
        const norm = Math.hypot(v.x, v.y) || 1;
        const dx = (v.x / norm) * 44;
        const dy = -(v.y / norm) * 44;
        svg.appendChild(line(sx(point.x), sy(point.eta), sx(point.x) + dx, sy(point.eta) + dy, { stroke: color, width: 4, arrow }));
      };
      if (anchored) {
        svg.appendChild(circle(sx(0), sy(0), 15, { fill: "rgba(209,111,43,0.12)", stroke: colors.orange, width: 3 }));
        svg.appendChild(text(sx(0) + 20, sy(0) + 5, "A", { fill: colors.orange, size: 16, weight: 800 }));
        drawField(svg, area, (x, eta) => ({ x: eta, y: -0.82 * x }), {
          arrow,
          xs: [-1.55, -0.75, 0.05, 0.85, 1.65],
          ys: [-0.8, 0, 0.8],
          stroke: "rgba(209,111,43,0.30)"
        });
      } else {
        drawField(svg, area, () => ({ x: 0.9, y: 0 }), {
          arrow,
          xs: [-1.55, -0.75, 0.05, 0.85, 1.65],
          ys: [-0.8, 0, 0.8],
          stroke: "rgba(14,114,120,0.28)"
        });
      }
      svg.appendChild(path(`M ${sx(s.x) + 10} ${sy(s.eta) - 30} C ${sx(s.x + 0.4)} ${sy(1.18)} ${sx(phi.x - 0.4)} ${sy(1.18)} ${sx(phi.x) - 10} ${sy(phi.eta) - 30}`, { stroke: colors.muted, width: 2, dash: "5 6", arrow }));
      svg.appendChild(text((sx(s.x) + sx(phi.x)) / 2, sy(1.3), "Phi_a", { anchor: "middle", fill: colors.muted, size: 13, weight: 800 }));
      svg.appendChild(circle(sx(s.x), sy(s.eta), 8, { fill: colors.teal }));
      svg.appendChild(circle(sx(phi.x), sy(phi.eta), 8, { fill: colors.orange }));
      arrowAt(s, colors.teal);
      arrowAt(phi, colors.orange);
      svg.appendChild(text(sx(s.x) - 18, sy(s.eta) + 30, "s", { fill: colors.teal, size: 13, weight: 800 }));
      svg.appendChild(text(sx(phi.x) - 30, sy(phi.eta) + 30, "Phi_a(s)", { fill: colors.orange, size: 13, weight: 800 }));
    };

    drawSymmetryCase(top, false);
    drawSymmetryCase(bottom, true);
    svg.appendChild(text(76, 236, "(Phi_a)_* X_s = X_{Phi_a(s)}", { fill: colors.teal, size: 15, weight: 800 }));
    svg.appendChild(text(76, 498, "(eta,-kx) != (eta,-k(x+a))", { fill: colors.rust, size: 15, weight: 800 }));
  }

  function renderSpatialHomogeneity(host) {
    let local;
    const render = () => {
      const a = local.slider;
      const isAnchor = local.choice === "anchor";
      const { svg, arrow } = createSvg(host, 540);
      const area = { x: 34, y: 34, w: 692, h: 362 };
      panel(
        svg,
        area.x,
        area.y,
        area.w,
        area.h,
        isAnchor ? "Campo anclado: el traslado deja una huella" : "Campo libre: el traslado cae sobre si mismo",
        "naranja: X original; azul: campo transportado (Phi_a)_*X"
      );
      axes(svg, area, { x: "x", y: "eta" });

      const sx = scale([-2.2, 2.2], [area.x + 50, area.x + area.w - 44]);
      const sy = scale([-1.35, 1.35], [area.y + area.h - 46, area.y + 76]);
      const k = 0.85;
      const original = (point) => isAnchor
        ? { x: point.eta, y: -k * point.x }
        : { x: point.eta, y: 0 };
      const transported = (point) => original({ x: point.x - a, eta: point.eta });
      const vectorText = (vector) => `(${vector.x.toFixed(2)}, ${vector.y.toFixed(2)})`;
      const drawVectorAt = (point, vector, color, width) => {
        const norm = Math.hypot(vector.x, vector.y);
        if (norm < 0.04) return;
        const length = Math.min(42, 16 + 16 * norm);
        const dx = (vector.x / norm) * length;
        const dy = -(vector.y / norm) * length;
        svg.appendChild(line(sx(point.x), sy(point.eta), sx(point.x) + dx, sy(point.eta) + dy, { stroke: color, width, arrow }));
      };
      const samplesX = [-1.65, -0.85, -0.05, 0.75, 1.55];
      const samplesEta = [-0.9, -0.3, 0.3, 0.9];
      samplesX.forEach((x) => {
        samplesEta.forEach((eta) => {
          const point = { x, eta };
          drawVectorAt(point, original(point), isAnchor ? "rgba(209,111,43,0.54)" : "rgba(209,111,43,0.42)", isAnchor ? 2.6 : 6);
          drawVectorAt(point, transported(point), "rgba(14,114,120,0.62)", isAnchor ? 2.6 : 3);
        });
      });

      const probe = { x: 0.7, eta: 0.62 };
      const xo = original(probe);
      const xt = transported(probe);
      svg.appendChild(circle(sx(probe.x), sy(probe.eta), 8, { fill: colors.ink }));
      drawVectorAt(probe, xo, colors.orange, 5);
      drawVectorAt(probe, xt, colors.teal, 5);
      svg.appendChild(text(sx(probe.x) + 14, sy(probe.eta) - 18, "punto de comparacion", { size: 12, weight: 800 }));

      if (isAnchor) {
        svg.appendChild(line(sx(0), area.y + 78, sx(0), area.y + area.h - 42, { stroke: "rgba(209,111,43,0.34)", width: 2 }));
        svg.appendChild(circle(sx(0), sy(0), 14, { fill: "rgba(209,111,43,0.10)", stroke: colors.orange, width: 3 }));
        svg.appendChild(text(sx(0) + 18, sy(0) + 5, "A=0", { fill: colors.orange, size: 14, weight: 800 }));
        svg.appendChild(line(sx(a), area.y + 78, sx(a), area.y + area.h - 42, { stroke: "rgba(14,114,120,0.30)", width: 2 }));
        svg.appendChild(circle(sx(a), sy(0), 14, { fill: "rgba(14,114,120,0.10)", stroke: colors.teal, width: 3 }));
        svg.appendChild(text(sx(a) + 18, sy(0) + 5, "Phi_a(A)", { fill: colors.teal, size: 14, weight: 800 }));
      } else {
        svg.appendChild(path(`M ${sx(-1.85)} ${sy(1.18)} C ${sx(-0.6)} ${sy(1.45)} ${sx(0.7)} ${sy(1.45)} ${sx(1.85)} ${sy(1.18)}`, { stroke: colors.teal, width: 3, dash: "6 6", arrow }));
        svg.appendChild(text(sx(0), sy(1.48), "el patron completo se desplaza sin cambiar", { anchor: "middle", fill: colors.teal, size: 13, weight: 800 }));
      }

      panel(svg, 34, 424, 692, 72, "Test de homogeneidad", isAnchor ? "((Phi_a)_*X)(x,eta)=(eta,-k(x-a)) no coincide con X(x,eta)" : "((Phi_a)_*X)(x,eta)=X(x,eta): no hay origen absoluto");
      svg.appendChild(line(82, 486, 136, 486, { stroke: colors.orange, width: 5, arrow }));
      svg.appendChild(text(146, 491, "X original", { fill: colors.orange, size: 13, weight: 800 }));
      svg.appendChild(line(282, 486, 336, 486, { stroke: colors.teal, width: 5, arrow }));
      svg.appendChild(text(346, 491, "(Phi_a)_*X", { fill: colors.teal, size: 13, weight: 800 }));
      svg.appendChild(text(520, 491, `a = ${a.toFixed(2)}`, { fill: colors.ink, size: 15, weight: 800 }));

      setDemoValue("spatial-a", a.toFixed(2));
      setDemoValue("spatial-mode", isAnchor ? "anclado" : "libre");
      setDemoValue("spatial-original", vectorText(xo));
      setDemoValue("spatial-transported", vectorText(xt));
      setDemoValue("spatial-verdict", isAnchor
        ? "los campos se separan; el traslado revela un lugar privilegiado."
        : "los campos coinciden; la traslacion no revela ningun origen.");
    };
    local = initControls("spatial-homogeneity", { choice: "free", slider: 1.05 }, render);
    render();
  }

  function renderIsotropyFilter(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "Sin anisotropia, todas las direcciones equivalen", "un vector fijo dentro de la ley es estructura fisica");
    const cx = 260;
    const cy = 182;
    svg.appendChild(circle(cx, cy, 86, { fill: "none", stroke: "rgba(14,114,120,0.28)", width: 3 }));
    for (let i = 0; i < 8; i += 1) {
      const a = (Math.PI * 2 * i) / 8;
      svg.appendChild(line(cx, cy, cx + 64 * Math.cos(a), cy + 64 * Math.sin(a), { stroke: "rgba(14,114,120,0.32)", width: 2, arrow }));
    }
    svg.appendChild(text(cx, 292, "rotaciones admisibles", { anchor: "middle", size: 13 }));
    svg.appendChild(line(470, cy, 630, cy - 54, { stroke: colors.orange, width: 5, arrow }));
    svg.appendChild(text(550, 292, "vector fijo a: campo externo", { anchor: "middle", fill: colors.orange, size: 13 }));
  }

  function renderTimeHomogeneity(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 360);
      panel(svg, 34, 34, 692, 264, "Tres instantes, misma preparacion", local.choice === "autonomous" ? "sistema aislado: el campo se repite" : "accionamiento externo: el campo cambia con t");
      [0, 1, 2].forEach((i) => {
        const x0 = 96 + i * 210;
        box(svg, x0, 118, 150, 132, `t${i}`, { fill: "rgba(255,255,255,0.56)" });
        const tilt = local.choice === "autonomous" ? 0 : (i - 1) * 0.55;
        for (let k = 0; k < 4; k += 1) {
          const x = x0 + 42 + (k % 2) * 58;
          const y = 164 + Math.floor(k / 2) * 42;
          svg.appendChild(line(x - 14, y + 8 * tilt, x + 24, y - 8 * tilt, { stroke: local.choice === "autonomous" ? colors.teal : colors.orange, width: 2.6, arrow }));
        }
      });
      setReadout("time-homogeneity", local.choice === "autonomous"
        ? "Misma preparacion, misma flecha: la hora del reloj no entra en la ley."
        : "Las flechas cambian con el tiempo: eso exige un motor, control o entorno externo.");
    };
    local = initControls("time-homogeneity", { choice: "autonomous" }, render);
    render();
  }

  function renderGalileanRelativity(host) {
    let local;
    const render = () => {
      const u = local.slider;
      const { svg } = createSvg(host, 380);
      panel(svg, 28, 34, 330, 278, "Laboratorio A", "x(t)=vt");
      panel(svg, 402, 34, 330, 278, "Laboratorio B", "x'(t)=x-ut");
      const drawPanel = (x0, y0, v, color) => {
        svg.appendChild(line(x0 + 42, y0 + 218, x0 + 278, y0 + 218, { stroke: "rgba(27,40,48,0.14)" }));
        svg.appendChild(line(x0 + 54, y0 + 232, x0 + 54, y0 + 66, { stroke: "rgba(27,40,48,0.14)" }));
        svg.appendChild(path(`M ${x0 + 70} ${y0 + 214} L ${x0 + 260} ${y0 + 214 - v * 68}`, { stroke: color, width: 4 }));
      };
      drawPanel(28, 34, 1.15, colors.teal);
      drawPanel(402, 34, 1.15 - u, colors.orange);
      setReadout("galilean-relativity", `v_A=1.15; u=${u.toFixed(2)}; v_B=${(1.15 - u).toFixed(2)}. Cambia el numero, no la clase de movimiento.`);
    };
    local = initControls("galilean-relativity", { slider: 0.8 }, render);
    render();
  }

  function renderSymmetryNoConservation(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "Simetria no basta para conservar", "hace falta estructura que convierta transformaciones en generadores");
    const steps = [
      ["simetria", 78],
      ["soluciones", 226],
      ["fase", 374],
      ["generador G", 522],
      ["conservacion", 620]
    ];
    steps.forEach(([label, x], i) => {
      box(svg, x, i === 2 ? 132 : 162, i === 4 ? 118 : 110, 54, label, { fill: i === 2 ? "rgba(209,111,43,0.12)" : "rgba(255,255,255,0.70)", size: 13 });
      if (i < steps.length - 1) svg.appendChild(line(x + (i === 4 ? 118 : 110), i === 2 ? 159 : 189, steps[i + 1][1] - 8, steps[i + 1][0] === "fase" ? 159 : 189, { stroke: colors.teal, width: 2.6, arrow }));
    });
    svg.appendChild(text(346, 246, "el puente no es opcional", { fill: colors.orange, size: 14, weight: 800 }));
  }

  function renderChapter2FilterMap(host) {
    const { svg, arrow } = createSvg(host, 430);
    panel(svg, 34, 34, 692, 330, "Mapa del capitulo 2", "cada filtro elimina estructura no justificada");
    box(svg, 72, 106, 130, 50, "campo X", { color: colors.teal, size: 16 });
    box(svg, 250, 82, 168, 48, "covariancia", { size: 14 });
    box(svg, 250, 148, 168, 48, "simetria fisica", { size: 14 });
    box(svg, 468, 64, 150, 42, "homogeneidad", { size: 13 });
    box(svg, 468, 116, 150, 42, "isotropia", { size: 13 });
    box(svg, 468, 168, 150, 42, "tiempo", { size: 13 });
    box(svg, 468, 220, 150, 42, "Galileo", { size: 13 });
    box(svg, 286, 292, 188, 50, "X admisible", { color: colors.orange, size: 16, fill: "rgba(209,111,43,0.10)" });

    svg.appendChild(line(204, 131, 246, 106, { stroke: colors.teal, width: 2.6, arrow }));
    svg.appendChild(line(204, 131, 246, 172, { stroke: colors.teal, width: 2.6, arrow }));
    svg.appendChild(line(420, 106, 464, 85, { stroke: colors.teal, width: 2.4, arrow }));
    svg.appendChild(line(420, 172, 464, 137, { stroke: colors.teal, width: 2.4, arrow }));
    svg.appendChild(line(420, 172, 464, 189, { stroke: colors.teal, width: 2.4, arrow }));
    svg.appendChild(line(420, 172, 464, 241, { stroke: colors.teal, width: 2.4, arrow }));
    [85, 137, 189, 241].forEach((y) => {
      svg.appendChild(path(`M 620 ${y} C 676 ${y} 676 318 478 318`, { stroke: "rgba(14,114,120,0.32)", width: 2, arrow }));
    });
    svg.appendChild(text(78, 224, "no resolver aun", { fill: colors.muted, size: 13, weight: 800 }));
    svg.appendChild(text(78, 246, "solo descartar", { fill: colors.muted, size: 13, weight: 800 }));
    svg.appendChild(text(286, 392, "lo que queda pasa al siguiente capitulo", { fill: colors.muted, size: 13, weight: 800 }));
  }

  function renderLawInvoice(host) {
    let local;
    const render = () => {
      const mode = local.choice;
      const strength = Math.max(0.15, local.strength);
      const shift = local.shift;
      const q0 = shift;
      const phase = ((shift + 1.2) / 2.4) * Math.PI * 2;
      const drive = strength * Math.sin(phase);
      const gamma = strength;
      const k = strength;
      const g = strength;
      const acceleration = (q, eta) => {
        if (mode === "anchor") return -k * (q - q0);
        if (mode === "uniform") return g;
        if (mode === "medium") return -gamma * eta;
        if (mode === "driven") return drive;
        return 0;
      };
      const label = {
        free: "libre",
        anchor: "anclaje",
        uniform: "campo uniforme",
        medium: "medio",
        driven: "reloj externo"
      }[mode];
      const formula = {
        free: "A=0",
        anchor: `A=-${k.toFixed(2)}(q-${q0.toFixed(2)})`,
        uniform: `A=${g.toFixed(2)}`,
        medium: `A=-${gamma.toFixed(2)} eta`,
        driven: `A=${drive.toFixed(2)}`
      }[mode];
      const structure = {
        free: "no compra centro, direccion, medio ni reloj",
        anchor: "compra un centro fisico C",
        uniform: "compra una direccion de aceleracion",
        medium: "compra un reposo definido por el medio",
        driven: "compra un reloj o accionamiento externo"
      }[mode];

      const { svg, arrow } = createSvg(host, 560);
      const area = { x: 34, y: 34, w: 692, h: 392 };
      panel(svg, area.x, area.y, area.w, area.h, `Ley candidata: ${label}`, "campo en el espacio de presentes (q, eta)");
      axes(svg, area, { x: "q", y: "eta" });
      const sx = scale([-2.1, 2.1], [area.x + 56, area.x + area.w - 44]);
      const sy = scale([-1.7, 1.7], [area.y + area.h - 48, area.y + 74]);
      const field = (q, eta) => ({ x: eta, y: acceleration(q, eta) });
      drawField(svg, area, field, {
        arrow,
        xs: [-1.65, -1.05, -0.45, 0.15, 0.75, 1.35, 1.95],
        ys: [-1.2, -0.6, 0, 0.6, 1.2],
        stroke: mode === "free" ? "rgba(14,114,120,0.40)" : "rgba(96,113,128,0.42)",
        length: 20
      });

      const points = [];
      let point = { q: -1.35, eta: mode === "medium" ? 1.25 : 0.72 };
      for (let i = 0; i < 92; i += 1) {
        points.push({ ...point });
        const dt = 0.035;
        const a = acceleration(point.q, point.eta);
        point = { q: point.q + dt * point.eta, eta: point.eta + dt * a };
        if (point.q < -2.2 || point.q > 2.2 || point.eta < -1.9 || point.eta > 1.9) break;
      }
      if (points.length > 1) {
        const d = points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.q)} ${sy(p.eta)}`)
          .join(" ");
        svg.appendChild(path(d, { stroke: colors.teal, width: 4, arrow }));
        const last = points[points.length - 1];
        svg.appendChild(circle(sx(last.q), sy(last.eta), 8, { fill: colors.orange }));
      }

      if (mode === "anchor") {
        svg.appendChild(line(sx(q0), area.y + 72, sx(q0), area.y + area.h - 44, { stroke: "rgba(209,111,43,0.35)", width: 2.5 }));
        svg.appendChild(circle(sx(q0), sy(0), 15, { fill: "rgba(209,111,43,0.13)", stroke: colors.orange, width: 3 }));
        svg.appendChild(text(sx(q0) + 18, sy(0) + 5, "C", { fill: colors.orange, size: 16, weight: 800 }));
      }
      if (mode === "uniform") {
        svg.appendChild(line(area.x + area.w - 112, area.y + 266, area.x + area.w - 112, area.y + 168, { stroke: colors.orange, width: 6, arrow }));
        svg.appendChild(text(area.x + area.w - 146, area.y + 292, "vector externo", { fill: colors.orange, size: 13, weight: 800 }));
      }
      if (mode === "medium") {
        svg.appendChild(line(area.x + 54, sy(0), area.x + area.w - 44, sy(0), { stroke: "rgba(209,111,43,0.45)", width: 2.8 }));
        svg.appendChild(text(area.x + area.w - 210, sy(0) - 14, "reposo del medio", { fill: colors.orange, size: 13, weight: 800 }));
      }
      if (mode === "driven") {
        const cx = area.x + area.w - 100;
        const cy = area.y + 130;
        svg.appendChild(circle(cx, cy, 36, { fill: "rgba(209,111,43,0.08)", stroke: colors.orange, width: 3 }));
        svg.appendChild(line(cx, cy, cx + 26 * Math.cos(phase), cy + 26 * Math.sin(phase), { stroke: colors.orange, width: 4 }));
        svg.appendChild(text(cx - 44, cy + 58, "reloj externo", { fill: colors.orange, size: 13, weight: 800 }));
      }

      const chip = (x, y, textValue, active) => {
        svg.appendChild(rect(x, y, 122, 30, {
          rx: 14,
          fill: active ? "rgba(209,111,43,0.13)" : "rgba(255,255,255,0.58)",
          stroke: active ? "rgba(209,111,43,0.42)" : "rgba(27,40,48,0.08)"
        }));
        svg.appendChild(text(x + 61, y + 20, textValue, {
          anchor: "middle",
          fill: active ? colors.orange : colors.muted,
          size: 12,
          weight: 800
        }));
      };
      chip(area.x + 52, area.y + area.h - 36, "centro", mode === "anchor");
      chip(area.x + 186, area.y + area.h - 36, "direccion", mode === "uniform");
      chip(area.x + 320, area.y + area.h - 36, "medio", mode === "medium");
      chip(area.x + 454, area.y + area.h - 36, "reloj", mode === "driven");
      chip(area.x + 588, area.y + area.h - 36, "ninguna", mode === "free");

      panel(svg, 34, 452, 692, 64, formula, structure);
      setDemoValue("invoice-mode", label);
      setDemoValue("invoice-formula", formula);
      setDemoValue("invoice-structure", structure);
      setDemoValue("invoice-strength", strength.toFixed(2));
      setDemoValue("invoice-shift", shift.toFixed(2));
    };
    local = initControls("law-invoice", { choice: "free", strength: 0.8, shift: 0.25 }, render);
    render();
  }

  function renderGalileanBoost(host) {
    let local;
    const render = () => {
      const mode = local.choice;
      const u = local.u;
      const gamma = 0.75;
      const vStar = 0.65;
      const acc = (eta, lab) => {
        const absoluteEta = lab === "B" ? eta + u : eta;
        if (mode === "drag") return -gamma * absoluteEta;
        if (mode === "preferred") return -gamma * (absoluteEta - vStar);
        return 0;
      };
      const label = {
        free: "libre",
        drag: "rozamiento",
        preferred: "velocidad preferida"
      }[mode];
      const { svg, arrow } = createSvg(host, 520);
      const left = { x: 34, y: 34, w: 330, h: 342 };
      const right = { x: 396, y: 34, w: 330, h: 342 };
      panel(svg, left.x, left.y, left.w, left.h, "Laboratorio A", `ley ${label}`);
      panel(svg, right.x, right.y, right.w, right.h, `Laboratorio B, u=${u.toFixed(2)}`, "misma situacion vista desde otro laboratorio");
      const drawPanel = (area, lab) => {
        axes(svg, area, { x: "q", y: "eta" });
        const sx = scale([-2, 2], [area.x + 42, area.x + area.w - 34]);
        const sy = scale([-1.7, 1.7], [area.y + area.h - 40, area.y + 68]);
        drawField(svg, area, (q, eta) => ({ x: eta, y: acc(eta, lab) }), {
          arrow,
          xs: [-1.45, -0.75, -0.05, 0.65, 1.35],
          ys: [-1.15, -0.55, 0.05, 0.65, 1.25],
          stroke: mode === "free" ? "rgba(14,114,120,0.42)" : "rgba(96,113,128,0.42)",
          length: 20
        });
        const rest = mode === "free" ? null : (mode === "drag" ? 0 : vStar) - (lab === "B" ? u : 0);
        if (rest !== null && rest > -1.65 && rest < 1.65) {
          svg.appendChild(line(area.x + 44, sy(rest), area.x + area.w - 36, sy(rest), {
            stroke: "rgba(209,111,43,0.50)",
            width: 2.5
          }));
          svg.appendChild(text(area.x + 58, sy(rest) - 12, lab === "B" ? `eta'=${rest.toFixed(2)}` : `eta=${rest.toFixed(2)}`, {
            fill: colors.orange,
            size: 12,
            weight: 800
          }));
        }
        const sampleEta = lab === "B" ? 0.5 : 0.5 + u;
        svg.appendChild(circle(sx(-0.85), sy(sampleEta), 8, { fill: lab === "B" ? colors.orange : colors.teal }));
      };
      drawPanel(left, "A");
      drawPanel(right, "B");
      panel(svg, 34, 410, 692, 68, "Test galileano", mode === "free"
        ? "El campo libre conserva la misma forma en ambos laboratorios: no hay reposo absoluto."
        : "La ley delata estructura adicional: el reposo del medio o la velocidad preferida se desplaza al cambiar de laboratorio.");
      setDemoValue("boost-u", u.toFixed(2));
      setDemoValue("boost-mode", label);
      setDemoValue("boost-rest", mode === "free" ? "ninguno" : ((mode === "drag" ? 0 : vStar) - u).toFixed(2));
      setDemoValue("boost-verdict", mode === "free"
        ? "no aparece velocidad privilegiada"
        : "aparece una velocidad privilegiada en el nuevo laboratorio");
    };
    local = initControls("galilean-boost", { choice: "free", u: 0.8 }, render);
    render();
  }

  function renderInternalRelation(host) {
    let local;
    const render = () => {
      const mode = local.choice;
      const a = local.a;
      const r = local.r;
      const q1 = a - r / 2;
      const q2 = a + r / 2;
      const { svg, arrow } = createSvg(host, 460);
      const area = { x: 34, y: 34, w: 692, h: 300 };
      panel(svg, area.x, area.y, area.w, area.h, mode === "internal" ? "Dependencia interna" : "Dependencia absoluta", "traslada todo el sistema y mira que cantidad cambia");
      const sx = scale([-3, 3], [area.x + 58, area.x + area.w - 58]);
      const y = area.y + 170;
      svg.appendChild(line(sx(-2.8), y, sx(2.8), y, { stroke: "rgba(27,40,48,0.18)", width: 2 }));
      svg.appendChild(line(sx(0), y - 88, sx(0), y + 88, { stroke: "rgba(27,40,48,0.18)", width: 2 }));
      svg.appendChild(text(sx(0) + 8, y + 106, "origen de coordenadas", { fill: colors.muted, size: 12, weight: 800 }));
      svg.appendChild(circle(sx(q1), y, 12, { fill: colors.teal }));
      svg.appendChild(circle(sx(q2), y, 12, { fill: colors.orange }));
      svg.appendChild(text(sx(q1) - 20, y + 38, "q1", { fill: colors.teal, size: 14, weight: 800 }));
      svg.appendChild(text(sx(q2) - 20, y + 38, "q2", { fill: colors.orange, size: 14, weight: 800 }));
      svg.appendChild(path(`M ${sx(q1)} ${y - 44} L ${sx(q2)} ${y - 44}`, { stroke: colors.muted, width: 2.2, arrow }));
      svg.appendChild(path(`M ${sx(q2)} ${y - 52} L ${sx(q1)} ${y - 52}`, { stroke: colors.muted, width: 2.2, arrow }));
      svg.appendChild(text((sx(q1) + sx(q2)) / 2, y - 66, `r=q2-q1=${r.toFixed(2)}`, { anchor: "middle", fill: colors.ink, size: 14, weight: 800 }));

      if (mode === "internal") {
        const len = Math.min(72, 26 + 20 * r);
        svg.appendChild(line(sx(q1), y - 18, sx(q1) + len, y - 18, { stroke: colors.teal, width: 5, arrow }));
        svg.appendChild(line(sx(q2), y - 18, sx(q2) - len, y - 18, { stroke: colors.orange, width: 5, arrow }));
        svg.appendChild(text(area.x + 74, area.y + 80, "la fuerza lee solo r", { fill: colors.teal, size: 15, weight: 800 }));
      } else {
        const arrowToOrigin = (q, color) => {
          const dir = q > 0 ? -1 : 1;
          svg.appendChild(line(sx(q), y - 18, sx(q) + dir * 62, y - 18, { stroke: color, width: 5, arrow }));
        };
        arrowToOrigin(q1, colors.teal);
        arrowToOrigin(q2, colors.orange);
        svg.appendChild(circle(sx(0), y, 18, { fill: "rgba(209,111,43,0.10)", stroke: colors.orange, width: 3 }));
        svg.appendChild(text(area.x + 74, area.y + 80, "la ley mira al origen", { fill: colors.orange, size: 15, weight: 800 }));
      }

      panel(svg, 34, 366, 692, 58, mode === "internal"
        ? "Trasladar ambos puntos no cambia q2-q1: no aparece centro externo."
        : "Trasladar ambos puntos cambia q1 y q2 respecto del origen: hay anclaje externo.",
      `a=${a.toFixed(2)}, q1=${q1.toFixed(2)}, q2=${q2.toFixed(2)}`);
      setDemoValue("relation-a", a.toFixed(2));
      setDemoValue("relation-r", r.toFixed(2));
      setDemoValue("relation-q1", q1.toFixed(2));
      setDemoValue("relation-q2", q2.toFixed(2));
      setDemoValue("relation-verdict", mode === "internal"
        ? "la traslacion global no cambia la ley"
        : "la traslacion global cambia lo que la ley ve");
    };
    local = initControls("internal-relation", { choice: "internal", a: 0.65, r: 1.35 }, render);
    render();
  }

  function renderPendulumStructure(host) {
    let local;
    const render = () => {
      const theta = local.theta;
      const { svg, arrow } = createSvg(host, 480);
      const area = { x: 34, y: 34, w: 692, h: 356 };
      panel(svg, area.x, area.y, area.w, area.h, "Pendulo: el modelo ya trae estructura", "Q=S1, longitud fija, soporte y gravedad");
      const pivot = { x: area.x + 342, y: area.y + 86 };
      const length = 176;
      const bob = {
        x: pivot.x + length * Math.sin(theta),
        y: pivot.y + length * Math.cos(theta)
      };
      svg.appendChild(line(pivot.x - 130, pivot.y - 20, pivot.x + 130, pivot.y - 20, { stroke: "rgba(27,40,48,0.24)", width: 5 }));
      svg.appendChild(circle(pivot.x, pivot.y, 8, { fill: colors.ink }));
      svg.appendChild(svgEl("circle", {
        cx: pivot.x,
        cy: pivot.y,
        r: length,
        fill: "none",
        stroke: "rgba(14,114,120,0.18)",
        "stroke-width": 3,
        "stroke-dasharray": "7 8"
      }));
      svg.appendChild(line(pivot.x, pivot.y, bob.x, bob.y, { stroke: colors.teal, width: 4 }));
      svg.appendChild(circle(bob.x, bob.y, 18, { fill: colors.orange }));
      svg.appendChild(line(pivot.x, pivot.y, pivot.x, pivot.y + length, { stroke: "rgba(27,40,48,0.14)", width: 2, dash: "5 6" }));
      svg.appendChild(path(`M ${pivot.x} ${pivot.y + 54} A 54 54 0 0 ${theta > 0 ? 1 : 0} ${pivot.x + 54 * Math.sin(theta)} ${pivot.y + 54 * Math.cos(theta)}`, {
        stroke: colors.orange,
        width: 3,
        arrow
      }));
      svg.appendChild(text(pivot.x + 64 * Math.sin(theta / 2) + 8, pivot.y + 64 * Math.cos(theta / 2), "theta", {
        fill: colors.orange,
        size: 14,
        weight: 800
      }));
      svg.appendChild(text((pivot.x + bob.x) / 2 + 12, (pivot.y + bob.y) / 2, "ell", { fill: colors.teal, size: 14, weight: 800 }));
      svg.appendChild(line(area.x + 584, area.y + 104, area.x + 584, area.y + 184, { stroke: colors.orange, width: 6, arrow }));
      svg.appendChild(text(area.x + 598, area.y + 150, "g", { fill: colors.orange, size: 18, weight: 800 }));

      const chip = (x, y, title, body) => {
        svg.appendChild(rect(x, y, 182, 58, { rx: 14, fill: "rgba(255,255,255,0.70)" }));
        svg.appendChild(text(x + 16, y + 23, title, { fill: colors.ink, size: 13, weight: 800 }));
        svg.appendChild(text(x + 16, y + 44, body, { fill: colors.muted, size: 11, weight: 700 }));
      };
      chip(area.x + 54, area.y + 264, "soporte", "marca un punto");
      chip(area.x + 256, area.y + 264, "longitud fija", "reduce Q a S1");
      chip(area.x + 458, area.y + 264, "gravedad", "marca vertical");
      panel(svg, 34, 414, 692, 38, `theta=${theta.toFixed(2)} rad`, "no es particula libre: las simetrias se leen en el modelo ya construido");
      setDemoValue("pendulum-theta", theta.toFixed(2));
    };
    local = initControls("pendulum-structure", { theta: 0.58 }, render);
    render();
  }

  function renderCovectorRule(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "Regla dual", "lo que se estira en dq se compensa en p");
    svg.appendChild(line(116, 160, 280, 160, { stroke: colors.teal, width: 5, arrow }));
    svg.appendChild(text(190, 132, "dq", { anchor: "middle", fill: colors.teal, size: 18, weight: 800 }));
    svg.appendChild(line(480, 160, 660, 160, { stroke: colors.orange, width: 5, arrow }));
    svg.appendChild(text(570, 132, "dQ = J dq", { anchor: "middle", fill: colors.orange, size: 18, weight: 800 }));
    svg.appendChild(path("M 346 158 C 380 118 414 118 448 158", { stroke: colors.muted, width: 3, arrow }));
    svg.appendChild(text(397, 102, "J", { anchor: "middle", size: 16, weight: 800 }));
    svg.appendChild(text(160, 240, "p", { fill: colors.teal, size: 16, weight: 800 }));
    svg.appendChild(text(535, 240, "P = p J^{-1}", { fill: colors.orange, size: 16, weight: 800 }));
  }

  function renderCanonicalForm(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "La misma forma, dos lecturas locales", "Theta no depende de la etiqueta");
    box(svg, 92, 150, 180, 62, "p_i dq^i", { fill: "rgba(14,114,120,0.10)", color: colors.teal, size: 20 });
    box(svg, 488, 150, 180, 62, "P_a dQ^a", { fill: "rgba(209,111,43,0.10)", color: colors.orange, size: 20 });
    svg.appendChild(line(276, 181, 484, 181, { stroke: colors.muted, width: 3, arrow }));
    svg.appendChild(text(380, 132, "cambio de coordenadas", { anchor: "middle", size: 13 }));
    svg.appendChild(text(380, 260, "misma cinta geometrica: Θ", { anchor: "middle", fill: colors.ink, size: 16, weight: 800 }));
  }

  function renderHamiltonianFlow(host) {
    let local;
    const render = () => {
      const { svg, arrow } = createSvg(host, 390);
      const area = { x: 34, y: 34, w: 690, h: 296 };
      panel(svg, area.x, area.y, area.w, area.h, "Curva integral de X_H", local.choice === "oscillator" ? "oscilador: orbita cerrada" : "libre: q avanza, p permanece");
      axes(svg, area, { x: "q", y: "p" });
      const sx = scale([-2, 2], [area.x + 38, area.x + area.w - 34]);
      const sy = scale([-2, 2], [area.y + area.h - 34, area.y + 62]);
      if (local.choice === "oscillator") {
        drawField(svg, area, (q, p) => ({ x: p, y: -q }), { arrow, stroke: "rgba(96,113,128,0.38)" });
        svg.appendChild(svgEl("ellipse", { cx: sx(0), cy: sy(0), rx: sx(1.25) - sx(0), ry: sy(0) - sy(1.25), fill: "none", stroke: colors.teal, "stroke-width": 4 }));
        svg.appendChild(circle(sx(0.55), sy(1.12), 8, { fill: colors.orange }));
        setReadout("hamiltonian-flow", "El punto inicial no elige una formula de segundo orden: sigue una flecha local en fase.");
      } else {
        drawField(svg, area, (q, p) => ({ x: p, y: 0 }), { arrow, stroke: "rgba(96,113,128,0.38)" });
        svg.appendChild(path(`M ${sx(-1.6)} ${sy(0.85)} L ${sx(1.6)} ${sy(0.85)}`, { stroke: colors.teal, width: 4, arrow }));
        svg.appendChild(circle(sx(-0.8), sy(0.85), 8, { fill: colors.orange }));
        setReadout("hamiltonian-flow", "En el caso libre, p queda fijo y q avanza con la flecha que H genera.");
      }
    };
    local = initControls("hamiltonian-flow", { choice: "oscillator" }, render);
    render();
  }

  function renderHNotEnergy(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "Orden conceptual de H", "no leer energia antes de construir el generador");
    box(svg, 90, 150, 110, 54, "H", { size: 22, color: colors.teal });
    box(svg, 276, 150, 130, 54, "X_H", { size: 22, color: colors.teal });
    box(svg, 482, 150, 150, 54, "flujo temporal", { size: 15 });
    svg.appendChild(line(202, 177, 272, 177, { stroke: colors.teal, width: 3, arrow }));
    svg.appendChild(line(408, 177, 478, 177, { stroke: colors.teal, width: 3, arrow }));
    svg.appendChild(path("M 154 236 C 270 300 430 300 548 236", { stroke: colors.orange, width: 3, arrow }));
    svg.appendChild(text(352, 312, "si ∂tH=0, puede leerse como energia conservada", { anchor: "middle", fill: colors.orange, size: 13 }));
  }

  function renderStateToPhase(host) {
    const { svg, arrow } = createSvg(host, 360);
    panel(svg, 34, 34, 692, 264, "Refinar el presente minimo", "de dato de cambio neutral a covector con estructura");
    box(svg, 86, 148, 160, 60, "s=(q, eta)", { color: colors.teal, size: 18 });
    box(svg, 514, 148, 160, 60, "z=(q, p)", { color: colors.orange, size: 18 });
    svg.appendChild(line(250, 178, 510, 178, { stroke: colors.teal, width: 3, arrow }));
    ["Theta", "omega", "generadores"].forEach((label, i) => {
      box(svg, 310 + i * 86, 232, 78, 34, label, { size: 11, fill: "rgba(14,114,120,0.08)", color: colors.muted });
    });
    svg.appendChild(text(380, 122, "añadir estructura de fase", { anchor: "middle", size: 14, weight: 800 }));
  }

  function renderPhaseSpaceGains(host) {
    const { svg } = createSvg(host, 380);
    panel(svg, 34, 34, 692, 278, "Tres ganancias de T*Q", "el soporte donde una funcion puede generar transformaciones");
    [
      ["1", "p covector", "segundo dato con regla dual", 92],
      ["2", "Theta=p dq", "emparejamiento canónico", 312],
      ["3", "omega=dq∧dp", "funciones → campos", 532]
    ].forEach(([n, title, body, x]) => {
      svg.appendChild(circle(x + 70, 130, 24, { fill: "rgba(14,114,120,0.12)", stroke: colors.teal, width: 2 }));
      svg.appendChild(text(x + 70, 137, n, { anchor: "middle", fill: colors.teal, size: 18, weight: 800 }));
      box(svg, x, 176, 140, 58, title, { size: 14 });
      svg.appendChild(text(x + 70, 260, body, { anchor: "middle", size: 12 }));
    });
  }

  const renderers = {
    "state-law-question": renderStateLawQuestion,
    "field-examples": renderFieldExamples,
    "annex-flow": renderAnnexFlow,
    "annex-pushforward": renderAnnexPushforward,
    "annex-bracket": renderAnnexBracket,
    "coordinate-covariance": renderCoordinateCovariance,
    "physical-symmetry": renderPhysicalSymmetry,
    "equivariant-field": renderEquivariantField,
    "spatial-homogeneity": renderSpatialHomogeneity,
    "isotropy-filter": renderIsotropyFilter,
    "time-homogeneity": renderTimeHomogeneity,
    "galilean-relativity": renderGalileanRelativity,
    "galilean-boost": renderGalileanBoost,
    "law-invoice": renderLawInvoice,
    "internal-relation": renderInternalRelation,
    "pendulum-structure": renderPendulumStructure,
    "symmetry-filters": renderSymmetryFilters,
    "symmetry-no-conservation": renderSymmetryNoConservation,
    "chapter2-filter-map": renderChapter2FilterMap,
    "covector-pairing": renderCovectorPairing,
    "covector-rule": renderCovectorRule,
    "canonical-form": renderCanonicalForm,
    "hamiltonian-field": renderHamiltonianField,
    "hamiltonian-flow": renderHamiltonianFlow,
    "h-not-energy": renderHNotEnergy,
    "state-to-phase": renderStateToPhase,
    "phase-space-gains": renderPhaseSpaceGains,
    "generator-lab": renderGeneratorLab,
    "free-hamiltonian-boost": renderFreeHamiltonianBoost,
    "canonical-action": renderCanonicalAction,
    "eliminate-p": renderEliminateP,
    "liouville-cloud": renderLiouvilleCloud,
    "stationary-phase": renderStationaryPhase
  };

  function init() {
    $all("[data-demo]").forEach((host) => {
      const renderer = renderers[host.dataset.demo];
      if (renderer) renderer(host);
    });
    Demo.renderMath?.(document.body);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

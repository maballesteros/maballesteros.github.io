window.addEventListener("DOMContentLoaded", () => {
  renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false }
    ]
  });

  initHistoryFamilySketch();
  initStationaryActionSketch();
  initGhostModel();
});

function initHistoryFamilySketch() {
  const host = document.getElementById("viz-history-family");
  const slider = document.getElementById("history-family-lambda");
  const label = document.getElementById("history-family-lambda-value");
  const resetButton = document.getElementById("reset-history-family");
  if (!host || !slider || !label || !resetButton) return;

  const family = [-1, -0.6, -0.25, 0, 0.35, 0.7, 1];

  function pathPoint(u, lambda) {
    const x = u;
    const base = 0.18 + 0.54 * u;
    const bump = 0.26 * lambda * Math.sin(Math.PI * u);
    const twist = 0.06 * Math.sin(2 * Math.PI * u);
    return { x, y: base + bump + twist };
  }

  function screenPoint(p, originX, originY, w, h, point) {
    return {
      x: originX + point.x * w,
      y: originY + h - point.y * h
    };
  }

  const sketch = (p) => {
    function vizHeight() {
      const width = host.clientWidth;
      if (width < 420) return 250;
      if (width < 640) return 286;
      return 338;
    }

    function curveVertices(originX, originY, w, h, lambda) {
      const pts = [];
      for (let i = 0; i <= 60; i += 1) {
        const u = i / 60;
        pts.push(screenPoint(p, originX, originY, w, h, pathPoint(u, lambda)));
      }
      return pts;
    }

    p.setup = () => {
      const canvas = p.createCanvas(host.clientWidth, vizHeight());
      canvas.parent(host);
      p.pixelDensity(2);
    };

    p.windowResized = () => {
      p.resizeCanvas(host.clientWidth, vizHeight());
    };

    p.draw = () => {
      const lambda = Number(slider.value);
      label.textContent = `λ=${lambda.toFixed(2)}`;

      p.clear();
      p.background(252, 248, 240);

      const tiny = p.width < 430;
      const marginX = 36;
      const marginY = 26;
      const innerW = p.width - marginX * 2;
      const innerH = p.height - marginY * 2;
      const axisY = marginY + innerH - 26;
      const axisX = marginX + 18;

      p.noStroke();
      for (let i = 0; i < 6; i += 1) {
        p.fill(14, 114, 120, 11 - i);
        p.circle(p.width * 0.18, p.height * 0.18, 170 + i * 20);
      }

      p.stroke(27, 40, 48, 45);
      p.strokeWeight(1.3);
      p.line(marginX, axisY, p.width - marginX, axisY);
      p.line(axisX, marginY, axisX, p.height - marginY);

      p.noStroke();
      p.fill(96, 113, 128);
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(tiny ? 10 : 12);
      p.text("t", p.width - marginX + 6, axisY);
      p.text("x", axisX, marginY - 10);

      const originX = axisX + 22;
      const originY = marginY + 10;
      const plotW = innerW - 48;
      const plotH = innerH - 46;

      family.forEach((member) => {
        const pts = curveVertices(originX, originY, plotW, plotH, member);
        p.noFill();
        p.stroke(27, 40, 48, member === 0 ? 55 : 35);
        p.strokeWeight(member === 0 ? 2.2 : 1.4);
        p.beginShape();
        pts.forEach((pt) => p.vertex(pt.x, pt.y));
        p.endShape();
      });

      const selected = curveVertices(originX, originY, plotW, plotH, lambda);
      p.noFill();
      p.stroke(209, 111, 43);
      p.strokeWeight(4);
      p.beginShape();
      selected.forEach((pt) => p.vertex(pt.x, pt.y));
      p.endShape();

      const start = selected[0];
      const end = selected[selected.length - 1];
      p.noStroke();
      p.fill(27, 40, 48);
      p.circle(start.x, start.y, 9);
      p.circle(end.x, end.y, 9);

      p.fill(96, 113, 128);
      p.textSize(tiny ? 10 : 12);
      p.text("t₁", start.x - 14, axisY + 18);
      p.text("t₂", end.x - 6, axisY + 18);
      p.text("x₁", axisX - 26, start.y);
      p.text("x₂", axisX - 26, end.y);

      p.fill(96, 113, 128);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(tiny ? 10 : 12);
      p.text("historias cinemáticamente posibles entre los mismos extremos", marginX + 6, 12);
    };
  };

  new p5(sketch);
  resetButton.addEventListener("click", () => {
    slider.value = "0";
  });
}

function initStationaryActionSketch() {
  const host = document.getElementById("viz-stationary-action");
  const slider = document.getElementById("stationary-epsilon");
  const label = document.getElementById("stationary-epsilon-value");
  const resetButton = document.getElementById("reset-stationary");
  if (!host || !slider || !label || !resetButton) return;

  function pathPoint(u, epsilon) {
    const x = u;
    const base = 0.18 + 0.58 * u;
    const eta = 0.22 * Math.sin(Math.PI * u);
    const reference = 0.05 * Math.sin(2 * Math.PI * u);
    return { x, y: base + reference + epsilon * eta };
  }

  const sketch = (p) => {
    function vizHeight() {
      const width = host.clientWidth;
      if (width < 420) return 260;
      if (width < 640) return 300;
      return 344;
    }

    function drawTrajectoryPanel(panelX, panelY, panelW, panelH, epsilon) {
      p.noStroke();
      p.fill(255, 255, 255, 170);
      p.rect(panelX, panelY, panelW, panelH, 18);

      p.fill(96, 113, 128);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(p.width < 430 ? 10 : 12);
      p.textStyle(p.BOLD);
      p.text("deformación de trayectorias", panelX + 16, panelY + 14);

      const margin = 22;
      const plotX = panelX + margin;
      const plotY = panelY + 34;
      const plotW = panelW - margin * 2;
      const plotH = panelH - 54;

      p.stroke(27, 40, 48, 38);
      p.strokeWeight(1.2);
      p.line(plotX, plotY + plotH, plotX + plotW, plotY + plotH);
      p.line(plotX, plotY, plotX, plotY + plotH);

      [-0.8, -0.35, 0, 0.35, 0.8].forEach((member) => {
        p.noFill();
        p.stroke(27, 40, 48, member === 0 ? 55 : 28);
        p.strokeWeight(member === 0 ? 2.1 : 1.2);
        p.beginShape();
        for (let i = 0; i <= 64; i += 1) {
          const u = i / 64;
          const point = pathPoint(u, member);
          const sx = plotX + point.x * plotW;
          const sy = plotY + plotH - point.y * plotH;
          p.vertex(sx, sy);
        }
        p.endShape();
      });

      p.noFill();
      p.stroke(14, 114, 120);
      p.strokeWeight(3.6);
      p.beginShape();
      for (let i = 0; i <= 64; i += 1) {
        const u = i / 64;
        const point = pathPoint(u, epsilon);
        const sx = plotX + point.x * plotW;
        const sy = plotY + plotH - point.y * plotH;
        p.vertex(sx, sy);
      }
      p.endShape();

      const start = pathPoint(0, 0);
      const end = pathPoint(1, 0);
      p.noStroke();
      p.fill(27, 40, 48);
      p.circle(plotX + start.x * plotW, plotY + plotH - start.y * plotH, 8);
      p.circle(plotX + end.x * plotW, plotY + plotH - end.y * plotH, 8);

      p.fill(96, 113, 128);
      p.textStyle(p.NORMAL);
      p.text("t₁", plotX - 4, plotY + plotH + 10);
      p.text("t₂", plotX + plotW - 10, plotY + plotH + 10);
    }

    function drawActionPanel(panelX, panelY, panelW, panelH, epsilon) {
      p.noStroke();
      p.fill(255, 255, 255, 170);
      p.rect(panelX, panelY, panelW, panelH, 18);

      p.fill(96, 113, 128);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(p.width < 430 ? 10 : 12);
      p.textStyle(p.BOLD);
      p.text("acción como función de ε", panelX + 16, panelY + 14);

      const margin = 22;
      const plotX = panelX + margin;
      const plotY = panelY + 34;
      const plotW = panelW - margin * 2;
      const plotH = panelH - 54;

      const xMin = -1.1;
      const xMax = 1.1;
      const yMin = -0.1;
      const yMax = 1.15;
      const toX = (v) => plotX + ((v - xMin) / (xMax - xMin)) * plotW;
      const toY = (v) => plotY + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

      p.stroke(27, 40, 48, 38);
      p.strokeWeight(1.2);
      p.line(plotX, toY(0), plotX + plotW, toY(0));
      p.line(toX(0), plotY, toX(0), plotY + plotH);

      p.noFill();
      p.stroke(209, 111, 43);
      p.strokeWeight(3);
      p.beginShape();
      for (let i = 0; i <= 80; i += 1) {
        const x = xMin + ((xMax - xMin) * i) / 80;
        const y = 0.82 * x * x + 0.1;
        p.vertex(toX(x), toY(y));
      }
      p.endShape();

      const yVal = 0.82 * epsilon * epsilon + 0.1;
      p.stroke(14, 114, 120, 130);
      p.strokeWeight(1.6);
      p.line(toX(epsilon), toY(0), toX(epsilon), toY(yVal));

      const slope = 1.64 * epsilon;
      const tangentLength = 0.32;
      const x1 = epsilon - tangentLength;
      const x2 = epsilon + tangentLength;
      const y1 = yVal + slope * (x1 - epsilon);
      const y2 = yVal + slope * (x2 - epsilon);

      p.stroke(14, 114, 120);
      p.strokeWeight(2.2);
      p.line(toX(x1), toY(y1), toX(x2), toY(y2));

      p.noStroke();
      p.fill(14, 114, 120);
      p.circle(toX(epsilon), toY(yVal), 10);

      p.fill(96, 113, 128);
      p.textStyle(p.NORMAL);
      p.text("ε", plotX + plotW - 8, toY(0) + 8);
      p.text("Φ", toX(0) + 8, plotY + 2);
      p.text("ε = 0 → derivada nula", plotX + 12, plotY + plotH - 18);
    }

    p.setup = () => {
      const canvas = p.createCanvas(host.clientWidth, vizHeight());
      canvas.parent(host);
      p.pixelDensity(2);
    };

    p.windowResized = () => {
      p.resizeCanvas(host.clientWidth, vizHeight());
    };

    p.draw = () => {
      const epsilon = Number(slider.value);
      label.textContent = `ε=${epsilon.toFixed(2)}`;

      p.clear();
      p.background(252, 248, 240);

      const stacked = p.width < 760;
      const margin = 16;
      const gap = 16;
      const panelW = stacked ? p.width - margin * 2 : (p.width - margin * 2 - gap) / 2;
      const panelH = stacked ? (p.height - margin * 2 - gap) / 2 : p.height - margin * 2;
      const leftX = margin;
      const leftY = margin;
      const rightX = stacked ? margin : margin + panelW + gap;
      const rightY = stacked ? margin + panelH + gap : margin;

      drawTrajectoryPanel(leftX, leftY, panelW, panelH, epsilon);
      drawActionPanel(rightX, rightY, panelW, panelH, epsilon);
    };
  };

  new p5(sketch);
  resetButton.addEventListener("click", () => {
    slider.value = "0";
  });
}

function initGhostModel() {
  const host = document.getElementById("viz-ghost-model");
  const slider = document.getElementById("ghost-coupling");
  const label = document.getElementById("ghost-coupling-value");
  const resetButton = document.getElementById("reset-ghost-model");
  const perturbButton = document.getElementById("perturb-ghost-model");
  if (!host || !slider || !label || !resetButton || !perturbButton) return;

  const controller = {
    w1: 1,
    w2: 1.08,
    state: null,
    history: [],
    reset() {
      this.state = { q1: 0.48, v1: 0, q2: 0.05, v2: 0 };
      this.history = [];
    },
    perturb() {
      this.state.q2 += 0.09;
      this.state.v2 -= 0.04;
    }
  };

  function deriv(state, epsilon, w1, w2) {
    return {
      q1: state.v1,
      v1: -(w1 * w1) * state.q1 - epsilon * state.q2,
      q2: state.v2,
      v2: -(w2 * w2) * state.q2 + epsilon * state.q1
    };
  }

  function addState(a, b, factor) {
    return {
      q1: a.q1 + b.q1 * factor,
      v1: a.v1 + b.v1 * factor,
      q2: a.q2 + b.q2 * factor,
      v2: a.v2 + b.v2 * factor
    };
  }

  function rk4Step(state, epsilon, w1, w2, dt) {
    const k1 = deriv(state, epsilon, w1, w2);
    const k2 = deriv(addState(state, k1, dt / 2), epsilon, w1, w2);
    const k3 = deriv(addState(state, k2, dt / 2), epsilon, w1, w2);
    const k4 = deriv(addState(state, k3, dt), epsilon, w1, w2);

    return {
      q1: state.q1 + (dt / 6) * (k1.q1 + 2 * k2.q1 + 2 * k3.q1 + k4.q1),
      v1: state.v1 + (dt / 6) * (k1.v1 + 2 * k2.v1 + 2 * k3.v1 + k4.v1),
      q2: state.q2 + (dt / 6) * (k1.q2 + 2 * k2.q2 + 2 * k3.q2 + k4.q2),
      v2: state.v2 + (dt / 6) * (k1.v2 + 2 * k2.v2 + 2 * k3.v2 + k4.v2)
    };
  }

  function energies(state, epsilon, w1, w2) {
    const ePlus = 0.5 * (state.v1 * state.v1 + (w1 * w1) * state.q1 * state.q1);
    const eMinus = -0.5 * (state.v2 * state.v2 + (w2 * w2) * state.q2 * state.q2);
    const eInt = epsilon * state.q1 * state.q2;
    return {
      ePlus,
      eMinus,
      eInt,
      eTotal: ePlus + eMinus + eInt
    };
  }

  controller.reset();

  const sketch = (p) => {
    function vizHeight() {
      const width = host.clientWidth;
      if (width < 420) return 318;
      if (width < 760) return 360;
      return 382;
    }

    function drawOscillator(panelX, panelY, panelW, panelH, labelText, displacement, tint) {
      const y = panelY + panelH / 2;
      const anchorX = panelX + 28;
      const restX = panelX + panelW * 0.56;
      const amplitude = panelW * 0.2;
      const massX = restX + displacement * amplitude;

      p.noStroke();
      p.fill(255, 255, 255, 150);
      p.rect(panelX + 10, panelY + 10, panelW - 20, panelH - 20, 16);

      p.stroke(27, 40, 48, 55);
      p.strokeWeight(1.4);
      p.line(anchorX, y - 30, anchorX, y + 30);

      p.noFill();
      p.stroke(tint);
      p.strokeWeight(3);
      p.beginShape();
      const segments = 12;
      const usable = Math.max(18, massX - anchorX - 22);
      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        const x = anchorX + 12 + t * usable;
        const offset = i === 0 || i === segments ? 0 : (i % 2 === 0 ? -11 : 11);
        p.vertex(x, y + offset);
      }
      p.endShape();

      p.stroke(tint);
      p.strokeWeight(3);
      p.line(anchorX, y, massX - 24, y);
      p.noStroke();
      p.fill(tint);
      p.rect(massX - 24, y - 18, 48, 36, 10);

      p.fill(27, 40, 48);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(p.width < 430 ? 11 : 13);
      p.textStyle(p.BOLD);
      p.text(labelText, panelX + 16, panelY + 16);
    }

    function drawBars(panelX, panelY, panelW, panelH, current) {
      const maxEnergy = Math.max(
        0.12,
        ...controller.history.flatMap((entry) => [
          Math.abs(entry.ePlus),
          Math.abs(entry.eMinus),
          Math.abs(entry.eTotal)
        ])
      );

      const centerY = panelY + panelH * 0.6;
      const scale = (panelH * 0.34) / maxEnergy;
      const barW = panelW * 0.17;
      const centers = [
        panelX + panelW * 0.22,
        panelX + panelW * 0.5,
        panelX + panelW * 0.78
      ];
      const values = [current.ePlus, current.eMinus, current.eTotal];
      const fills = ["#0e7278", "#b6421f", "#d16f2b"];
      const labels = ["E+", "E−", "Etotal"];

      p.stroke(27, 40, 48, 35);
      p.strokeWeight(1.4);
      p.line(panelX + 20, centerY, panelX + panelW - 20, centerY);

      centers.forEach((cx, index) => {
        const value = values[index];
        const h = value * scale;
        p.noStroke();
        p.fill(255, 255, 255, 150);
        p.rect(cx - barW / 2, panelY + 18, barW, panelH - 36, 14);
        p.fill(fills[index]);
        if (h >= 0) {
          p.rect(cx - barW / 2, centerY - h, barW, h, 12);
        } else {
          p.rect(cx - barW / 2, centerY, barW, -h, 12);
        }
        p.fill(27, 40, 48);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(p.width < 430 ? 11 : 12);
        p.textStyle(p.BOLD);
        p.text(labels[index], cx, panelY + panelH - 28);
        p.fill(96, 113, 128);
        p.textStyle(p.NORMAL);
        p.text(value.toFixed(2), cx, panelY + panelH - 14);
      });
    }

    function drawEnergyTrace(panelX, panelY, panelW, panelH) {
      const trace = controller.history.slice(-180);
      if (!trace.length) return;

      const maxEnergy = Math.max(
        0.12,
        ...trace.flatMap((entry) => [
          Math.abs(entry.ePlus),
          Math.abs(entry.eMinus),
          Math.abs(entry.eTotal)
        ])
      );
      const toX = (index) => panelX + 16 + (index / Math.max(trace.length - 1, 1)) * (panelW - 32);
      const toY = (value) => panelY + panelH / 2 - (value / maxEnergy) * (panelH * 0.42);

      p.stroke(27, 40, 48, 30);
      p.strokeWeight(1.2);
      p.line(panelX + 12, panelY + panelH / 2, panelX + panelW - 12, panelY + panelH / 2);

      [
        { key: "ePlus", color: "#0e7278" },
        { key: "eMinus", color: "#b6421f" },
        { key: "eTotal", color: "#d16f2b" }
      ].forEach(({ key, color }) => {
        p.noFill();
        p.stroke(color);
        p.strokeWeight(key === "eTotal" ? 2.8 : 2);
        p.beginShape();
        trace.forEach((entry, index) => {
          p.vertex(toX(index), toY(entry[key]));
        });
        p.endShape();
      });
    }

    p.setup = () => {
      const canvas = p.createCanvas(host.clientWidth, vizHeight());
      canvas.parent(host);
      p.pixelDensity(2);
    };

    p.windowResized = () => {
      p.resizeCanvas(host.clientWidth, vizHeight());
    };

    p.draw = () => {
      const epsilon = Number(slider.value);
      label.textContent = `ε=${epsilon.toFixed(3)}`;

      const dt = Math.min(p.deltaTime * 0.001, 1 / 40);
      const substeps = 6;
      for (let i = 0; i < substeps; i += 1) {
        controller.state = rk4Step(controller.state, epsilon, controller.w1, controller.w2, dt / substeps);
      }

      const current = energies(controller.state, epsilon, controller.w1, controller.w2);
      controller.history.push(current);
      if (controller.history.length > 220) controller.history.shift();

      p.clear();
      p.background(252, 248, 240);

      const stacked = p.width < 760;
      const margin = 14;
      const gap = 14;
      const panelW = stacked ? p.width - margin * 2 : (p.width - margin * 2 - gap) / 2;
      const panelH = stacked ? (p.height - margin * 2 - gap) / 2 : p.height - margin * 2;
      const left = { x: margin, y: margin };
      const right = stacked
        ? { x: margin, y: margin + panelH + gap }
        : { x: margin + panelW + gap, y: margin };

      [left, right].forEach((panel) => {
        p.noStroke();
        p.fill(255, 255, 255, 172);
        p.rect(panel.x, panel.y, panelW, panelH, 20);
      });

      p.fill(96, 113, 128);
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(p.width < 430 ? 10 : 12);
      p.textStyle(p.BOLD);
      p.text("modos acoplados", left.x + 16, left.y + 14);
      p.text("energías", right.x + 16, right.y + 14);

      drawOscillator(left.x + 8, left.y + 34, panelW - 16, (panelH - 48) / 2, "modo positivo", controller.state.q1, "#0e7278");
      drawOscillator(left.x + 8, left.y + 34 + (panelH - 48) / 2, panelW - 16, (panelH - 48) / 2, "modo negativo", controller.state.q2, "#b6421f");

      drawBars(right.x + 8, right.y + 34, panelW - 16, panelH * 0.55, current);
      drawEnergyTrace(right.x + 8, right.y + panelH * 0.57, panelW - 16, panelH * 0.33);
    };
  };

  new p5(sketch);
  resetButton.addEventListener("click", () => {
    controller.reset();
  });
  perturbButton.addEventListener("click", () => {
    controller.perturb();
  });
}

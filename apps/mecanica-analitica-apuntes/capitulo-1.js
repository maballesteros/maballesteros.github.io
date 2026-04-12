      let noInertiaController;
      let realWorldController;

      window.addEventListener("DOMContentLoaded", () => {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "$", right: "$", display: false }
          ],
          macros: {
            "\\dv": "\\frac{d#1}{d#2}",
            "\\dddot": "\\dot{\\ddot{#1}}"
          }
        });

        initSystemVsConfigurationViz();
        initModelPruningViz();
        initPhotoVsStateSketch();
        initPendulumConfigViz();
        initLawRuleViz();
        initReversibilitySketch();
        initNoInertiaSketch();
        initMemoryWorld();
        initRealWorldSketch();
        initStateSliceSketch();
        initPhaseProjectionSketch();
      });

      function renderInlineMath(container) {
        renderMathInElement(container, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "$", right: "$", display: false }
          ],
          macros: {
            "\\dv": "\\frac{d#1}{d#2}",
            "\\dddot": "\\dot{\\ddot{#1}}"
          }
        });
      }

      function drawArrow(p, x1, y1, x2, y2, color, weight = 1.6) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const size = 7;
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

      function initSystemVsConfigurationViz() {
        const host = document.getElementById("viz-system-config");
        const resetButton = document.getElementById("reset-system-config");
        const caption = document.getElementById("system-config-caption");
        const particleButton = document.getElementById("system-case-particle");
        const pendulumButton = document.getElementById("system-case-pendulum");
        const doubleButton = document.getElementById("system-case-double");

        if (!host || !resetButton || !caption || !particleButton || !pendulumButton || !doubleButton) return;

        const labels = {
          particle: "partícula en una línea",
          pendulum: "péndulo simple",
          double: "péndulo doble"
        };

        const controller = {
          mode: "particle",
          setMode(mode) {
            this.mode = mode;
            syncUi();
          },
          reset() {
            this.mode = "particle";
            syncUi();
          }
        };

        function syncButtons() {
          setButtonVariant(particleButton, controller.mode === "particle");
          setButtonVariant(pendulumButton, controller.mode === "pendulum");
          setButtonVariant(doubleButton, controller.mode === "double");
        }

        function panelFrame(svg, x, y, w, h, title, subtitle) {
          svg
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", w)
            .attr("height", h)
            .attr("rx", 22)
            .attr("fill", "rgba(255,255,255,0.62)")
            .attr("stroke", "rgba(27,40,48,0.08)");

          svg
            .append("text")
            .attr("x", x + 18)
            .attr("y", y + 24)
            .attr("fill", "#607180")
            .attr("font-size", 12)
            .attr("font-weight", 700)
            .text(title);

          svg
            .append("text")
            .attr("x", x + 18)
            .attr("y", y + 46)
            .attr("fill", "rgba(96,113,128,0.86)")
            .attr("font-size", 11)
            .text(subtitle);
        }

        function render() {
          host.innerHTML = "";
          const width = host.clientWidth;
          const stacked = width < 720;
          const height = stacked ? 470 : 320;
          const margin = 18;
          const gap = 18;
          const panelWidth = stacked ? width - margin * 2 : (width - margin * 2 - gap) / 2;
          const panelHeight = stacked ? (height - margin * 2 - gap) / 2 : height - margin * 2;
          const leftTop = { x: margin, y: margin };
          const rightTop = stacked
            ? { x: margin, y: margin + panelHeight + gap }
            : { x: margin + panelWidth + gap, y: margin };

          const svg = d3
            .select(host)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          panelFrame(svg, leftTop.x, leftTop.y, panelWidth, panelHeight, "sistema", "qué parte del mundo decides estudiar");
          panelFrame(svg, rightTop.x, rightTop.y, panelWidth, panelHeight, "configuración", "cómo queda colocado ese sistema");

          const mode = controller.mode;
          caption.textContent = labels[mode];

          const lineY = leftTop.y + panelHeight * 0.58;
          const rightLineY = rightTop.y + panelHeight * 0.58;

          function polarPoint(cx, cy, radius, theta) {
            return {
              x: cx + radius * Math.sin(theta),
              y: cy + radius * Math.cos(theta)
            };
          }

          if (mode === "particle") {
            svg
              .append("line")
              .attr("x1", leftTop.x + 24)
              .attr("x2", leftTop.x + panelWidth - 24)
              .attr("y1", lineY)
              .attr("y2", lineY)
              .attr("stroke", "rgba(27,40,48,0.62)")
              .attr("stroke-width", 2);

            svg
              .append("circle")
              .attr("cx", leftTop.x + panelWidth * 0.54)
              .attr("cy", lineY)
              .attr("r", 9)
              .attr("fill", "#d16f2b");

            svg
              .append("text")
              .attr("x", leftTop.x + 18)
              .attr("y", leftTop.y + panelHeight - 22)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("una partícula sobre una línea");

            svg
              .append("line")
              .attr("x1", rightTop.x + 24)
              .attr("x2", rightTop.x + panelWidth - 24)
              .attr("y1", rightLineY)
              .attr("y2", rightLineY)
              .attr("stroke", "rgba(27,40,48,0.62)")
              .attr("stroke-width", 2);

            svg
              .append("line")
              .attr("x1", rightTop.x + panelWidth * 0.54)
              .attr("x2", rightTop.x + panelWidth * 0.54)
              .attr("y1", rightLineY - 16)
              .attr("y2", rightLineY + 16)
              .attr("stroke", "#0e7278")
              .attr("stroke-width", 2.5);

            svg
              .append("text")
              .attr("x", rightTop.x + panelWidth * 0.54 - 6)
              .attr("y", rightLineY + 34)
              .attr("fill", "#0e7278")
              .attr("font-size", 14)
              .text("x");
          }

          if (mode === "pendulum") {
            const leftPivot = { x: leftTop.x + panelWidth * 0.48, y: leftTop.y + panelHeight * 0.22 };
            const rightPivot = { x: rightTop.x + panelWidth * 0.48, y: rightTop.y + panelHeight * 0.22 };
            const radius = Math.min(panelWidth, panelHeight) * 0.34;
            const theta = 0.62;
            const leftBob = polarPoint(leftPivot.x, leftPivot.y, radius, theta);
            const rightBob = polarPoint(rightPivot.x, rightPivot.y, radius, theta);

            svg
              .append("circle")
              .attr("cx", leftPivot.x)
              .attr("cy", leftPivot.y)
              .attr("r", 5.5)
              .attr("fill", "#1b2830");
            svg
              .append("line")
              .attr("x1", leftPivot.x)
              .attr("y1", leftPivot.y)
              .attr("x2", leftBob.x)
              .attr("y2", leftBob.y)
              .attr("stroke", "#1b2830")
              .attr("stroke-width", 3);
            svg
              .append("circle")
              .attr("cx", leftBob.x)
              .attr("cy", leftBob.y)
              .attr("r", 9)
              .attr("fill", "#d16f2b");

            svg
              .append("line")
              .attr("x1", rightPivot.x)
              .attr("x2", rightPivot.x)
              .attr("y1", rightPivot.y)
              .attr("y2", rightTop.y + panelHeight - 26)
              .attr("stroke", "rgba(27,40,48,0.24)")
              .attr("stroke-dasharray", "6 6");
            svg
              .append("circle")
              .attr("cx", rightPivot.x)
              .attr("cy", rightPivot.y)
              .attr("r", 5.5)
              .attr("fill", "#1b2830");
            svg
              .append("line")
              .attr("x1", rightPivot.x)
              .attr("y1", rightPivot.y)
              .attr("x2", rightBob.x)
              .attr("y2", rightBob.y)
              .attr("stroke", "#1b2830")
              .attr("stroke-width", 3);
            svg
              .append("circle")
              .attr("cx", rightBob.x)
              .attr("cy", rightBob.y)
              .attr("r", 9)
              .attr("fill", "#0e7278");
            svg
              .append("path")
              .attr(
                "d",
                `M ${rightPivot.x} ${rightPivot.y + radius * 0.24} A ${radius * 0.24} ${radius * 0.24} 0 0 1 ${
                  rightPivot.x + radius * 0.14
                } ${rightPivot.y + radius * 0.18}`
              )
              .attr("fill", "none")
              .attr("stroke", "#0e7278")
              .attr("stroke-width", 2.5);
            svg
              .append("text")
              .attr("x", rightPivot.x + radius * 0.16)
              .attr("y", rightPivot.y + radius * 0.2)
              .attr("fill", "#0e7278")
              .attr("font-size", 14)
              .text("θ");
          }

          if (mode === "double") {
            const l1 = Math.min(panelWidth, panelHeight) * 0.24;
            const l2 = Math.min(panelWidth, panelHeight) * 0.2;
            const theta1 = 0.56;
            const theta2 = 0.34;
            const leftPivot = { x: leftTop.x + panelWidth * 0.36, y: leftTop.y + panelHeight * 0.22 };
            const rightPivot = { x: rightTop.x + panelWidth * 0.34, y: rightTop.y + panelHeight * 0.22 };
            const leftBob1 = polarPoint(leftPivot.x, leftPivot.y, l1, theta1);
            const leftBob2 = polarPoint(leftBob1.x, leftBob1.y, l2, theta2);
            const rightBob1 = polarPoint(rightPivot.x, rightPivot.y, l1, theta1);
            const rightBob2 = polarPoint(rightBob1.x, rightBob1.y, l2, theta2);

            [
              [leftPivot, leftBob1, "#1b2830"],
              [leftBob1, leftBob2, "#1b2830"],
              [rightPivot, rightBob1, "#1b2830"],
              [rightBob1, rightBob2, "#1b2830"]
            ].forEach(([a, b, color]) => {
              svg
                .append("line")
                .attr("x1", a.x)
                .attr("y1", a.y)
                .attr("x2", b.x)
                .attr("y2", b.y)
                .attr("stroke", color)
                .attr("stroke-width", 3);
            });

            [
              [leftPivot.x, leftPivot.y, "#1b2830", 5.5],
              [leftBob1.x, leftBob1.y, "#d16f2b", 8.5],
              [leftBob2.x, leftBob2.y, "#0e7278", 8.5],
              [rightPivot.x, rightPivot.y, "#1b2830", 5.5],
              [rightBob1.x, rightBob1.y, "#d16f2b", 8.5],
              [rightBob2.x, rightBob2.y, "#0e7278", 8.5]
            ].forEach(([cx, cy, fill, r]) => {
              svg.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r).attr("fill", fill);
            });

            svg
              .append("line")
              .attr("x1", rightPivot.x)
              .attr("x2", rightPivot.x)
              .attr("y1", rightPivot.y)
              .attr("y2", rightTop.y + panelHeight - 24)
              .attr("stroke", "rgba(27,40,48,0.22)")
              .attr("stroke-dasharray", "6 6");
            svg
              .append("line")
              .attr("x1", rightBob1.x)
              .attr("x2", rightBob1.x)
              .attr("y1", rightBob1.y)
              .attr("y2", rightTop.y + panelHeight - 24)
              .attr("stroke", "rgba(27,40,48,0.18)")
              .attr("stroke-dasharray", "6 6");
            svg
              .append("text")
              .attr("x", rightPivot.x + l1 * 0.18)
              .attr("y", rightPivot.y + l1 * 0.2)
              .attr("fill", "#0e7278")
              .attr("font-size", 13)
              .attr("font-weight", 700)
              .text("θ₁");
            svg
              .append("text")
              .attr("x", rightBob1.x + l2 * 0.12)
              .attr("y", rightBob1.y + l2 * 0.18)
              .attr("fill", "#d16f2b")
              .attr("font-size", 13)
              .attr("font-weight", 700)
              .text("θ₂");
          }

          svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", height - 14)
            .attr("text-anchor", "middle")
            .attr("fill", "#607180")
            .attr("font-size", 12)
            .text("primero decides el sistema; después eliges las variables que fijan su configuración");
        }

        function syncUi() {
          syncButtons();
          render();
        }

        particleButton.addEventListener("click", () => controller.setMode("particle"));
        pendulumButton.addEventListener("click", () => controller.setMode("pendulum"));
        doubleButton.addEventListener("click", () => controller.setMode("double"));
        resetButton.addEventListener("click", () => controller.reset());
        window.addEventListener("resize", render);
        syncUi();
      }

      function initModelPruningViz() {
        const host = document.getElementById("viz-model-pruning");
        const resetButton = document.getElementById("reset-model-pruning");
        const dragButton = document.getElementById("toggle-model-drag");
        const supportButton = document.getElementById("toggle-model-support");
        const elasticityButton = document.getElementById("toggle-model-elasticity");
        const caption = document.getElementById("model-pruning-caption");

        if (!host || !resetButton || !dragButton || !supportButton || !elasticityButton || !caption) return;

        const controller = {
          drag: true,
          support: true,
          elasticity: true,
          reset() {
            this.drag = true;
            this.support = true;
            this.elasticity = true;
            syncUi();
          }
        };

        function syncButtons() {
          setButtonVariant(dragButton, controller.drag);
          setButtonVariant(supportButton, controller.support);
          setButtonVariant(elasticityButton, controller.elasticity);
        }

        function syncCaption() {
          const active = [];
          if (controller.drag) active.push("aire");
          if (controller.support) active.push("soporte");
          if (controller.elasticity) active.push("elasticidad");
          caption.textContent = active.length
            ? `efectos activos en el péndulo real: ${active.join(", ")}`
            : "solo queda visible la estructura mínima del modelo";
        }

        function render() {
          host.innerHTML = "";
          const width = host.clientWidth;
          const stacked = width < 760;
          const height = stacked ? 470 : 320;
          const margin = 18;
          const gap = 18;
          const panelWidth = stacked ? width - margin * 2 : (width - margin * 2 - gap) / 2;
          const panelHeight = stacked ? (height - margin * 2 - gap) / 2 : height - margin * 2;
          const leftTop = { x: margin, y: margin };
          const rightTop = stacked
            ? { x: margin, y: margin + panelHeight + gap }
            : { x: margin + panelWidth + gap, y: margin };

          const svg = d3
            .select(host)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          function frame(top, title, subtitle) {
            svg
              .append("rect")
              .attr("x", top.x)
              .attr("y", top.y)
              .attr("width", panelWidth)
              .attr("height", panelHeight)
              .attr("rx", 22)
              .attr("fill", "rgba(255,255,255,0.62)")
              .attr("stroke", "rgba(27,40,48,0.08)");
            svg
              .append("text")
              .attr("x", top.x + 18)
              .attr("y", top.y + 24)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .attr("font-weight", 700)
              .text(title);
            svg
              .append("text")
              .attr("x", top.x + 18)
              .attr("y", top.y + 46)
              .attr("fill", "rgba(96,113,128,0.86)")
              .attr("font-size", 11)
              .text(subtitle);
          }

          frame(leftTop, "péndulo real", "efectos secundarios presentes");
          frame(rightTop, "modelo simple", "solo se conserva lo esencial");

          const theta = 0.58;

          function pendulum(top, colorBob, simple) {
            const pivot = { x: top.x + panelWidth * 0.48, y: top.y + panelHeight * 0.22 };
            const radius = Math.min(panelWidth, panelHeight) * 0.34;
            const bob = {
              x: pivot.x + radius * Math.sin(theta),
              y: pivot.y + radius * Math.cos(theta)
            };

            svg
              .append("line")
              .attr("x1", pivot.x - 34)
              .attr("x2", pivot.x + 34)
              .attr("y1", pivot.y)
              .attr("y2", pivot.y)
              .attr("stroke", "rgba(27,40,48,0.7)")
              .attr("stroke-width", 3);

            if (!simple && controller.support) {
              svg
                .append("line")
                .attr("x1", pivot.x - 30)
                .attr("x2", pivot.x + 30)
                .attr("y1", pivot.y - 10)
                .attr("y2", pivot.y - 16)
                .attr("stroke", "rgba(14,114,120,0.55)")
                .attr("stroke-width", 2.5);
              svg
                .append("text")
                .attr("x", top.x + 18)
                .attr("y", top.y + panelHeight - 56)
                .attr("fill", "#0e7278")
                .attr("font-size", 11)
                .text("vibración del soporte");
            }

            if (!simple && controller.elasticity) {
              const midX = (pivot.x + bob.x) / 2;
              const midY = (pivot.y + bob.y) / 2;
              svg
                .append("path")
                .attr(
                  "d",
                  `M ${pivot.x} ${pivot.y}
                   Q ${midX - 12} ${midY - 12} ${midX} ${midY}
                   Q ${midX + 12} ${midY + 12} ${bob.x} ${bob.y}`
                )
                .attr("fill", "none")
                .attr("stroke", "#b6421f")
                .attr("stroke-width", 3);
            } else {
              svg
                .append("line")
                .attr("x1", pivot.x)
                .attr("y1", pivot.y)
                .attr("x2", bob.x)
                .attr("y2", bob.y)
                .attr("stroke", "#1b2830")
                .attr("stroke-width", 3);
            }

            svg.append("circle").attr("cx", pivot.x).attr("cy", pivot.y).attr("r", 5.5).attr("fill", "#1b2830");
            svg.append("circle").attr("cx", bob.x).attr("cy", bob.y).attr("r", 9).attr("fill", colorBob);

            if (!simple && controller.drag) {
              [0, 1, 2].forEach((index) => {
                const y = bob.y - 18 + index * 14;
                svg
                  .append("line")
                  .attr("x1", bob.x + 18)
                  .attr("x2", bob.x + 48)
                  .attr("y1", y)
                  .attr("y2", y)
                  .attr("stroke", "#d16f2b")
                  .attr("stroke-width", 2);
              });
              svg
                .append("text")
                .attr("x", bob.x + 18)
                .attr("y", bob.y + 34)
                .attr("fill", "#d16f2b")
                .attr("font-size", 11)
                .text("rozamiento con el aire");
            }

            if (simple) {
              svg
                .append("line")
                .attr("x1", pivot.x)
                .attr("x2", pivot.x)
                .attr("y1", pivot.y)
                .attr("y2", top.y + panelHeight - 24)
                .attr("stroke", "rgba(27,40,48,0.22)")
                .attr("stroke-dasharray", "6 6");
              svg
                .append("path")
                .attr(
                  "d",
                  `M ${pivot.x} ${pivot.y + radius * 0.24} A ${radius * 0.24} ${radius * 0.24} 0 0 1 ${
                    pivot.x + radius * 0.13
                  } ${pivot.y + radius * 0.18}`
                )
                .attr("fill", "none")
                .attr("stroke", "#0e7278")
                .attr("stroke-width", 2.5);
              svg
                .append("text")
                .attr("x", pivot.x + radius * 0.16)
                .attr("y", pivot.y + radius * 0.2)
                .attr("fill", "#0e7278")
                .attr("font-size", 14)
                .attr("font-weight", 700)
                .text("θ(t)");
              svg
                .append("text")
                .attr("x", top.x + 18)
                .attr("y", top.y + panelHeight - 54)
                .attr("fill", "#607180")
                .attr("font-size", 11)
                .text("variables retenidas: θ(t), ℓ y gravedad");
            }
          }

          pendulum(leftTop, "#d16f2b", false);
          pendulum(rightTop, "#0e7278", true);
        }

        function syncUi() {
          syncButtons();
          syncCaption();
          render();
        }

        dragButton.addEventListener("click", () => {
          controller.drag = !controller.drag;
          syncUi();
        });
        supportButton.addEventListener("click", () => {
          controller.support = !controller.support;
          syncUi();
        });
        elasticityButton.addEventListener("click", () => {
          controller.elasticity = !controller.elasticity;
          syncUi();
        });
        resetButton.addEventListener("click", () => controller.reset());
        window.addEventListener("resize", render);
        syncUi();
      }

      function initLawRuleViz() {
        const host = document.getElementById("viz-law-rule");
        const resetButton = document.getElementById("reset-law-rule");
        const flowButton = document.getElementById("law-mode-flow");
        const mapButton = document.getElementById("law-mode-map");
        const historiesButton = document.getElementById("law-mode-histories");
        const caption = document.getElementById("law-mode-caption");

        if (!host || !resetButton || !flowButton || !mapButton || !historiesButton || !caption) return;

        const labels = {
          flow: "continuación local a partir del presente",
          map: "salto discreto de un estado al siguiente",
          histories: "selección global entre historias completas"
        };

        const controller = {
          mode: "flow",
          setMode(mode) {
            this.mode = mode;
            syncUi();
          },
          reset() {
            this.mode = "flow";
            syncUi();
          }
        };

        function syncButtons() {
          setButtonVariant(flowButton, controller.mode === "flow");
          setButtonVariant(mapButton, controller.mode === "map");
          setButtonVariant(historiesButton, controller.mode === "histories");
        }

        function render() {
          host.innerHTML = "";
          const width = host.clientWidth;
          const height = width < 720 ? 380 : 320;
          const svg = d3
            .select(host)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          svg
            .append("rect")
            .attr("x", 18)
            .attr("y", 18)
            .attr("width", width - 36)
            .attr("height", height - 36)
            .attr("rx", 22)
            .attr("fill", "rgba(255,255,255,0.62)")
            .attr("stroke", "rgba(27,40,48,0.08)");

          const titleMap = {
            flow: "ecuación diferencial",
            map: "mapa discreto",
            histories: "historias completas"
          };

          svg
            .append("text")
            .attr("x", 40)
            .attr("y", 48)
            .attr("fill", "#607180")
            .attr("font-size", 12)
            .attr("font-weight", 700)
            .text(titleMap[controller.mode]);

          if (controller.mode === "flow") {
            const axisY = height * 0.55;
            const scaleX = d3.scaleLinear().domain([-1.8, 1.8]).range([56, width - 56]);
            const x0 = 1.1;
            const x1 = 0.8;

            svg
              .append("text")
              .attr("x", 40)
              .attr("y", 78)
              .attr("fill", "#1b2830")
              .attr("font-size", 24)
              .text("ẋ = −γx");

            svg
              .append("line")
              .attr("x1", 56)
              .attr("x2", width - 56)
              .attr("y1", axisY)
              .attr("y2", axisY)
              .attr("stroke", "rgba(27,40,48,0.52)")
              .attr("stroke-width", 2);

            [-1.4, -0.8, -0.2].forEach((value) => {
              svg
                .append("line")
                .attr("x1", scaleX(value))
                .attr("x2", scaleX(value + 0.24))
                .attr("y1", axisY - 24)
                .attr("y2", axisY - 24)
                .attr("stroke", "rgba(96,113,128,0.7)")
                .attr("stroke-width", 2);
            });
            [0.2, 0.8, 1.4].forEach((value) => {
              svg
                .append("line")
                .attr("x1", scaleX(value))
                .attr("x2", scaleX(value - 0.24))
                .attr("y1", axisY - 24)
                .attr("y2", axisY - 24)
                .attr("stroke", "rgba(96,113,128,0.7)")
                .attr("stroke-width", 2);
            });

            svg.append("circle").attr("cx", scaleX(x0)).attr("cy", axisY).attr("r", 10).attr("fill", "#d16f2b");
            svg.append("circle").attr("cx", scaleX(x1)).attr("cy", axisY).attr("r", 10).attr("fill", "#0e7278");
            svg
              .append("line")
              .attr("x1", scaleX(x0))
              .attr("x2", scaleX(x1))
              .attr("y1", axisY + 28)
              .attr("y2", axisY + 28)
              .attr("stroke", "#0e7278")
              .attr("stroke-width", 3);
            svg
              .append("text")
              .attr("x", scaleX(x0) - 10)
              .attr("y", axisY + 54)
              .attr("fill", "#d16f2b")
              .attr("font-size", 12)
              .text("x(t₀)");
            svg
              .append("text")
              .attr("x", scaleX(x1) - 18)
              .attr("y", axisY + 54)
              .attr("fill", "#0e7278")
              .attr("font-size", 12)
              .text("x(t₀+dt)");
            svg
              .append("text")
              .attr("x", 40)
              .attr("y", height - 36)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("la ley local asigna al presente un cambio inmediato");
          }

          if (controller.mode === "map") {
            const values = [1.1, 0.66, 0.4];
            const scaleX = d3.scaleLinear().domain([-1.2, 1.4]).range([70, width - 80]);
            const axisY = height * 0.58;

            svg
              .append("text")
              .attr("x", 40)
              .attr("y", 78)
              .attr("fill", "#1b2830")
              .attr("font-size", 24)
              .text("xₙ₊₁ = 0.6 xₙ");

            svg
              .append("line")
              .attr("x1", 70)
              .attr("x2", width - 70)
              .attr("y1", axisY)
              .attr("y2", axisY)
              .attr("stroke", "rgba(27,40,48,0.52)")
              .attr("stroke-width", 2);

            values.forEach((value, index) => {
              const x = scaleX(value);
              const color = index === 0 ? "#d16f2b" : index === 1 ? "#0e7278" : "#b6421f";
              svg.append("circle").attr("cx", x).attr("cy", axisY).attr("r", 10).attr("fill", color);
              svg
                .append("text")
                .attr("x", x - 18)
                .attr("y", axisY + 54)
                .attr("fill", color)
                .attr("font-size", 12)
                .text(index === 0 ? "xₙ" : index === 1 ? "xₙ₊₁" : "xₙ₊₂");
              if (index < values.length - 1) {
                svg
                  .append("line")
                  .attr("x1", x)
                  .attr("x2", scaleX(values[index + 1]))
                  .attr("y1", axisY + 26)
                  .attr("y2", axisY + 26)
                  .attr("stroke", "rgba(96,113,128,0.8)")
                  .attr("stroke-width", 3);
              }
            });

            svg
              .append("text")
              .attr("x", 40)
              .attr("y", height - 36)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("aquí la ley no deriva: actualiza el estado en pasos discretos");
          }

          if (controller.mode === "histories") {
            const inner = { left: 76, right: width - 60, top: 86, bottom: height - 56 };
            const x = d3.scaleLinear().domain([0, 1]).range([inner.left, inner.right]);
            const y = d3.scaleLinear().domain([-1.1, 1.1]).range([inner.bottom, inner.top]);
            const line = d3
              .line()
              .x((d) => x(d.t))
              .y((d) => y(d.x))
              .curve(d3.curveMonotoneX);

            const curves = [
              {
                color: "rgba(96,113,128,0.55)",
                width: 2,
                dash: "8 7",
                label: "candidata A",
                values: d3.range(0, 1.001, 0.05).map((t) => ({ t, x: 0.85 - 1.2 * t + 0.25 * t * t }))
              },
              {
                color: "#d16f2b",
                width: 4,
                label: "historia admitida",
                values: d3.range(0, 1.001, 0.05).map((t) => ({ t, x: 0.8 - 0.4 * Math.sin(Math.PI * t) - 0.85 * t }))
              },
              {
                color: "rgba(96,113,128,0.55)",
                width: 2,
                dash: "8 7",
                label: "candidata B",
                values: d3.range(0, 1.001, 0.05).map((t) => ({ t, x: 0.8 - 1.4 * t + 0.7 * t * t }))
              }
            ];

            svg
              .append("text")
              .attr("x", 40)
              .attr("y", 78)
              .attr("fill", "#1b2830")
              .attr("font-size", 24)
              .text("comparar historias completas");

            svg
              .append("line")
              .attr("x1", inner.left)
              .attr("x2", inner.right)
              .attr("y1", inner.bottom)
              .attr("y2", inner.bottom)
              .attr("stroke", "rgba(27,40,48,0.5)")
              .attr("stroke-width", 2);
            svg
              .append("line")
              .attr("x1", inner.left)
              .attr("x2", inner.left)
              .attr("y1", inner.bottom)
              .attr("y2", inner.top)
              .attr("stroke", "rgba(27,40,48,0.5)")
              .attr("stroke-width", 2);

            curves.forEach((curve, index) => {
              svg
                .append("path")
                .attr("d", line(curve.values))
                .attr("fill", "none")
                .attr("stroke", curve.color)
                .attr("stroke-width", curve.width)
                .attr("stroke-dasharray", curve.dash || null);

              svg
                .append("text")
                .attr("x", inner.right - 110)
                .attr("y", inner.top + 24 + index * 18)
                .attr("fill", curve.color)
                .attr("font-size", 12)
                .text(curve.label);
            });

            svg
              .append("text")
              .attr("x", inner.right - 8)
              .attr("y", inner.bottom + 18)
              .attr("text-anchor", "end")
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("t");
            svg
              .append("text")
              .attr("x", inner.left - 14)
              .attr("y", inner.top + 8)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("x");
            svg
              .append("text")
              .attr("x", 40)
              .attr("y", height - 36)
              .attr("fill", "#607180")
              .attr("font-size", 12)
              .text("el formato cambia, pero la ley sigue seleccionando qué continuación cuenta como física");
          }
        }

        function syncUi() {
          caption.textContent = labels[controller.mode];
          syncButtons();
          render();
        }

        flowButton.addEventListener("click", () => controller.setMode("flow"));
        mapButton.addEventListener("click", () => controller.setMode("map"));
        historiesButton.addEventListener("click", () => controller.setMode("histories"));
        resetButton.addEventListener("click", () => controller.reset());
        window.addEventListener("resize", render);
        syncUi();
      }

      function initPhotoVsStateSketch() {
        const host = document.getElementById("viz-photo-state");
        const resetButton = document.getElementById("reset-photo-state");
        if (!host || !resetButton) return;

        const controller = {
          time: 0,
          reset() {
            this.time = 0;
          }
        };

        const sketch = (p) => {
          const theta0 = 0.62;

          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 252;
            if (width < 640) return 286;
            return 332;
          }

          function bobPoint(cx, cy, radius, theta) {
            return {
              x: cx + radius * Math.sin(theta),
              y: cy + radius * Math.cos(theta)
            };
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
            controller.time += p.deltaTime * 0.001;
            if (controller.time > 5.4) controller.time = 0;

            p.clear();
            p.background(252, 248, 240);

            const width = p.width;
            const height = p.height;
            const small = width < 430;
            const stacked = width < 620;
            const margin = 18;
            const gap = 18;
            const panelWidth = stacked ? width - margin * 2 : (width - margin * 2 - gap) / 2;
            const panelHeight = stacked ? (height - margin * 2 - gap) / 2 : height - margin * 2;
            const leftTop = { x: margin, y: margin };
            const rightTop = stacked
              ? { x: margin, y: margin + panelHeight + gap }
              : { x: margin + panelWidth + gap, y: margin };

            [leftTop, rightTop].forEach((top) => {
              p.noStroke();
              p.fill(255, 255, 255, 170);
              p.rect(top.x, top.y, panelWidth, panelHeight, 20);
            });

            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(small ? 11 : 13);
            p.textStyle(p.BOLD);
            p.text("la foto", leftTop.x + 18, leftTop.y + 16);
            p.text("dos futuros posibles", rightTop.x + 18, rightTop.y + 16);

            const leftPivot = {
              x: leftTop.x + panelWidth * 0.5,
              y: leftTop.y + panelHeight * 0.24
            };
            const rightPivot = {
              x: rightTop.x + panelWidth * 0.5,
              y: rightTop.y + panelHeight * 0.24
            };
            const radius = Math.min(panelWidth, panelHeight) * 0.34;

            const staticBob = bobPoint(leftPivot.x, leftPivot.y, radius, theta0);
            const warmup = Math.max(controller.time - 0.8, 0);
            const spread = Math.min(warmup * 0.42, 0.72);
            const thetaA = theta0 - spread;
            const thetaB = theta0 + spread;
            const bobA = bobPoint(rightPivot.x, rightPivot.y, radius, thetaA);
            const bobB = bobPoint(rightPivot.x, rightPivot.y, radius, thetaB);
            const originBob = bobPoint(rightPivot.x, rightPivot.y, radius, theta0);

            function drawReference(pivot, top) {
              p.stroke(27, 40, 48, 55);
              p.strokeWeight(1.4);
              p.line(pivot.x, top.y + 22, pivot.x, top.y + panelHeight - 22);
              p.noStroke();
              p.fill(96, 113, 128);
              p.textSize(small ? 11 : 12);
              p.textStyle(p.NORMAL);
              p.text("misma θ(t₀)", pivot.x - (small ? 34 : 40), top.y + panelHeight - 18);
            }

            drawReference(leftPivot, leftTop);
            drawReference(rightPivot, rightTop);

            p.stroke(27, 40, 48);
            p.strokeWeight(3);
            p.line(leftPivot.x, leftPivot.y, staticBob.x, staticBob.y);
            p.fill(27, 40, 48);
            p.circle(leftPivot.x, leftPivot.y, 9);
            p.fill(209, 111, 43);
            p.circle(staticBob.x, staticBob.y, 16);

            p.stroke(27, 40, 48, 70);
            p.strokeWeight(2);
            p.line(rightPivot.x, rightPivot.y, originBob.x, originBob.y);

            p.stroke("#0e7278");
            p.strokeWeight(3);
            p.line(rightPivot.x, rightPivot.y, bobA.x, bobA.y);
            p.stroke("#d16f2b");
            p.line(rightPivot.x, rightPivot.y, bobB.x, bobB.y);

            p.noStroke();
            p.fill(27, 40, 48);
            p.circle(rightPivot.x, rightPivot.y, 9);
            p.fill("#0e7278");
            p.circle(bobA.x, bobA.y, 14);
            p.fill("#d16f2b");
            p.circle(bobB.x, bobB.y, 14);

            p.fill(14, 114, 120);
            p.textSize(small ? 10 : 12);
            p.text("θ̇ < 0", bobA.x - (small ? 14 : 18), bobA.y - 26);
            p.fill(209, 111, 43);
            p.text("θ̇ > 0", bobB.x - (small ? 14 : 18), bobB.y + 14);

            p.stroke(14, 114, 120, 170);
            p.strokeWeight(2);
            p.line(bobA.x + 6, bobA.y - 8, bobA.x - 18, bobA.y - 22);
            p.line(bobA.x - 18, bobA.y - 22, bobA.x - 14, bobA.y - 12);
            p.line(bobA.x - 18, bobA.y - 22, bobA.x - 7, bobA.y - 24);

            p.stroke(209, 111, 43, 180);
            p.line(bobB.x - 6, bobB.y + 8, bobB.x + 18, bobB.y + 22);
            p.line(bobB.x + 18, bobB.y + 22, bobB.x + 8, bobB.y + 24);
            p.line(bobB.x + 18, bobB.y + 22, bobB.x + 14, bobB.y + 12);

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(small ? 10 : 12);
            p.text(
              "la misma configuración no basta para fijar la historia",
              rightTop.x + 18,
              rightTop.y + panelHeight - 34,
              panelWidth - 36
            );
          };
        };

        new p5(sketch);
        resetButton.addEventListener("click", () => controller.reset());
      }

      function initPendulumConfigViz() {
        const simpleHost = document.getElementById("viz-pendulum-config");
        const simpleAngleInput = document.getElementById("pendulum-angle");
        const simpleAngleValue = document.getElementById("pendulum-angle-value");
        const simpleResetButton = document.getElementById("reset-pendulum-config");

        const doubleHost = document.getElementById("viz-double-pendulum-config");
        const theta1Input = document.getElementById("double-theta-1");
        const theta2Input = document.getElementById("double-theta-2");
        const theta1Value = document.getElementById("double-theta-1-value");
        const theta2Value = document.getElementById("double-theta-2-value");
        const doubleResetButton = document.getElementById("reset-double-pendulum-config");

        function degLabel(value) {
          return `${Math.round((value * 180) / Math.PI)}°`;
        }

        function polarPoint(cx, cy, radius, theta) {
          return {
            x: cx + radius * Math.sin(theta),
            y: cy + radius * Math.cos(theta)
          };
        }

        function arcPath(cx, cy, radius, startAngle, endAngle) {
          const start = polarPoint(cx, cy, radius, startAngle);
          const end = polarPoint(cx, cy, radius, endAngle);
          const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
          const sweep = endAngle > startAngle ? 1 : 0;
          return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
        }

        function renderSimple() {
          if (!simpleHost) return;

          const theta = Number(simpleAngleInput.value);
          simpleAngleValue.textContent = `θ = ${degLabel(theta)}`;
          simpleHost.innerHTML = "";

          const width = simpleHost.clientWidth;
          const stacked = width < 640;
          const height = stacked ? 460 : 340;
          const svg = d3
            .select(simpleHost)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          const margin = 24;
          const panelGap = 24;
          const panelWidth = stacked
            ? width - margin * 2
            : (width - margin * 2 - panelGap) / 2;
          const panelHeight = stacked
            ? (height - margin * 2 - panelGap) / 2
            : height - margin * 2;
          const leftTop = { x: margin, y: margin };
          const rightTop = stacked
            ? { x: margin, y: margin + panelHeight + panelGap }
            : { x: margin + panelWidth + panelGap, y: margin };

          const panels = [
            { top: leftTop, title: "cartesianas + restricción" },
            { top: rightTop, title: "una coordenada basta" }
          ];

          panels.forEach((panel) => {
            svg
              .append("rect")
              .attr("x", panel.top.x)
              .attr("y", panel.top.y)
              .attr("width", panelWidth)
              .attr("height", panelHeight)
              .attr("rx", 20)
              .attr("fill", "rgba(255,255,255,0.52)")
              .attr("stroke", "rgba(27,40,48,0.08)");
          });

          const leftPivot = {
            x: leftTop.x + panelWidth * 0.36,
            y: leftTop.y + panelHeight * 0.54
          };
          const leftRadius = Math.min(panelWidth, panelHeight) * 0.28;
          const leftBob = polarPoint(leftPivot.x, leftPivot.y, leftRadius, theta);

          svg
            .append("circle")
            .attr("cx", leftPivot.x)
            .attr("cy", leftPivot.y)
            .attr("r", leftRadius)
            .attr("fill", "none")
            .attr("stroke", "rgba(27,40,48,0.26)")
            .attr("stroke-dasharray", "8 8");

          svg
            .append("line")
            .attr("x1", leftTop.x + 28)
            .attr("x2", leftTop.x + panelWidth - 26)
            .attr("y1", leftPivot.y)
            .attr("y2", leftPivot.y)
            .attr("stroke", "rgba(27,40,48,0.55)")
            .attr("stroke-width", 1.5);

          svg
            .append("line")
            .attr("x1", leftPivot.x)
            .attr("x2", leftPivot.x)
            .attr("y1", leftTop.y + 22)
            .attr("y2", leftTop.y + panelHeight - 22)
            .attr("stroke", "rgba(27,40,48,0.55)")
            .attr("stroke-width", 1.5);

          svg
            .append("text")
            .attr("x", leftTop.x + panelWidth - 24)
            .attr("y", leftPivot.y - 10)
            .attr("text-anchor", "end")
            .attr("fill", "#607180")
            .attr("font-size", width < 480 ? 11 : 13)
            .text("x");

          svg
            .append("text")
            .attr("x", leftPivot.x + 10)
            .attr("y", leftTop.y + 26)
            .attr("fill", "#607180")
            .attr("font-size", width < 480 ? 11 : 13)
            .text("y");

          svg
            .append("line")
            .attr("x1", leftPivot.x)
            .attr("y1", leftPivot.y)
            .attr("x2", leftBob.x)
            .attr("y2", leftBob.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3);

          svg
            .append("line")
            .attr("x1", leftBob.x)
            .attr("x2", leftBob.x)
            .attr("y1", leftBob.y)
            .attr("y2", leftPivot.y)
            .attr("stroke", "rgba(209,111,43,0.55)")
            .attr("stroke-dasharray", "5 5");

          svg
            .append("line")
            .attr("x1", leftBob.x)
            .attr("x2", leftPivot.x)
            .attr("y1", leftBob.y)
            .attr("y2", leftBob.y)
            .attr("stroke", "rgba(14,114,120,0.55)")
            .attr("stroke-dasharray", "5 5");

          svg
            .append("circle")
            .attr("cx", leftPivot.x)
            .attr("cy", leftPivot.y)
            .attr("r", 5.5)
            .attr("fill", "#1b2830");

          svg
            .append("circle")
            .attr("cx", leftBob.x)
            .attr("cy", leftBob.y)
            .attr("r", 9)
            .attr("fill", "#d16f2b");

          svg
            .append("text")
            .attr("x", leftBob.x + 10)
            .attr("y", leftBob.y - 8)
            .attr("fill", "#1b2830")
            .attr("font-size", width < 480 ? 11 : 13)
            .text("(x, y)");

          svg
            .append("text")
            .attr("x", leftTop.x + 20)
            .attr("y", leftTop.y + panelHeight - 16)
            .attr("fill", "#607180")
            .attr("font-size", width < 480 ? 11 : 13)
            .text("x² + y² = ℓ²");

          svg
            .append("text")
            .attr("x", leftTop.x + 20)
            .attr("y", leftTop.y + 22)
            .attr("fill", "#607180")
            .attr("font-size", width < 480 ? 11 : 13)
            .attr("font-weight", 700)
            .text("cartesianas + restricción");

          const rightPivot = {
            x: rightTop.x + panelWidth * 0.5,
            y: rightTop.y + panelHeight * 0.2
          };
          const rightRadius = Math.min(panelWidth, panelHeight) * 0.36;
          const rightBob = polarPoint(rightPivot.x, rightPivot.y, rightRadius, theta);

          svg
            .append("line")
            .attr("x1", rightPivot.x)
            .attr("x2", rightPivot.x)
            .attr("y1", rightPivot.y)
            .attr("y2", rightTop.y + panelHeight - 28)
            .attr("stroke", "rgba(27,40,48,0.28)")
            .attr("stroke-dasharray", "7 7")
            .attr("stroke-width", 1.5);

          svg
            .append("path")
            .attr("d", arcPath(rightPivot.x, rightPivot.y, rightRadius * 0.34, 0, theta))
            .attr("fill", "none")
            .attr("stroke", "#0e7278")
            .attr("stroke-width", 3);

          svg
            .append("line")
            .attr("x1", rightPivot.x)
            .attr("y1", rightPivot.y)
            .attr("x2", rightBob.x)
            .attr("y2", rightBob.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3.2);

          svg
            .append("circle")
            .attr("cx", rightPivot.x)
            .attr("cy", rightPivot.y)
            .attr("r", 5.5)
            .attr("fill", "#1b2830");

          svg
            .append("circle")
            .attr("cx", rightBob.x)
            .attr("cy", rightBob.y)
            .attr("r", 9)
            .attr("fill", "#0e7278");

          svg
            .append("text")
            .attr("x", rightPivot.x + rightRadius * 0.18)
            .attr("y", rightPivot.y + rightRadius * 0.22)
            .attr("fill", "#0e7278")
            .attr("font-size", width < 480 ? 12 : 14)
            .attr("font-weight", 700)
            .text("θ");

          svg
            .append("text")
            .attr("x", rightTop.x + 20)
            .attr("y", rightTop.y + 22)
            .attr("fill", "#607180")
            .attr("font-size", width < 480 ? 11 : 13)
            .attr("font-weight", 700)
            .text("una coordenada basta");
        }

        function renderDouble() {
          if (!doubleHost) return;

          const theta1 = Number(theta1Input.value);
          const theta2 = Number(theta2Input.value);
          theta1Value.textContent = `θ₁ = ${degLabel(theta1)}`;
          theta2Value.textContent = `θ₂ = ${degLabel(theta2)}`;
          doubleHost.innerHTML = "";

          const width = doubleHost.clientWidth;
          const stacked = width < 700;
          const height = stacked ? 500 : 340;
          const svg = d3
            .select(doubleHost)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          const margin = 24;
          const panelGap = 24;
          const panelWidth = stacked
            ? width - margin * 2
            : (width - margin * 2 - panelGap) / 2;
          const panelHeight = stacked
            ? (height - margin * 2 - panelGap) / 2
            : height - margin * 2;
          const leftTop = { x: margin, y: margin };
          const rightTop = stacked
            ? { x: margin, y: margin + panelHeight + panelGap }
            : { x: margin + panelWidth + panelGap, y: margin };

          [leftTop, rightTop].forEach((top) => {
            svg
              .append("rect")
              .attr("x", top.x)
              .attr("y", top.y)
              .attr("width", panelWidth)
              .attr("height", panelHeight)
              .attr("rx", 20)
              .attr("fill", "rgba(255,255,255,0.52)")
              .attr("stroke", "rgba(27,40,48,0.08)");
          });

          const l1 = Math.min(panelWidth, panelHeight) * 0.25;
          const l2 = Math.min(panelWidth, panelHeight) * 0.23;

          const leftPivot = {
            x: leftTop.x + panelWidth * 0.28,
            y: leftTop.y + panelHeight * 0.28
          };
          const bob1 = polarPoint(leftPivot.x, leftPivot.y, l1, theta1);
          const bob2 = polarPoint(bob1.x, bob1.y, l2, theta2);

          svg
            .append("line")
            .attr("x1", leftTop.x + 24)
            .attr("x2", leftTop.x + panelWidth - 24)
            .attr("y1", leftPivot.y)
            .attr("y2", leftPivot.y)
            .attr("stroke", "rgba(27,40,48,0.55)")
            .attr("stroke-width", 1.5);

          svg
            .append("line")
            .attr("x1", leftPivot.x)
            .attr("x2", leftPivot.x)
            .attr("y1", leftTop.y + 20)
            .attr("y2", leftTop.y + panelHeight - 24)
            .attr("stroke", "rgba(27,40,48,0.55)")
            .attr("stroke-width", 1.5);

          svg
            .append("text")
            .attr("x", leftTop.x + panelWidth - 24)
            .attr("y", leftPivot.y - 10)
            .attr("text-anchor", "end")
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .text("x");

          svg
            .append("text")
            .attr("x", leftPivot.x + 10)
            .attr("y", leftTop.y + 24)
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .text("y");

          svg
            .append("line")
            .attr("x1", leftPivot.x)
            .attr("y1", leftPivot.y)
            .attr("x2", bob1.x)
            .attr("y2", bob1.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3);

          svg
            .append("line")
            .attr("x1", bob1.x)
            .attr("y1", bob1.y)
            .attr("x2", bob2.x)
            .attr("y2", bob2.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3);

          svg
            .append("circle")
            .attr("cx", leftPivot.x)
            .attr("cy", leftPivot.y)
            .attr("r", 5.5)
            .attr("fill", "#1b2830");

          svg
            .append("circle")
            .attr("cx", bob1.x)
            .attr("cy", bob1.y)
            .attr("r", 8.5)
            .attr("fill", "#d16f2b");

          svg
            .append("circle")
            .attr("cx", bob2.x)
            .attr("cy", bob2.y)
            .attr("r", 8.5)
            .attr("fill", "#0e7278");

          if (panelWidth > 220) {
            svg
              .append("text")
              .attr("x", bob1.x + 10)
              .attr("y", bob1.y - 8)
              .attr("fill", "#1b2830")
              .attr("font-size", width < 520 ? 11 : 13)
              .text("(x₁, y₁)");

            svg
              .append("text")
              .attr("x", bob2.x + 10)
              .attr("y", bob2.y + 14)
              .attr("fill", "#1b2830")
              .attr("font-size", width < 520 ? 11 : 13)
              .text("(x₂, y₂)");
          }

          svg
            .append("text")
            .attr("x", leftTop.x + 20)
            .attr("y", leftTop.y + 22)
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .attr("font-weight", 700)
            .text("cartesianas + vínculos");

          svg
            .append("text")
            .attr("x", leftTop.x + 20)
            .attr("y", leftTop.y + panelHeight - 16)
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .text("4 coordenadas, 2 restricciones");

          const rightPivot = {
            x: rightTop.x + panelWidth * 0.34,
            y: rightTop.y + panelHeight * 0.2
          };
          const rightBob1 = polarPoint(rightPivot.x, rightPivot.y, l1, theta1);
          const rightBob2 = polarPoint(rightBob1.x, rightBob1.y, l2, theta2);

          svg
            .append("line")
            .attr("x1", rightPivot.x)
            .attr("x2", rightPivot.x)
            .attr("y1", rightPivot.y)
            .attr("y2", rightTop.y + panelHeight - 22)
            .attr("stroke", "rgba(27,40,48,0.28)")
            .attr("stroke-dasharray", "7 7")
            .attr("stroke-width", 1.5);

          svg
            .append("line")
            .attr("x1", rightBob1.x)
            .attr("x2", rightBob1.x)
            .attr("y1", rightBob1.y)
            .attr("y2", rightTop.y + panelHeight - 22)
            .attr("stroke", "rgba(27,40,48,0.24)")
            .attr("stroke-dasharray", "7 7")
            .attr("stroke-width", 1.3);

          svg
            .append("path")
            .attr("d", arcPath(rightPivot.x, rightPivot.y, l1 * 0.34, 0, theta1))
            .attr("fill", "none")
            .attr("stroke", "#0e7278")
            .attr("stroke-width", 3);

          svg
            .append("path")
            .attr("d", arcPath(rightBob1.x, rightBob1.y, l2 * 0.34, 0, theta2))
            .attr("fill", "none")
            .attr("stroke", "#d16f2b")
            .attr("stroke-width", 3);

          svg
            .append("line")
            .attr("x1", rightPivot.x)
            .attr("y1", rightPivot.y)
            .attr("x2", rightBob1.x)
            .attr("y2", rightBob1.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3);

          svg
            .append("line")
            .attr("x1", rightBob1.x)
            .attr("y1", rightBob1.y)
            .attr("x2", rightBob2.x)
            .attr("y2", rightBob2.y)
            .attr("stroke", "#1b2830")
            .attr("stroke-width", 3);

          svg
            .append("circle")
            .attr("cx", rightPivot.x)
            .attr("cy", rightPivot.y)
            .attr("r", 5.5)
            .attr("fill", "#1b2830");

          svg
            .append("circle")
            .attr("cx", rightBob1.x)
            .attr("cy", rightBob1.y)
            .attr("r", 8.5)
            .attr("fill", "#d16f2b");

          svg
            .append("circle")
            .attr("cx", rightBob2.x)
            .attr("cy", rightBob2.y)
            .attr("r", 8.5)
            .attr("fill", "#0e7278");

          svg
            .append("text")
            .attr("x", rightPivot.x + l1 * 0.18)
            .attr("y", rightPivot.y + l1 * 0.22)
            .attr("fill", "#0e7278")
            .attr("font-size", width < 520 ? 12 : 14)
            .attr("font-weight", 700)
            .text("θ₁");

          svg
            .append("text")
            .attr("x", rightBob1.x + l2 * 0.12)
            .attr("y", rightBob1.y + l2 * 0.18)
            .attr("fill", "#d16f2b")
            .attr("font-size", width < 520 ? 12 : 14)
            .attr("font-weight", 700)
            .text("θ₂");

          svg
            .append("text")
            .attr("x", rightTop.x + 20)
            .attr("y", rightTop.y + 22)
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .attr("font-weight", 700)
            .text("ángulos adaptados");

          svg
            .append("text")
            .attr("x", rightTop.x + 20)
            .attr("y", rightTop.y + panelHeight - 16)
            .attr("fill", "#607180")
            .attr("font-size", width < 520 ? 11 : 13)
            .text("θ₁ y θ₂ muestran 2 gdl");
        }

        if (simpleHost && simpleAngleInput && simpleResetButton) {
          simpleAngleInput.addEventListener("input", renderSimple);
          simpleResetButton.addEventListener("click", () => {
            simpleAngleInput.value = "0.68";
            renderSimple();
          });
          window.addEventListener("resize", renderSimple);
          renderSimple();
        }

        if (doubleHost && theta1Input && theta2Input && doubleResetButton) {
          theta1Input.addEventListener("input", renderDouble);
          theta2Input.addEventListener("input", renderDouble);
          doubleResetButton.addEventListener("click", () => {
            theta1Input.value = "0.54";
            theta2Input.value = "0.38";
            renderDouble();
          });
          window.addEventListener("resize", renderDouble);
          renderDouble();
        }
      }

      function initReversibilitySketch() {
        const host = document.getElementById("viz-reversibility");
        const resetButton = document.getElementById("reset-reversibility");
        const pauseButton = document.getElementById("pause-reversibility");
        if (!host || !resetButton || !pauseButton) return;

        const controller = {
          time: 0,
          paused: false,
          reset() {
            this.time = 0;
            this.paused = false;
            syncPauseUi();
          },
          togglePause() {
            this.paused = !this.paused;
            syncPauseUi();
          }
        };

        function syncPauseUi() {
          pauseButton.textContent = controller.paused ? "Reanudar" : "Pausar";
        }

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 540;
            if (width < 760) return 640;
            return 540;
          }

          function formatSigned(value) {
            const rounded = Math.abs(value) < 0.005 ? 0 : value;
            return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(2)}`;
          }

          function lineScale(x, left, width) {
            return p.map(x, -1.8, 1.8, left + 28, left + width - 28);
          }

          function drawColumnFrame(x, y, w, h, title, tint) {
            p.noStroke();
            p.fill(255, 255, 255, 176);
            p.rect(x, y, w, h, 22);
            p.fill(tint);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 11 : 13);
            p.textStyle(p.BOLD);
            p.text(title, x + 18, y + 16);
          }

          function drawCellFrame(x, y, w, h, title) {
            p.stroke(27, 40, 48, 18);
            p.strokeWeight(1);
            p.fill(255, 255, 255, 0);
            p.rect(x, y, w, h, 18);
            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 10 : 11);
            p.textStyle(p.BOLD);
            p.text(title, x + 14, y + 12);
          }

          function drawReadoutStack(x, y, w, label, timeValue, xValue, vValue, color) {
            const baseX = x + w - 18;
            const baseY = y + 18;
            p.noStroke();
            p.textAlign(p.RIGHT, p.TOP);
            p.textStyle(p.NORMAL);
            p.textSize(p.width < 430 ? 9 : 10);
            p.fill(96, 113, 128);
            p.text(`${label} = ${formatSigned(timeValue)}`, baseX, baseY);
            p.text(`x = ${formatSigned(xValue)}`, baseX, baseY + 14);
            p.fill(color);
            p.text(`v = ${formatSigned(vValue)}`, baseX, baseY + 28);
          }

          function drawOscillatorCell(x, y, w, h, phase, displayTime, inverted, color) {
            drawCellFrame(x, y, w, h, "oscilador armónico");

            const xPos = Math.cos(phase);
            const vPos = inverted ? Math.sin(phase) : -Math.sin(phase);
            const shownTime = inverted ? -displayTime : displayTime;
            const lineY = y + h * 0.3;
            const px = lineScale(xPos, x, w);

            drawReadoutStack(
              x,
              y,
              w,
              inverted ? "-t" : "t",
              shownTime,
              xPos,
              vPos,
              color
            );

            p.stroke(27, 40, 48, 40);
            p.strokeWeight(1.3);
            p.line(x + 24, lineY, x + w - 24, lineY);
            p.line(lineScale(0, x, w), lineY - 14, lineScale(0, x, w), lineY + 14);

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(p.width < 430 ? 10 : 11);
            p.textStyle(p.NORMAL);
            p.text("misma posición sobre la recta", x + 14, y + 42);

            p.fill("#1b2830");
            p.circle(px, lineY, 12);
            drawArrow(
              p,
              px,
              lineY - 24,
              px + 42 * Math.sign(vPos || 1),
              lineY - 24,
              color,
              2.1
            );

            p.noStroke();
            p.fill(color);
            p.textAlign(p.LEFT, p.CENTER);
            p.text(vPos >= 0 ? "v > 0" : "v < 0", px + 48, lineY - 24);

            const cx = x + w * 0.55;
            const cy = y + h * 0.74;
            const rx = Math.min(w * 0.22, 72);
            const ry = Math.min(h * 0.18, 42);
            const phaseX = cx + rx * xPos;
            const phaseY = cy - ry * vPos;

            p.stroke(27, 40, 48, 34);
            p.strokeWeight(1.2);
            p.line(cx - rx - 14, cy, cx + rx + 14, cy);
            p.line(cx, cy - ry - 12, cx, cy + ry + 12);
            p.noFill();
            p.stroke(27, 40, 48);
            p.strokeWeight(2);
            p.ellipse(cx, cy, rx * 2, ry * 2);
            p.noStroke();
            p.fill(color);
            p.circle(phaseX, phaseY, 11);

            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 9 : 10);
            p.text(
              inverted
                ? "en fase: mismo x, velocidad opuesta"
                : "en fase: estado compatible con la misma órbita",
              x + 14,
              y + h - 24,
              w - 28
            );
          }

          function drawRelaxationCell(x, y, w, h, displayTime, timeNorm, inverted, color) {
            drawCellFrame(x, y, w, h, "relajación  ẋ = −γx");

            const lineY = y + h * 0.58;
            const scaleX = (value) => lineScale(value, x, w);

            p.stroke(27, 40, 48, 40);
            p.strokeWeight(1.3);
            p.line(x + 24, lineY, x + w - 24, lineY);
            p.line(scaleX(0), lineY - 14, scaleX(0), lineY + 14);

            [-1.45, -0.85, -0.35].forEach((value) => {
              drawArrow(
                p,
                scaleX(value),
                lineY - 30,
                scaleX(value + 0.28),
                lineY - 30,
                "rgba(96,113,128,0.64)",
                1.4
              );
            });
            [0.35, 0.85, 1.45].forEach((value) => {
              drawArrow(
                p,
                scaleX(value),
                lineY - 30,
                scaleX(value - 0.28),
                lineY - 30,
                "rgba(96,113,128,0.64)",
                1.4
              );
            });

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(p.width < 430 ? 10 : 11);
            p.textStyle(p.NORMAL);
            p.text("las flechas grises siguen apuntando al origen", x + 14, y + 42, w - 28);

            const gamma = 2.2;
            const duration = 1.65;
            const t = timeNorm * duration;
            const start = 1.45;
            const end = start * Math.exp(-gamma * duration);
            const xPos = inverted
              ? start * Math.exp(-gamma * (duration - t))
              : start * Math.exp(-gamma * t);
            const vPos = inverted ? gamma * xPos : -gamma * xPos;
            const shownTime = inverted ? -displayTime : displayTime;

            drawReadoutStack(
              x,
              y,
              w,
              inverted ? "-t" : "t",
              shownTime,
              xPos,
              vPos,
              color
            );

            p.stroke(color);
            p.strokeWeight(2.4);
            p.line(scaleX(inverted ? end : start), lineY + 24, scaleX(xPos), lineY + 24);
            drawArrow(
              p,
              scaleX(xPos),
              lineY + 24,
              scaleX(xPos) + 36 * Math.sign(vPos || 1),
              lineY + 24,
              color,
              2.1
            );
            p.noStroke();
            p.fill(color);
            p.circle(scaleX(xPos), lineY + 24, 11);

            p.fill(color);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 9 : 10);
            p.textStyle(p.BOLD);
            p.text(
              inverted ? "la película sale hacia afuera" : "la trayectoria cae al origen",
              x + 14,
              y + h - 38,
              w - 28
            );
            p.textStyle(p.NORMAL);
            p.fill(96, 113, 128);
            p.text(
              inverted
                ? "eso choca con la misma ley local"
                : "eso sí sigue las flechas del campo",
              x + 14,
              y + h - 22,
              w - 28
            );
          }

          p.setup = () => {
            const canvas = p.createCanvas(host.clientWidth, vizHeight());
            canvas.parent(host);
            p.pixelDensity(2);
            syncPauseUi();
          };

          p.windowResized = () => {
            p.resizeCanvas(host.clientWidth, vizHeight());
          };

          p.draw = () => {
            if (!controller.paused) {
              controller.time += p.deltaTime * 0.001;
            }
            const loop = 4.8;
            const displayTime = controller.time % loop;
            const timeNorm = displayTime / loop;
            const phase = 0.55 + timeNorm * 2 * Math.PI;

            p.clear();
            p.background(252, 248, 240);

            const stacked = p.width < 760;
            const margin = 18;
            const gap = 18;
            const columnWidth = stacked
              ? p.width - margin * 2
              : (p.width - margin * 2 - gap) / 2;
            const columnHeight = stacked
              ? (p.height - margin * 2 - gap) / 2
              : p.height - margin * 2;
            const leftX = margin;
            const rightX = stacked ? margin : margin + columnWidth + gap;
            const leftY = margin;
            const rightY = stacked ? margin + columnHeight + gap : margin;

            drawColumnFrame(leftX, leftY, columnWidth, columnHeight, "película directa", "#0e7278");
            drawColumnFrame(rightX, rightY, columnWidth, columnHeight, "película invertida", "#b6421f");

            const innerPadX = 12;
            const innerPadTop = 48;
            const innerPadBottom = 12;
            const innerGap = 12;
            const cellWidth = columnWidth - innerPadX * 2;
            const cellHeight = (columnHeight - innerPadTop - innerPadBottom - innerGap) / 2;

            drawOscillatorCell(
              leftX + innerPadX,
              leftY + innerPadTop,
              cellWidth,
              cellHeight,
              phase,
              displayTime,
              false,
              "#0e7278"
            );
            drawRelaxationCell(
              leftX + innerPadX,
              leftY + innerPadTop + cellHeight + innerGap,
              cellWidth,
              cellHeight,
              displayTime,
              timeNorm,
              false,
              "#0e7278"
            );

            drawOscillatorCell(
              rightX + innerPadX,
              rightY + innerPadTop,
              cellWidth,
              cellHeight,
              phase,
              displayTime,
              true,
              "#b6421f"
            );
            drawRelaxationCell(
              rightX + innerPadX,
              rightY + innerPadTop + cellHeight + innerGap,
              cellWidth,
              cellHeight,
              displayTime,
              timeNorm,
              true,
              "#b6421f"
            );

            if (controller.paused) {
              p.noStroke();
              p.fill(27, 40, 48, 120);
              p.rect(p.width / 2 - 54, 10, 108, 28, 14);
              p.fill(248, 243, 234);
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(12);
              p.textStyle(p.BOLD);
              p.text("PAUSA", p.width / 2, 24);
            }
          };
        };

        new p5(sketch);
        resetButton.addEventListener("click", () => controller.reset());
        pauseButton.addEventListener("click", () => controller.togglePause());
      }

      function initStateSliceSketch() {
        const host = document.getElementById("viz-state-slice");
        const xInput = document.getElementById("state-slice-x0");
        const vInput = document.getElementById("state-slice-v0");
        const xValue = document.getElementById("state-slice-x0-value");
        const vValue = document.getElementById("state-slice-v0-value");
        const toggleButton = document.getElementById("toggle-state-velocity");
        const modeLabel = document.getElementById("state-velocity-mode");
        const resetButton = document.getElementById("reset-state-slice");
        if (!host || !xInput || !vInput || !xValue || !vValue || !toggleButton || !modeLabel || !resetButton) return;

        const controller = {
          showVelocity: true,
          reset() {
            xInput.value = "0.35";
            vInput.value = "0.72";
            this.showVelocity = true;
            syncUi();
          },
          toggle() {
            this.showVelocity = !this.showVelocity;
            syncUi();
          }
        };

        function syncUi() {
          xValue.textContent = `x₀ = ${Number(xInput.value).toFixed(2)}`;
          vValue.textContent = `v₀ = ${Number(vInput.value).toFixed(2)}`;
          toggleButton.textContent = controller.showVelocity
            ? "Ocultar velocidad"
            : "Mostrar velocidad";
          modeLabel.textContent = controller.showVelocity
            ? "velocidad visible"
            : "solo ves la configuración";
        }

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 270;
            if (width < 700) return 360;
            return 320;
          }

          function scaleConfig(x, left, width) {
            return p.map(x, -1, 1, left + 32, left + width - 32);
          }

          function scaleStateX(x, left, width) {
            return p.map(x, -1, 1, left + 36, left + width - 28);
          }

          function scaleStateY(v, top, height) {
            return p.map(v, -1.4, 1.4, top + height - 30, top + 28);
          }

          p.setup = () => {
            const canvas = p.createCanvas(host.clientWidth, vizHeight());
            canvas.parent(host);
            p.pixelDensity(2);
            syncUi();
          };

          p.windowResized = () => {
            p.resizeCanvas(host.clientWidth, vizHeight());
          };

          p.draw = () => {
            syncUi();

            const x0 = Number(xInput.value);
            const v0 = Number(vInput.value);

            p.clear();
            p.background(252, 248, 240);

            const stacked = p.width < 700;
            const margin = 18;
            const gap = 18;
            const panelWidth = stacked
              ? p.width - margin * 2
              : (p.width - margin * 2 - gap) / 2;
            const panelHeight = stacked
              ? (p.height - margin * 2 - gap) / 2
              : p.height - margin * 2;
            const leftTop = { x: margin, y: margin };
            const rightTop = stacked
              ? { x: margin, y: margin + panelHeight + gap }
              : { x: margin + panelWidth + gap, y: margin };

            [leftTop, rightTop].forEach((top) => {
              p.noStroke();
              p.fill(255, 255, 255, 170);
              p.rect(top.x, top.y, panelWidth, panelHeight, 20);
            });

            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 10 : 12);
            p.textStyle(p.BOLD);
            p.text("configuración", leftTop.x + 16, leftTop.y + 14);
            p.text("espacio de estados", rightTop.x + 16, rightTop.y + 14);

            const axisY = leftTop.y + panelHeight * 0.56;
            const xPos = scaleConfig(x0, leftTop.x, panelWidth);
            p.stroke(27, 40, 48, 45);
            p.strokeWeight(1.4);
            p.line(leftTop.x + 24, axisY, leftTop.x + panelWidth - 24, axisY);
            p.stroke(27, 40, 48, 72);
            p.line(xPos, axisY - 18, xPos, axisY + 18);
            p.noStroke();
            p.fill(27, 40, 48);
            p.circle(xPos, axisY, 12);
            p.fill(96, 113, 128);
            p.textStyle(p.NORMAL);
            p.text("x₀", xPos - 8, axisY + 22);

            if (controller.showVelocity) {
              drawArrow(p, xPos, axisY - 26, xPos + 46, axisY - 26, "#0e7278", 2.4);
              drawArrow(p, xPos, axisY + 26, xPos - 46, axisY + 26, "#d16f2b", 2.4);
              p.noStroke();
              p.fill("#0e7278");
              p.text("+\u2009v₀", xPos + 54, axisY - 36);
              p.fill("#d16f2b");
              p.text("−\u2009v₀", xPos - 76, axisY + 16);
            } else {
              p.fill(96, 113, 128);
              p.textAlign(p.CENTER, p.CENTER);
              p.textSize(p.width < 430 ? 20 : 28);
              p.text("?", xPos, axisY - 42);
            }

            const stateAxisX = scaleStateX(0, rightTop.x, panelWidth);
            const stateAxisY = scaleStateY(0, rightTop.y, panelHeight);
            const stateX = scaleStateX(x0, rightTop.x, panelWidth);
            const stateYPlus = scaleStateY(v0, rightTop.y, panelHeight);
            const stateYMinus = scaleStateY(-v0, rightTop.y, panelHeight);

            p.stroke(27, 40, 48, 42);
            p.strokeWeight(1.3);
            p.line(rightTop.x + 26, stateAxisY, rightTop.x + panelWidth - 24, stateAxisY);
            p.line(stateAxisX, rightTop.y + 22, stateAxisX, rightTop.y + panelHeight - 24);
            p.stroke(27, 40, 48, 22);
            p.line(stateX, rightTop.y + 22, stateX, rightTop.y + panelHeight - 24);

            p.noStroke();
            p.fill("#0e7278");
            p.circle(stateX, stateYPlus, 12);
            p.fill("#d16f2b");
            p.circle(stateX, stateYMinus, 12);

            p.fill("#0e7278");
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(p.width < 430 ? 10 : 12);
            p.text("(x₀,+v₀)", stateX + 10, stateYPlus);
            p.fill("#d16f2b");
            p.text("(x₀,−v₀)", stateX + 10, stateYMinus);
            p.fill(96, 113, 128);
            p.text("x", rightTop.x + panelWidth - 14, stateAxisY - 14);
            p.text("v", stateAxisX + 8, rightTop.y + 18);
          };
        };

        new p5(sketch);
        xInput.addEventListener("input", syncUi);
        vInput.addEventListener("input", syncUi);
        toggleButton.addEventListener("click", () => controller.toggle());
        resetButton.addEventListener("click", () => controller.reset());
      }

      function initPhaseProjectionSketch() {
        const host = document.getElementById("viz-phase-projection");
        const resetButton = document.getElementById("reset-phase-projection");
        if (!host || !resetButton) return;

        const controller = {
          time: 0,
          reset() {
            this.time = 0;
          }
        };

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 340;
            if (width < 760) return 430;
            return 340;
          }

          function graphPoint(originX, originY, w, h, t, y, yMin, yMax) {
            return {
              x: originX + (t / (2 * Math.PI)) * w,
              y: originY + h - ((y - yMin) / (yMax - yMin)) * h
            };
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
            controller.time += p.deltaTime * 0.0007;
            const theta = (0.55 + controller.time) % (2 * Math.PI);
            const mirrorTheta = (2 * Math.PI - theta) % (2 * Math.PI);
            const x = Math.cos(theta);
            const v = -Math.sin(theta);
            const mirrorX = Math.cos(mirrorTheta);
            const mirrorV = -Math.sin(mirrorTheta);

            p.clear();
            p.background(252, 248, 240);

            const stacked = p.width < 760;
            const margin = 18;
            const gap = 16;
            if (stacked) {
              const panelHeight = (p.height - margin * 2 - gap * 2) / 3;
              drawXPanel(margin, margin, p.width - margin * 2, panelHeight, theta, mirrorTheta);
              drawVPanel(margin, margin + panelHeight + gap, p.width - margin * 2, panelHeight, theta, mirrorTheta);
              drawPhasePanel(margin, margin + 2 * (panelHeight + gap), p.width - margin * 2, panelHeight, x, v, mirrorX, mirrorV);
            } else {
              const leftWidth = p.width * 0.56;
              const rightWidth = p.width - margin * 2 - gap - leftWidth;
              const panelHeight = (p.height - margin * 2 - gap) / 2;
              drawXPanel(margin, margin, leftWidth, panelHeight, theta, mirrorTheta);
              drawVPanel(margin, margin + panelHeight + gap, leftWidth, panelHeight, theta, mirrorTheta);
              drawPhasePanel(margin + leftWidth + gap, margin, rightWidth, p.height - margin * 2, x, v, mirrorX, mirrorV);
            }
          };

          function drawXPanel(x0, y0, w, h, theta, mirrorTheta) {
            p.noStroke();
            p.fill(255, 255, 255, 170);
            p.rect(x0, y0, w, h, 18);
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 10 : 12);
            p.textStyle(p.BOLD);
            p.text("x(t)", x0 + 14, y0 + 12);

            const plotX = x0 + 18;
            const plotY = y0 + 36;
            const plotW = w - 36;
            const plotH = h - 54;

            p.stroke(27, 40, 48, 36);
            p.strokeWeight(1.2);
            p.line(plotX, plotY + plotH / 2, plotX + plotW, plotY + plotH / 2);

            p.noFill();
            p.stroke(27, 40, 48, 180);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i <= 100; i += 1) {
              const t = (2 * Math.PI * i) / 100;
              const pt = graphPoint(plotX, plotY, plotW, plotH, t, Math.cos(t), -1.2, 1.2);
              p.vertex(pt.x, pt.y);
            }
            p.endShape();

            const current = graphPoint(plotX, plotY, plotW, plotH, theta, Math.cos(theta), -1.2, 1.2);
            const mirror = graphPoint(plotX, plotY, plotW, plotH, mirrorTheta, Math.cos(mirrorTheta), -1.2, 1.2);
            p.stroke(27, 40, 48, 24);
            p.line(current.x, plotY, current.x, plotY + plotH);
            p.line(mirror.x, plotY, mirror.x, plotY + plotH);
            p.noStroke();
            p.fill("#0e7278");
            p.circle(current.x, current.y, 10);
            p.fill("#d16f2b");
            p.circle(mirror.x, mirror.y, 10);
            p.fill(96, 113, 128);
            p.textStyle(p.NORMAL);
            p.text("mismo x", plotX + 12, plotY + plotH - 16);
          }

          function drawVPanel(x0, y0, w, h, theta, mirrorTheta) {
            p.noStroke();
            p.fill(255, 255, 255, 170);
            p.rect(x0, y0, w, h, 18);
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 10 : 12);
            p.textStyle(p.BOLD);
            p.text("v(t)", x0 + 14, y0 + 12);

            const plotX = x0 + 18;
            const plotY = y0 + 36;
            const plotW = w - 36;
            const plotH = h - 54;

            p.stroke(27, 40, 48, 36);
            p.strokeWeight(1.2);
            p.line(plotX, plotY + plotH / 2, plotX + plotW, plotY + plotH / 2);

            p.noFill();
            p.stroke(27, 40, 48, 180);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i <= 100; i += 1) {
              const t = (2 * Math.PI * i) / 100;
              const pt = graphPoint(plotX, plotY, plotW, plotH, t, -Math.sin(t), -1.2, 1.2);
              p.vertex(pt.x, pt.y);
            }
            p.endShape();

            const current = graphPoint(plotX, plotY, plotW, plotH, theta, -Math.sin(theta), -1.2, 1.2);
            const mirror = graphPoint(plotX, plotY, plotW, plotH, mirrorTheta, -Math.sin(mirrorTheta), -1.2, 1.2);
            p.noStroke();
            p.fill("#0e7278");
            p.circle(current.x, current.y, 10);
            p.fill("#d16f2b");
            p.circle(mirror.x, mirror.y, 10);
            p.fill(96, 113, 128);
            p.textStyle(p.NORMAL);
            p.text("v opuesta", plotX + 12, plotY + plotH - 16);
          }

          function drawPhasePanel(x0, y0, w, h, x, v, mirrorX, mirrorV) {
            p.noStroke();
            p.fill(255, 255, 255, 170);
            p.rect(x0, y0, w, h, 18);
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 10 : 12);
            p.textStyle(p.BOLD);
            p.text("plano (x,v)", x0 + 14, y0 + 12);

            const cx = x0 + w * 0.5;
            const cy = y0 + h * 0.56;
            const rx = Math.min(w * 0.3, 95);
            const ry = Math.min(h * 0.26, 80);

            p.stroke(27, 40, 48, 40);
            p.strokeWeight(1.2);
            p.line(cx - rx - 24, cy, cx + rx + 24, cy);
            p.line(cx, cy + ry + 24, cx, cy - ry - 24);

            p.noFill();
            p.stroke(27, 40, 48);
            p.strokeWeight(2);
            p.ellipse(cx, cy, rx * 2, ry * 2);

            const px = cx + rx * x;
            const py = cy - ry * v;
            const mx = cx + rx * mirrorX;
            const my = cy - ry * mirrorV;
            p.stroke(27, 40, 48, 24);
            p.line(px, py, mx, my);
            p.noStroke();
            p.fill("#0e7278");
            p.circle(px, py, 11);
            p.fill("#d16f2b");
            p.circle(mx, my, 11);
            p.fill(96, 113, 128);
            p.textStyle(p.NORMAL);
            p.text("misma proyección en x, distinto estado", x0 + 14, y0 + h - 22, w - 28);
          }
        };

        new p5(sketch);
        resetButton.addEventListener("click", () => controller.reset());
      }

      function initNoInertiaSketch() {
        const host = document.getElementById("viz-no-inertia");
        const gainInput = document.getElementById("gain");
        const gainValue = document.getElementById("gain-value");
        const resetButton = document.getElementById("reset-no-inertia");
        const seed = [-1.6, -1.05, -0.35, 0.32, 0.96, 1.48];

        const controller = {
          time: 0,
          reset() {
            this.time = 0;
          }
        };
        noInertiaController = controller;

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 248;
            if (width < 640) return 280;
            return 340;
          }

          function scaledX(x, width) {
            const normalized = Math.tanh(x / 2.25);
            return p.map(normalized, -1, 1, 38, width - 38);
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
            const gain = Number(gainInput.value);
            gainValue.textContent = `k=${gain.toFixed(2)}`;
            controller.time += p.deltaTime * 0.00055;

            p.clear();
            p.background(252, 248, 240);

            const axisY = p.height * 0.58;
            const zeroX = scaledX(0, p.width);
            const tiny = p.width < 430;

            p.noStroke();
            for (let i = 0; i < 7; i += 1) {
              p.fill(14, 114, 120, 13 - i);
              p.circle(p.width * 0.16, p.height * 0.2, 190 + i * 26);
            }

            p.stroke(27, 40, 48, 46);
            p.strokeWeight(1);
            p.line(28, axisY, p.width - 28, axisY);

            p.stroke(27, 40, 48, 86);
            p.strokeWeight(2);
            p.line(zeroX, axisY - 28, zeroX, axisY + 28);

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(tiny ? 10 : 12);
            p.text("misma posición, mismo futuro", 18, 20);
            p.text("x = 0", zeroX - 10, axisY + (tiny ? 38 : 46));

            const particles = seed.map((x0) => x0 * Math.exp(gain * controller.time));

            particles.forEach((x, index) => {
              const xPos = scaledX(x, p.width);
              const y = axisY + ((index % 3) - 1) * 18;
              const color = index < 3 ? "#d16f2b" : "#0e7278";

              p.stroke(color + "55");
              p.strokeWeight(1.5);
              p.line(xPos, y, xPos, axisY);

              p.noStroke();
              p.fill(color);
              p.circle(xPos, y, 12 + (index % 2) * 2);
            });
          };
        };

        new p5(sketch);

        gainInput.addEventListener("input", () => {
          renderInlineMath(gainValue.parentElement);
        });

        resetButton.addEventListener("click", () => controller.reset());
      }

      function initMemoryWorld() {
        const host = document.getElementById("viz-memory");
        const slider = document.getElementById("time-window");
        const label = document.getElementById("time-window-value");
        const resetButton = document.getElementById("reset-memory");
        const accelerations = [-1.4, -0.8, -0.2, 0.55, 1.2];
        const colors = ["#b6421f", "#d16f2b", "#1b2830", "#0e7278", "#2b9892"];
        const x0 = 0;
        const v0 = 1;

        function buildData(T) {
          return accelerations.map((a) => ({
            a,
            values: d3.range(0, T + 0.001, T / 100).map((t) => ({
              t,
              x: x0 + v0 * t + 0.5 * a * t * t
            }))
          }));
        }

        function animatePaths(selection) {
          selection.each(function () {
            const length = this.getTotalLength();
            d3.select(this)
              .attr("stroke-dasharray", `${length} ${length}`)
              .attr("stroke-dashoffset", length)
              .transition()
              .duration(1500)
              .ease(d3.easeCubicOut)
              .attr("stroke-dashoffset", 0);
          });
        }

        function render(restart = true) {
          const T = Number(slider.value);
          label.textContent = `T=${T.toFixed(1)}`;
          host.innerHTML = "";

          const width = host.clientWidth;
          const height = width < 420 ? 248 : width < 640 ? 280 : 340;
          const margin = { top: 24, right: 42, bottom: 42, left: 48 };
          const small = width < 500;
          const data = buildData(T);
          const yExtent = d3.extent(data.flatMap((curve) => curve.values.map((d) => d.x)));
          const pad = (yExtent[1] - yExtent[0]) * 0.16 || 1;

          const x = d3.scaleLinear().domain([0, T]).range([margin.left, width - margin.right]);
          const y = d3.scaleLinear().domain([yExtent[0] - pad, yExtent[1] + pad]).range([height - margin.bottom, margin.top]);

          const svg = d3
            .select(host)
            .append("svg")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", width)
            .attr("height", height);

          svg
            .append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("rx", 18)
            .attr("fill", "rgba(255,255,255,0.46)");

          const grid = svg.append("g").attr("stroke", "rgba(27,40,48,0.08)");
          x.ticks(6).forEach((tick) => {
            grid
              .append("line")
              .attr("x1", x(tick))
              .attr("x2", x(tick))
              .attr("y1", margin.top)
              .attr("y2", height - margin.bottom);
          });
          y.ticks(5).forEach((tick) => {
            grid
              .append("line")
              .attr("x1", margin.left)
              .attr("x2", width - margin.right)
              .attr("y1", y(tick))
              .attr("y2", y(tick));
          });

          svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(6))
            .call((g) => g.selectAll("path,line").attr("stroke", "rgba(27,40,48,0.32)"))
            .call((g) => g.selectAll("text").attr("fill", "#607180").style("font-family", "Manrope").style("font-size", small ? "10px" : "12px"));

          svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(5))
            .call((g) => g.selectAll("path,line").attr("stroke", "rgba(27,40,48,0.32)"))
            .call((g) => g.selectAll("text").attr("fill", "#607180").style("font-family", "Manrope").style("font-size", small ? "10px" : "12px"));

          const line = d3
            .line()
            .x((d) => x(d.t))
            .y((d) => y(d.x))
            .curve(d3.curveMonotoneX);

          const paths = svg
            .append("g")
            .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", "none")
            .attr("stroke", (_, i) => colors[i])
            .attr("stroke-width", (_, i) => (i === 2 ? 4 : 2.6))
            .attr("d", (d) => line(d.values));

          if (restart) {
            animatePaths(paths);
          }

          data.forEach((curve, index) => {
            const last = curve.values[curve.values.length - 1];
            svg
              .append("text")
              .attr("x", x(last.t) + (small ? 6 : 10))
              .attr("y", y(last.x))
              .attr("fill", colors[index])
              .attr("font-size", small ? 10 : 12)
              .attr("font-weight", 700)
              .text(`a₀=${curve.a.toFixed(1)}`);
          });

          svg
            .append("circle")
            .attr("cx", x(0))
            .attr("cy", y(0))
            .attr("r", 5)
            .attr("fill", "#1b2830");

          svg
            .append("line")
            .attr("x1", x(0))
            .attr("y1", y(0))
            .attr("x2", x(0.95))
            .attr("y2", y(0.95))
            .attr("stroke", "rgba(27,40,48,0.4)")
            .attr("stroke-dasharray", "6 5")
            .attr("stroke-width", 2);

          svg
            .append("text")
            .attr("x", x(1.05))
            .attr("y", y(1.0) - (small ? 8 : 12))
            .attr("fill", "#607180")
            .attr("font-size", small ? 10 : 12)
            .text(small ? "misma tangente" : "misma tangente inicial");
        }

        render(true);
        slider.addEventListener("input", () => render(true));
        resetButton.addEventListener("click", () => render(true));
        window.addEventListener("resize", () => render(false));
      }

      function initRealWorldSketch() {
        const host = document.getElementById("viz-real-world");
        const springInput = document.getElementById("spring-k");
        const springValue = document.getElementById("spring-k-value");
        const resetButton = document.getElementById("reset-real-world");
        const baseVelocities = [-1.45, -0.75, -0.15, 0.7, 1.4];
        const colors = ["#b6421f", "#d16f2b", "#1b2830", "#0e7278", "#2b9892"];

        const controller = {
          particles: [],
          reset() {
            this.particles = baseVelocities.map((v, index) => ({
              x: 0,
              v,
              lane: index,
              trail: [0]
            }));
          }
        };
        controller.reset();
        realWorldController = controller;

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 252;
            if (width < 640) return 286;
            return 340;
          }

          function trackY(index) {
            const center = p.height * 0.58;
            return center + (index - 2) * (p.width < 440 ? 18 : 22);
          }

          function scaledX(x, width) {
            const normalized = Math.tanh(x / 2.8);
            return p.map(normalized, -1, 1, 40, width - 40);
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
            const k = Number(springInput.value);
            springValue.textContent = `k = ${k.toFixed(2)}`;

            const rawDt = Math.min(p.deltaTime * 0.00105, 0.028);
            const substeps = 2;
            const dt = rawDt / substeps;

            for (let step = 0; step < substeps; step += 1) {
              controller.particles.forEach((particle) => {
                particle.v += -k * particle.x * dt;
                particle.x += particle.v * dt;
                particle.trail.push(particle.x);
                if (particle.trail.length > 150) particle.trail.shift();
              });
            }

            p.clear();
            p.background(252, 248, 240);

            const axisX = scaledX(0, p.width);
            const tiny = p.width < 430;

            p.noStroke();
            for (let i = 0; i < 6; i += 1) {
              p.fill(209, 111, 43, 11 - i);
              p.circle(p.width * 0.82, p.height * 0.2, 180 + i * 24);
            }

            p.stroke(27, 40, 48, 38);
            p.strokeWeight(1.2);
            controller.particles.forEach((particle) => {
              const y = trackY(particle.lane);
              p.line(34, y, p.width - 34, y);
            });

            p.stroke(27, 40, 48, 82);
            p.strokeWeight(2);
            p.line(axisX, 28, axisX, p.height - 30);

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(tiny ? 10 : 12);
            p.text(k === 0 ? "misma posición, futuros distintos por la velocidad" : "la fuerza curva historias, no inventa el estado", 18, 20);
            p.text("x = 0", axisX - 10, p.height - (tiny ? 12 : 10));

            controller.particles.forEach((particle, index) => {
              const y = trackY(index);

              p.noFill();
              p.stroke(colors[index] + "80");
              p.strokeWeight(index === 2 ? 2.8 : 2.2);
              p.beginShape();
              particle.trail.forEach((trailX) => {
                p.vertex(scaledX(trailX, p.width), y);
              });
              p.endShape();

              const xPos = scaledX(particle.x, p.width);
              p.noStroke();
              p.fill(colors[index]);
              p.circle(xPos, y, index === 2 ? 12 : 11);
            });
          };
        };

        new p5(sketch);

        springInput.addEventListener("input", () => controller.reset());
        resetButton.addEventListener("click", () => controller.reset());
      }

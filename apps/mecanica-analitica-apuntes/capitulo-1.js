      const Demo = window.CourseDemos;
      let noInertiaController;

      window.addEventListener("DOMContentLoaded", () => {
        Demo.renderMath(document.body);

        initSystemVsConfigurationViz();
        initModelPruningViz();
        initPendulumConfigViz();
        initLawRuleViz();
        initReversibilitySketch();
        initStateFlowSketch();
        initAttractorFieldSketch();
        initNoInertiaSketch();
        initMemoryWorld();
        initPhaseProjectionSketch();
      });

      function renderInlineMath(container) {
        Demo.renderMath(container);
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
          Demo.syncButtons({
            particle: particleButton,
            pendulum: pendulumButton,
            double: doubleButton
          }, controller.mode);
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
          Demo.setButtonVariant(dragButton, controller.drag);
          Demo.setButtonVariant(supportButton, controller.support);
          Demo.setButtonVariant(elasticityButton, controller.elasticity);
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
          map: "salto discreto de un presente al siguiente",
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
          Demo.syncButtons({
            flow: flowButton,
            map: mapButton,
            histories: historiesButton
          }, controller.mode);
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
              .text("aquí la ley no deriva: actualiza el presente en pasos discretos");
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
            Demo.drawArrow(
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
              Demo.drawArrow(
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
              Demo.drawArrow(
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
            Demo.drawArrow(
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
            Demo.setupP5Canvas(p, host, vizHeight, { onSetup: syncPauseUi });
          };

          p.windowResized = () => {
            Demo.resizeP5Canvas(p, host, vizHeight);
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

      function initStateFlowSketch() {
        const host = document.getElementById("viz-state-flow");
        const resetButton = document.getElementById("reset-state-flow");
        const qButton = document.getElementById("state-flow-q");
        const qetaButton = document.getElementById("state-flow-qeta");
        const qetaalphaButton = document.getElementById("state-flow-qetaalpha");
        const caption = document.getElementById("state-flow-caption");
        if (!host || !resetButton || !qButton || !qetaButton || !qetaalphaButton || !caption) return;

        const labels = {
          q: "el punto q intenta decidirlo todo",
          qeta: "cada punto (q,η) trae una flecha completa",
          qetaalpha: "el tercer dato abre flechas distintas desde el mismo (q,η)"
        };

        const controller = {
          mode: "q",
          time: 0,
          setMode(mode) {
            this.mode = mode;
            syncUi();
          },
          reset() {
            this.time = 0;
            syncUi();
          }
        };

        function syncUi() {
          Demo.syncButtons({
            q: qButton,
            qeta: qetaButton,
            qetaalpha: qetaalphaButton
          }, controller.mode);
          caption.textContent = labels[controller.mode];
        }

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 430) return 430;
            if (width < 720) return 440;
            return 400;
          }

          function panel(x, y, w, h, title, subtitle) {
            p.noStroke();
            p.fill(255, 255, 255, 168);
            p.rect(x, y, w, h, 20);
            p.stroke(27, 40, 48, 18);
            p.strokeWeight(1);
            p.rect(x, y, w, h, 20);
            p.noStroke();
            p.fill(27, 40, 48);
            p.textAlign(p.LEFT, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(p.width < 430 ? 11 : 13);
            p.text(title, x + 16, y + 15);
            p.textStyle(p.NORMAL);
            p.fill(96, 113, 128);
            p.textSize(p.width < 430 ? 10 : 11);
            p.text(subtitle, x + 16, y + 37, w - 32);
          }

          function drawFormula(text, x, y) {
            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(p.width < 430 ? 11 : 13);
            p.text(text, x, y);
          }

          function drawQMode(x0, y0, w, h) {
            panel(x0, y0, w, h, "presente candidato: s = q", "la configuración intenta traer una sola flecha");
            const axisY = y0 + h * 0.56;
            const left = x0 + 54;
            const right = x0 + w - 42;
            p.stroke(27, 40, 48, 38);
            p.strokeWeight(1.4);
            p.line(left, axisY, right, axisY);
            p.noStroke();
            p.fill(96, 113, 128);
            p.textSize(11);
            p.text("q", right - 8, axisY + 12);

            [-0.9, -0.45, 0.05, 0.55, 0.95].forEach((q) => {
              const x = p.map(q, -1, 1, left, right);
              const u = -0.52 * q;
              const end = x + u * 70;
              Demo.drawArrow(p, x - Math.sign(u || 1) * 12, axisY - 20, end, axisY - 20, "rgba(14,114,120,0.62)", 2);
              p.noStroke();
              p.fill("#0e7278");
              p.circle(x, axisY, 8);
            });

            const q = 0.82 * Math.cos(controller.time * 0.85);
            const x = p.map(q, -1, 1, left, right);
            p.noStroke();
            p.fill("#d16f2b");
            p.circle(x, axisY + 30, 13);
            drawFormula("s = q    →    q̇ = f(q,t)", x0 + 22, y0 + h - 42);
          }

          function drawQEtaMode(x0, y0, w, h) {
            panel(x0, y0, w, h, "presente candidato: s = (q,η)", "el flujo vive en un plano de presentes");
            const cx = x0 + w * 0.52;
            const cy = y0 + h * 0.57;
            const rx = Math.min(w * 0.31, 150);
            const ry = Math.min(h * 0.28, 92);
            const viewport = new Demo.Viewport2D(p, {
              left: cx - rx,
              right: cx + rx,
              top: cy - ry,
              bottom: cy + ry
            }, {
              x: [-1, 1],
              y: [-1, 1]
            });

            p.stroke(27, 40, 48, 38);
            p.strokeWeight(1.3);
            p.line(cx - rx - 22, cy, cx + rx + 22, cy);
            p.line(cx, cy + ry + 22, cx, cy - ry - 22);
            p.noStroke();
            p.fill(96, 113, 128);
            p.textSize(11);
            p.text("q", cx + rx + 20, cy + 6);
            p.text("η", cx + 8, cy - ry - 24);

            Demo.drawVectorField(p, viewport, {
              xs: Demo.range(-1, 1, 1 / 3),
              ys: Demo.range(-1, 1, 0.5),
              field: ({ x: q, y: eta }) => ({ x: eta, y: -q }),
              length: 20,
              color: "rgba(96,113,128,0.48)",
              weight: 1.2
            });

            p.noFill();
            p.stroke("#0e7278");
            p.strokeWeight(2.6);
            p.ellipse(cx, cy, rx * 1.55, ry * 1.55);
            const theta = controller.time * 0.75;
            const q = 0.78 * Math.cos(theta);
            const eta = -0.78 * Math.sin(theta);
            const pt = viewport.point({ x: q, y: eta });
            p.noStroke();
            p.fill("#0e7278");
            p.circle(pt.x, pt.y, 13);
            drawFormula("s = (q,η)    →    (q̇,η̇)=X(q,η,t)", x0 + 22, y0 + h - 42);
          }

          function drawQEtaAlphaMode(x0, y0, w, h) {
            panel(x0, y0, w, h, "presente candidato: s = (q,η,α)", "la misma sombra (q,η) puede esconder varios α");
            const cx = x0 + w * 0.47;
            const cy = y0 + h * 0.56;
            const rx = Math.min(w * 0.28, 132);
            const ry = Math.min(h * 0.25, 82);

            p.stroke(27, 40, 48, 34);
            p.strokeWeight(1.3);
            p.line(cx - rx - 20, cy, cx + rx + 20, cy);
            p.line(cx, cy + ry + 20, cx, cy - ry - 20);
            p.noStroke();
            p.fill(96, 113, 128);
            p.textSize(11);
            p.text("q", cx + rx + 19, cy + 6);
            p.text("η", cx + 8, cy - ry - 23);

            const base = { x: cx - rx * 0.32, y: cy + ry * 0.12 };
            p.stroke(27, 40, 48, 24);
            p.line(base.x, cy - ry - 18, base.x, cy + ry + 18);
            p.noStroke();
            p.fill("#1b2830");
            p.circle(base.x, base.y, 12);

            const branches = [
              { alpha: "-α", color: "#b6421f", dy: 58 },
              { alpha: "0", color: "#1b2830", dy: 10 },
              { alpha: "+α", color: "#0e7278", dy: -42 }
            ];
            branches.forEach((branch, index) => {
              const endX = base.x + rx * 0.82;
              const endY = base.y + branch.dy;
              Demo.drawArrow(p, base.x + 6, base.y + (index - 1) * 2, endX, endY, branch.color, 2.4);
              p.noStroke();
              p.fill(branch.color);
              p.textStyle(p.BOLD);
              p.textSize(11);
              p.text(branch.alpha, endX + 10, endY - 6);
            });

            p.noStroke();
            p.fill(96, 113, 128);
            p.textStyle(p.NORMAL);
            p.textSize(p.width < 430 ? 10 : 11);
            p.text("mismo (q,η), flechas distintas si α es libre", x0 + 22, y0 + h - 64, w - 44);
            drawFormula("s = (q,η,α)    →    más memoria pide más física", x0 + 22, y0 + h - 42);
          }

          p.setup = () => {
            Demo.setupP5Canvas(p, host, vizHeight, { font: "Manrope" });
          };

          p.windowResized = () => {
            Demo.resizeP5Canvas(p, host, vizHeight);
          };

          p.draw = () => {
            controller.time += p.deltaTime * 0.001;
            p.clear();
            p.background(252, 248, 240);

            p.noStroke();
            for (let i = 0; i < 7; i += 1) {
              p.fill(14, 114, 120, 10 - i);
              p.circle(p.width * 0.83, p.height * 0.18, 170 + i * 22);
            }

            const margin = 18;
            const x = margin;
            const y = margin;
            const w = p.width - margin * 2;
            const h = p.height - margin * 2;
            if (controller.mode === "q") drawQMode(x, y, w, h);
            if (controller.mode === "qeta") drawQEtaMode(x, y, w, h);
            if (controller.mode === "qetaalpha") drawQEtaAlphaMode(x, y, w, h);
          };
        };

        new p5(sketch);
        qButton.addEventListener("click", () => controller.setMode("q"));
        qetaButton.addEventListener("click", () => controller.setMode("qeta"));
        qetaalphaButton.addEventListener("click", () => controller.setMode("qetaalpha"));
        resetButton.addEventListener("click", () => controller.reset());
        syncUi();
      }

      function initPhaseProjectionSketch() {
        const host = document.getElementById("viz-phase-projection");
        const resetButton = document.getElementById("reset-phase-projection");
        const energyInput = document.getElementById("phase-energy");
        const energyValue = document.getElementById("phase-energy-value");
        if (!host || !resetButton || !energyInput || !energyValue) return;

        const controller = {
          time: 0,
          radius: Number(energyInput.value),
          reset() {
            this.time = 0;
            this.radius = 0.72;
            energyInput.value = String(this.radius);
            syncUi();
          }
        };

        function syncUi() {
          controller.radius = Number(energyInput.value);
          energyValue.textContent = `radio = ${controller.radius.toFixed(2)}`;
        }

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 430) return 720;
            if (width < 760) return 650;
            return 600;
          }

          function graphPoint(originX, originY, w, h, t, y, yMin, yMax) {
            return {
              x: originX + (t / (2 * Math.PI)) * w,
              y: originY + h - ((y - yMin) / (yMax - yMin)) * h
            };
          }

          function panel(x, y, w, h, title, subtitle) {
            p.noStroke();
            p.fill(255, 255, 255, 172);
            p.rect(x, y, w, h, 20);
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textStyle(p.BOLD);
            p.textSize(p.width < 430 ? 10 : 12);
            p.text(title, x + 16, y + 14);
            if (subtitle) {
              p.textStyle(p.NORMAL);
              p.textSize(p.width < 430 ? 9.5 : 11);
              p.fill(96, 113, 128, 215);
              p.text(subtitle, x + 16, y + 34, w - 32);
            }
          }

          p.setup = () => {
            Demo.setupP5Canvas(p, host, vizHeight, { font: "Manrope", onSetup: syncUi });
          };

          p.windowResized = () => {
            Demo.resizeP5Canvas(p, host, vizHeight);
          };

          p.draw = () => {
            syncUi();
            controller.time += p.deltaTime * 0.0007;
            const theta = (0.55 + controller.time) % (2 * Math.PI);
            const mirrorTheta = (2 * Math.PI - theta) % (2 * Math.PI);
            const radius = controller.radius;
            const x = radius * Math.cos(theta);
            const v = -radius * Math.sin(theta);
            const mirrorX = radius * Math.cos(mirrorTheta);
            const mirrorV = -radius * Math.sin(mirrorTheta);

            p.clear();
            p.background(252, 248, 240);

            const margin = 18;
            const gap = 16;
            const phaseHeight = p.width < 560 ? p.height * 0.56 : p.height * 0.58;
            const phaseX = margin;
            const phaseY = margin;
            const phaseW = p.width - margin * 2;
            const phaseH = phaseHeight - margin;
            drawPhasePanel(phaseX, phaseY, phaseW, phaseH, x, v, mirrorX, mirrorV, radius);

            const bottomY = phaseY + phaseH + gap;
            const bottomH = p.height - bottomY - margin;
            if (p.width < 620) {
              const half = (bottomH - gap) / 2;
              drawProjectionPanel(margin, bottomY, phaseW, half, theta, mirrorTheta, radius, "x(t)", "misma posición, dos visitas", (t) => radius * Math.cos(t));
              drawProjectionPanel(margin, bottomY + half + gap, phaseW, half, theta, mirrorTheta, radius, "η(t)", "datos de cambio opuestos", (t) => -radius * Math.sin(t));
            } else {
              const panelW = (phaseW - gap) / 2;
              drawProjectionPanel(margin, bottomY, panelW, bottomH, theta, mirrorTheta, radius, "x(t)", "misma posición, dos visitas", (t) => radius * Math.cos(t));
              drawProjectionPanel(margin + panelW + gap, bottomY, panelW, bottomH, theta, mirrorTheta, radius, "η(t)", "datos de cambio opuestos", (t) => -radius * Math.sin(t));
            }
          };

          function drawProjectionPanel(x0, y0, w, h, theta, mirrorTheta, radius, title, subtitle, valueAt) {
            panel(x0, y0, w, h, title, subtitle);

            const plotX = x0 + 18;
            const plotY = y0 + 52;
            const plotW = w - 36;
            const plotH = h - 72;

            p.stroke(27, 40, 48, 36);
            p.strokeWeight(1.2);
            p.line(plotX, plotY + plotH / 2, plotX + plotW, plotY + plotH / 2);

            p.noFill();
            p.stroke(27, 40, 48, 180);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i <= 100; i += 1) {
              const t = (2 * Math.PI * i) / 100;
              const pt = graphPoint(plotX, plotY, plotW, plotH, t, valueAt(t), -1.1, 1.1);
              p.vertex(pt.x, pt.y);
            }
            p.endShape();

            const current = graphPoint(plotX, plotY, plotW, plotH, theta, valueAt(theta), -1.1, 1.1);
            const mirror = graphPoint(plotX, plotY, plotW, plotH, mirrorTheta, valueAt(mirrorTheta), -1.1, 1.1);
            p.stroke(27, 40, 48, 24);
            p.line(current.x, plotY, current.x, plotY + plotH);
            p.line(mirror.x, plotY, mirror.x, plotY + plotH);
            p.noStroke();
            p.fill("#0e7278");
            p.circle(current.x, current.y, 10);
            p.fill("#d16f2b");
            p.circle(mirror.x, mirror.y, 10);
          }

          function drawPhasePanel(x0, y0, w, h, x, v, mirrorX, mirrorV, radius) {
            panel(x0, y0, w, h, "plano de estados (x,η)", "cada flecha es la continuación local: (ẋ,η̇)=(η,−x)");

            const cx = x0 + w * 0.5;
            const cy = y0 + h * 0.56;
            const rx = Math.min(w * 0.34, 170);
            const ry = Math.min(h * 0.34, 120);
            const viewport = new Demo.Viewport2D(p, {
              left: cx - rx,
              right: cx + rx,
              top: cy - ry,
              bottom: cy + ry
            }, {
              x: [-1, 1],
              y: [-1, 1]
            });

            p.stroke(27, 40, 48, 40);
            p.strokeWeight(1.2);
            p.line(cx - rx - 24, cy, cx + rx + 24, cy);
            p.line(cx, cy + ry + 24, cx, cy - ry - 24);

            Demo.drawVectorField(p, viewport, {
              xs: Demo.range(-1, 1, 0.25),
              ys: Demo.range(-1, 1, 1 / 3),
              field: ({ x: stateX, y: stateV }) => ({ x: stateV, y: -stateX }),
              length: Math.min(24, Math.max(12, Math.min(rx, ry) * 0.12)),
              color: "rgba(96,113,128,0.48)",
              weight: 1.25
            });

            p.noFill();
            p.stroke("#0e7278");
            p.strokeWeight(2.7);
            p.ellipse(cx, cy, rx * radius * 2, ry * radius * 2);

            const current = viewport.point({ x, y: v });
            const mirror = viewport.point({ x: mirrorX, y: mirrorV });
            p.stroke(27, 40, 48, 24);
            p.line(current.x, current.y, mirror.x, mirror.y);

            viewport.drawVector({ x, y: v }, { x: v, y: -x }, {
              anchor: "tail",
              color: "#0e7278",
              length: 46,
              weight: 3
            });

            p.noStroke();
            p.fill("#0e7278");
            p.circle(current.x, current.y, 13);
            p.fill("#d16f2b");
            p.circle(mirror.x, mirror.y, 11);
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.TOP);
            p.textStyle(p.NORMAL);
            p.textSize(p.width < 430 ? 10 : 12);
            p.text("azul: estado actual; naranja: misma x, η opuesta", x0 + 16, y0 + h - 26, w - 32);
          }
        };

        new p5(sketch);
        energyInput.addEventListener("input", syncUi);
        resetButton.addEventListener("click", () => controller.reset());
        syncUi();
      }

      function initAttractorFieldSketch() {
        const host = document.getElementById("viz-attractor-field");
        const kInput = document.getElementById("attractor-field-k");
        const kValue = document.getElementById("attractor-field-k-value");
        const resetButton = document.getElementById("reset-attractor-field");
        if (!host || !kInput || !kValue || !resetButton) return;

        const attractor = { x: 0.45, y: 0.15 };
        const controller = {
          time: 0,
          reset() {
            this.time = 0;
            kInput.value = "0.95";
            syncUi();
          }
        };

        const starts = [
          { x: -1.75, y: 1.25 },
          { x: -1.55, y: -1.2 },
          { x: -0.25, y: 1.55 },
          { x: 1.75, y: 1.0 },
          { x: 1.55, y: -1.35 },
          { x: -1.95, y: 0.05 }
        ];

        function syncUi() {
          kValue.textContent = `k=${Number(kInput.value).toFixed(2)}`;
        }

        function drawAttractor(p, viewport) {
          const { x: ax, y: ay } = viewport.point(attractor);
          p.noStroke();
          for (let i = 0; i < 5; i += 1) {
            p.fill(209, 111, 43, 30 - i * 4);
            p.circle(ax, ay, 76 + i * 18);
          }

          p.noFill();
          p.stroke("#d16f2b");
          p.strokeWeight(2.4);
          p.circle(ax, ay, 56);
          p.stroke("rgba(209,111,43,0.65)");
          p.strokeWeight(1.6);
          p.circle(ax, ay, 34);
          p.line(ax - 34, ay, ax + 34, ay);
          p.line(ax, ay - 34, ax, ay + 34);

          p.noStroke();
          p.fill("#b6421f");
          p.circle(ax, ay, 12);
          p.fill("#1b2830");
          p.textAlign(p.LEFT, p.BOTTOM);
          p.textStyle(p.BOLD);
          p.textSize(p.width < 440 ? 13 : 15);
          p.text("A", ax + 13, ay - 9);
          p.textStyle(p.NORMAL);
          p.fill(96, 113, 128);
          p.textSize(p.width < 440 ? 10 : 11);
          p.text("lugar marcado", ax + 13, ay + 8);
        }

        function drawParticles(p, viewport, k) {
          const cycle = 4.6;
          starts.forEach((start, index) => {
            const tau = (controller.time + index * 0.55) % cycle;
            const point = Demo.exponentialToward(start, attractor, k * 0.9, tau);
            const previous = Demo.exponentialToward(start, attractor, k * 0.9, Math.max(0, tau - 0.32));

            viewport.drawSegment(previous, point, { color: "rgba(14,114,120,0.35)", weight: 2 });
            viewport.drawPoint(point, { color: "#0e7278", radius: index === 1 ? 12 : 10 });
          });
        }

        Demo.createP5Demo(host, {
          font: "Manrope",
          height(width) {
            return Demo.responsiveHeight(width, [
              { max: 430, height: 390 },
              { max: 680, height: 430 }
            ], 380);
          },
          setup: syncUi,
          draw(p, { dt }) {
            const k = Number(kInput.value);
            controller.time += dt;
            syncUi();

            p.noStroke();
            p.fill(255, 255, 255, 156);
            p.rect(16, 16, p.width - 32, p.height - 32, 18);

            const bounds = {
              left: 34,
              right: p.width - 34,
              top: 34,
              bottom: p.height - 48
            };

            const viewport = new Demo.Viewport2D(p, bounds, {
              x: [-2.2, 2.2],
              y: [-1.75, 1.75]
            });

            viewport.drawGrid({
              color: "rgba(27,40,48,0.08)",
              xTicks: Demo.range(-2, 2, 0.5),
              yTicks: Demo.range(-1.5, 1.5, 0.5)
            });
            viewport.drawAxes({ color: "rgba(27,40,48,0.22)", weight: 1.4 });

            p.noStroke();
            p.fill(96, 113, 128);
            p.textSize(p.width < 440 ? 10 : 11);
            p.textAlign(p.RIGHT, p.TOP);
            p.text("plano de configuraciones", bounds.right, bounds.top + 2);

            Demo.drawVectorField(p, viewport, {
              xs: Demo.range(-1.75, 1.75, 0.58),
              ys: Demo.range(-1.25, 1.25, 0.5),
              field: ({ x, y }) => ({ x: attractor.x - x, y: attractor.y - y }),
              skip: ({ norm }) => norm < 0.16,
              length: ({ norm }) => p.constrain(18 + 8 * k + norm * 2, 18, 34),
              color: "rgba(96,113,128,0.52)",
              weight: 1.25
            });

            drawParticles(p, viewport, k);
            drawAttractor(p, viewport);

            p.noStroke();
            p.fill(96, 113, 128);
            p.textAlign(p.LEFT, p.BOTTOM);
            p.textStyle(p.NORMAL);
            p.textSize(p.width < 440 ? 10 : 11);
            p.text("campo local: ṙ = -k(r - A)", 34, p.height - 18);
          }
        });

        kInput.addEventListener("input", syncUi);
        resetButton.addEventListener("click", () => controller.reset());
      }

      function initNoInertiaSketch() {
        const host = document.getElementById("viz-no-inertia");
        const resetButton = document.getElementById("reset-no-inertia");
        const allButton = document.getElementById("no-inertia-all");
        const attractorButton = document.getElementById("no-inertia-attractor");
        const driftButton = document.getElementById("no-inertia-drift");
        const restButton = document.getElementById("no-inertia-rest");
        const caption = document.getElementById("no-inertia-caption");

        if (!host || !resetButton || !allButton || !attractorButton || !driftButton || !restButton || !caption) return;

        const labels = {
          all: "todas las salidas posibles rompen algo",
          attractor: "mueve, pero inventa un lugar especial",
          drift: "mueve, pero inventa un sentido especial",
          rest: "no privilegia nada, pero tampoco permite lanzamiento"
        };

        const controller = {
          time: 0,
          mode: "all",
          setMode(mode) {
            this.mode = mode;
            syncUi();
          },
          reset() {
            this.time = 0;
          }
        };
        noInertiaController = controller;

        function syncButtons() {
          Demo.syncButtons({
            all: allButton,
            attractor: attractorButton,
            drift: driftButton,
            rest: restButton
          }, controller.mode);
        }

        function syncUi() {
          syncButtons();
          caption.textContent = labels[controller.mode];
        }

        const sketch = (p) => {
          function vizHeight() {
            const width = host.clientWidth;
            if (width < 420) return 470;
            if (width < 640) return 490;
            return 450;
          }

          function scaledX(x) {
            return p.map(x, -2, 2, 56, p.width - 56);
          }

          function focusAlpha(key) {
            return controller.mode === "all" || controller.mode === key ? 1 : 0.32;
          }

          function laneTextSize() {
            if (p.width < 430) return 10;
            return 12;
          }

          function drawSoftText(text, x, y, maxWidth) {
            p.noStroke();
            p.fill(96, 113, 128);
            p.textSize(laneTextSize());
            p.textStyle(p.NORMAL);
            p.text(text, x, y, maxWidth);
          }

          function drawLaneFrame(y, h, alpha) {
            p.noStroke();
            p.fill(255, 255, 255, 54 + alpha * 120);
            p.rect(18, y, p.width - 36, h, 18);
            p.stroke(27, 40, 48, 18 + alpha * 38);
            p.strokeWeight(1);
            p.line(44, y + h * 0.62, p.width - 44, y + h * 0.62);
          }

          function drawParticle(x, y, rgb, alpha, radius = 10) {
            p.noStroke();
            p.fill(rgb[0], rgb[1], rgb[2], 210 * alpha);
            p.circle(scaledX(x), y, radius);
          }

          function drawAttractor(y, h, t, alpha) {
            const axisY = y + h * 0.62;
            const zeroX = scaledX(0);
            const color = [182, 66, 31];
            const arrowY = axisY - 20;
            const arrowPoints = [-1.55, -0.8, 0.8, 1.55];

            p.stroke(color[0], color[1], color[2], 70 + alpha * 120);
            p.strokeWeight(2);
            p.line(zeroX, y + 26, zeroX, y + h - 18);
            p.noStroke();
            p.fill(color[0], color[1], color[2], 220 * alpha);
            p.circle(zeroX, axisY, 9);

            arrowPoints.forEach((x) => {
              const startX = scaledX(x);
              const endX = scaledX(x * 0.72);
              Demo.drawArrow(p, startX, arrowY, endX, arrowY, `rgba(182, 66, 31, ${0.25 + alpha * 0.55})`, 2);
            });

            [-1.45, -0.7, 0.55, 1.35].forEach((x0, index) => {
              const x = x0 * Math.exp(-0.9 * t);
              drawParticle(x, axisY + ((index % 2) * 2 - 1) * 12, color, alpha, 11);
            });

            drawSoftText("lugar especial: x = 0", zeroX + 10, y + h - 26, 150);
          }

          function drawDrift(y, h, t, alpha) {
            const axisY = y + h * 0.62;
            const color = [14, 114, 120];
            const arrowY = axisY - 20;
            [-1.45, -0.65, 0.15, 0.95].forEach((x) => {
              Demo.drawArrow(p, scaledX(x), arrowY, scaledX(x + 0.42), arrowY, `rgba(14, 114, 120, ${0.25 + alpha * 0.55})`, 2);
            });

            const phase = (t * 0.45) % 4;
            [-1.75, -1.05, -0.35, 0.35].forEach((x0, index) => {
              const wrapped = ((x0 + phase + 2) % 4) - 2;
              drawParticle(wrapped, axisY + ((index % 2) * 2 - 1) * 12, color, alpha, 11);
            });

            drawSoftText("sentido especial: todas las flechas miran igual", 42, y + h - 26, p.width - 84);
          }

          function drawRest(y, h, alpha) {
            const axisY = y + h * 0.62;
            const color = [27, 40, 48];
            [-1.4, -0.55, 0.45, 1.3].forEach((x, index) => {
              const xPos = scaledX(x);
              p.stroke(color[0], color[1], color[2], 55 + alpha * 80);
              p.strokeWeight(2);
              p.line(xPos - 7, axisY - 20, xPos + 7, axisY - 20);
              drawParticle(x, axisY + ((index % 2) * 2 - 1) * 12, color, alpha, 10);
            });

            p.stroke(96, 113, 128, 70 * alpha);
            p.strokeWeight(2);
            const x0 = scaledX(0.65);
            p.line(x0 - 16, axisY - 38, x0 + 16, axisY - 10);
            p.line(x0 + 16, axisY - 38, x0 - 16, axisY - 10);
            drawSoftText("sin dato de lanzamiento: no hay memoria inercial", 42, y + h - 26, p.width - 84);
          }

          function drawLaneHeader(y, title, formula, summary, alpha) {
            p.noStroke();
            p.fill(27, 40, 48, 235 * alpha);
            p.textStyle(p.BOLD);
            p.textAlign(p.LEFT, p.TOP);
            p.textSize(p.width < 430 ? 11 : 13);
            p.text(title, 36, y + 18);
            p.textStyle(p.NORMAL);
            p.fill(96, 113, 128, 235 * alpha);
            p.textSize(p.width < 430 ? 10 : 12);
            p.text(formula, 36, y + 40);
            if (p.width > 500) {
              p.text(summary, p.width * 0.45, y + 19, p.width * 0.45);
            } else {
              p.text(summary, 120, y + 18, p.width - 150);
            }
          }

          p.setup = () => {
            Demo.setupP5Canvas(p, host, vizHeight);
          };

          p.windowResized = () => {
            Demo.resizeP5Canvas(p, host, vizHeight);
          };

          p.draw = () => {
            controller.time += p.deltaTime * 0.001;
            const t = controller.time % 5.2;

            p.clear();
            p.background(252, 248, 240);

            p.noStroke();
            for (let i = 0; i < 7; i += 1) {
              p.fill(14, 114, 120, 10 - i);
              p.circle(p.width * 0.12, p.height * 0.08, 160 + i * 24);
            }

            const top = 18;
            const gap = 12;
            const laneH = (p.height - top * 2 - gap * 2) / 3;

            const lanes = [
              {
                key: "attractor",
                title: "Atractor",
                formula: "dx/dt = -kx",
                summary: "mueve, pero marca un origen físico",
                draw: (y, h, alpha) => drawAttractor(y, h, t, alpha)
              },
              {
                key: "drift",
                title: "Deriva",
                formula: "dx/dt = c",
                summary: "mueve, pero marca una dirección física",
                draw: (y, h, alpha) => drawDrift(y, h, t, alpha)
              },
              {
                key: "rest",
                title: "Reposo",
                formula: "dx/dt = 0",
                summary: "no privilegia nada, pero no hay lanzamiento",
                draw: (y, h, alpha) => drawRest(y, h, alpha)
              }
            ];

            lanes.forEach((lane, index) => {
              const y = top + index * (laneH + gap);
              const alpha = focusAlpha(lane.key);
              drawLaneFrame(y, laneH, alpha);
              drawLaneHeader(y, lane.title, lane.formula, lane.summary, alpha);
              lane.draw(y, laneH, alpha);
            });
          };
        };

        new p5(sketch);

        resetButton.addEventListener("click", () => controller.reset());
        allButton.addEventListener("click", () => controller.setMode("all"));
        attractorButton.addEventListener("click", () => controller.setMode("attractor"));
        driftButton.addEventListener("click", () => controller.setMode("drift"));
        restButton.addEventListener("click", () => controller.setMode("rest"));
        syncUi();
      }

      function initMemoryWorld() {
        const host = document.getElementById("viz-memory");
        const slider = document.getElementById("time-window");
        const label = document.getElementById("time-window-value");
        const resetButton = document.getElementById("reset-memory");
        const alphas = [-1.25, -0.65, 0, 0.65, 1.25];
        const colors = ["#b6421f", "#d16f2b", "#1b2830", "#0e7278", "#2b9892"];
        const x0 = 0;
        const eta0 = 1;

        if (!host || !slider || !label || !resetButton) return;

        function buildData(T) {
          return alphas.map((alpha) => ({
            alpha,
            values: d3.range(0, T + 0.001, T / 100).map((t) => ({
              t,
              x: x0 + eta0 * t + 0.5 * alpha * t * t,
              eta: eta0 + alpha * t
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

          const width = host.clientWidth;
          const small = width < 520;
          const height = small ? 570 : width < 760 ? 560 : 510;
          const topPanel = {
            x: 18,
            y: 18,
            w: width - 36,
            h: small ? 244 : 218
          };
          const graphTop = topPanel.y + topPanel.h + 28;
          const margin = { top: graphTop + 52, right: 38, bottom: 42, left: 48 };
          const data = buildData(T);
          const yExtent = d3.extent(data.flatMap((curve) => curve.values.map((d) => d.x)));
          const pad = (yExtent[1] - yExtent[0]) * 0.16 || 1;

          const x = d3.scaleLinear().domain([0, T]).range([margin.left, width - margin.right]);
          const y = d3.scaleLinear().domain([yExtent[0] - pad, yExtent[1] + pad]).range([height - margin.bottom, margin.top]);

          const svg = Demo.createSvg(host, height);
          Demo.addSvgArrowMarker(svg, "memory-arrow");

          Demo.svgPanel(svg, {
            x: topPanel.x,
            y: topPanel.y,
            w: topPanel.w,
            h: topPanel.h,
            title: "campo en el espacio ampliado",
            subtitle: "ejemplo: (ẋ,η̇,α̇)=(η,α,0)"
          });

          const layerX0 = topPanel.x + (small ? 26 : 34);
          const layerX1 = topPanel.x + topPanel.w - (small ? 24 : 34);
          const layerTop = topPanel.y + 70;
          const layerBottom = topPanel.y + topPanel.h - 34;
          const layerY = d3.scaleLinear().domain([1.35, -1.35]).range([layerTop, layerBottom]);
          const stateX = layerX0 + (layerX1 - layerX0) * 0.37;
          const arrowDx = small ? 46 : 64;

          svg
            .append("text")
            .attr("x", layerX0)
            .attr("y", topPanel.y + topPanel.h - 13)
            .attr("fill", "#607180")
            .attr("font-size", small ? 10 : 11)
            .text("mismo (x₀,η₀); capas α distintas pintan flechas distintas");

          alphas.forEach((alpha, index) => {
            const yLayer = layerY(alpha);
            const arrowDy = -alpha * (small ? 18 : 22);
            const color = colors[index];

            svg
              .append("line")
              .attr("x1", layerX0)
              .attr("x2", layerX1)
              .attr("y1", yLayer)
              .attr("y2", yLayer)
              .attr("stroke", "rgba(27,40,48,0.10)")
              .attr("stroke-width", 1.2);

            svg
              .append("text")
              .attr("x", layerX0)
              .attr("y", yLayer - 7)
              .attr("fill", color)
              .attr("font-size", small ? 9 : 10)
              .attr("font-weight", 800)
              .text(`α=${alpha.toFixed(index === 2 ? 0 : 2)}`);

            svg
              .append("circle")
              .attr("cx", stateX)
              .attr("cy", yLayer)
              .attr("r", index === 2 ? 6.5 : 5.4)
              .attr("fill", color);

            svg
              .append("line")
              .attr("x1", stateX + 8)
              .attr("y1", yLayer)
              .attr("x2", stateX + arrowDx)
              .attr("y2", yLayer + arrowDy)
              .attr("stroke", color)
              .attr("stroke-width", index === 2 ? 3 : 2.2)
              .attr("marker-end", "url(#memory-arrow)");

            if (!small) {
              svg
                .append("text")
                .attr("x", stateX + arrowDx + 12)
                .attr("y", yLayer + arrowDy + 4)
                .attr("fill", "#607180")
                .attr("font-size", 10)
                .text(alpha === 0 ? "η no cambia" : alpha > 0 ? "η aumenta" : "η disminuye");
            }
          });

          Demo.svgPanel(svg, {
            x: margin.left - 18,
            y: margin.top - 14,
            w: width - margin.left - margin.right + 36,
            h: height - margin.top - margin.bottom + 34,
            title: "proyección sobre x(t)",
            subtitle: "al olvidar α, un solo presente visible abre futuros distintos"
          });

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
              .attr("x", x(last.t) - 8)
              .attr("y", y(last.x))
              .attr("fill", colors[index])
              .attr("font-size", small ? 10 : 12)
              .attr("font-weight", 700)
              .attr("text-anchor", "end")
              .text(`α₀=${curve.alpha.toFixed(1)}`);
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
            .text(small ? "mismo η₀" : "mismo dato de cambio η₀");
        }

        render(true);
        slider.addEventListener("input", () => render(true));
        resetButton.addEventListener("click", () => {
          slider.value = "4.5";
          render(true);
        });
        window.addEventListener("resize", () => render(false));
      }

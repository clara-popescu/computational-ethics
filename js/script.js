gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(DrawSVGPlugin);


// page 1 ////////////////////////////////////////////////////////////////////////////////////////////////////////////
const totalDots = 189; // 18,908,650 -> one dot is 100,000 people
const dotRadius = 7;
const clusterSpacing = 250; // distance between clusters

// ===== CANDIDATES =====
let candidates = [
  { name: "Calin Georgescu", ratio: 0.051, color: "#FFE020" },
  { name: "Elena Lasconi", ratio: 0.152, color: "#D1D5DC" },
  { name: "Marcel Ciolacu", ratio: 0.2568, color: "#D1D5DC" },
  { name: "George Simion", ratio: 0.176, color: "#D1D5DC" },
  { name: "Others", ratio: 0.3642, color: "#D1D5DC" }
];

// ===== DOTS =====
let dots = [];
for (let i = 0; i < totalDots; i++) {
  dots.push({ id: i, candidate: null, x: 0, y: 0, prevCandidate: null });
}

// ===== CONTAINER + SVG =====
const container = d3.select("#voteClusters");

const svg = container
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMidYMid meet");

// To always get real size
function getSvgSize() {
  return container.node().getBoundingClientRect();
}

// ===== LABEL GROUP =====
const labelGroup = svg.append("g").attr("class", "labels");

// ===== HELPER FUNCTIONS =====
function assignDots(ratios) {
  let cumSum = 0;
  const thresholds = ratios.map(r => {
    cumSum += r;
    return cumSum;
  });

  dots.forEach((d, i) => {
    const frac = (i + 1) / totalDots;
    for (let j = 0; j < thresholds.length; j++) {
      if (frac <= thresholds[j]) {
        d.candidate = candidates[j].name;
        break;
      }
    }
  });
}

function computePositions() {
  const { width, height } = getSvgSize();

  const totalClusterWidth =
    (candidates.length - 1) * clusterSpacing;
  const startX = (width - totalClusterWidth) / 2;

  const simulation = d3.forceSimulation(dots)
    .force(
      "x",
      d3.forceX(d => {
        const i = candidates.findIndex(c => c.name === d.candidate);
        return startX + i * clusterSpacing;
      }).strength(0.25)
    )
    .force(
      "y",
      d3.forceY(height / 2).strength(0.25)
    )
    .force("collide", d3.forceCollide(dotRadius * 1.8))
    .stop();

  for (let i = 0; i < 300; i++) simulation.tick();

  // Update labels
  labelGroup.selectAll("text")
    .data(candidates)
    .join("text")
    .attr("class", "label")
    .attr("x", (d, i) => startX + i * clusterSpacing)
    .attr("y", height / 2 - 100)
    .attr("text-anchor", "middle")
    .text(d => d.name);
}

// ===== INITIAL STATE =====
assignDots(candidates.map(c => c.ratio));
computePositions();

const circles = svg.selectAll("circle")
  .data(dots, d => d.id)
  .enter()
  .append("circle")
  .attr("r", dotRadius)
  .attr("cx", d => d.x)
  .attr("cy", d => d.y)
  .attr("fill", d => candidates.find(c => c.name === d.candidate).color);

// ===== ANIMATE DOT MOVEMENT =====
function animateDotMovement(newRatios) {
  dots.forEach(d => (d.prevCandidate = d.candidate));

  candidates.forEach((c, i) => (c.ratio = newRatios[i]));
  assignDots(newRatios);

  computePositions();

  circles.each(function (d) {
    const cand = candidates.find(c => c.name === d.candidate);
    gsap.to(this, {
      duration: 3,
      attr: { cx: d.x, cy: d.y },
      fill: cand.color,
      ease: "power1.inOut"
    });
  });
}

// ===== SCROLL TRIGGER =====
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
  trigger: "#section1",
  start: "top+=10 top",
  onEnter: () =>
    animateDotMovement([0.229, 0.1917, 0.1914, 0.1386, 0.2493]), // new ratios
  onLeaveBack: () =>
    animateDotMovement([0.051, 0.152, 0.2568, 0.176, 0.3642]) // initial ratio
});

// ===== HANDLE RESIZE =====
window.addEventListener("resize", () => {
  computePositions();
  circles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
});




// page 2
// donut chart with d3.js
const colors = ["#FDC800", "#fbf1b3ff"];

function createDonut(selector, data) {
  const svg = d3.select(selector);
  
  //get width
  const svgNode = svg.node();
  const width = svgNode.getBoundingClientRect().width;
  const height = svgNode.getBoundingClientRect().height;

  // SVG size to match parent width
  svg.attr("width", width).attr("height", height);

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);


  const maxScale = 1.15;
  const padding = 10;
  const radius = (Math.min(width, height) / 2 - padding) / maxScale;
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
  const pie = d3.pie().value(d => d);

  const paths = g.selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("fill", (d, i) => colors[i])
      .each(function(d) { this._current = d; })
      .attr("d", arc);

  const centerText = g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "32px")
      .style("opacity", 0)
      .text("");

  return function animate(scaleAmount, textOpacity) {
    paths.attr("transform", (d, i) => i === 0 ? `scale(${scaleAmount})` : "scale(1)");

    centerText
      .style("opacity", textOpacity)
      .text("74%");
  };
}



const updateDonut = createDonut("#donut", [74, 26]);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: "#section2",
    start: "top top",
    end: "+=2000",
    scrub: true,
    pin: true
  }
});

tl.to({}, {
  duration: 1,
  onUpdate() {
    const t = this.progress();
    const inflate = 1 + Math.sin(t * Math.PI) * 0.15;
    const opacity = Math.min(t * 2, 1);

    updateDonut(inflate, opacity);
  }
});



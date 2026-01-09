gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
gsap.registerPlugin(DrawSVGPlugin);


// page 1 ////////////////////////////////////////////////////////////////////////////////////////////////////////////
const totalDots = 189; // 18,908,650 -> one dot is 100,000 people
const dotRadius = 7;
const clusterSpacing = 250; // distance between clusters

// data
let candidates = [
  { name: "Călin Georgescu", ratio: 0.051, color: "#FFE020" },
  { name: "Elena Lasconi", ratio: 0.152, color: "#D1D5DC" },
  { name: "Marcel Ciolacu", ratio: 0.2568, color: "#D1D5DC" },
  { name: "George Simion", ratio: 0.176, color: "#D1D5DC" },
  { name: "Others", ratio: 0.3642, color: "#D1D5DC" }
];

// dots
let dots = [];
for (let i = 0; i < totalDots; i++) {
  dots.push({ id: i, candidate: null, x: 0, y: 0, prevCandidate: null });
}

// container + svg
const container = d3.select("#voteClusters");

const svg = container
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMidYMid meet");

// to always get real size
function getSvgSize() {
  return container.node().getBoundingClientRect();
}

// labels
const labelGroup = svg.append("g").attr("class", "labels");

// helper functions
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

  // update labels
  labelGroup.selectAll("text")
    .data(candidates)
    .join("text")
    .attr("class", "label")
    .attr("x", (d, i) => startX + i * clusterSpacing)
    .attr("y", height / 2 - 100)
    .attr("text-anchor", "middle")
    .text(d => d.name);
}

// initial state
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

// animate dots
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

ScrollTrigger.create({
  trigger: "#section1",
  start: "top top",
  onEnter: () =>
    animateDotMovement([0.229, 0.1917, 0.1914, 0.1386, 0.2493]), // new ratios
  onLeaveBack: () =>
    animateDotMovement([0.051, 0.152, 0.2568, 0.176, 0.3642]) // initial ratio
});

// handle resize
window.addEventListener("resize", () => {
  computePositions();
  circles
    .attr("cx", d => d.x)
    .attr("cy", d => d.y);
});


// page 2 ////////////////////////////////////////////////////////////////////////////////////////////////////////////
const pinDuration = window.innerHeight * 3;

ScrollTrigger.create({
  trigger: "#section2",
  start: "top top",
  end: () => "+=" + pinDuration,
  pin: true,
  pinSpacing: true
});

gsap.fromTo(
  "#section2TextWrapper",
  { yPercent: 100 },
  { yPercent: -200,
    ease: "none",
    scrollTrigger: {
      trigger: "#section2",
      start: "top top",
      end: () => "+=" + pinDuration,
      scrub: true
    }
  }
);


// page 3 ////////////////////////////////////////////////////////////////////////////////////////////////////////////
// const content = document.getElementById("content");
// const redactedItems = document.querySelectorAll(".redacted");

// // initial blur
// gsap.set(content, { filter: "blur(20px)" });

// // scroll triggered blur + reveal
// gsap.to(content, {
//   filter: "blur(0px)",
//   ease: "none",
//   scrollTrigger: {
//     trigger: '#section3',
//     start: "top top",
//     end: "+=130%",
//     scrub: true,
//     pin: true,
//     pinSpacing: true,
//     }
//   }
// );


const canvas = document.getElementById("blurCanvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// draw blurred overlay
ctx.filter = "blur(20px)";
ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// reset filter - for sharpness
ctx.filter = "none";

// instruction text on top
// ctx.font = "32px sans-serif";
// ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
// ctx.textAlign = "center";
// ctx.textBaseline = "middle";
// ctx.fillText(
//   "Swipe to reveal",
//   canvas.width / 2,
//   canvas.height / 2
// );



// Erase blur on mousemove (optional: use a parent listener)
document.getElementById("section3").addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
});

// Reveal redacted spans on click
const redactedItems = document.querySelectorAll(".redacted");

redactedItems.forEach(item => {
  item.addEventListener("click", () => {
    item.classList.add("revealed");
  });
});

// page 4 ////////////////////////////////////////////////////////////////////////////////////////////////////////////

const strip = document.getElementById("timelineStrip");
const timelineItems = strip.querySelectorAll(".timelineItem");
const totalItems = timelineItems.length;

// total distance to move left
const distance = (totalItems - 1) * window.innerWidth;

const totalScroll = window.innerWidth * (totalItems - 1)

gsap.to(strip, {
  x: -distance,
  ease: "none",
  scrollTrigger: {
    trigger: "#section4",
    start: "top top",
    end: `+=${totalScroll}`,
    scrub: true,
    pin: true
    // markers: true
  }
});






// snapping /////////////
// const snapSections = ["#intro", "#section1", "#section2", "#section3", "#section5"];

// // Helper to get the current offsetTop of each section
// function getSnapPoints() {
//   return snapSections
//     .map(sel => document.querySelector(sel))
//     .filter(el => el) // remove nulls
//     .map(el => el.offsetTop);
// }

// Vertical snapping ScrollTrigger
// ScrollTrigger.create({
//   trigger: document.body,
//   start: "top top",
//   end: "bottom bottom",
//   scrub: true,
//   snap: {
//     snapTo: value => {
//       const points = getSnapPoints();
//       // find closest point
//       let closest = points[0];
//       let minDist = Math.abs(value - closest);
//       for (let i = 1; i < points.length; i++) {
//         const dist = Math.abs(value - points[i]);
//         if (dist < minDist) {
//           closest = points[i];
//           minDist = dist;
//         }
//       }
//       return closest;
//     },
//     duration: 1.2,      // exaggerated snap
//     ease: "power3.out"
//   }
// });
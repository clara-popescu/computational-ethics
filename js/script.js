gsap.registerPlugin(ScrollTrigger);

// map
gsap.from(".draw-me", {duration:4, drawSVG: 0});

// balance
gsap.to("#bar", {
  rotate: -25,
  transformOrigin: "50%, 50%",
  scrollTrigger: { 
    trigger: "#title", 
    start: "top 80%",
    // markers: true,
    scrub: true }
});

gsap.to("#leftPlate", {
  y: 90,
  transformOrigin: "50%, 50%",
  scrollTrigger: { 
    trigger: "#title", 
    start: "top 80%",
    // markers: true,
    scrub: true }
});

gsap.to("#rightPlate", {
  y: -90,
  transformOrigin: "50%, 50%",
  scrollTrigger: { 
    trigger: "#title", 
    // start: top (top position of the target - 0px from the target element), 80% (scroller start is 80% down the viewport)
    start: "top 80%",
    markers: true,
    scrub: true }
});
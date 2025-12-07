gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(DrawSVGPlugin);


// text pinning
// pin the section behind the text until text-5 is in its final position
ScrollTrigger.create({
  id: "sectionPin",
  trigger: "#section",
  start: "top top",
  end: () => "+=" + (window.innerHeight * 5),
  pin: true,
  pinSpacing: true
});

gsap.utils.toArray(["#text-2", "#text-3", "#text-4", "#text-5"]).forEach((el, i) => {
  gsap.fromTo(el,
    { y: 1000},
    {
    y: 0,
    ease: "none",
    scrollTrigger: {
      trigger: "#section",
      start: () => ScrollTrigger.getById("sectionPin").start + window.innerHeight * i,
      end: () => ScrollTrigger.getById("sectionPin").start + window.innerHeight * (i + 1),
      scrub: true
    }
  }
  );
});
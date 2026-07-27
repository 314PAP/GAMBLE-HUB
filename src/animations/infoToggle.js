import gsap from "gsap";

export function initInfoToggleAnimations() {
  const btn = document.getElementById("btn-game-info");
  if (!btn) return;

  // Hover: zlatý glow pulse
  btn.addEventListener("mouseenter", () => {
    gsap.to(btn, {
      scale: 1.1,
      filter: "brightness(1.3) drop-shadow(0 0 10px rgba(255, 230, 0, 1))",
      duration: 0.2,
      ease: "power2.out",
    });
  });

  btn.addEventListener("mouseleave", () => {
    if (!btn.classList.contains("is-pressed")) {
      gsap.to(btn, {
        scale: 1,
        filter: "drop-shadow(0 0 6px rgba(255, 230, 0, 0.8))",
        duration: 0.2,
        ease: "power2.out",
      });
    }
  });
}

export function epilepticFlash(btn) {
  if (!btn) return;

  // Zastav předchozí animaci
  gsap.killTweensOf(btn);

  // Epileptická flash sekvence
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0 });
  
  tl.to(btn, {
    borderColor: "#ff0000",
    color: "#ff0000",
    boxShadow: "0 0 20px #ff0000, inset 0 0 10px #ff0000, 0 0 12px #ff0000",
    scale: 1.2,
    duration: 0.15,
    ease: "none",
  })
  .to(btn, {
    borderColor: "#ff8800",
    color: "#ff8800",
    boxShadow: "0 0 20px #ff8800, inset 0 0 10px #ff8800, 0 0 12px #ff8800",
    duration: 0.15,
    ease: "none",
  })
  .to(btn, {
    borderColor: "#ffff00",
    color: "#ffff00",
    boxShadow: "0 0 20px #ffff00, inset 0 0 10px #ffff00, 0 0 12px #ffff00",
    duration: 0.15,
    ease: "none",
  })
  .to(btn, {
    borderColor: "#00ff00",
    color: "#00ff00",
    boxShadow: "0 0 20px #00ff00, inset 0 0 10px #00ff00, 0 0 12px #00ff00",
    duration: 0.15,
    ease: "none",
  })
  .to(btn, {
    borderColor: "#00ffff",
    color: "#00ffff",
    boxShadow: "0 0 20px #00ffff, inset 0 0 10px #00ffff, 0 0 12px #00ffff",
    duration: 0.15,
    ease: "none",
  })
  .to(btn, {
    borderColor: "#8855ff",
    color: "#8855ff",
    boxShadow: "0 0 20px #8855ff, inset 0 0 10px #8855ff, 0 0 12px #8855ff",
    duration: 0.15,
    ease: "none",
  });

  return tl;
}

export function animatePanelOpen(panel) {
  if (!panel) return;

  // Zastav předchozí animace
  gsap.killTweensOf(panel);
  gsap.killTweensOf(panel.querySelector(".info-panel-content"));

  const tl = gsap.timeline();

  // Panel background pulse
  tl.to(panel, {
    backgroundColor: "rgba(10, 0, 20, 0.92)",
    duration: 0.15,
    ease: "none",
  })
  .to(panel, {
    backgroundColor: "rgba(0, 10, 20, 0.92)",
    duration: 0.15,
    ease: "none",
  })
  .to(panel, {
    backgroundColor: "rgba(2, 2, 5, 0.92)",
    duration: 0.15,
    ease: "none",
  });

  // Content border pulse
  const content = panel.querySelector(".info-panel-content");
  if (content) {
    tl.to(content, {
      borderColor: "#ff0000",
      boxShadow: "0 0 20px #ff0000, 0 0 40px #ff0000, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      borderWidth: 3,
      duration: 0.15,
      ease: "none",
    }, 0)
    .to(content, {
      borderColor: "#ff8800",
      boxShadow: "0 0 20px #ff8800, 0 0 40px #ff8800, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    })
    .to(content, {
      borderColor: "#ffff00",
      boxShadow: "0 0 20px #ffff00, 0 0 40px #ffff00, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    })
    .to(content, {
      borderColor: "#00ff00",
      boxShadow: "0 0 20px #00ff00, 0 0 40px #00ff00, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    })
    .to(content, {
      borderColor: "#00ffff",
      boxShadow: "0 0 20px #00ffff, 0 0 40px #00ffff, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    })
    .to(content, {
      borderColor: "#8855ff",
      boxShadow: "0 0 20px #8855ff, 0 0 40px #8855ff, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    })
    .to(content, {
      borderColor: "#ff0000",
      boxShadow: "0 0 20px #ff0000, 0 0 40px #ff0000, inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.15,
      ease: "none",
    });
  }

  return tl;
}

export function stopPanelAnimation(panel) {
  if (!panel) return;
  gsap.killTweensOf(panel);
  
  const content = panel.querySelector(".info-panel-content");
  if (content) gsap.killTweensOf(content);

  // Reset na základní stav
  gsap.to(panel, {
    backgroundColor: "rgba(2, 2, 5, 0.92)",
    duration: 0.1,
    ease: "power2.out",
  });

  if (content) {
    gsap.to(content, {
      borderColor: "#1a1a2e",
      borderWidth: 2,
      boxShadow: "inset 0 2px 20px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.6)",
      duration: 0.1,
      ease: "power2.out",
    });
  }
}

export function stopEpilepticFlash(btn) {
  if (!btn) return;
  gsap.killTweensOf(btn);
  
  // Reset na základní stav
  gsap.to(btn, {
    borderColor: "#ffe600",
    color: "#ffe600",
    boxShadow: "0 0 12px rgba(255, 230, 0, 0.5), inset 1px 1px 0px rgba(255, 255, 255, 0.4), inset -1px -1px 0px rgba(0, 0, 0, 0.6)",
    scale: 1,
    duration: 0.1,
    ease: "power2.out",
  });
}

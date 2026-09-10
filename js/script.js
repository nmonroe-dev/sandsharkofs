/* =========================================================
   SAND SHARK — INTERACTION ENGINE
   ========================================================= */

(() => {
  "use strict";

  const root = document.documentElement;
  const siloSection = document.querySelector(".silo-scroll-section");
  const siloSand = document.querySelector("#silo-sand");
  const siloPercent = document.querySelector("#silo-percent");
  const pageProgressBar = document.querySelector("#page-progress-bar");
  const materialVisual = document.querySelector("#material-visual");
  const sandPile = document.querySelector("#sand-pile");
  const pilePercent = document.querySelector("#pile-percent");
  const flowStatus = document.querySelector("#flow-status");

  /* ---------------------------------------------------------
     WHOLE-PAGE SCROLL PROGRESS
     The silo is fixed/sticky visually, but its sand level is
     driven by the entire page scroll — not just one scene.
     --------------------------------------------------------- */

  function getPageProgress() {
    const scrollTop = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return 0;
    return Math.max(0, Math.min(1, scrollTop / maxScroll));
  }

  function updatePageProgress() {
    const progress = getPageProgress();

    if (pageProgressBar) {
      pageProgressBar.style.width = `${progress * 100}%`;
    }

    if (siloSand) {
      // 100% at the top -> 0% at the bottom.
      const level = 100 - progress * 100;
      siloSand.style.height = `${level}%`;
    }

    if (siloPercent) {
      siloPercent.textContent = `${Math.round(100 - progress * 100)}%`;
    }

    updateFlowStages();
  }

  /* ---------------------------------------------------------
     SILO SECTION STAGE INDICATORS
     --------------------------------------------------------- */

  const flowStages = document.querySelectorAll(".flow-stage");

  function updateFlowStages() {
    if (!siloSection || !flowStages.length) return;

    const sectionRect = siloSection.getBoundingClientRect();
    const viewport = window.innerHeight;
    const totalTravel = siloSection.offsetHeight + viewport;
    const traveled = viewport - sectionRect.top;
    const sectionProgress = Math.max(0, Math.min(1, traveled / totalTravel));

    // Build the pile from almost empty to full while this section passes the viewport.
    const pileLevel = Math.max(0.035, Math.min(1, sectionProgress * 1.12));

    if (materialVisual) {
      materialVisual.style.setProperty("--pile-level", pileLevel.toFixed(3));
    }

    if (pilePercent) {
      pilePercent.textContent = `${Math.round(pileLevel * 100)}%`;
    }

    const viewportTarget = viewport * 0.48;
    let closestIndex = 0;
    let closestDistance = Infinity;

    flowStages.forEach((stage, i) => {
      const rect = stage.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - viewportTarget);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    flowStages.forEach((stage, i) => {
      stage.classList.toggle("active", i === closestIndex);
    });

    if (flowStatus) {
      const statuses = ["PLANNING", "DISPATCHING", "STAGING", "DELIVERING", "FEEDING"];
      flowStatus.textContent = statuses[closestIndex] || "ACTIVE";
    }
  }

  /* ---------------------------------------------------------
     SCROLL PERFORMANCE
     --------------------------------------------------------- */

  let ticking = false;

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updatePageProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  window.addEventListener("load", updatePageProgress);

  /* ---------------------------------------------------------
     REVEAL ELEMENTS
     --------------------------------------------------------- */

  const revealElements = document.querySelectorAll(
    ".service-card, .feature-copy, .qualification-strip > div, .career-copy, .job-description, .application-card, .values-grid > div"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("revealed"));
  }

  /* ---------------------------------------------------------
     SERVICE MODALS
     --------------------------------------------------------- */

  const modal = document.querySelector("#info-modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalBody = document.querySelector("#modal-body");
  const modalFocus = document.querySelector("#modal-focus");

  const serviceDetails = {
    coordination: {
      title: "Frac Sand Coordination",
      body: "Sand Shark coordinates the field logistics surrounding frac sand movement — aligning delivery activity, site requirements, schedules, staging and communication so the material flow supports the active operation.",
      focus: "Material movement / sequencing"
    },
    trucks: {
      title: "Truck & Carrier Flow",
      body: "Truck movement is managed as part of the larger jobsite sequence. Sand Shark supports carrier communication, arrival timing, staging, traffic flow and changing priorities while keeping the field picture current.",
      focus: "Arrival / staging / flow"
    },
    site: {
      title: "Wellsite Logistics",
      body: "Active pads can change quickly. Sand Shark helps organize the practical movement around the site — where trucks stage, how traffic moves, what is arriving next and which changes need to be communicated across the operation.",
      focus: "Jobsite organization"
    },
    equipment: {
      title: "Sand Systems & Equipment",
      body: "Sand operations can involve multiple configurations and equipment types. Sand Shark works around boxes, silos, belts, pneumatic systems, forklifts and related handling equipment as part of the site's material-flow plan.",
      focus: "Equipment / material handling"
    },
    communication: {
      title: "Field Communication",
      body: "A schedule only works when the people executing it have the same information. Sand Shark keeps communication moving between dispatch, carriers, field personnel, customer representatives and other vendors supporting the operation.",
      focus: "Operational visibility"
    },
    field: {
      title: "On-Site Support",
      body: "Sand Shark provides field-oriented support around the movement and organization of frac sand operations. This panel is ready for approved company photography that shows the people, equipment and environment behind the work.",
      focus: "Field execution"
    }
  };

  function openModal(key) {
    if (!modal || !serviceDetails[key]) return;

    const detail = serviceDetails[key];
    modalTitle.textContent = detail.title;
    modalBody.textContent = detail.body;
    modalFocus.textContent = detail.focus;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-modal]").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.modal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  /* ---------------------------------------------------------
     HERO MOUSE PARALLAX
     --------------------------------------------------------- */

  const hero = document.querySelector(".hero");
  const heroGrid = document.querySelector(".hero-grid");
  const heroBackground = document.querySelector(".hero-background");

  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      if (heroGrid) {
        heroGrid.style.transform = `translate(${x * 18}px, ${y * 18}px)`;
      }

      if (heroBackground) {
        heroBackground.style.transform = `translate(${x * 7}px, ${y * 7}px)`;
      }
    });

    hero.addEventListener("mouseleave", () => {
      if (heroGrid) heroGrid.style.transform = "translate(0,0)";
      if (heroBackground) heroBackground.style.transform = "translate(0,0)";
    });
  }

  /* ---------------------------------------------------------
     CAREER FORM — FRONT END DEMO
     --------------------------------------------------------- */

  const careerForm = document.querySelector("#career-form");
  const careerNote = document.querySelector("#career-form-note");

  if (careerForm) {
    careerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (careerNote) {
        careerNote.textContent =
          "The application form is working on the page. Connect this form to your preferred backend or form service before launch so applications and résumé files are actually received.";
        careerNote.classList.add("show");
      }
    });
  }

  /* ---------------------------------------------------------
     CONTACT FORM — FRONT END DEMO
     --------------------------------------------------------- */

  const contactForm = document.querySelector("#contact-form");
  const contactNote = document.querySelector("#contact-form-note");

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (contactNote) {
        contactNote.textContent = "Your inquiry form is ready on the page. Connect it to the company's preferred email/form backend before launch so submissions are actually delivered.";
        contactNote.classList.add("show");
      }
    });
  }

  /* ---------------------------------------------------------
     ACTIVE NAVIGATION
     --------------------------------------------------------- */

  const navLinks = document.querySelectorAll(".navigation a[href^='#']");
  const sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------------------------------------------------------
     REDUCED MOTION
     --------------------------------------------------------- */

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (reducedMotion.matches) {
    root.style.scrollBehavior = "auto";
    document.body.classList.add("reduced-motion");
  }
})();
const opsFlowDiagram = document.querySelector(".ops-flow-diagram");

if (opsFlowDiagram) {

const opsFlowNodes =
opsFlowDiagram.querySelectorAll(".ops-flow-node");

const opsFlowPulse =
opsFlowDiagram.querySelector(".ops-flow-pulse");

let flowTimer = null;
let activeFlowIndex = 0;

function activateOpsFlowNode(index) {

opsFlowNodes.forEach((node, i) => {
node.classList.toggle("active", i === index);
});

activeFlowIndex = index;

if (opsFlowPulse) {
const activeNode = opsFlowNodes[index];

const diagramRect =
opsFlowDiagram.getBoundingClientRect();

const nodeRect =
activeNode.getBoundingClientRect();

const targetTop =
nodeRect.top -
diagramRect.top +
nodeRect.height / 2 -
35;

opsFlowPulse.style.opacity = "1";
opsFlowPulse.style.transform =
`translateY(${targetTop}px)`;
}
}

function startOpsFlowAnimation() {

if (flowTimer) return;

activateOpsFlowNode(0);

flowTimer = setInterval(() => {

activeFlowIndex++;

if (activeFlowIndex >= opsFlowNodes.length) {
activeFlowIndex = 0;
}

activateOpsFlowNode(activeFlowIndex);

}, 1400);
}

function stopOpsFlowAnimation() {

if (flowTimer) {
clearInterval(flowTimer);
flowTimer = null;
}
}

const opsFlowObserver =
new IntersectionObserver(
entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {
startOpsFlowAnimation();
} else {
stopOpsFlowAnimation();
}

});

},
{
threshold: 0.35
}
);

opsFlowObserver.observe(opsFlowDiagram);

}
const servicePhotoCard =
document.querySelector(".service-card.image-card");

const serviceCardPhoto =
servicePhotoCard?.querySelector(".service-card-photo");


if (
servicePhotoCard &&
serviceCardPhoto &&
window.matchMedia("(pointer: fine)").matches
) {

servicePhotoCard.addEventListener("mousemove", (event) => {

const rect =
servicePhotoCard.getBoundingClientRect();

const x =
(event.clientX - rect.left) / rect.width - 0.5;

const y =
(event.clientY - rect.top) / rect.height - 0.5;


serviceCardPhoto.style.transform =
`scale(1.08)
translate(${x * -10}px, ${y * -10}px)`;

});


servicePhotoCard.addEventListener("mouseleave", () => {

serviceCardPhoto.style.transform =
"scale(1.03) translate(0, 0)";

});

}

const xrayBlock = document.querySelector("#service-xray-block");

if (xrayBlock) {
const scanLine = xrayBlock.querySelector(".xray-scan-line");
const xrayNodes = xrayBlock.querySelectorAll(".xray-node");
const xrayStatus = xrayBlock.querySelector(".xray-status");

function updateXraySection() {
const rect = xrayBlock.getBoundingClientRect();
const windowHeight = window.innerHeight;

const start = windowHeight * 0.15;
const end = windowHeight * 0.85;

let progress = (start - rect.top) / (rect.height + start - end);
progress = Math.max(0, Math.min(1, progress));

if (scanLine) {
const panelWidth = xrayBlock.querySelector(".service-xray-panel").offsetWidth;
scanLine.style.transform = `translateX(${progress * panelWidth}px)`;
}

const activeCount = Math.min(
xrayNodes.length,
Math.floor(progress * (xrayNodes.length + 1))
);

xrayNodes.forEach((node, index) => {
node.classList.toggle("active", index < activeCount);
});

if (xrayStatus) {
if (progress < 0.25) {
xrayStatus.innerHTML =
'<span class="xray-status-dot"></span>BUILDING FIELD PICTURE';
} else if (progress < 0.75) {
xrayStatus.innerHTML =
'<span class="xray-status-dot"></span>LINKING MOVEMENT + COMMUNICATION';
} else {
xrayStatus.innerHTML =
'<span class="xray-status-dot"></span>OPERATIONAL PICTURE / ALIGNED';
}
}
}

window.addEventListener("scroll", updateXraySection, { passive: true });
window.addEventListener("resize", updateXraySection);
window.addEventListener("load", updateXraySection);
}
/* =========================================================
SAFETY — FIELD READINESS LOOP
========================================================= */

const fieldReadiness =
document.querySelector("#field-readiness");


if (fieldReadiness) {

const fieldChecks =
[...fieldReadiness.querySelectorAll(".field-check")];

let fieldLoopTimer = null;
let fieldTimeouts = [];


function clearFieldTimeouts() {

fieldTimeouts.forEach(timeout => {
clearTimeout(timeout);
});

fieldTimeouts = [];

}


function resetFieldReadiness() {

clearFieldTimeouts();

fieldReadiness.classList.remove(
"scanning",
"complete"
);


fieldChecks.forEach(check => {

check.classList.remove("active");

});


/* force browser to reset the animation */

void fieldReadiness.offsetWidth;

}


function playFieldReadiness() {

resetFieldReadiness();


fieldReadiness.classList.add("scanning");


fieldChecks.forEach((check, index) => {

const timeout = setTimeout(() => {

check.classList.add("active");

}, 450 + index * 420);


fieldTimeouts.push(timeout);

});


const completeTimeout = setTimeout(() => {

fieldReadiness.classList.add("complete");

}, 3400);


fieldTimeouts.push(completeTimeout);

}


function startFieldLoop() {

if (fieldLoopTimer) return;


playFieldReadiness();


fieldLoopTimer = setInterval(() => {

playFieldReadiness();

}, 6500);

}


function stopFieldLoop() {

if (fieldLoopTimer) {

clearInterval(fieldLoopTimer);

fieldLoopTimer = null;

}


clearFieldTimeouts();

}


const fieldReadinessObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startFieldLoop();

} else {

stopFieldLoop();

}

});

},

{
threshold: 0.20
}

);


fieldReadinessObserver.observe(fieldReadiness);

}



/* =========================================================
SAFETY — READINESS BADGES LOOP
========================================================= */

const personnelReadiness =
document.querySelector("#personnel-readiness");


if (personnelReadiness) {

const readinessBadgesContainer =
personnelReadiness.querySelector(".readiness-badges");

const readinessBadgeItems =
[...personnelReadiness.querySelectorAll(".readiness-badge")];

let badgeLoopTimer = null;
let badgeTimeouts = [];


function clearBadgeTimeouts() {

badgeTimeouts.forEach(timeout => {

clearTimeout(timeout);

});


badgeTimeouts = [];

}


function resetReadinessBadges() {

clearBadgeTimeouts();


personnelReadiness.classList.remove("complete");


if (readinessBadgesContainer) {

readinessBadgesContainer.classList.remove("active");

}


readinessBadgeItems.forEach(badge => {

badge.classList.remove("active");

});


/* force browser to redraw so rings can animate again */

void personnelReadiness.offsetWidth;

}


function playReadinessBadges() {

resetReadinessBadges();


if (readinessBadgesContainer) {

readinessBadgesContainer.classList.add("active");

}


readinessBadgeItems.forEach((badge, index) => {

const timeout = setTimeout(() => {

badge.classList.add("active");

}, 250 + index * 500);


badgeTimeouts.push(timeout);

});


const completeTimeout = setTimeout(() => {

personnelReadiness.classList.add("complete");

}, 2700);


badgeTimeouts.push(completeTimeout);

}


function startBadgeLoop() {

if (badgeLoopTimer) return;


playReadinessBadges();


badgeLoopTimer = setInterval(() => {

playReadinessBadges();

}, 4200);

}


function stopBadgeLoop() {

if (badgeLoopTimer) {

clearInterval(badgeLoopTimer);

badgeLoopTimer = null;

}


clearBadgeTimeouts();

}


const readinessLoopObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startBadgeLoop();

} else {

stopBadgeLoop();

}

});

},

{
threshold: 0.18
}

);


readinessLoopObserver.observe(personnelReadiness);

}
/* =========================================================
CAREERS — CANDIDATE STANDARD LOOP
========================================================= */

const careerCandidateSystem =
document.querySelector("#career-candidate-system");


if (careerCandidateSystem) {

const candidateItems =
[...careerCandidateSystem.querySelectorAll(".candidate-standard-item")];

const candidateStatus =
careerCandidateSystem.querySelector("#candidate-system-status");

let candidateLoop = null;
let candidateTimeouts = [];


function clearCandidateTimeouts() {

candidateTimeouts.forEach(timer => {
clearTimeout(timer);
});

candidateTimeouts = [];

}


function resetCandidateSystem() {

clearCandidateTimeouts();


candidateItems.forEach(item => {
item.classList.remove("active");
});


if (candidateStatus) {
candidateStatus.textContent = "REVIEWING";
}

}


function playCandidateSystem() {

resetCandidateSystem();


candidateItems.forEach((item, index) => {

const timer =
setTimeout(() => {

item.classList.add("active");


if (candidateStatus) {

const states = [
"EXPERIENCE",
"SAFETY",
"COMMUNICATION",
"RELIABILITY"
];

candidateStatus.textContent =
states[index];

}

}, 250 + index * 650);


candidateTimeouts.push(timer);

});


const completeTimer =
setTimeout(() => {

if (candidateStatus) {
candidateStatus.textContent = "FIELD READY";
}

}, 3100);


candidateTimeouts.push(completeTimer);

}


function startCandidateLoop() {

if (candidateLoop) return;


playCandidateSystem();


candidateLoop =
setInterval(() => {

playCandidateSystem();

}, 5000);

}


function stopCandidateLoop() {

if (candidateLoop) {

clearInterval(candidateLoop);

candidateLoop = null;

}


clearCandidateTimeouts();

}


const candidateObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startCandidateLoop();

} else {

stopCandidateLoop();

}

});

},

{
threshold: 0.25
}

);


candidateObserver.observe(careerCandidateSystem);

}



/* =========================================================
CAREERS — ROLE RESPONSIBILITY LOOP
========================================================= */

const careerRoleProfile =
document.querySelector("#career-role-profile");


if (careerRoleProfile) {

const careerRoleSteps =
[...careerRoleProfile.querySelectorAll(".role-step")];

const careerRoleStatus =
careerRoleProfile.querySelector("#role-profile-status");

let roleLoop = null;
let roleTimeouts = [];


function clearRoleTimeouts() {

roleTimeouts.forEach(timer => {

clearTimeout(timer);

});


roleTimeouts = [];

}


function resetRoleProfile() {

clearRoleTimeouts();


careerRoleSteps.forEach(step => {

step.classList.remove("active");

});


if (careerRoleStatus) {

careerRoleStatus.textContent =
"FIELD POSITION";

}

}


function playRoleProfile() {

resetRoleProfile();


careerRoleSteps.forEach((step, index) => {

const timer =
setTimeout(() => {

step.classList.add("active");


if (careerRoleStatus) {

careerRoleStatus.textContent =
`STEP 0${index + 1} / ACTIVE`;

}

}, 250 + index * 650);


roleTimeouts.push(timer);

});


const completeTimer =
setTimeout(() => {

if (careerRoleStatus) {

careerRoleStatus.textContent =
"FIELD EXECUTION / READY";

}

}, 4350);


roleTimeouts.push(completeTimer);

}


function startRoleLoop() {

if (roleLoop) return;


playRoleProfile();


roleLoop =
setInterval(() => {

playRoleProfile();

}, 6500);

}


function stopRoleLoop() {

if (roleLoop) {

clearInterval(roleLoop);

roleLoop = null;

}


clearRoleTimeouts();

}


const roleObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startRoleLoop();

} else {

stopRoleLoop();

}

});

},

{
threshold: 0.13
}

);


roleObserver.observe(careerRoleProfile);

}



/* =========================================================
CAREERS — FIELD STANDARD LOOP
========================================================= */

const careerStandardsSection =
document.querySelector("#career-standards-section");


if (careerStandardsSection) {

const careerStandardCards =
[...careerStandardsSection.querySelectorAll(".career-standard-card")];

let standardsLoop = null;
let standardsTimeouts = [];


function clearStandardsTimeouts() {

standardsTimeouts.forEach(timer => {

clearTimeout(timer);

});


standardsTimeouts = [];

}


function resetCareerStandards() {

clearStandardsTimeouts();


careerStandardCards.forEach(card => {

card.classList.remove("active");

});

}


function playCareerStandards() {

resetCareerStandards();


careerStandardCards.forEach((card, index) => {

const timer =
setTimeout(() => {

card.classList.add("active");

}, 300 + index * 650);


standardsTimeouts.push(timer);

});

}


function startStandardsLoop() {

if (standardsLoop) return;


playCareerStandards();


standardsLoop =
setInterval(() => {

playCareerStandards();

}, 5000);

}


function stopStandardsLoop() {

if (standardsLoop) {

clearInterval(standardsLoop);

standardsLoop = null;

}


clearStandardsTimeouts();

}


const standardsObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startStandardsLoop();

} else {

stopStandardsLoop();

}

});

},

{
threshold: 0.20
}

);


standardsObserver.observe(careerStandardsSection);

}
/* =========================================================
CONTACT — LIVE OPERATIONS REQUEST
========================================================= */

const contactConsole =
document.querySelector("#contact-console");


if (contactConsole) {

const nameInput =
document.querySelector("#contact-name");

const companyInput =
document.querySelector("#contact-company");

const operationInput =
document.querySelector("#contact-operation");

const messageInput =
document.querySelector("#contact-message");

const supportInputs =
[...document.querySelectorAll(
'.support-option input[type="checkbox"]'
)];


const requestName =
document.querySelector("#request-name");

const requestCompany =
document.querySelector("#request-company");

const requestOperation =
document.querySelector("#request-operation");

const requestSupport =
document.querySelector("#request-support");

const requestStatus =
document.querySelector("#contact-request-status");

const requestPercent =
document.querySelector("#request-percent");

const requestSignalFill =
document.querySelector("#request-signal-fill");


function updateContactRequest() {

const name =
nameInput?.value.trim() || "";

const company =
companyInput?.value.trim() || "";

const operation =
operationInput?.value.trim() || "";

const message =
messageInput?.value.trim() || "";


const support =
supportInputs
.filter(input => input.checked)
.map(input => input.value);


if (requestName) {

requestName.textContent =
name || "NOT PROVIDED";

}


if (requestCompany) {

requestCompany.textContent =
company || "NOT PROVIDED";

}


if (requestOperation) {

requestOperation.textContent =
operation || "NOT PROVIDED";

}


if (requestSupport) {

requestSupport.textContent =
support.length
? support.join(" / ")
: "NOT SELECTED";

}


let completed = 0;

if (name) completed++;
if (company) completed++;
if (operation) completed++;
if (support.length) completed++;
if (message) completed++;


const percent =
Math.round(
(completed / 5) * 100
);


if (requestPercent) {

requestPercent.textContent =
`${percent}%`;

}


if (requestSignalFill) {

requestSignalFill.style.width =
`${percent}%`;

}


if (requestStatus) {

if (percent === 0) {

requestStatus.textContent =
"AWAITING DETAILS";

} else if (percent < 60) {

requestStatus.textContent =
"BUILDING REQUEST";

} else if (percent < 100) {

requestStatus.textContent =
"FIELD PICTURE";

} else {

requestStatus.textContent =
"READY TO SEND";

}

}


contactConsole.classList.toggle(
"has-data",
percent > 0
);

}


[
nameInput,
companyInput,
operationInput,
messageInput
].forEach(input => {

input?.addEventListener(
"input",
updateContactRequest
);

});


supportInputs.forEach(input => {

input.addEventListener(
"change",
updateContactRequest
);

});


updateContactRequest();

}



/* =========================================================
CONTACT — REQUEST FLOW LOOP
========================================================= */

const contactFlowSection =
document.querySelector("#contact-flow-section");


if (contactFlowSection) {

const contactFlowSystem =
contactFlowSection.querySelector(
".contact-flow-system"
);

const contactFlowSteps =
[...contactFlowSection.querySelectorAll(
".contact-flow-step"
)];


let contactFlowLoop = null;

let contactFlowTimeouts = [];


function clearContactFlowTimeouts() {

contactFlowTimeouts.forEach(timer => {

clearTimeout(timer);

});


contactFlowTimeouts = [];

}


function resetContactFlow() {

clearContactFlowTimeouts();


if (contactFlowSystem) {

contactFlowSystem.classList.remove(
"active"
);

}


contactFlowSteps.forEach(step => {

step.classList.remove(
"active"
);

});


void contactFlowSection.offsetWidth;

}


function playContactFlow() {

resetContactFlow();


if (contactFlowSystem) {

contactFlowSystem.classList.add(
"active"
);

}


contactFlowSteps.forEach(
(step, index) => {

const timer =
setTimeout(() => {

step.classList.add(
"active"
);

}, 300 + index * 650);


contactFlowTimeouts.push(
timer
);

}
);

}


function startContactFlowLoop() {

if (contactFlowLoop) return;


playContactFlow();


contactFlowLoop =
setInterval(() => {

playContactFlow();

}, 5200);

}


function stopContactFlowLoop() {

if (contactFlowLoop) {

clearInterval(
contactFlowLoop
);

contactFlowLoop =
null;

}


clearContactFlowTimeouts();

}


const contactFlowObserver =
new IntersectionObserver(

entries => {

entries.forEach(entry => {

if (entry.isIntersecting) {

startContactFlowLoop();

} else {

stopContactFlowLoop();

}

});

},

{
threshold: .20
}

);


contactFlowObserver.observe(
contactFlowSection
);

}
/* =========================================================
MOBILE NAVIGATION
========================================================= */

const mobileNavToggle =
document.querySelector(".mobile-nav-toggle");

const mobileNavigation =
document.querySelector(".navigation");


if (
mobileNavToggle &&
mobileNavigation
) {

function openMobileNav() {

mobileNavigation.classList.add("open");

mobileNavToggle.classList.add("active");

mobileNavToggle.setAttribute(
"aria-expanded",
"true"
);

mobileNavToggle.setAttribute(
"aria-label",
"Close navigation"
);

document.body.classList.add(
"mobile-nav-open"
);

}


function closeMobileNav() {

mobileNavigation.classList.remove("open");

mobileNavToggle.classList.remove("active");

mobileNavToggle.setAttribute(
"aria-expanded",
"false"
);

mobileNavToggle.setAttribute(
"aria-label",
"Open navigation"
);

document.body.classList.remove(
"mobile-nav-open"
);

}


mobileNavToggle.addEventListener(
"click",
() => {

if (
mobileNavigation.classList.contains("open")
) {

closeMobileNav();

} else {

openMobileNav();

}

}
);


mobileNavigation
.querySelectorAll("a")
.forEach(link => {

link.addEventListener(
"click",
closeMobileNav
);

});


document.addEventListener(
"keydown",
event => {

if (event.key === "Escape") {

closeMobileNav();

}

}
);


window.addEventListener(
"resize",
() => {

if (window.innerWidth > 1000) {

closeMobileNav();

}

}
);

}

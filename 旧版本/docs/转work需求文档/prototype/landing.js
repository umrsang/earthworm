const root = document.documentElement;
const menu = document.querySelector(".mobile-menu");
const menuButton = document.querySelector("[data-action='menu']");
const demoModal = document.querySelector(".demo-modal");

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  const action = actionTarget?.dataset.action;

  if (action === "theme") {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    actionTarget.textContent = nextTheme === "dark" ? "☾" : "☀";
  }

  if (action === "menu") {
    const isOpen = menu.classList.toggle("is-open");
    menuButton.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  }

  if (action === "faq") {
    const item = actionTarget.closest(".faq-item");
    const willOpen = !item.classList.contains("is-open");
    document.querySelectorAll(".faq-item").forEach((faq) => {
      faq.classList.remove("is-open");
      faq.querySelector("button b").textContent = "+";
    });
    if (willOpen) {
      item.classList.add("is-open");
      actionTarget.querySelector("b").textContent = "−";
    }
  }

  if (action === "demo") {
    demoModal.classList.add("is-open");
    demoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    demoModal.querySelector(".modal-close").focus();
  }

  if (action === "close-demo") {
    demoModal.classList.remove("is-open");
    demoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  const filterTarget = event.target.closest("[data-course-filter]");
  const filter = filterTarget?.dataset.courseFilter;
  if (filter) {
    document
      .querySelectorAll("[data-course-filter]")
      .forEach((button) => button.classList.toggle("is-active", button === filterTarget));
    document.querySelectorAll("[data-course-kind]").forEach((course) => {
      course.hidden = filter !== "all" && course.dataset.courseKind !== filter;
    });
  }
});

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuButton.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && demoModal.classList.contains("is-open")) {
    document.querySelector("[data-action='close-demo']").click();
  }
});

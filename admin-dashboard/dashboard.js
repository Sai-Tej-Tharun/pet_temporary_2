"use strict";

/* =========================
   THEME TOGGLE
========================= */
const toggle = document.getElementById("themeToggle");

toggle.addEventListener("click", () => {

    const html = document.documentElement;

    const newTheme =
        html.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";

    html.setAttribute("data-theme", newTheme);

    localStorage.setItem("theme", newTheme);

});
/* =========================
   NOTIFICATIONS DROPDOWN
========================= */
const notifBtn = document.getElementById("notifBtn");
const dropdown = document.getElementById("notifDropdown");

notifBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("active");
});

/* CLOSE ON OUTSIDE CLICK */
document.addEventListener("click", () => {
  dropdown.classList.remove("active");
});

/* =========================
   INIT ICONS
========================= */
lucide.createIcons();

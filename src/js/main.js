async function loadPartial(url, containerId) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`);
    }

    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (e) {
    console.log(`Error status ${e}`);
  }
}

function setupMobileMenu() {
  const headerContainer = document.getElementById("header-container");
  const mobileBtn = headerContainer.querySelector("#mobile-btn");
  const navMenu = headerContainer.querySelector("nav");

  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileBtn.classList.toggle("is-open");

      navMenu.classList.toggle("hidden");
      navMenu.classList.toggle("flex");
      navMenu.classList.toggle("flex-col");

      navMenu.classList.toggle("absolute");
      navMenu.classList.toggle("top-full");
      navMenu.classList.toggle("left-0");
      navMenu.classList.toggle("w-full");
      navMenu.classList.toggle("bg-cream");
      navMenu.classList.toggle("p-6");
      navMenu.classList.toggle("shadow-md");
      navMenu.classList.toggle("items-left");
      navMenu.classList.toggle("gap-6");
    });
  }
}

function setupNavigationVisibility() {
  const headerContainer = document.getElementById("header-container");

  const aboutLink = headerContainer.querySelector("#nav-about");
  const currentPath = window.location.pathname;

  if (aboutLink && currentPath !== "/" && currentPath !== "/index.html") {
    aboutLink.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("/partials/header.html", "header-container");

  setupMobileMenu();

  setupNavigationVisibility();

  loadPartial("/partials/footer.html", "footer-container");
});

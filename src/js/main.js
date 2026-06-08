// const header = document.querySelector('#header-container');
// const footer = document.querySelector('#footer-container');

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
      // 1. Trigger the CSS 'X' Animation
      mobileBtn.classList.toggle("is-open");

      // 2. Toggle the Menu Visibility & Vertical Layout
      navMenu.classList.toggle("hidden");
      navMenu.classList.toggle("flex");
      navMenu.classList.toggle("flex-col");

      // 3. Absolute positioning to drop down over the page
      navMenu.classList.toggle("absolute");
      navMenu.classList.toggle("top-full");
      navMenu.classList.toggle("left-0");
      navMenu.classList.toggle("w-full");
      navMenu.classList.toggle("bg-cream");
      navMenu.classList.toggle("p-6");
      navMenu.classList.toggle("shadow-md");
      navMenu.classList.toggle("items-left"); // Centers the links vertically
      navMenu.classList.toggle("gap-6");
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load the header FIRST and wait for it to finish injecting
  await loadPartial("/partials/header.html", "header-container");

  // 2. Now that the header is physically on the screen, attach the button logic
  setupMobileMenu();

  // 3. Load the footer (we don't need to await this since no other code depends on it)
  loadPartial("/partials/footer.html", "footer-container");
});

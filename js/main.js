// Todo o conteúdo da página vem de data.json; edite só esse arquivo para atualizar o site.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function icon(className) {
  return el("i", { className });
}

function field(root, name) {
  return root.querySelector(`[data-field="${name}"]`);
}

function external(url) {
  return url.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" };
}

function renderProfile(profile) {
  const root = document.querySelector(".profile");
  document.title = profile.name;
  field(root, "avatar").src = profile.avatar;
  field(root, "name").textContent = profile.name;
  field(root, "role").textContent = profile.roles[0];
  field(root, "roles").replaceChildren(
    ...profile.roles.map((role) => el("span", { className: "roles__item", textContent: role }))
  );
  field(root, "bio").textContent = profile.bio;
  field(root, "current").textContent = profile.current;
  field(root, "social").replaceChildren(
    ...profile.social.map((s) =>
      el("a", { href: s.url, ariaLabel: s.label, ...external(s.url) }, [icon(s.icon)])
    )
  );
}

function renderLinks(links) {
  field(document, "links").replaceChildren(
    ...links.map((link) =>
      el("li", { className: "content__item" }, [
        el("a", { className: "bio-link", href: link.url, ...external(link.url) }, [
          icon(link.icon),
          el("span", { textContent: link.title }),
          icon("fa-solid fa-arrow-up-right-from-square bio-link__external"),
        ]),
      ])
    )
  );
}

function renderProjects(projects) {
  const dialog = document.getElementById("project-dialog");

  field(document, "projects").replaceChildren(
    ...projects.map((project) => {
      const card = el("button", { className: "project-card" }, [
        el("img", { src: project.image, alt: "", loading: "lazy" }),
        el("strong", { textContent: project.name }),
        el("span", { textContent: project.summary }),
      ]);
      card.addEventListener("click", () => {
        field(dialog, "image").src = project.image;
        field(dialog, "image").alt = project.name;
        field(dialog, "name").textContent = project.name;
        field(dialog, "description").textContent = project.description;
        field(dialog, "url").href = project.url;
        dialog.showModal();
      });
      return el("li", { className: "content__item" }, [card]);
    })
  );
}

function animateTabs() {
  document.querySelector(".tabs").addEventListener("change", () => {
    if (reduceMotion) return;
    document.querySelectorAll(".content__group").forEach((group) => {
      if (group.offsetParent === null) return; // grupo escondido pela aba atual
      group.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 300, easing: "ease-out" }
      );
    });
  });
}

async function init() {
  animateTabs();
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderProfile(data.profile);
    renderLinks(data.links);
    renderProjects(data.projects);
  } catch (error) {
    console.error("Falha ao carregar data.json:", error);
    document.querySelectorAll(".skeleton").forEach((node) => node.remove());
    field(document, "links").replaceChildren(
      el("li", { className: "content__error", textContent: "Não foi possível carregar o conteúdo." })
    );
  } finally {
    document.body.classList.remove("is-loading");
  }
}

init();

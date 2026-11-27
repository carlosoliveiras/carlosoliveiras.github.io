// Todo o conteúdo da página vem de db/data.json; edite só esse arquivo para atualizar o site.

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

function renderRecommendations(items) {
  field(document, "recommendations").replaceChildren(
    ...(items.length
      ? items.map((item) =>
          el("li", { className: "content__item" }, [
            el("a", { className: "bio-link", href: item.url, ...external(item.url) }, [
              el("span", { className: "bio-link__text" }, [
                el("span", { textContent: item.title }),
                el("small", { textContent: item.description }),
              ]),
              icon("fa-solid fa-arrow-up-right-from-square bio-link__external"),
            ]),
          ])
        )
      : [el("li", { className: "content__error", textContent: "Nenhuma recomendação ainda." })])
  );
}

// número em destaque do projeto; "series" vira um gráfico de linha ao lado
function renderMetric({ value, label, series }) {
  const text = el("span", { className: "metric__text" }, [
    el("span", { className: "metric__value", textContent: value }),
    el("span", { className: "metric__label", textContent: label }),
  ]);
  return el("span", { className: "metric" }, series?.length > 1 ? [text, sparkline(series, label)] : [text]);
}

// linha com área em degradê, como os cards do deyv.in
function sparkline(series, label) {
  const w = 120, h = 48, pad = 4;
  const min = Math.min(...series), max = Math.max(...series);
  const points = series.map((v, i) => [
    pad + (i * (w - 2 * pad)) / (series.length - 1),
    h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad),
  ]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const area = `${line} L ${points.at(-1)[0]} ${h} L ${pad} ${h} Z`;
  const span = el("span", { className: "metric__chart", role: "img", ariaLabel: `Gráfico de ${label}` });
  span.innerHTML = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="currentColor" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#spark-fill)"/>
    <path d="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${points.at(-1)[0]}" cy="${points.at(-1)[1]}" r="3" fill="currentColor"/>
  </svg>`;
  return span;
}

function renderProjects(projects) {
  const dialog = document.getElementById("project-dialog");

  field(document, "projects").replaceChildren(
    ...projects.map((project) => {
      const card = el("button", { className: "project-card" }, [
        el("span", { className: "project-card__head" }, [
          el("strong", { textContent: project.name }),
          ...(project.status ? [el("small", { className: "badge", textContent: project.status })] : []),
        ]),
        el("span", { className: "project-card__summary", textContent: project.summary }),
        ...(project.metric ? [renderMetric(project.metric)] : []),
      ]);
      card.addEventListener("click", () => {
        field(dialog, "image").src = project.image;
        field(dialog, "image").alt = project.name;
        field(dialog, "image").style.objectFit = project.imageFit || "cover";
        field(dialog, "name").textContent = project.name;
        field(dialog, "description").textContent = project.description;
        field(dialog, "technologies").replaceChildren(
          ...(project.technologies || []).map((tech) => el("li", { textContent: tech }))
        );
        field(dialog, "url").href = project.url;
        field(dialog, "url").hidden = !project.url;
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

function themeToggle() {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const sync = () => {
    const dark = root.dataset.theme === "dark";
    button.setAttribute("aria-pressed", dark);
    button.ariaLabel = dark ? "Ativar tema claro" : "Ativar tema escuro";
  };
  sync();
  button.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", root.dataset.theme);
    } catch {}
    sync();
  });
}

async function init() {
  themeToggle();
  animateTabs();
  try {
    const response = await fetch("db/data.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderProfile(data.profile);
    renderLinks(data.links);
    renderProjects(data.projects);
    renderRecommendations(data.recommendations || []);
  } catch (error) {
    console.error("Falha ao carregar db/data.json:", error);
    document.querySelectorAll(".skeleton").forEach((node) => node.remove());
    field(document, "links").replaceChildren(
      el("li", { className: "content__error", textContent: "Não foi possível carregar o conteúdo." })
    );
  } finally {
    document.body.classList.remove("is-loading");
  }
}

init();

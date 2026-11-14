// =========================================================
// CATÁLOGO DE JUEGOS (Aquí iremos agregando los tuyos)
// =========================================================
const listaJuegos = [
    {
        id: "demo-1",
        titulo: "Próximo Juego",
        categoria: "arcade", // Opciones: "accion", "arcade", "puzzle"
        icono: "🚀",
        imagen: "", // Opcional: si luego pones una portada ej: "juegos/juego1/portada.png"
        colorFondo: "linear-gradient(135deg, #4f46e5, #06b6d4)",
        tag: "NUEVO", // Opcional: "NUEVO", "TOP", o ""
        destacado: true, // true = tarjeta grande estilo Friv
        controles: "PC: Flechas / Celular: Táctil",
        ruta: "juegos/demo/index.html"
    }
];

// =========================================================
// LÓGICA DEL HUB (No necesitas tocar esto al agregar juegos)
// =========================================================
const grid = document.getElementById("grid-juegos");
const buscador = document.getElementById("buscador");
const sinResultados = document.getElementById("sin-resultados");
const contadorJuegos = document.getElementById("contador-juegos");

const modal = document.getElementById("modal-juego");
const modalBox = document.getElementById("modal-box");
const iframe = document.getElementById("iframe-juego");
const tituloActual = document.getElementById("titulo-juego-actual");
const iconoActual = document.getElementById("icono-juego-actual");
const controlesActual = document.getElementById("controles-juego-actual");
const btnFavoritoModal = document.getElementById("btn-favorito-modal");

let categoriaActual = "todos";
let juegoAbierto = null;
let favoritos = JSON.parse(localStorage.getItem("arcade_favoritos")) || [];

contadorJuegos.textContent = listaJuegos.length;

function guardarFavoritos() {
    localStorage.setItem("arcade_favoritos", JSON.stringify(favoritos));
}

function toggleFavorito(id, event) {
    if (event) event.stopPropagation();
    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(fav => fav !== id);
    } else {
        favoritos.push(id);
    }
    guardarFavoritos();
    renderizarJuegos();
    actualizarBotonFavoritoModal();
}

function actualizarBotonFavoritoModal() {
    if (!juegoAbierto) return;
    const esFav = favoritos.includes(juegoAbierto.id);
    btnFavoritoModal.textContent = esFav ? "⭐" : "☆";
}

function renderizarJuegos() {
    const textoBusqueda = buscador.value.toLowerCase().trim();
    grid.innerHTML = "";

    const filtrados = listaJuegos.filter(juego => {
        const coincideTexto = juego.titulo.toLowerCase().includes(textoBusqueda);
        const coincideCategoria =
            categoriaActual === "todos" ||
            (categoriaActual === "favoritos" && favoritos.includes(juego.id)) ||
            juego.categoria === categoriaActual;

        return coincideTexto && coincideCategoria;
    });

    if (filtrados.length === 0) {
        sinResultados.classList.remove("oculto");
    } else {
        sinResultados.classList.add("oculto");
    }

    filtrados.forEach(juego => {
        const esFav = favoritos.includes(juego.id);
        const card = document.createElement("div");
        card.className = `tarjeta-juego ${juego.destacado ? "destacado" : ""} ${juego.imagen ? "con-imagen" : ""}`;
        
        if (!juego.imagen && juego.colorFondo) {
            card.style.background = juego.colorFondo;
        }

        const badgeHTML = juego.tag
            ? `<span class="badge-tag ${juego.tag.toLowerCase() === "top" ? "top" : ""}">${juego.tag}</span>`
            : "";

        const mediaHTML = juego.imagen
            ? `<img src="${juego.imagen}" alt="${juego.titulo}" class="img-juego">`
            : `<div class="icono-juego">${juego.icono}</div>`;

        card.innerHTML = `
            ${badgeHTML}
            <span class="fav-corner ${esFav ? "es-fav" : ""}" title="Favorito">${esFav ? "⭐" : "☆"}</span>
            ${mediaHTML}
            <div class="overlay-info">
                <div class="titulo-juego">${juego.titulo}</div>
            </div>
        `;

        card.querySelector(".fav-corner").onclick = (e) => toggleFavorito(juego.id, e);
        card.onclick = () => abrirJuego(juego);
        grid.appendChild(card);
    });
}

function abrirJuego(juego) {
    juegoAbierto = juego;
    tituloActual.textContent = juego.titulo;
    iconoActual.textContent = juego.icono;
    controlesActual.textContent = juego.controles || "PC & Celular";
    iframe.src = juego.ruta;
    actualizarBotonFavoritoModal();
    modal.classList.remove("oculto");
    document.body.style.overflow = "hidden";
}

function cerrarJuego() {
    modal.classList.add("oculto");
    iframe.src = "";
    juegoAbierto = null;
    document.body.style.overflow = "auto";
}

// Eventos de filtros
document.querySelectorAll(".filtro-btn").forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
        categoriaActual = btn.dataset.categoria;
        renderizarJuegos();
    };
});

// Eventos de búsqueda y botones del visor
buscador.addEventListener("input", renderizarJuegos);
document.getElementById("btn-cerrar").onclick = cerrarJuego;
btnFavoritoModal.onclick = () => {
    if (juegoAbierto) toggleFavorito(juegoAbierto.id);
};

document.getElementById("btn-reiniciar").onclick = () => {
    if (juegoAbierto) {
        iframe.src = iframe.src;
    }
};

document.getElementById("btn-fullscreen").onclick = () => {
    if (!document.fullscreenElement) {
        modalBox.requestFullscreen().catch(() => {
            if (iframe.requestFullscreen) iframe.requestFullscreen();
        });
    } else {
        document.exitFullscreen();
    }
};

// Cerrar con tecla ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("oculto")) {
        cerrarJuego();
    }
});

// Iniciar catálogo
renderizarJuegos();
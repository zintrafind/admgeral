 /* ============================================================
SIDEBAR TOGGLE
============================================================ */

let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebarBtn");

if (sidebarBtn && sidebar) {

sidebarBtn.onclick = function () {

    sidebar.classList.toggle("active");

};

}

/* ============================================================
VARIÁVEIS GLOBAIS
============================================================ */

let idAnuncioParaExcluir = null;
let tokenAtualGlobal = null;

let idAnuncioParaSuspender = null;
let tokenSuspenderGlobal = null;

/* ============================================================
DOM CONTENT LOADED
============================================================ */

document.addEventListener("DOMContentLoaded", async function () {

const token =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken");


/* ========================================================
   VERIFICAR LOGIN
   ======================================================== */

if (
    !token &&
    window.location.pathname.includes("anuncios-publicados")
) {

    mostrarToast(
        "Acesso negado. Faça o login primeiro.",
        "erro"
    );


    setTimeout(() => {

        window.location.href =
            "../autenticação/index.html";

    }, 1500);


    return;

}


/* ========================================================
   CARREGAR ANÚNCIOS
   ======================================================== */

if (
    window.location.pathname.includes("anuncios-publicados")
) {

    await carregarAnunciosAdmin(token);

}


/* ========================================================
   LOGOUT
   ======================================================== */

const logoutBtn =
    document.querySelector(".logout a");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function (e) {

            e.preventDefault();


            localStorage.removeItem("adminToken");

            sessionStorage.removeItem("adminToken");


            mostrarToast(
                "Sessão encerrada com sucesso.",
                "sucesso"
            );


            setTimeout(() => {

                window.location.href =
                    "../autenticação/index.html";

            }, 1000);

        }
    );

}


/* ========================================================
   CONFIGURAR MODAIS
   ======================================================== */

setupModalExclusao();

setupModalDetalhes();

setupModalSuspensao();

});

/* ============================================================
CARREGAR ANÚNCIOS
UC44 - GERENCIAR ANÚNCIOS PUBLICADOS
============================================================ */

async function carregarAnunciosAdmin(token) {

const container =
    document.querySelector(".advertisements");


if (!container) {

    return;

}


try {

    const response =
        await fetch(
            "http://127.0.0.1:8000/api/admin/products",
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"

                }

            }
        );


    if (!response.ok) {

        console.error(
            "Erro HTTP:",
            response.status
        );


        mostrarToast(
            "Não foi possível carregar os anúncios.",
            "erro"
        );


        return;

    }


    const anuncios =
        await response.json();


    container.innerHTML = "";


    if (
        !anuncios ||
        anuncios.length === 0
    ) {

        container.innerHTML = `
            <p style="
                padding: 20px;
                color: #666;
            ">
                Nenhum anúncio publicado no momento.
            </p>
        `;


        return;

    }


    anuncios.forEach(anuncio => {

        const card =
            document.createElement("div");


        card.className =
            "advertisement-card";


        const idProduto =
            anuncio.id_produto ||
            anuncio.id;


        let imagemSrc =
            "src/images/celular.png";


        const imgCampo =
            anuncio.ds_imagem ||
            anuncio.imagem ||
            anuncio.ds_foto ||
            anuncio.foto ||
            anuncio.url_imagem ||
            anuncio.caminho_imagem;


        if (
            imgCampo &&
            typeof imgCampo === "string" &&
            imgCampo.trim() !== ""
        ) {

            if (
                imgCampo.startsWith("http://") ||
                imgCampo.startsWith("https://")
            ) {

                imagemSrc =
                    imgCampo;

            }

            else if (
                imgCampo.startsWith("/storage/") ||
                imgCampo.startsWith("storage/")
            ) {

                const caminhoLimpo =
                    imgCampo.startsWith("/")
                        ? imgCampo.substring(1)
                        : imgCampo;


                imagemSrc =
                    `http://127.0.0.1:8000/${caminhoLimpo}`;

            }

            else {

                imagemSrc =
                    `http://127.0.0.1:8000/storage/${imgCampo}`;

            }

        }


        const nomeProduto =
            anuncio.nm_produto ||
            anuncio.nm_anuncio ||
            anuncio.titulo ||
            anuncio.name ||
            "Produto sem nome";


        const nomeUsuario =
            anuncio.dono_anuncio ||
            (
                anuncio.usuario
                    ? anuncio.usuario.nm_usuario
                    : null
            ) ||
            `Usuário ID: ${anuncio.id_usuario || "Mobile"}`;


        const categoriasMap = {
    1: "Hardware",
    2: "Computador e notebook",
    3: "Celular e tablet",
    4: "Memórias e pen drives",
    5: "Fontes e carregadores",
    6: "Impressoras e adaptadores",
    7: "Consoles e videogames",
    8: "Câmeras",
    9: "Outros"
};

const categoriaInfo =
    anuncio.nome_categoria ||
    categoriasMap[anuncio.id_categoria] ||
    "Categoria não informada";

        const statusProduto =
            anuncio.st_status || "A";


        const statusMap = {

            A: "Disponível",

            N: "Em negociação",

            T: "Trocado",

            S: "Suspenso",

            E: "Excluído"

        };


        const statusTexto =
            statusMap[statusProduto] ||
            statusProduto;


        let textoSuspensao =
            "Suspender Anúncio";


        let iconeSuspensao =
            "fa-pause";


        if (
            statusProduto === "S"
        ) {

            textoSuspensao =
                "Deixar Disponível";


            iconeSuspensao =
                "fa-play";

        }


        card.innerHTML = `

            <img
                src="${imagemSrc}"
                alt="${nomeProduto}"
                onerror="
                    this.src='src/images/celular.png'
                "
            >

            <div class="advertisement-info">

                <div class="advertisement-title">

                    ${nomeProduto}

                </div>

                <div class="indicator">

                    <p class="advertisement-description">

                        <i class="fa-solid fa-user"></i>

                        ${nomeUsuario}

                    </p>


                    <p class="advertisement-status">

                        <i class="fa-solid fa-tag"></i>

                        <span class="quantity">
                            Categoria:
                                </span>

                            ${categoriaInfo}

                    </p>

                </div>

                <div class="advertisement-actions">

                    <button
                        type="button"
                        class="btn-suspender-anuncio"
                    >

                        <i class="fa-solid ${iconeSuspensao}"></i>

                        ${textoSuspensao}

                    </button>

                    <button
                        type="button"
                        class="btn-excluir-anuncio"
                    >

                        <i class="fa-solid fa-trash"></i>

                        Excluir Anúncio

                    </button>

                </div>

            </div>

        `;


        card.addEventListener(
            "click",
            function (e) {

                if (
                    e.target.closest(
                        ".btn-suspender-anuncio"
                    ) ||
                    e.target.closest(
                        ".btn-excluir-anuncio"
                    )
                ) {

                    return;

                }


                visualizarDetalhes(
                    idProduto,
                    token
                );

            }
        );


        const botaoSuspender =
            card.querySelector(
                ".btn-suspender-anuncio"
            );


        if (botaoSuspender) {

            botaoSuspender.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();


                    abrirModalSuspensao(
                        idProduto,
                        token,
                        statusProduto
                    );

                }
            );

        }


        const botaoExcluir =
            card.querySelector(
                ".btn-excluir-anuncio"
            );


        if (botaoExcluir) {

            botaoExcluir.addEventListener(
                "click",
                function (e) {

                    e.stopPropagation();


                    abrirModalExclusao(
                        idProduto,
                        token
                    );

                }
            );

        }


        container.appendChild(card);

    });

}

catch (error) {

    console.error(
        "Erro de conexão com o servidor Laravel:",
        error
    );


    mostrarToast(
        "Falha de comunicação com a API.",
        "erro"
    );

}

}

/* ============================================================
VISUALIZAR DETALHES DO ANÚNCIO
============================================================ */

async function visualizarDetalhes(
idProduto,
token
) {

try {

    const response =
        await fetch(
            `http://127.0.0.1:8000/api/admin/products/${idProduto}/detalhes`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"

                }

            }
        );


    if (response.ok) {

        const anuncio =
            await response.json();


        preencherModalDetalhes(
            anuncio
        );


        const modal =
            document.getElementById(
                "detailsModal"
            );


        if (modal) {

            modal.style.display =
                "flex";

        }


        return;

    }


    if (
        response.status === 404
    ) {

        mostrarToast(
            "Anúncio não encontrado.",
            "erro"
        );


        return;

    }


    mostrarToast(
        "Não foi possível carregar os detalhes do anúncio.",
        "erro"
    );

}

catch (error) {

    console.error(
        "Erro ao visualizar anúncio:",
        error
    );


    mostrarToast(
        "Falha de comunicação com a API.",
        "erro"
    );

}

}

/* ============================================================
PREENCHER MODAL DE DETALHES
============================================================ */

function preencherModalDetalhes(anuncio) {

const nome =
    anuncio.nm_produto ||
    "Produto sem nome";


const descricao =
    anuncio.ds_produto ||
    "Sem descrição cadastrada.";


const usuario =
    anuncio.dono_anuncio ||
    "Usuário não informado";


const email =
    anuncio.email_usuario ||
    "Não informado";


const categoria =
    anuncio.nome_categoria ||
    categoriasMap[anuncio.id_categoria] ||
    "Não informada";

let condicao =
    anuncio.st_condicao ||
    "Não informada";


const condicoes = {

    N: "Novo",

    S: "Semi-novo",

    U: "Usado",

    Q: "Quebrado"

};


condicao =
    condicoes[condicao] ||
    condicao;


let status =
    anuncio.st_status ||
    "Não informado";


const statusMap = {

    A: "Disponível",

    N: "Em negociação",

    T: "Trocado",

    S: "Suspenso",

    E: "Excluído"

};


status =
    statusMap[status] ||
    status;


const elementoNome =
    document.getElementById(
        "detailNome"
    );


const elementoDescricao =
    document.getElementById(
        "detailDescricao"
    );


const elementoUsuario =
    document.getElementById(
        "detailUsuario"
    );


const elementoEmail =
    document.getElementById(
        "detailEmail"
    );


const elementoCategoria =
    document.getElementById(
        "detailCategoria"
    );


const elementoCondicao =
    document.getElementById(
        "detailCondicao"
    );


const elementoStatus =
    document.getElementById(
        "detailStatus"
    );


if (elementoNome) {

    elementoNome.textContent =
        nome;

}


if (elementoDescricao) {

    elementoDescricao.textContent =
        descricao;

}


if (elementoUsuario) {

    elementoUsuario.textContent =
        usuario;

}


if (elementoEmail) {

    elementoEmail.textContent =
        email;

}


if (elementoCategoria) {

    elementoCategoria.textContent =
        categoria;

}


if (elementoCondicao) {

    elementoCondicao.textContent =
        condicao;

}


if (elementoStatus) {

    elementoStatus.textContent =
        status;

}


const imagem =
    document.getElementById(
        "detailImagem"
    );


if (imagem) {

    let imagemSrc =
        "src/images/celular.png";


    if (
        anuncio.imagens &&
        anuncio.imagens.length > 0
    ) {

        const imagemBanco =
            anuncio.imagens[0].ds_imagem;


        if (
            imagemBanco &&
            typeof imagemBanco === "string"
        ) {

            if (
                imagemBanco.startsWith("http://") ||
                imagemBanco.startsWith("https://")
            ) {

                imagemSrc =
                    imagemBanco;

            }

            else if (
                imagemBanco.startsWith("/storage/") ||
                imagemBanco.startsWith("storage/")
            ) {

                const caminhoLimpo =
                    imagemBanco.startsWith("/")
                        ? imagemBanco.substring(1)
                        : imagemBanco;


                imagemSrc =
                    `http://127.0.0.1:8000/${caminhoLimpo}`;

            }

            else {

                imagemSrc =
                    `http://127.0.0.1:8000/storage/${imagemBanco}`;

            }

        }

    }


    imagem.src =
        imagemSrc;

}

}

/* ============================================================
CONFIGURAR MODAL DE DETALHES
============================================================ */

function setupModalDetalhes() {

const modal =
    document.getElementById(
        "detailsModal"
    );


const fecharBtn =
    document.getElementById(
        "closeDetailsBtn"
    );


if (
    fecharBtn &&
    modal
) {

    fecharBtn.addEventListener(
        "click",
        function () {

            modal.style.display =
                "none";

        }
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        function (e) {

            if (
                e.target === modal
            ) {

                modal.style.display =
                    "none";

            }

        }
    );

}

}

/* ============================================================
MODAL DE EXCLUSÃO
============================================================ */

function abrirModalExclusao(
idProduto,
token
) {

idAnuncioParaExcluir =
    idProduto;


tokenAtualGlobal =
    token;


const modal =
    document.getElementById(
        "deleteModal"
    );


if (modal) {

    modal.style.display =
        "flex";

}

}

/* ============================================================
CONFIGURAR MODAL DE EXCLUSÃO
============================================================ */

function setupModalExclusao() {

const modal =
    document.getElementById(
        "deleteModal"
    );


const cancelarBtn =
    document.getElementById(
        "cancelDeleteBtn"
    );


const confirmarBtn =
    document.getElementById(
        "confirmDeleteBtn"
    );


if (
    cancelarBtn &&
    modal
) {

    cancelarBtn.addEventListener(
        "click",
        function () {

            modal.style.display =
                "none";

        }
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        function (e) {

            if (
                e.target === modal
            ) {

                modal.style.display =
                    "none";

            }

        }
    );

}


if (
    confirmarBtn &&
    modal
) {

    confirmarBtn.addEventListener(
        "click",
        async function () {

            if (
                !idAnuncioParaExcluir ||
                !tokenAtualGlobal
            ) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/api/admin/products/${idAnuncioParaExcluir}`,
                        {
                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${tokenAtualGlobal}`,

                                "Accept":
                                    "application/json"

                            }

                        }
                    );


                if (response.ok) {

                    modal.style.display =
                        "none";


                    mostrarToast(
                        "Anúncio excluído com sucesso!",
                        "sucesso"
                    );


                    setTimeout(() => {

                        location.reload();

                    }, 1000);


                    return;

                }


                modal.style.display =
                    "none";


                mostrarToast(
                    "Não foi possível localizar ou excluir o anúncio.",
                    "erro"
                );

            }

            catch (error) {

                console.error(
                    "Erro na requisição de exclusão:",
                    error
                );


                modal.style.display =
                    "none";


                mostrarToast(
                    "Falha de comunicação com a API.",
                    "erro"
                );

            }

        }
    );

}

}

/* ============================================================
SUSPENDER / DEIXAR DISPONÍVEL
============================================================ */

function abrirModalSuspensao(
idProduto,
token,
statusAtual
) {

idAnuncioParaSuspender =
    idProduto;


tokenSuspenderGlobal =
    token;


const modal =
    document.getElementById(
        "suspendModal"
    );


const titulo =
    modal?.querySelector("h3");


const mensagem =
    modal?.querySelector("p");


const confirmarBtn =
    document.getElementById(
        "confirmSuspendBtn"
    );


const icone =
    modal?.querySelector(
        ".modal-icon i"
    );


if (
    statusAtual === "S"
) {

    if (titulo) {

        titulo.textContent =
            "Deixar Anúncio Disponível";

    }


    if (mensagem) {

        mensagem.innerHTML = `
            Tem certeza de que deseja deixar este anúncio disponível?
            <br>
            O anúncio voltará a ficar disponível para os usuários.
        `;

    }


    if (confirmarBtn) {

        confirmarBtn.textContent =
            "Sim, Deixar Disponível";


        confirmarBtn.classList.remove(
            "btn-confirmar-suspend"
        );


        confirmarBtn.classList.add(
            "btn-confirmar-suspensao"
        );

    }


    if (icone) {

        icone.className =
            "fa-solid fa-circle-play";

    }

}

else {

    if (titulo) {

        titulo.textContent =
            "Suspender Anúncio";

    }


    if (mensagem) {

        mensagem.innerHTML = `
            Tem certeza de que deseja suspender este anúncio?
            <br>
            O anúncio ficará indisponível para os usuários.
        `;

    }


    if (confirmarBtn) {

        confirmarBtn.textContent =
            "Sim, Suspender";


        confirmarBtn.classList.remove(
            "btn-confirmar-suspensao"
        );


        confirmarBtn.classList.add(
            "btn-confirmar-suspend"
        );

    }


    if (icone) {

        icone.className =
            "fa-solid fa-circle-pause";

    }

}


if (modal) {

    modal.dataset.statusAtual =
        statusAtual;


    modal.style.display =
        "flex";

}

}

/* ============================================================
CONFIGURAR MODAL DE SUSPENSÃO
============================================================ */

function setupModalSuspensao() {

const modal =
    document.getElementById(
        "suspendModal"
    );


const cancelarBtn =
    document.getElementById(
        "cancelSuspendBtn"
    );


const confirmarBtn =
    document.getElementById(
        "confirmSuspendBtn"
    );


if (
    cancelarBtn &&
    modal
) {

    cancelarBtn.addEventListener(
        "click",
        function () {

            modal.style.display =
                "none";

        }
    );

}


if (modal) {

    modal.addEventListener(
        "click",
        function (e) {

            if (
                e.target === modal
            ) {

                modal.style.display =
                    "none";

            }

        }
    );

}


if (
    confirmarBtn &&
    modal
) {

    confirmarBtn.addEventListener(
        "click",
        async function () {

            if (
                !idAnuncioParaSuspender ||
                !tokenSuspenderGlobal
            ) {

                mostrarToast(
                    "Anúncio não selecionado.",
                    "erro"
                );


                return;

            }


            const statusAtual =
                modal.dataset.statusAtual;


            const novoStatus =
                statusAtual === "S"
                    ? "A"
                    : "S";


            try {

                /* =================================================
                   ALTERAR SOMENTE O STATUS
                   ================================================= */

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/api/admin/products/${idAnuncioParaSuspender}/status`,
                        {
                            method: "PUT",

                            headers: {

                                "Authorization":
                                    `Bearer ${tokenSuspenderGlobal}`,

                                "Accept":
                                    "application/json",

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    st_status:
                                        novoStatus

                                })

                        }
                    );


                /* =================================================
                   SUCESSO
                   ================================================= */

                if (response.ok) {

                    modal.style.display =
                        "none";


                    if (
                        novoStatus === "S"
                    ) {

                        mostrarToast(
                            "Anúncio suspenso com sucesso!",
                            "sucesso"
                        );

                    }

                    else {

                        mostrarToast(
                            "Anúncio disponibilizado novamente!",
                            "sucesso"
                        );

                    }


                    setTimeout(() => {

                        location.reload();

                    }, 1000);


                    return;

                }


                /* =================================================
                   ERRO
                   ================================================= */

                const erro =
                    await response.json()
                        .catch(() => null);


                console.error(
                    "Erro ao alterar status:",
                    response.status,
                    erro
                );


                modal.style.display =
                    "none";


                mostrarToast(
                    erro?.message ||
                    erro?.error ||
                    "Não foi possível alterar o status do anúncio.",
                    "erro"
                );

            }

            catch (error) {

                console.error(
                    "Erro ao alterar status:",
                    error
                );


                modal.style.display =
                    "none";


                mostrarToast(
                    "Falha de comunicação com a API.",
                    "erro"
                );

            }

        }
    );

}

}

/* ============================================================
TOAST
============================================================ */

function mostrarToast(
mensagem,
tipo = "sucesso"
) {

const toast =
    document.getElementById(
        "toastNotification"
    );


const toastMessage =
    document.getElementById(
        "toastMessage"
    );


const toastIcon =
    document.getElementById(
        "toastIcon"
    );


if (!toast) {

    console.warn(
        "Elemento #toastNotification não encontrado."
    );


    return;

}


if (toastMessage) {

    toastMessage.textContent =
        mensagem;

}


toast.className =
    `toast-notification ${tipo}`;


if (toastIcon) {

    if (
        tipo === "sucesso"
    ) {

        toastIcon.className =
            "fa-solid fa-circle-check";

    }

    else {

        toastIcon.className =
            "fa-solid fa-circle-exclamation";

    }

}


toast.style.display =
    "flex";


toast.style.animation =
    "none";


toast.offsetHeight;


toast.style.animation =
    "";


setTimeout(() => {

    toast.style.display =
        "none";

}, 3000);

}
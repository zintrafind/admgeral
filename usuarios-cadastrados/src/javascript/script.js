 
document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // CONFIGURAÇÕES
    // ============================================================

    const API_URL = "http://127.0.0.1:8000/api";
    const STORAGE_URL = "http://127.0.0.1:8000/storage";

    const token =
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken");

    let usuariosCarregados = [];


    // ============================================================
    // ELEMENTOS DA PÁGINA
    // ============================================================

    const sidebar = document.querySelector(".sidebar");
    const sidebarBtn = document.querySelector(".sidebarBtn");

    const containerUsers = document.getElementById("users-list");

    const inputPesquisa = document.getElementById("input-pesquisa");
    const btnPesquisa = document.getElementById("btn-button");

    const btnLogout = document.getElementById("btn-logout");


    // ============================================================
    // MODAL DE CONFIRMAÇÃO
    // ============================================================

    const customModal = document.getElementById("custom-modal");
    const modalTitulo = document.getElementById("modal-titulo");
    const modalMensagem = document.getElementById("modal-mensagem");
    const modalIcon = document.getElementById("modal-icon");

    const modalBtnSim = document.getElementById("modal-btn-sim");
    const modalBtnNao = document.getElementById("modal-btn-nao");


    // ============================================================
    // MODAL DE DETALHES
    // ============================================================

    const modalDetalhes = document.getElementById("modal-detalhes");

    const btnFecharDetalhes =
        document.getElementById("btn-fechar-detalhes");

    const btnDetalhesFechar =
        document.getElementById("btn-detalhes-fechar");


    // ============================================================
    // MODAL DE EDIÇÃO
    // ============================================================

    const modalEditar = document.getElementById("modal-editar");

    const btnFecharEditar =
        document.getElementById("btn-fechar-editar");

    const btnCancelarEdicao =
        document.getElementById("btn-cancelar-edicao");

    const formEditar =
        document.getElementById("form-editar-usuario");


    // ============================================================
    // PROTEÇÃO DA PÁGINA
    // ============================================================

    if (!token) {

        window.location.href =
            "../autenticação/index.html";

        return;
    }


    // ============================================================
    // SIDEBAR
    // ============================================================

    if (sidebarBtn && sidebar) {

        sidebarBtn.addEventListener("click", () => {

            sidebar.classList.toggle("active");

        });

    }


    // ============================================================
    // FUNÇÃO PARA ESCAPAR HTML
    // Evita que dados do usuário sejam interpretados como HTML
    // ============================================================

    function escaparHTML(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {
            return "";
        }

        return String(valor)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    // ============================================================
    // FOTO DO USUÁRIO
    // ============================================================

    function obterFotoUsuario(usuario) {

        if (
            usuario.ds_foto_perfil &&
            usuario.ds_foto_perfil.trim() !== ""
        ) {

            // Caso já venha como URL completa

            if (
                usuario.ds_foto_perfil.startsWith("http://") ||
                usuario.ds_foto_perfil.startsWith("https://")
            ) {

                return usuario.ds_foto_perfil;

            }


            let caminho =
                usuario.ds_foto_perfil.replace(/^\/+/, "");


            // Caso o banco já tenha "storage/..."
            if (caminho.startsWith("storage/")) {

                return `http://127.0.0.1:8000/${caminho}`;

            }


            return `${STORAGE_URL}/${caminho}`;
        }


        // Avatar padrão

        if (usuario.tp_usuario === "A") {

            return "src/images/avatar1.png";

        }


        return "src/images/avatar2.png";
    }


    // ============================================================
    // CONVERTER TIPO DO USUÁRIO
    // ============================================================

    function obterTipoUsuario(tipo) {

        if (tipo === "A") {
            return "Administrador";
        }

        return "Cliente";
    }


    // ============================================================
    // CONVERTER STATUS
    // ============================================================

    function obterStatusUsuario(status) {

        if (status === "B") {
            return "Bloqueado";
        }

        if (status === "A") {
            return "Ativo";
        }

        return status || "Não informado";
    }


    // ============================================================
    // STATUS DO E-MAIL
    // ============================================================

    function obterStatusEmail(status) {

        if (
            status === "S" ||
            status === "1" ||
            status === 1 ||
            status === true
        ) {

            return "Sim";

        }

        return "Não";
    }


    // ============================================================
    // FORMATAR DATA
    // ============================================================

    function formatarData(data) {

    if (!data) {
        return "Não informado";
    }

    const dataTexto = String(data);

    const dataParte = dataTexto.substring(0, 10);
    const horaParte = dataTexto.substring(11, 16);

    const partes = dataParte.split("-");

    if (partes.length !== 3) {
        return data;
    }

    const ano = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    return `${dia}/${mes}/${ano}, ${horaParte}`;
}


    // ============================================================
    // MOSTRAR MODAL DE AVISO / CONFIRMAÇÃO
    // ============================================================

    function mostrarModal(
        mensagem,
        tipo = "confirmacao",
        titulo = "Atenção",
        textoBotao = "Confirmar"
    ) {

        return new Promise((resolve) => {

            if (
                !customModal ||
                !modalMensagem ||
                !modalBtnSim ||
                !modalBtnNao
            ) {

                if (tipo === "alerta") {

                    alert(mensagem);
                    resolve(true);

                } else {

                    resolve(confirm(mensagem));

                }

                return;
            }


            modalTitulo.textContent = titulo;
            modalMensagem.textContent = mensagem;

            customModal.style.display = "flex";


            // ----------------------------------------------------
            // ALERTA
            // ----------------------------------------------------

            if (tipo === "alerta") {

                modalBtnNao.style.display = "none";

                modalBtnSim.textContent = "OK";


                if (modalIcon) {

                    modalIcon.className =
                        "fa-solid fa-circle-info modal-icon";

                }

            }


            // ----------------------------------------------------
            // CONFIRMAÇÃO
            // ----------------------------------------------------

            else {

                modalBtnNao.style.display = "inline-block";

                modalBtnNao.textContent = "Cancelar";

                modalBtnSim.textContent = textoBotao;


                if (modalIcon) {

                    modalIcon.className =
                        "fa-solid fa-triangle-exclamation modal-icon";

                }

            }


            const fecharModal = (resultado) => {

                customModal.style.display = "none";

                modalBtnSim.onclick = null;
                modalBtnNao.onclick = null;

                resolve(resultado);

            };


            modalBtnSim.onclick = () => {

                fecharModal(true);

            };


            modalBtnNao.onclick = () => {

                fecharModal(false);

            };

        });
    }


    // ============================================================
    // BUSCAR USUÁRIOS NA API
    // ============================================================

    async function carregarUsuariosDaApi() {

        try {

            if (containerUsers) {

                containerUsers.innerHTML = `
                    <div class="users-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <p>Carregando usuários...</p>
                    </div>
                `;

            }


            const response = await fetch(
                `${API_URL}/admin/users`,
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

                throw new Error(
                    "Erro ao buscar usuários."
                );

            }


            const dados = await response.json();


            usuariosCarregados =
                Array.isArray(dados)
                    ? dados
                    : [];


            console.log(
                "USUÁRIOS RECEBIDOS:",
                usuariosCarregados
            );


            renderizarCards(
                usuariosCarregados
            );

        }

        catch (error) {

            console.error(
                "Erro ao carregar usuários:",
                error
            );


            if (containerUsers) {

                containerUsers.innerHTML = `

                    <div class="users-error">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        <p>
                            Erro ao carregar os usuários.
                        </p>

                        <span>
                            Verifique se o servidor Laravel está ligado.
                        </span>

                    </div>

                `;

            }

        }
    }


    // ============================================================
    // RENDERIZAR CARDS
    // ============================================================

    function renderizarCards(usuarios) {

        if (!containerUsers) {
            return;
        }


        containerUsers.innerHTML = "";


        // --------------------------------------------------------
        // NENHUM USUÁRIO
        // --------------------------------------------------------

        if (
            !usuarios ||
            usuarios.length === 0
        ) {

            containerUsers.innerHTML = `

                <div class="users-empty">

                    <i class="fa-solid fa-users-slash"></i>

                    <p>
                        Nenhum usuário encontrado.
                    </p>

                </div>

            `;

            return;
        }


        // --------------------------------------------------------
        // CRIAR CARDS
        // --------------------------------------------------------

        usuarios.forEach((user) => {

            const userId =
                user.id_usuario;

            const userName =
                escaparHTML(
                    user.nm_usuario || "Usuário"
                );

            const userEmail =
                escaparHTML(
                    user.email || "Sem e-mail"
                );

            const userType =
                obterTipoUsuario(
                    user.tp_usuario
                );

            const bloqueado =
                user.st_usuario === "B";

            const statusTexto =
                obterStatusUsuario(
                    user.st_usuario
                );

            const avatarImg =
                obterFotoUsuario(user);


            const card =
                document.createElement("div");


            card.className =
                bloqueado
                    ? "users-card user-bloqueado"
                    : "users-card";


            card.id =
                `user-card-${userId}`;


            card.innerHTML = `

                <div class="user-card-top">

                    <div class="user-avatar-wrapper">

                        <img
                            src="${escaparHTML(avatarImg)}"
                            alt="Foto de ${userName}"
                            class="user-avatar"
                        >

                        <span class="
                            user-status
                            ${bloqueado
                                ? "status-bloqueado"
                                : "status-ativo"
                            }
                        ">

                            ${escaparHTML(statusTexto)}

                        </span>

                    </div>

                </div>


                <div class="user-info">


                    <div class="indicator">


                        <p class="user-description">

                            <i class="fa-solid fa-user"></i>

                            ${userName}

                        </p>


                        <p class="user-email">

                            <i class="fa-solid fa-envelope"></i>

                            ${userEmail}

                        </p>


                        <p class="user-quantity">

                            <i class="fa-solid fa-shield"></i>

                            <span class="quantity">
                                Tipo:
                            </span>

                            ${userType}

                        </p>


                    </div>



                    <div class="user-actions">


                        <button
                            type="button"
                            class="btn-user-action btn-visualizar"
                            data-id="${userId}"
                            title="Visualizar usuário"
                        >

                            <i class="fa-solid fa-eye"></i>

                            Visualizar

                        </button>


                        <button
                            type="button"
                            class="btn-user-action btn-editar"
                            data-id="${userId}"
                            title="Editar usuário"
                        >

                            <i class="fa-solid fa-pen"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="
                                btn-user-action
                                ${bloqueado
                                    ? "btn-desbloquear"
                                    : "btn-bloquear"
                                }
                            "
                            data-id="${userId}"
                            title="${
                                bloqueado
                                    ? "Desbloquear usuário"
                                    : "Bloquear usuário"
                            }"
                        >

                            <i class="fa-solid ${
                                bloqueado
                                    ? "fa-lock-open"
                                    : "fa-ban"
                            }"></i>

                            ${
                                bloqueado
                                    ? "Desbloquear"
                                    : "Bloquear"
                            }

                        </button>


                        <button
                            type="button"
                            class="btn-user-action btn-excluir"
                            data-id="${userId}"
                            title="Excluir usuário"
                        >

                            <i class="fa-solid fa-trash"></i>

                            Excluir

                        </button>


                    </div>


                </div>

            `;


            // ----------------------------------------------------
            // FALLBACK DA FOTO
            // ----------------------------------------------------

            const imagem =
                card.querySelector(
                    ".user-avatar"
                );


            imagem.addEventListener(
                "error",
                function () {

                    this.onerror = null;

                    this.src =
                        user.tp_usuario === "A"
                            ? "src/images/avatar1.png"
                            : "src/images/avatar2.png";

                }
            );


            containerUsers.appendChild(card);

        });


        adicionarEventosCards();
    }


    // ============================================================
    // EVENTOS DOS BOTÕES DOS CARDS
    // ============================================================

    function adicionarEventosCards() {

        // VISUALIZAR

        document
            .querySelectorAll(".btn-visualizar")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        visualizarUsuario(
                            botao.dataset.id
                        );

                    }
                );

            });


        // EDITAR

        document
            .querySelectorAll(".btn-editar")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        abrirEdicaoUsuario(
                            botao.dataset.id
                        );

                    }
                );

            });


        // BLOQUEAR

        document
            .querySelectorAll(".btn-bloquear")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarStatusUsuario(
                            botao.dataset.id,
                            false
                        );

                    }
                );

            });


        // DESBLOQUEAR

        document
            .querySelectorAll(".btn-desbloquear")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        alterarStatusUsuario(
                            botao.dataset.id,
                            true
                        );

                    }
                );

            });


        // EXCLUIR

        document
            .querySelectorAll(".btn-excluir")
            .forEach((botao) => {

                botao.addEventListener(
                    "click",
                    () => {

                        deletarUsuario(
                            botao.dataset.id
                        );

                    }
                );

            });

    }


    // ============================================================
    // PESQUISAR USUÁRIOS
    // ============================================================

    function pesquisarUsuarios() {

        if (!inputPesquisa) {
            return;
        }


        const pesquisa =
            inputPesquisa.value
                .trim()
                .toLowerCase();


        if (!pesquisa) {

            renderizarCards(
                usuariosCarregados
            );

            return;
        }


        const usuariosFiltrados =
            usuariosCarregados.filter(
                (usuario) => {

                    const id =
                        String(
                            usuario.id_usuario || ""
                        ).toLowerCase();

                    const nome =
                        String(
                            usuario.nm_usuario || ""
                        ).toLowerCase();

                    const email =
                        String(
                            usuario.email || ""
                        ).toLowerCase();

                    const tipo =
                        obterTipoUsuario(
                            usuario.tp_usuario
                        ).toLowerCase();

                    const status =
                        obterStatusUsuario(
                            usuario.st_usuario
                        ).toLowerCase();


                    return (
                        id.includes(pesquisa) ||
                        nome.includes(pesquisa) ||
                        email.includes(pesquisa) ||
                        tipo.includes(pesquisa) ||
                        status.includes(pesquisa)
                    );

                }
            );


        renderizarCards(
            usuariosFiltrados
        );
    }


    if (inputPesquisa) {

        inputPesquisa.addEventListener(
            "input",
            pesquisarUsuarios
        );


        inputPesquisa.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    pesquisarUsuarios();

                }

            }
        );

    }


    if (btnPesquisa) {

        btnPesquisa.addEventListener(
            "click",
            pesquisarUsuarios
        );

    }


    // ============================================================
    // VISUALIZAR DETALHES
    // ============================================================

    async function visualizarUsuario(id) {

        try {

            const response = await fetch(
                `${API_URL}/admin/users/${id}/detalhes`,
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


            const dados =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    dados.message ||
                    "Não foi possível carregar o usuário."
                );

            }


            // ----------------------------------------------------
            // FOTO
            // ----------------------------------------------------

            const foto =
                document.getElementById(
                    "detalhe-foto"
                );


            if (foto) {

                foto.src =
                    obterFotoUsuario(dados);


                foto.onerror = function () {

                    this.onerror = null;

                    this.src =
                        dados.tp_usuario === "A"
                            ? "src/images/avatar1.png"
                            : "src/images/avatar2.png";

                };

            }


            // ----------------------------------------------------
            // DADOS
            // ----------------------------------------------------

            document.getElementById(
                "detalhe-id"
            ).textContent =
                dados.id_usuario;


            document.getElementById(
                "detalhe-nome"
            ).textContent =
                dados.nm_usuario ||
                "Não informado";


            document.getElementById(
                "detalhe-email"
            ).textContent =
                dados.email ||
                "Não informado";


            document.getElementById(
                "detalhe-tipo"
            ).textContent =
                obterTipoUsuario(
                    dados.tp_usuario
                );


            document.getElementById(
                "detalhe-status"
            ).textContent =
                obterStatusUsuario(
                    dados.st_usuario
                );


            document.getElementById(
                "detalhe-email-verificado"
            ).textContent =
                obterStatusEmail(
                    dados.st_email_verificado
                );


            document.getElementById(
                "detalhe-descricao"
            ).textContent =
                dados.ds_usuario ||
                "Nenhuma descrição cadastrada.";


            document.getElementById(
                "detalhe-anuncios"
            ).textContent =
                dados.total_anuncios ?? 0;


            document.getElementById(
                "detalhe-trocas"
            ).textContent =
                dados.total_trocas ?? 0;


            document.getElementById(
                "detalhe-data"
            ).textContent =
                formatarData(
                    dados.created_at
                );


            if (modalDetalhes) {

                modalDetalhes.style.display =
                    "flex";

            }

        }

        catch (error) {

            console.error(
                "Erro ao visualizar usuário:",
                error
            );


            await mostrarModal(
                error.message,
                "alerta",
                "Erro"
            );

        }
    }


    // ============================================================
    // FECHAR DETALHES
    // ============================================================

    function fecharDetalhes() {

        if (modalDetalhes) {

            modalDetalhes.style.display =
                "none";

        }
    }


    if (btnFecharDetalhes) {

        btnFecharDetalhes.addEventListener(
            "click",
            fecharDetalhes
        );

    }


    if (btnDetalhesFechar) {

        btnDetalhesFechar.addEventListener(
            "click",
            fecharDetalhes
        );

    }


    // ============================================================
    // ABRIR EDIÇÃO
    // ============================================================

    async function abrirEdicaoUsuario(id) {

        try {

            const response = await fetch(
                `${API_URL}/admin/users/${id}/detalhes`,
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


            const usuario =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    usuario.message ||
                    "Não foi possível carregar o usuário."
                );

            }


            document.getElementById(
                "editar-id"
            ).value =
                usuario.id_usuario;


            document.getElementById(
                "editar-nome"
            ).value =
                usuario.nm_usuario || "";


            document.getElementById(
                "editar-email"
            ).value =
                usuario.email || "";


            document.getElementById(
                "editar-tipo"
            ).value =
                usuario.tp_usuario || "C";


            document.getElementById(
                "editar-descricao"
            ).value =
                usuario.ds_usuario || "";


            if (modalEditar) {

                modalEditar.style.display =
                    "flex";

            }

        }

        catch (error) {

            console.error(
                "Erro ao abrir edição:",
                error
            );


            await mostrarModal(
                error.message,
                "alerta",
                "Erro"
            );

        }
    }


    // ============================================================
    // SALVAR EDIÇÃO
    // ============================================================

    if (formEditar) {

        formEditar.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const id =
                    document.getElementById(
                        "editar-id"
                    ).value;


                const nome =
                    document.getElementById(
                        "editar-nome"
                    ).value.trim();


                const email =
                    document.getElementById(
                        "editar-email"
                    ).value.trim();


                const tipo =
                    document.getElementById(
                        "editar-tipo"
                    ).value;


                const descricao =
                    document.getElementById(
                        "editar-descricao"
                    ).value.trim();


                if (!nome || !email) {

                    await mostrarModal(
                        "Preencha o nome e o e-mail.",
                        "alerta",
                        "Atenção"
                    );

                    return;
                }


                try {

                    const response = await fetch(
                        `${API_URL}/admin/users/${id}`,
                        {
                            method: "PUT",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`,

                                "Accept":
                                    "application/json",

                                "Content-Type":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                nm_usuario:
                                    nome,

                                email:
                                    email,

                                tp_usuario:
                                    tipo,

                                ds_usuario:
                                    descricao || null

                            })
                        }
                    );


                    const dados =
                        await response.json()
                            .catch(() => ({}));


                    if (!response.ok) {

                        // Erros de validação Laravel

                        if (
                            response.status === 422 &&
                            dados.errors
                        ) {

                            const mensagens =
                                Object.values(
                                    dados.errors
                                )
                                .flat()
                                .join("\n");


                            throw new Error(
                                mensagens
                            );

                        }


                        throw new Error(
                            dados.message ||
                            "Não foi possível atualizar o usuário."
                        );

                    }


                    fecharEdicao();


                    await mostrarModal(
                        dados.message ||
                        "Usuário atualizado com sucesso!",
                        "alerta",
                        "Sucesso"
                    );


                    await carregarUsuariosDaApi();

                }

                catch (error) {

                    console.error(
                        "Erro ao editar usuário:",
                        error
                    );


                    await mostrarModal(
                        error.message,
                        "alerta",
                        "Erro"
                    );

                }

            }
        );

    }


    // ============================================================
    // FECHAR EDIÇÃO
    // ============================================================

    function fecharEdicao() {

        if (modalEditar) {

            modalEditar.style.display =
                "none";

        }


        if (formEditar) {

            formEditar.reset();

        }
    }


    if (btnFecharEditar) {

        btnFecharEditar.addEventListener(
            "click",
            fecharEdicao
        );

    }


    if (btnCancelarEdicao) {

        btnCancelarEdicao.addEventListener(
            "click",
            fecharEdicao
        );

    }


    // ============================================================
    // BLOQUEAR / DESBLOQUEAR
    // ============================================================

    async function alterarStatusUsuario(
        id,
        estaBloqueado
    ) {

        const acao =
            estaBloqueado
                ? "desbloquear"
                : "bloquear";


        const acaoCapitalizada =
            estaBloqueado
                ? "Desbloquear"
                : "Bloquear";


        const confirmado =
            await mostrarModal(
                `Deseja realmente ${acao} este usuário?`,
                "confirmacao",
                "Alterar status",
                acaoCapitalizada
            );


        if (!confirmado) {
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/admin/users/${id}/status`,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }
                }
            );


            const dados =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    dados.message ||
                    "Não foi possível alterar o status."
                );

            }


            await mostrarModal(
                dados.message ||
                "Status alterado com sucesso!",
                "alerta",
                "Sucesso"
            );


            await carregarUsuariosDaApi();

        }

        catch (error) {

            console.error(
                "Erro ao alterar status:",
                error
            );


            await mostrarModal(
                error.message,
                "alerta",
                "Erro"
            );

        }
    }


    // ============================================================
    // EXCLUIR USUÁRIO
    // ============================================================

    async function deletarUsuario(id) {

        if (!id) {

            await mostrarModal(
                "ID do usuário inválido.",
                "alerta",
                "Erro"
            );

            return;
        }


        const usuario =
            usuariosCarregados.find(
                (item) =>
                    String(item.id_usuario) ===
                    String(id)
            );


        const nome =
            usuario
                ? usuario.nm_usuario
                : "este usuário";


        const confirmado =
            await mostrarModal(
                `Deseja realmente excluir ${nome}? Esta ação não poderá ser desfeita.`,
                "confirmacao",
                "Excluir usuário",
                "Excluir"
            );


        if (!confirmado) {
            return;
        }


        try {

            const response = await fetch(
                `${API_URL}/admin/users/${id}`,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }
                }
            );


            const dados =
                await response.json()
                    .catch(() => ({}));


            if (!response.ok) {

                throw new Error(
                    dados.message ||
                    "Não foi possível excluir o usuário."
                );

            }


            await mostrarModal(
                dados.message ||
                "Usuário excluído com sucesso!",
                "alerta",
                "Sucesso"
            );


            await carregarUsuariosDaApi();

        }

        catch (error) {

            console.error(
                "Erro na exclusão:",
                error
            );


            await mostrarModal(
                error.message ||
                "Falha de comunicação com a API.",
                "alerta",
                "Erro"
            );

        }
    }


    // ============================================================
    // FECHAR MODAIS CLICANDO FORA
    // ============================================================

    if (modalDetalhes) {

        modalDetalhes.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modalDetalhes
                ) {

                    fecharDetalhes();

                }

            }
        );

    }


    if (modalEditar) {

        modalEditar.addEventListener(
            "click",
            (event) => {

                if (
                    event.target === modalEditar
                ) {

                    fecharEdicao();

                }

            }
        );

    }


    // ============================================================
    // TECLA ESC
    // ============================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                fecharDetalhes();
                fecharEdicao();

            }

        }
    );


    // ============================================================
    // LOGOUT
    // ============================================================

    if (btnLogout) {

        btnLogout.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                localStorage.removeItem(
                    "adminToken"
                );

                sessionStorage.removeItem(
                    "adminToken"
                );

                window.location.href =
                    "../autenticação/index.html";

            }
        );

    }


    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================

    carregarUsuariosDaApi();

});


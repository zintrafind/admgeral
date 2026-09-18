/* ==================== SIDEBAR ==================== */

const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".sidebarBtn");

if (sidebar && sidebarBtn) {

    const sidebarState = localStorage.getItem("sidebarState");

    if (sidebarState === "collapsed") {
        sidebar.classList.add("active");
    }

    sidebarBtn.addEventListener("click", function () {

        sidebar.classList.toggle("active");

        if (sidebar.classList.contains("active")) {
            localStorage.setItem("sidebarState", "collapsed");
        } else {
            localStorage.setItem("sidebarState", "expanded");
        }

    });
}


/* ==================== DASHBOARD ==================== */

document.addEventListener("DOMContentLoaded", async function () {

    const token =
        localStorage.getItem("adminToken") ||
        sessionStorage.getItem("adminToken");

    console.log("Token encontrado:", token ? "SIM" : "NÃO");

    if (!token) {

        window.location.href =
            "../autenticação/index.html";

        return;
    }

    await carregarDashboard(token);

});


/* ==================== CARREGAR DADOS ==================== */

async function carregarDashboard(token) {

    try {

        /* ==================== USUÁRIOS ==================== */

        const respostaUsuarios = await fetch(
            "http://127.0.0.1:8000/api/admin/users",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );

        console.log(
            "Status API usuários:",
            respostaUsuarios.status
        );


        if (!respostaUsuarios.ok) {

            const erroUsuarios =
                await respostaUsuarios.text();

            console.error(
                "Erro retornado pela API de usuários:",
                erroUsuarios
            );

            throw new Error(
                "Não foi possível carregar os usuários."
            );
        }


        const usuarios =
            await respostaUsuarios.json();

        console.log(
            "Usuários recebidos:",
            usuarios
        );


        /* ==================== ANÚNCIOS ==================== */

        const respostaAnuncios = await fetch(
            "http://127.0.0.1:8000/api/admin/products",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );


        console.log(
            "Status API anúncios:",
            respostaAnuncios.status
        );


        if (!respostaAnuncios.ok) {

            const erroAnuncios =
                await respostaAnuncios.text();

            console.error(
                "Erro retornado pela API de anúncios:",
                erroAnuncios
            );

            throw new Error(
                "Não foi possível carregar os anúncios."
            );
        }


        const anuncios =
            await respostaAnuncios.json();

        console.log(
            "Anúncios recebidos:",
            anuncios
        );


        /* ==================== CÁLCULOS ==================== */

        const totalUsuarios =
            usuarios.length;


        const totalAnuncios =
            anuncios.length;


        const usuariosAtivos =
            usuarios.filter(
                usuario =>
                    usuario.st_usuario === "A"
            ).length;


        const anunciosDisponiveis =
            anuncios.filter(
                anuncio =>
                    anuncio.st_produto === "A"
            ).length;


        console.log("Total de usuários:", totalUsuarios);
        console.log("Total de anúncios:", totalAnuncios);
        console.log("Usuários ativos:", usuariosAtivos);
        console.log("Anúncios disponíveis:", anunciosDisponiveis);


        /* ==================== ATUALIZAR CARDS ==================== */

        const elementoUsuarios =
            document.getElementById("totalUsuarios");

        const elementoAnuncios =
            document.getElementById("totalAnuncios");

        const elementoUsuariosAtivos =
            document.getElementById("usuariosAtivos");

        const elementoAnunciosDisponiveis =
            document.getElementById("anunciosDisponiveis");


        if (elementoUsuarios) {
            elementoUsuarios.textContent =
                totalUsuarios;
        }


        if (elementoAnuncios) {
            elementoAnuncios.textContent =
                totalAnuncios;
        }


        if (elementoUsuariosAtivos) {
            elementoUsuariosAtivos.textContent =
                usuariosAtivos;
        }


        if (elementoAnunciosDisponiveis) {
            elementoAnunciosDisponiveis.textContent =
                anunciosDisponiveis;
        }

    } catch (error) {

        console.error(
            "ERRO COMPLETO DO DASHBOARD:",
            error
        );


        const ids = [
            "totalUsuarios",
            "totalAnuncios",
            "usuariosAtivos",
            "anunciosDisponiveis"
        ];


        ids.forEach(id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {
                elemento.textContent = "-";
            }

        });

    }

}
/* -------------------- SIDEBAR TOGGLE -------------------- */
let sidebar = document.querySelector(".sidebar");
let sidebarBtn = document.querySelector(".sidebarBtn");

if (sidebarBtn && sidebar) {
    sidebarBtn.onclick = function () {
        sidebar.classList.toggle("active");
    }
}

// Variáveis globais para controlar a exclusão via Modal
let idAnuncioParaExcluir = null;
let tokenAtualGlobal = null;

/* -------------------- AUTENTICAÇÃO E GERENCIAMENTO DE ANÚNCIOS (UC53) -------------------- */
document.addEventListener("DOMContentLoaded", async function() {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

    if (!token && window.location.pathname.includes('anuncios-publicados')) {
        mostrarToast('Acesso negado. Faça o login primeiro.', 'erro');
        setTimeout(() => {
            window.location.href = '../autenticação/index.html';
        }, 1500);
        return;
    }

    if (window.location.pathname.includes('anuncios-publicados')) {
        await carregarAnunciosAdmin(token);
    }

    const logoutBtn = document.querySelector('.logout a');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminToken');
            
            mostrarToast('Sessão encerrada com sucesso.', 'sucesso');
            setTimeout(() => {
                window.location.href = '../autenticação/index.html';
            }, 1000);
        });
    }

    // Configuração dos eventos do Modal de Exclusão
    setupModalExclusao();
});

// Função para buscar e renderizar os anúncios na tela (UC53)
async function carregarAnunciosAdmin(token) {
    const container = document.querySelector('.advertisements');
    if (!container) return;

    try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const anuncios = await response.json();
            container.innerHTML = ''; 

            if (!anuncios || anuncios.length === 0) {
                container.innerHTML = '<p style="padding: 20px; color: #666;">Nenhum anúncio publicado no momento.</p>';
                return;
            }

            anuncios.forEach(anuncio => {
                const card = document.createElement('div');
                card.className = 'advertisement-card';
                
                // Tratamento robusto da imagem vinda exatamente do Banco de Dados
                let imagemSrc = 'src/images/celular.png'; // Padrão se não houver imagem
                const imgCampo = anuncio.ds_imagem || anuncio.imagem || anuncio.ds_foto || anuncio.foto || anuncio.url_imagem || anuncio.caminho_imagem;
                
                if (imgCampo && typeof imgCampo === 'string' && imgCampo.trim() !== '') {
                    if (imgCampo.startsWith('http://') || imgCampo.startsWith('https://')) {
                        // URL externa completa
                        imagemSrc = imgCampo;
                    } else if (imgCampo.startsWith('/storage/') || imgCampo.startsWith('storage/')) {
                        // Caminho relativo contendo storage
                        const caminhoLimpo = imgCampo.startsWith('/') ? imgCampo.substring(1) : imgCampo;
                        imagemSrc = `http://127.0.0.1:8000/${caminhoLimpo}`;
                    } else {
                        // Apenas o nome do arquivo ou pasta interna salva no banco (ex: produtos/foto.jpg)
                        imagemSrc = `http://127.0.0.1:8000/storage/${imgCampo}`;
                    }
                }

                // Nome do Produto mapeado corretamente para 'nm_produto'
                const nomeProduto = anuncio.nm_produto || anuncio.nm_anuncio || anuncio.titulo || anuncio.name || 'Produto sem nome';

                // Nome do Usuário dono
                const nomeUsuario = anuncio.dono_anuncio || (anuncio.usuario ? anuncio.usuario.nm_usuario : null) || `Usuário ID: ${anuncio.id_usuario || 'Mobile'}`;

                // Categoria
                const categoriaInfo = `Categoria ID: ${anuncio.id_categoria || 'Geral'}`;

                // Identificador único do produto
                const idProduto = anuncio.id_produto || anuncio.id;

                card.innerHTML = `
                    <img src="${imagemSrc}" alt="${nomeProduto}" onerror="this.src='src/images/celular.png'">
                    <div class="advertisement-info">
                        <div class="advertisement-title">${nomeProduto}</div>
                        <div class="indicator">
                            <p class="advertisement-description">
                                <i class="fa-solid fa-user"></i> ${nomeUsuario}
                            </p>
                            <p class="advertisement-quantity">
                                <i class="fa-solid fa-tag"></i>
                                <span class="quantity">Info:</span> ${categoriaInfo}
                            </p>
                        </div>
                        <button type="button" class="btn-excluir-anuncio" onclick="abrirModalExclusao(${idProduto}, '${token}')" style="margin-top: 10px; width: 100%; background-color: #e74c3c; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            <i class="fa-solid fa-trash"></i> Excluir Anúncio
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });
        } else {
            console.error("Erro ao buscar anúncios da API Admin.");
        }
    } catch (error) {
        console.error("Erro de conexão com o servidor Laravel:", error);
    }
}

// Função para abrir o popup centralizado de confirmação
function abrirModalExclusao(idProduto, token) {
    idAnuncioParaExcluir = idProduto;
    tokenAtualGlobal = token;
    
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Configura os botões de cancelar, confirmar e fechar do modal
function setupModalExclusao() {
    const modal = document.getElementById('deleteModal');
    const cancelarBtn = document.getElementById('cancelDeleteBtn');
    const confirmarBtn = document.getElementById('confirmDeleteBtn');

    if (cancelarBtn && modal) {
        cancelarBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    if (confirmarBtn && modal) {
        confirmarBtn.addEventListener('click', async function() {
            if (!idAnuncioParaExcluir || !tokenAtualGlobal) return;

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/admin/products/${idAnuncioParaExcluir}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${tokenAtualGlobal}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    modal.style.display = 'none';
                    mostrarToast('Anúncio excluído com sucesso!', 'sucesso');
                    setTimeout(() => {
                        location.reload(); 
                    }, 1000);
                } else {
                    modal.style.display = 'none';
                    mostrarToast('Não foi possível localizar ou excluir o anúncio.', 'erro');
                }
            } catch (error) {
                console.error("Erro na requisição de exclusão:", error);
                modal.style.display = 'none';
                mostrarToast('Falha de comunicação com a API.', 'erro');
            }
        });
    }
}

// Função para exibir o popup flutuante de notificação (Toast)
function mostrarToast(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast) return;

    toastMessage.textContent = mensagem;
    toast.className = `toast-notification ${tipo}`;

    if (tipo === 'sucesso') {
        toastIcon.className = 'fa-solid fa-circle-check';
    } else {
        toastIcon.className = 'fa-solid fa-circle-exclamation';
    }

    toast.style.display = 'flex';
    toast.style.animation = 'none';
    toast.offsetHeight; // Força o reflow para reiniciar a animação
    toast.style.animation = '';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
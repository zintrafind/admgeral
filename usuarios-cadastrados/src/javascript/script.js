document.addEventListener("DOMContentLoaded", async () => {
    // -------------------- CONTROLE DA SIDEBAR --------------------
    let sidebar = document.querySelector(".sidebar");
    let sidebarBtn = document.querySelector(".sidebarBtn");

    if (sidebarBtn && sidebar) {
        sidebarBtn.onclick = function () {
            sidebar.classList.toggle("active");
        };
    }

    // -------------------- CONSUMO DA API DE USUÁRIOS --------------------
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    const containerUsers = document.querySelector('.users');

    // Proteção de rota: Se não houver token, redireciona para o login
    if (!token) {
        window.location.href = '../autenticação/index.html';
        return;
    }

    // Função para buscar os usuários cadastrados na API do Laravel
    async function carregarUsuariosDaApi() {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/admin/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar dados dos usuários.');
            }

            const usuarios = await response.json();
            console.log("DADOS RECEBIDOS DA API:", usuarios); 
            renderizarCards(usuarios);

        } catch (error) {
            console.error('Erro:', error);
            if (containerUsers) {
                containerUsers.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #e74c3c;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 30px; margin-bottom: 10px;"></i>
                        <p style="font-weight: 600;">Erro ao carregar a lista de usuários da API.</p>
                        <p style="font-size: 13px; color: #666; margin-top: 5px;">Verifique se o seu servidor backend está ligado.</p>
                    </div>
                `;
            }
        }
    }

    // Função para desenhar os cards dinamicamente na tela
    function renderizarCards(usuarios) {
        if (!containerUsers) return;
        containerUsers.innerHTML = ''; // Limpa os cards antigos

        if (usuarios.length === 0) {
            containerUsers.innerHTML = `<p style="padding: 20px;">Nenhum usuário cadastrado.</p>`;
            return;
        }

        usuarios.forEach((user, index) => {
            const userId = user.cd_usuario || user.id || user.id_usuario || user.codigo;
            const userName = user.nm_usuario || user.name || 'Usuário';
            const userEmail = user.email || '';
            const userType = user.tp_usuario === 'A' ? 'Administrador' : 'Cliente';
            
            const avatarImg = user.tp_usuario === 'A' ? 'src/images/avatar1.png' : 'src/images/avatar2.png';

            if (!userId) {
                console.warn(`Atenção: O usuário na posição ${index} está sem ID mapeado:`, user);
            }

            const cardHtml = `
                <div class="users-card" id="user-card-${userId}">
                    <img src="${avatarImg}" alt="Avatar">

                    <div class="user-info">
                        <div class="indicator">
                            <p class="user-description" style="font-weight: 600;">
                                <i class="fa-solid fa-user"></i> ${userName}
                            </p>
                            <p class="user-quantity" style="font-size: 13px; color: #666; margin: 4px 0;">
                                <i class="fa-solid fa-envelope"></i> ${userEmail}
                            </p>
                            <p class="user-quantity">
                                <i class="fa-solid fa-shield"></i> 
                                <span class="quantity">Tipo:</span> ${userType}
                            </p>
                        </div>
                        
                        <div style="margin-top: 10px;">
                            <button onclick="deletarUsuario('${userId}')" style="background: #e74c3c; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                <i class="fa-solid fa-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
            containerUsers.innerHTML += cardHtml;
        });
    }

    // -------------------- MODAL DE ALERTA / CONFIRMAÇÃO CUSTOMIZADO --------------------
    function mostrarModal(mensagem, tipo = 'confirmacao') {
        return new Promise((resolve) => {
            const modal = document.getElementById('custom-modal');
            const textoMsg = document.getElementById('modal-mensagem');
            const btnSim = document.getElementById('modal-btn-sim');
            const btnNao = document.getElementById('modal-btn-nao');

            if (!modal) {
                resolve(confirm(mensagem));
                return;
            }

            textoMsg.textContent = mensagem;
            modal.style.display = 'flex';

            if (tipo === 'alerta') {
                btnNao.style.display = 'none'; // Oculta o botão de cancelar se for apenas um aviso de erro/sucesso
                btnSim.textContent = 'OK';
            } else {
                btnNao.style.display = 'inline-block';
                btnSim.textContent = 'Excluir';
            }

            const fecharModal = (resultado) => {
                modal.style.display = 'none';
                btnSim.onclick = null;
                btnNao.onclick = null;
                resolve(resultado);
            };

            btnSim.onclick = () => fecharModal(true);
            btnNao.onclick = () => fecharModal(false);
        });
    }

    // Função global para excluir o usuário do banco de dados via API
    window.deletarUsuario = async function(id) {
        if (!id || id === 'undefined' || id === 'null') {
            await mostrarModal('Erro: ID do usuário inválido.', 'alerta');
            return;
        }

        // Exibe o modal bonito de confirmação
        const confirmado = await mostrarModal("Deseja realmente excluir este usuário do sistema?", 'confirmacao');
        if (!confirmado) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                await mostrarModal('Usuário excluído com sucesso!', 'alerta');
                carregarUsuariosDaApi(); // Atualiza a listagem na hora
            } else {
                const erroData = await response.json().catch(() => null);
                console.error('Erro retornado pela API:', erroData);
                await mostrarModal('Não foi possível excluir o usuário.', 'alerta');
            }
        } catch (error) {
            console.error('Erro na exclusão:', error);
            await mostrarModal('Falha de comunicação com a API. Verifique sua conexão.', 'alerta');
        }
    };

    // Inicializa a listagem assim que a página abre
    carregarUsuariosDaApi();
});
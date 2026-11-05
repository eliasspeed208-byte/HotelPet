/* =========================================================
   HOTELPET — JAVASCRIPT PRINCIPAL
   Painel | Pets | Usuários | Reservas | Configurações
   Dados preservados no localStorage.
   ========================================================= */


/* =========================================================
   1. CHAVES E FUNÇÕES GERAIS
   ========================================================= */

const CHAVES = {
    pets: "hotelpet_pets",
    reservas: "hotelpet_reservas",
    usuarios: "hotelpet_usuarios",
    configuracoes: "hotelpet_configuracoes"
};

function elemento(id) {
    return document.getElementById(id);
}

function valor(id) {
    return elemento(id)?.value?.trim() || "";
}

function definirValor(id, novoValor) {
    const campo = elemento(id);

    if (campo) {
        campo.value = novoValor ?? "";
    }
}

function definirTexto(id, texto) {
    const campo = elemento(id);

    if (campo) {
        campo.textContent = texto ?? "";
    }
}

function carregar(chave) {
    try {
        const dados = localStorage.getItem(chave);
        const resultado = dados ? JSON.parse(dados) : [];

        return Array.isArray(resultado) ? resultado : [];
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        return [];
    }
}

function salvar(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar dados:", erro);
        alert("Não foi possível salvar os dados neste navegador.");
        return false;
    }
}

function carregarConfiguracoes() {
    const padrao = {
        nome: "Hotel Pet",
        capacidade: 20,
        diaria: 80
    };

    try {
        const dados = localStorage.getItem(CHAVES.configuracoes);

        return dados
            ? { ...padrao, ...JSON.parse(dados) }
            : padrao;
    } catch (erro) {
        console.error("Erro ao carregar configurações:", erro);
        return padrao;
    }
}

function salvarConfiguracoes(dados) {
    try {
        localStorage.setItem(
            CHAVES.configuracoes,
            JSON.stringify(dados)
        );

        return true;
    } catch (erro) {
        console.error("Erro ao salvar configurações:", erro);
        alert("Não foi possível salvar as configurações.");
        return false;
    }
}

function criarId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2, 9);
}

function escapar(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caractere => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caractere];
    });
}

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function limparFormulario(formulario) {
    if (!formulario) return;

    formulario.reset();

    const campoId = formulario.querySelector(
        'input[type="hidden"][name="id"], input[type="hidden"]#id'
    );

    if (campoId) {
        campoId.value = "";
    }
}

function formatarMoeda(numero) {
    return Number(numero || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "-";

    const partes = String(data).split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterCorpoTabela(idTabela) {
    const tabela = elemento(idTabela);

    if (!tabela) return null;

    return tabela.tagName === "TBODY"
        ? tabela
        : tabela.querySelector("tbody");
}

function mostrarFormulario(formulario, visivel) {
    if (!formulario) return;

    formulario.classList.toggle("hidden", !visivel);
}

function pesquisarTexto(texto, termo) {
    return normalizar(texto).includes(normalizar(termo));
}


/* =========================================================
   2. PAINEL PRINCIPAL
   ========================================================= */

function listarReservasRecentes() {
    const tabela = elemento("tabela-reservas");

    if (!tabela) return;

    const reservas = carregar(CHAVES.reservas);

    const recentes = [...reservas]
        .sort((a, b) =>
            Number(b.criadoEm || 0) - Number(a.criadoEm || 0)
        )
        .slice(0, 5);

    if (recentes.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    Nenhuma reserva cadastrada.
                </td>
            </tr>
        `;

        return;
    }

    tabela.innerHTML = recentes.map(reserva => `
        <tr>
            <td>${escapar(reserva.pet)}</td>
            <td>${escapar(reserva.tutor)}</td>
            <td>${formatarData(reserva.entrada)}</td>
            <td>${formatarData(reserva.saida)}</td>
            <td>${escapar(reserva.status)}</td>
            <td>${formatarMoeda(reserva.valor)}</td>
        </tr>
    `).join("");
}

function atualizarPainel() {
    const reservas = carregar(CHAVES.reservas);
    const pets = carregar(CHAVES.pets);
    const usuarios = carregar(CHAVES.usuarios);
    const configuracoes = carregarConfiguracoes();

    const capacidade = Math.max(
        0,
        Number(configuracoes.capacidade) || 0
    );

    const ocupadas = reservas.filter(
        reserva => normalizar(reserva.status) === "em andamento"
    ).length;

    const vagas = Math.max(0, capacidade - ocupadas);

    definirTexto("total-reservas", reservas.length);
    definirTexto("total-pets", pets.length);
    definirTexto("total-usuarios", usuarios.length);
    definirTexto("total-vagas", vagas);

    definirTexto(
        "capacidade-hotel",
        `Capacidade total: ${capacidade}`
    );

    definirTexto(
        "nome-hotel-painel",
        configuracoes.nome || "Hotel Pet"
    );

    listarReservasRecentes();
}


/* =========================================================
   3. PETS
   ========================================================= */

function iniciarPets() {
    const form = elemento("form-pet");
    const tabela = obterCorpoTabela("tabela-pets");
    const container = elemento("container-form-pet") || form;
    const botaoNovo = elemento("btn-novo-pet");
    const botaoCancelar = elemento("btn-cancelar-pet");
    const campoBusca = elemento("busca-pets");
    const titulo = elemento("titulo-form-pet");

    if (!form || !tabela) return;

    function abrirFormulario(pet = null) {
        limparFormulario(form);

        if (pet) {
            Object.entries(pet).forEach(([chave, valorCampo]) => {
                definirValor(chave, valorCampo);
            });

            if (titulo) {
                titulo.textContent = "Editar Pet";
            }
        } else if (titulo) {
            titulo.textContent = "Cadastrar Novo Pet";
        }

        container.classList.remove("hidden");

        (container || form).scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function fecharFormulario() {
        limparFormulario(form);

        container.classList.add("hidden");

        if (titulo) {
            titulo.textContent = "Cadastrar Novo Pet";
        }
    }

    function listarPets(filtro = "") {
        const pets = carregar(CHAVES.pets);

        const filtrados = pets.filter(pet =>
            pesquisarTexto(pet.nome, filtro) ||
            pesquisarTexto(pet.tutor, filtro) ||
            pesquisarTexto(pet.especie, filtro) ||
            pesquisarTexto(pet.raca, filtro)
        );

        if (filtrados.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="9" class="empty">
                        ${filtro
                            ? "Nenhum pet encontrado."
                            : "Nenhum pet cadastrado."}
                    </td>
                </tr>
            `;
        } else {
            tabela.innerHTML = filtrados.map(pet => `
                <tr>
                    <td>${escapar(pet.nome)}</td>
                    <td>${escapar(pet.especie)}</td>
                    <td>${escapar(pet.raca || "-")}</td>
                    <td>${escapar(pet.idade || "-")}</td>
                    <td>${escapar(pet.porte || "-")}</td>
                    <td>${escapar(pet.peso || "-")}</td>
                    <td>${escapar(pet.tutor)}</td>
                    <td>${escapar(pet.telefone || "-")}</td>
                    <td>
                        <button type="button"
                            class="btn-secondary"
                            data-editar-pet="${escapar(pet.id)}">
                            Editar
                        </button>

                        <button type="button"
                            class="btn-danger"
                            data-excluir-pet="${escapar(pet.id)}">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join("");
        }

        definirTexto("total-pets", pets.length);

        definirTexto(
            "total-cachorros",
            pets.filter(pet =>
                normalizar(pet.especie) === "cachorro"
            ).length
        );

        definirTexto(
            "total-gatos",
            pets.filter(pet =>
                normalizar(pet.especie) === "gato"
            ).length
        );

        atualizarPainel();
    }

    botaoNovo?.addEventListener("click", () => {
        abrirFormulario();
    });

    botaoCancelar?.addEventListener("click", fecharFormulario);

    campoBusca?.addEventListener("input", () => {
        listarPets(campoBusca.value);
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const pets = carregar(CHAVES.pets);
        const id = valor("id");

        const pet = {
            id: id || criarId(),
            nome: valor("nome"),
            especie: valor("especie"),
            raca: valor("raca"),
            idade: valor("idade"),
            porte: valor("porte"),
            peso: valor("peso"),
            tutor: valor("tutor"),
            telefone: valor("telefone"),
            observacoes: valor("observacoes")
        };

        if (!pet.nome || !pet.tutor || !pet.especie) {
            alert("Preencha o nome, a espécie e o tutor.");
            return;
        }

        const indice = pets.findIndex(item => item.id === id);

        if (indice >= 0) {
            pets[indice] = pet;
        } else {
            pets.push(pet);
        }

        if (!salvar(CHAVES.pets, pets)) return;

        fecharFormulario();
        listarPets(campoBusca?.value || "");

        alert("Pet salvo com sucesso!");
    });

    tabela.addEventListener("click", function(event) {
        const editar = event.target.closest("[data-editar-pet]");
        const excluir = event.target.closest("[data-excluir-pet]");

        if (editar) {
            const pet = carregar(CHAVES.pets).find(
                item => item.id === editar.dataset.editarPet
            );

            if (pet) abrirFormulario(pet);
        }

        if (excluir) {
            if (!confirm("Deseja excluir este pet?")) return;

            const petsAtualizados = carregar(CHAVES.pets).filter(
                item => item.id !== excluir.dataset.excluirPet
            );

            if (!salvar(CHAVES.pets, petsAtualizados)) return;

            listarPets(campoBusca?.value || "");

            alert("Pet excluído com sucesso!");
        }
    });

    listarPets();
}


/* =========================================================
   4. USUÁRIOS
   ========================================================= */


function iniciarUsuarios() {
    const form = elemento("form-usuario");
    const botaoNovo = elemento("btn-novo-usuario");
    const botaoCancelar = elemento("btn-cancelar-usuario");
    const tabela = obterCorpoTabela("tabela-usuarios");
    const campoBusca = elemento("busca-usuarios");

    if (!form || !tabela) {
        console.error("Elementos do formulário de usuários não encontrados.");
        return;
    }

    function abrirFormulario(usuario = null) {
        limparFormulario(form);

        if (usuario) {
            Object.entries(usuario).forEach(([chave, valorCampo]) => {
                definirValor(chave, valorCampo);
            });
        }

        form.hidden = false;
        form.classList.remove("hidden");
        form.style.display = "grid";

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function fecharFormulario() {
        limparFormulario(form);
        form.classList.add("hidden");
        form.hidden = true;
        form.style.display = "none";
    }

    function listarUsuarios(filtro = "") {
        const usuarios = carregar(CHAVES.usuarios);

        const filtrados = usuarios.filter(usuario =>
            pesquisarTexto(usuario.nome, filtro) ||
            pesquisarTexto(usuario.email, filtro) ||
            pesquisarTexto(usuario.telefone, filtro) ||
            pesquisarTexto(usuario.tipo, filtro)
        );

        if (filtrados.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        ${filtro
                            ? "Nenhum usuário encontrado."
                            : "Nenhum usuário cadastrado."}
                    </td>
                </tr>
            `;
        } else {
            tabela.innerHTML = filtrados.map(usuario => `
                <tr>
                    <td>${escapar(usuario.nome)}</td>
                    <td>${escapar(usuario.email)}</td>
                    <td>${escapar(usuario.telefone || "-")}</td>
                    <td>${escapar(usuario.tipo)}</td>
                    <td>
                        <button type="button"
                            class="btn-secondary"
                            data-editar-usuario="${escapar(usuario.id)}">
                            Editar
                        </button>
                        <button type="button"
                            class="btn-danger"
                            data-excluir-usuario="${escapar(usuario.id)}">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join("");
        }

        definirTexto("total-usuarios", usuarios.length);
        definirTexto("total-gerentes", usuarios.filter(u =>
            normalizar(u.tipo) === "gerente"
        ).length);
        definirTexto("total-funcionarios", usuarios.filter(u =>
            normalizar(u.tipo).includes("funcionario")
        ).length);
        definirTexto("total-clientes", usuarios.filter(u =>
            normalizar(u.tipo) === "cliente"
        ).length);

        atualizarPainel();
    }

    botaoNovo?.addEventListener("click", function(event) {
        event.preventDefault();
        abrirFormulario();
    });

    botaoCancelar?.addEventListener("click", function(event) {
        event.preventDefault();
        fecharFormulario();
    });

    campoBusca?.addEventListener("input", function() {
        listarUsuarios(campoBusca.value);
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const usuarios = carregar(CHAVES.usuarios);
        const id = valor("id");

        const usuario = {
            id: id || criarId(),
            nome: valor("nome"),
            email: valor("email"),
            telefone: valor("telefone"),
            tipo: valor("tipo")
        };

        if (!usuario.nome || !usuario.email || !usuario.tipo) {
            alert("Preencha o nome, o e-mail e o tipo de usuário.");
            return;
        }

        const emailExiste = usuarios.some(item =>
            normalizar(item.email) === normalizar(usuario.email) &&
            item.id !== id
        );

        if (emailExiste) {
            alert("Já existe um usuário cadastrado com esse e-mail.");
            return;
        }

        const indice = usuarios.findIndex(item => item.id === id);

        if (indice >= 0) {
            usuarios[indice] = usuario;
        } else {
            usuarios.push(usuario);
        }

        if (!salvar(CHAVES.usuarios, usuarios)) return;

        fecharFormulario();
        listarUsuarios(campoBusca?.value || "");
        alert("Usuário salvo com sucesso!");
    });

    tabela.addEventListener("click", function(event) {
        const editar = event.target.closest("[data-editar-usuario]");
        const excluir = event.target.closest("[data-excluir-usuario]");

        if (editar) {
            const usuario = carregar(CHAVES.usuarios).find(
                item => item.id === editar.dataset.editarUsuario
            );

            if (usuario) abrirFormulario(usuario);
        }

        if (excluir) {
            if (!confirm("Deseja excluir este usuário?")) return;

            const atualizados = carregar(CHAVES.usuarios).filter(
                item => item.id !== excluir.dataset.excluirUsuario
            );

            if (!salvar(CHAVES.usuarios, atualizados)) return;

            listarUsuarios(campoBusca?.value || "");
            alert("Usuário excluído com sucesso!");
        }
    });

    listarUsuarios();
}


function iniciarReservas() {
    const form = elemento("cadastro-form");
    const tabela = elemento("registros-tbody");

    if (!form || !tabela) return;

    const botaoNovo = elemento("btn-novo");
    const botaoCancelar = elemento("btn-cancelar");
    const campoBusca = elemento("busca-reservas");
    const estadoVazio = document.querySelector(".empty-state");

    function abrirFormulario(reserva = null) {
        limparFormulario(form);

        if (reserva) {
            Object.entries(reserva).forEach(([chave, valorCampo]) => {
                definirValor(chave, valorCampo);
            });
        } else {
            definirValor("status", "Pendente");
        }

        mostrarFormulario(form, true);

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function fecharFormulario() {
        limparFormulario(form);
        mostrarFormulario(form, false);
    }

    function nomeGerente(reserva) {
        if (!reserva.gerenteId) return "-";

        const gerente = carregar(CHAVES.usuarios).find(usuario =>
            usuario.id === reserva.gerenteId
        );

        return gerente?.nome || reserva.gerenteId;
    }

    function listarReservas(filtro = "") {
        const reservas = carregar(CHAVES.reservas);
        const termo = normalizar(filtro);

        const filtradas = reservas.filter(reserva =>
            pesquisarTexto(reserva.pet, termo) ||
            pesquisarTexto(reserva.tutor, termo) ||
            pesquisarTexto(reserva.telefone, termo) ||
            pesquisarTexto(reserva.status, termo)
        );

        if (filtradas.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="9" class="empty">
                        ${termo
                            ? "Nenhuma reserva encontrada."
                            : "Nenhuma reserva cadastrada."}
                    </td>
                </tr>
            `;
        } else {
            tabela.innerHTML = filtradas.map(reserva => `
                <tr>
                    <td>${escapar(reserva.pet)}</td>
                    <td>${escapar(reserva.tutor)}</td>
                    <td>${escapar(reserva.telefone || "-")}</td>
                    <td>${formatarData(reserva.entrada)}</td>
                    <td>${formatarData(reserva.saida)}</td>
                    <td>${formatarMoeda(reserva.valor)}</td>
                    <td>${escapar(reserva.status)}</td>
                    <td>${escapar(nomeGerente(reserva))}</td>
                    <td>
                        <button type="button"
                            class="btn-secondary"
                            data-editar-reserva="${escapar(reserva.id)}">
                            Editar
                        </button>

                        <button type="button"
                            class="btn-danger"
                            data-excluir-reserva="${escapar(reserva.id)}">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join("");
        }

        if (estadoVazio) {
            estadoVazio.style.display =
                reservas.length === 0 && !termo ? "block" : "none";
        }

        definirTexto("total-reservas", reservas.length);

        definirTexto(
            "total-confirmadas",
            reservas.filter(item =>
                normalizar(item.status) === "confirmada"
            ).length
        );

        definirTexto(
            "total-andamento",
            reservas.filter(item =>
                normalizar(item.status) === "em andamento"
            ).length
        );

        definirTexto(
            "total-finalizadas",
            reservas.filter(item =>
                normalizar(item.status) === "finalizada"
            ).length
        );

        definirTexto(
            "total-canceladas",
            reservas.filter(item =>
                normalizar(item.status) === "cancelada"
            ).length
        );

        atualizarPainel();
    }

    botaoNovo?.addEventListener("click", () => {
        abrirFormulario();
    });

    botaoCancelar?.addEventListener("click", fecharFormulario);

    campoBusca?.addEventListener("input", () => {
        listarReservas(campoBusca.value);
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const reservas = carregar(CHAVES.reservas);
        const id = valor("id");

        const entrada = valor("entrada");
        const saida = valor("saida");

        if (entrada && saida && saida <= entrada) {
            alert("A data de saída deve ser posterior à data de entrada.");
            return;
        }

        const reservaExistente = reservas.find(item => item.id === id);

        const reserva = {
            id: id || criarId(),
            gerenteId: valor("gerenteId"),
            pet: valor("pet"),
            tutor: valor("tutor"),
            telefone: valor("telefone"),
            tipo: valor("tipo"),
            entrada: entrada,
            saida: saida,
            valor: Number(valor("valor")) || 0,
            status: valor("status") || "Pendente",
            observacoes: valor("observacoes"),
            criadoEm: reservaExistente?.criadoEm || Date.now()
        };

        if (
            !reserva.pet ||
            !reserva.tutor ||
            !reserva.telefone ||
            !reserva.tipo ||
            !reserva.entrada ||
            !reserva.saida
        ) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const indice = reservas.findIndex(item => item.id === id);

        if (indice >= 0) {
            reservas[indice] = reserva;
        } else {
            reservas.push(reserva);
        }

        if (!salvar(CHAVES.reservas, reservas)) return;

        fecharFormulario();
        listarReservas(campoBusca?.value || "");

        alert("Reserva salva com sucesso!");
    });

    tabela.addEventListener("click", function(event) {
        const editar = event.target.closest("[data-editar-reserva]");
        const excluir = event.target.closest("[data-excluir-reserva]");

        if (editar) {
            const reserva = carregar(CHAVES.reservas).find(
                item => item.id === editar.dataset.editarReserva
            );

            if (reserva) abrirFormulario(reserva);
        }

        if (excluir) {
            if (!confirm("Deseja excluir esta reserva?")) return;

            const reservasAtualizadas = carregar(CHAVES.reservas).filter(
                item => item.id !== excluir.dataset.excluirReserva
            );

            if (!salvar(CHAVES.reservas, reservasAtualizadas)) return;

            listarReservas(campoBusca?.value || "");

            alert("Reserva excluída com sucesso!");
        }
    });

    function calcularValorReserva() {
        const entrada = valor("entrada");
        const saida = valor("saida");

        if (!entrada || !saida || saida <= entrada) return;

        const dataEntrada = new Date(`${entrada}T12:00:00`);
        const dataSaida = new Date(`${saida}T12:00:00`);

        const dias = Math.round(
            (dataSaida - dataEntrada) / (1000 * 60 * 60 * 24)
        );

        const diaria = Number(
            carregarConfiguracoes().diaria
        ) || 0;

        if (dias > 0 && diaria > 0) {
            definirValor("valor", (dias * diaria).toFixed(2));
        }
    }

    elemento("entrada")?.addEventListener(
        "change",
        calcularValorReserva
    );

    elemento("saida")?.addEventListener(
        "change",
        calcularValorReserva
    );

    listarReservas();
}


/* =========================================================
   6. CONFIGURAÇÕES
   ========================================================= */

function iniciarConfiguracoes() {
    const form = elemento("form-configuracoes");

    if (!form) return;

    const configuracoes = carregarConfiguracoes();

    definirValor("nome", configuracoes.nome);
    definirValor("capacidade", configuracoes.capacidade);
    definirValor("valor-diaria", configuracoes.diaria);

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const nome = valor("nome");
        const capacidade = Number(valor("capacidade"));
        const diaria = Number(valor("valor-diaria"));

        if (
            !nome ||
            !Number.isInteger(capacidade) ||
            capacidade < 1
        ) {
            alert("Informe o nome do hotel e uma capacidade válida.");
            return;
        }

        if (!Number.isFinite(diaria) || diaria < 0) {
            alert("Informe um valor de diária válido.");
            return;
        }

        const salvo = salvarConfiguracoes({
            nome,
            capacidade,
            diaria
        });

        if (!salvo) return;

        atualizarPainel();

        alert("Configurações salvas com sucesso!");
    });
}


/* =========================================================
   7. INICIALIZAÇÃO DO SISTEMA
   ========================================================= */

document.addEventListener("DOMContentLoaded", function() {
    iniciarPets();
    iniciarUsuarios();
    iniciarReservas();
    iniciarConfiguracoes();

    atualizarPainel();

    console.log("HotelPet iniciado com sucesso.");
});

/* =====================================================
   HOTELPET - JAVASCRIPT PRINCIPAL
   Sistema feito com HTML, CSS e JavaScript puro.
   Os dados ficam salvos no localStorage do navegador.
   ===================================================== */


/* =====================================================
   1. CHAVES E FUNÇÕES GERAIS
   ===================================================== */

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
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        return [];
    }
}

function salvar(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
    } catch (erro) {
        console.error("Erro ao salvar dados:", erro);
        alert("Não foi possível salvar os dados neste navegador.");
    }
}

function carregarConfiguracoes() {
    try {
        const dados = localStorage.getItem(CHAVES.configuracoes);

        return dados
            ? JSON.parse(dados)
            : {
                nome: "Hotel Pet",
                capacidade: 20,
                diaria: 80
            };
    } catch (erro) {
        return {
            nome: "Hotel Pet",
            capacidade: 20,
            diaria: 80
        };
    }
}

function salvarConfiguracoes(dados) {
    try {
        localStorage.setItem(
            CHAVES.configuracoes,
            JSON.stringify(dados)
        );
    } catch (erro) {
        console.error("Erro ao salvar configurações:", erro);
        alert("Não foi possível salvar as configurações.");
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

function limparFormulario(formulario) {
    if (!formulario) return;

    formulario.reset();

    const campoId = formulario.querySelector('input[type="hidden"]');

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

    const partes = data.split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function atualizarPainel() {
    const reservas = carregar(CHAVES.reservas);
    const pets = carregar(CHAVES.pets);
    const usuarios = carregar(CHAVES.usuarios);
    const configuracoes = carregarConfiguracoes();

    const capacidade = Number(configuracoes.capacidade) || 0;

    // Considera ocupadas as vagas das reservas em andamento.
    const ocupadas = reservas.filter(
        reserva => reserva.status === "Em andamento"
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


/* =====================================================
   2. PAINEL PRINCIPAL
   ===================================================== */

function listarReservasRecentes() {
    const tabela = elemento("tabela-reservas");

    if (!tabela) return;

    const reservas = carregar(CHAVES.reservas);

    const recentes = [...reservas]
        .sort((a, b) => Number(b.criadoEm || 0) - Number(a.criadoEm || 0))
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


/* =====================================================
   3. PETS
   ===================================================== */

function iniciarPets() {
    const form = elemento("form-pet");
    const tabela = elemento("tabela-pets");

    if (!form || !tabela) return;

    function listarPets() {
        const pets = carregar(CHAVES.pets);

        if (pets.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="9" class="empty">
                        Nenhum pet cadastrado.
                    </td>
                </tr>
            `;
        } else {
            tabela.innerHTML = pets.map(pet => `
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
                            data-editar-pet="${escapar(pet.id)}">
                            Editar
                        </button>

                        <button type="button"
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
            pets.filter(pet => pet.especie === "Cachorro").length
        );

        definirTexto(
            "total-gatos",
            pets.filter(pet => pet.especie === "Gato").length
        );

        atualizarPainel();
    }

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

        salvar(CHAVES.pets, pets);

        limparFormulario(form);
        form.classList.add("hidden");

        listarPets();

        alert("Pet salvo com sucesso!");
    });

    tabela.addEventListener("click", function(event) {
        const editar = event.target.closest("[data-editar-pet]");
        const excluir = event.target.closest("[data-excluir-pet]");

        if (editar) {
            const pet = carregar(CHAVES.pets).find(
                item => item.id === editar.dataset.editarPet
            );

            if (!pet) return;

            Object.keys(pet).forEach(chave => {
                definirValor(chave, pet[chave]);
            });

            form.classList.remove("hidden");
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (excluir) {
            if (!confirm("Deseja excluir este pet?")) return;

            const petsAtualizados = carregar(CHAVES.pets).filter(
                item => item.id !== excluir.dataset.excluirPet
            );

            salvar(CHAVES.pets, petsAtualizados);
            listarPets();

            alert("Pet excluído com sucesso!");
        }
    });

    // Os botões de abrir e cancelar já são controlados
    // pelo pequeno script que está no pets.html.

    listarPets();
}


/* =====================================================
   4. USUÁRIOS
   ===================================================== */

function iniciarUsuarios() {
    const form = elemento("form-usuario");
    const tabela = elemento("tabela-usuarios");

    if (!form || !tabela) return;

    function listarUsuarios() {
        const usuarios = carregar(CHAVES.usuarios);

        if (usuarios.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="empty">
                        Nenhum usuário cadastrado.
                    </td>
                </tr>
            `;
        } else {
            tabela.innerHTML = usuarios.map(usuario => `
                <tr>
                    <td>${escapar(usuario.nome)}</td>
                    <td>${escapar(usuario.email)}</td>
                    <td>${escapar(usuario.telefone || "-")}</td>
                    <td>${escapar(usuario.tipo)}</td>
                    <td>
                        <button type="button"
                            data-editar-usuario="${escapar(usuario.id)}">
                            Editar
                        </button>

                        <button type="button"
                            data-excluir-usuario="${escapar(usuario.id)}">
                            Excluir
                        </button>
                    </td>
                </tr>
            `).join("");
        }

        atualizarPainel();
    }

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
            item.email.toLowerCase() === usuario.email.toLowerCase() &&
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

        salvar(CHAVES.usuarios, usuarios);

        limparFormulario(form);
        form.classList.add("hidden");

        listarUsuarios();

        alert("Usuário salvo com sucesso!");
    });

    tabela.addEventListener("click", function(event) {
        const editar = event.target.closest("[data-editar-usuario]");
        const excluir = event.target.closest("[data-excluir-usuario]");

        if (editar) {
            const usuario = carregar(CHAVES.usuarios).find(
                item => item.id === editar.dataset.editarUsuario
            );

            if (!usuario) return;

            Object.keys(usuario).forEach(chave => {
                definirValor(chave, usuario[chave]);
            });

            form.classList.remove("hidden");
            form.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (excluir) {
            if (!confirm("Deseja excluir este usuário?")) return;

            const usuariosAtualizados = carregar(CHAVES.usuarios).filter(
                item => item.id !== excluir.dataset.excluirUsuario
            );

            salvar(CHAVES.usuarios, usuariosAtualizados);
            listarUsuarios();

            alert("Usuário excluído com sucesso!");
        }
    });

    // Os botões de abrir e cancelar já são controlados
    // pelo pequeno script que está no usuarios.html.

    listarUsuarios();
}


/* =====================================================
   5. RESERVAS
   ===================================================== */

function iniciarReservas() {
    const form = elemento("cadastro-form");
    const tabela = elemento("registros-tbody");

    if (!form || !tabela) return;

    const botaoNovo = elemento("btn-novo");
    const botaoCancelar = elemento("btn-cancelar");
    const campoBusca = elemento("busca-reservas");
    const estadoVazio = document.querySelector(".empty-state");

    function listarReservas(filtro = "") {
        const reservas = carregar(CHAVES.reservas);

        const termo = filtro.toLowerCase();

        const filtradas = reservas.filter(reserva =>
            String(reserva.pet || "").toLowerCase().includes(termo) ||
            String(reserva.tutor || "").toLowerCase().includes(termo)
        );

        if (filtradas.length === 0) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="7" class="empty">
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
                    <td>${formatarData(reserva.entrada)}</td>
                    <td>${formatarData(reserva.saida)}</td>
                    <td>${formatarMoeda(reserva.valor)}</td>
                    <td>${escapar(reserva.status)}</td>
                    <td>
                        <button type="button"
                            data-editar-reserva="${escapar(reserva.id)}">
                            Editar
                        </button>

                        <button type="button"
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
            reservas.filter(item => item.status === "Confirmada").length
        );

        definirTexto(
            "total-andamento",
            reservas.filter(item => item.status === "Em andamento").length
        );

        definirTexto(
            "total-canceladas",
            reservas.filter(item => item.status === "Cancelada").length
        );

        atualizarPainel();
    }

    function abrirFormulario() {
        limparFormulario(form);

        definirValor("status", "Pendente");

        form.classList.remove("hidden");

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function fecharFormulario() {
        limparFormulario(form);
        form.classList.add("hidden");
    }

    if (botaoNovo) {
        botaoNovo.addEventListener("click", abrirFormulario);
    }

    if (botaoCancelar) {
        botaoCancelar.addEventListener("click", fecharFormulario);
    }

    if (campoBusca) {
        campoBusca.addEventListener("input", function() {
            listarReservas(campoBusca.value);
        });
    }

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

        const reserva = {
            id: id || criarId(),
            pet: valor("pet"),
            tutor: valor("tutor"),
            telefone: valor("telefone"),
            tipo: valor("tipo"),
            entrada: entrada,
            saida: saida,
            valor: Number(valor("valor")) || 0,
            status: valor("status"),
            observacoes: valor("observacoes"),
            criadoEm: id
                ? (reservas.find(item => item.id === id)?.criadoEm || Date.now())
                : Date.now()
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

        salvar(CHAVES.reservas, reservas);

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

            if (!reserva) return;

            Object.keys(reserva).forEach(chave => {
                definirValor(chave, reserva[chave]);
            });

            form.classList.remove("hidden");

            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        if (excluir) {
            if (!confirm("Deseja excluir esta reserva?")) return;

            const reservasAtualizadas = carregar(CHAVES.reservas).filter(
                item => item.id !== excluir.dataset.excluirReserva
            );

            salvar(CHAVES.reservas, reservasAtualizadas);

            listarReservas(campoBusca?.value || "");

            alert("Reserva excluída com sucesso!");
        }
    });

    // Atualiza o valor automaticamente quando as datas mudam,
    // usando o valor da diária salvo nas configurações.
    function calcularValorReserva() {
        const entrada = valor("entrada");
        const saida = valor("saida");

        if (!entrada || !saida || saida <= entrada) return;

        const dataEntrada = new Date(`${entrada}T12:00:00`);
        const dataSaida = new Date(`${saida}T12:00:00`);

        const dias = Math.round(
            (dataSaida - dataEntrada) / (1000 * 60 * 60 * 24)
        );

        const configuracoes = carregarConfiguracoes();
        const diaria = Number(configuracoes.diaria) || 0;

        if (dias > 0 && diaria > 0) {
            definirValor("valor", (dias * diaria).toFixed(2));
        }
    }

    elemento("entrada")?.addEventListener("change", calcularValorReserva);
    elemento("saida")?.addEventListener("change", calcularValorReserva);

    listarReservas();
}


/* =====================================================
   6. CONFIGURAÇÕES
   ===================================================== */

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

        if (!nome || !Number.isInteger(capacidade) || capacidade < 1) {
            alert("Informe o nome do hotel e uma capacidade válida.");
            return;
        }

        if (!Number.isFinite(diaria) || diaria < 0) {
            alert("Informe um valor de diária válido.");
            return;
        }

        salvarConfiguracoes({
            nome: nome,
            capacidade: capacidade,
            diaria: diaria
        });

        atualizarPainel();

        alert("Configurações salvas com sucesso!");
    });
}


/* =====================================================
   7. INICIALIZAÇÃO DO SISTEMA
   ===================================================== */

document.addEventListener("DOMContentLoaded", function() {
    iniciarPets();
    iniciarUsuarios();
    iniciarReservas();
    iniciarConfiguracoes();

    atualizarPainel();
});

/* ==================================================
   HOTELPET - AUTH.JS
   VERSÃO COMPLETA SEM LOGIN
   ================================================== */

(function () {
    "use strict";

    // Verifica se o sistema está aberto
    function verificarAcesso() {
        return true;
    }

    // Não exige autenticação para acessar as páginas
    function protegerPagina() {
        return true;
    }

    // Não adiciona botão de sair
    function adicionarBotaoSair() {
        return;
    }

    // Inicialização do sistema
    function iniciarAuth() {
        verificarAcesso();
        protegerPagina();
        adicionarBotaoSair();

        console.log("HotelPet: sistema iniciado sem login.");
    }

    // Executa quando a página carregar
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciarAuth);
    } else {
        iniciarAuth();
    }

    // Disponibiliza as funções
    window.HotelPetAuth = {
        verificarAcesso: verificarAcesso,
        protegerPagina: protegerPagina,
        adicionarBotaoSair: adicionarBotaoSair
    };

})();
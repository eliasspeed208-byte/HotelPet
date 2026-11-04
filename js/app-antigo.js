
(function () {

    const estaNaPastaPages = window.location.pathname.includes("/pages/");

    const caminhoLogin = estaNaPastaPages
        ? "../login.html"
        : "login.html";

    // Verifica se o usuário está conectado
    if (sessionStorage.getItem("hotelpet_logado") !== "sim") {
        window.location.href = caminhoLogin;
        return;
    }

    // Adiciona o botão Sair na barra lateral
    document.addEventListener("DOMContentLoaded", function () {

        const sidebar = document.querySelector(".sidebar");

        if (sidebar && !document.getElementById("btn-sair")) {

            const botao = document.createElement("button");

            botao.id = "btn-sair";
            botao.textContent = "Sair do sistema";

            botao.style.cssText = `
                display: block;
                width: calc(100% - 30px);
                margin: 20px 15px;
                padding: 12px;
                background: #a94442;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            `;

            botao.addEventListener("click", function () {

                sessionStorage.removeItem("hotelpet_logado");

                window.location.href = caminhoLogin;

            });

            sidebar.appendChild(botao);
        }

    });

})();

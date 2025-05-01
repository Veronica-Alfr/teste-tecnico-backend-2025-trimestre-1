<main>
  <h1 align="center">Upload/Get Video</h1>

  <p>
    O projeto realiza upload de vídeos de vários formatos, e os salva no cache por 60s. Assim, ele é trazido do cache ou da pasta criada no backend do docker. 
  </p>

  <h3>Status do Projeto</h3>
  
    Requisitos obrigatórios finalizados ✅

  <h3>+ Tarefas 👩🏽‍💻</h3>

    - Adicionar testes integrados

  <h3>Observações</h3>
  
    Esse é um projeto com instruções e licença 📜 registrados aqui -> env-dev/README.md

<summary><h3>🐋 Rodando no Docker vs Localmente</h3></summary>

  <details>
  
## 👉 Com Docker

    ⚠ Antes de começar, seu docker-compose precisa estar na versão 2.29 e o docker na versão 27.2 de preferência.

    ⚠ Suba o projeto completo usando o comando `docker-compose up --build` na raiz do projeto.
    ⚠ Para teste de desenvolvimento suba o docker com o comando `docker-compose -f env-dev/docker-compose.dev.yml up --build`.

    - Esses serviços inicializarão o contêiner chamado app_backend_prod ou app_backend (teste).

    - A partir daqui, você pode executar o contêiner via CLI ou abri-los no VS Code.

    ℹ️ As dependências são instaladas por meio do Dockerfile que é lido pelo Docker.

    ✨ Dica: A extensão Remote - Containers é recomendada para que você possa desenvolver sua aplicação no container Docker diretamente no VS Code, assim como você faz com seus arquivos locais.

<br />

## 👉 Sem Docker

    > :information_source: Instale as dependências com `npm install` no diretório raiz.

    ⚠ Não execute o comando npm audit fix! Ele atualiza várias dependências do projeto que podem causar conflitos.

    - ✨ Dica: Para executar o projeto dessa forma, você deve ter o node instalado no seu computador.

    ⚠ Espera-se que a versão do node usada esteja entre as mais recentes (v20+).

    - Para executar a aplicação use o comando `npm start` em seu diretório.

  <br/>

  </details>

  <h3>🛠 Tecnologias</h3>

    As tecnologias usadas foram: NestJS, TS, Nest Cache, Docker, Eslint, Prettier.

  <h3>Author</h3>

  <a href='https://github.com/Veronica-Alfr'>Verônica Alves</a>

</main>

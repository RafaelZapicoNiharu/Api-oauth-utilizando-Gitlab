[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/KM_djCwY)

# Se ainda não tiver o proxy instalado localmente rode o seguinte comando: npm install -g local-cors-proxy
# Para iniciar o processo, é necessário entrar na pasta oauth2-node-app e também na pasta oauth2-node-server, e instalar os módulos do Node executando o seguinte comando: npm i
# Para rodar o back-end, abra um terminal na pasta oauth2-node-server e execute o seguinte comando: node index.js
# Além de executar o back-end, conforme mencionado acima, é necessário também executar o proxy. Para isso, abra um novo terminal na pasta oauth2-node-server e execute o seguinte comando: lcp --proxyUrl https://gitlab.com/
# Para rodar o front-end, abra um terminal na pasta oauth2-node-app e execute o seguinte comando: npm run start
# No total, deverá ter três terminais abertos para poder realizar o teste do projeto, cada um com com os comando relatados acima.
# Quando executar o front-end, automaticamente abrirá uma aba no navegador para acessar o GitLab. Ao clicar em "Login", preencha seus dados para fazer o acesso à sua conta. Em seguida, será redirecionado para uma tela que apresenta uma mensagem com o título "Autorizar o TrabalhoWS a usar sua conta?". Neste ponto, clique na opção "Autorizar". Após clicar neste botão, será redirecionado para outra tela que exibirá a mensagem "Bem-vindo! Seu token é:", informando o código do token.
# Com o seu token, acesse a pasta oauth2-node-server onde há um arquivo chamado "servidor.rest". A partir deste arquivo, poderá executar os endpoints. Para isso, atualize a autorização com o token gerado pelo GitLab. Assim que atualizar a autorização, salve o arquivo e poderá realizar os testes dos endpoints, bastando clicar em "Send Request".

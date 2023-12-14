const express = require("express");
const axios = require("axios");
const fs = require("fs"); //Biblioteca node para armazenar nos arquivos
var cors = require("cors");

const caminhoBanco = "db.json";  //Caminho do banco

let Produtos = loadProdutos();

//Carregando os produtos do banco
function loadProdutos() {
    try {
        const data = fs.readFileSync(caminhoBanco); //Lendo o conteúdo do arquivo especificado pelo caminho caminhoBanco, e retorna os dados brutos
        return JSON.parse(data); //Os dados brutos lidos do arquivo são convertidos de uma string JSON
    }
    //Caso contrário executa o trecho do catch
    catch (error) {
        console.error("Erro ao carregar dados do arquivo:", error); //Ocorrendo um erro é exibido no console a mensagem de erro.
        return []; //Retorna um array vazio
    }
}

//Salvando os dados da variável Produtos
function saveProdutos() {
    try {
        const data = JSON.stringify(Produtos, null, 2); //Converte o objeto Produtos para uma string JSON formatada com uma indentação de 2 espaços (null, 2). NULL chamado de replacer - Ele permite que você especifique quais propriedades do objeto serão incluídas na string JSON. O valor null indica que todas as propriedades devem ser incluídas. 2 chamado de space - É um argumento opcional. Controla a formatação da string JSON. Nesse caso como é número, ele adiciona espaços de recuo à string para torná-la mais legível
        fs.writeFileSync(caminhoBanco, data); //Escrevendo a string JSON no arquivo especificado pelo caminho caminhoBanco
    }
    //Caso contrário executa o trecho do catch
    catch (error) {
        console.error("Erro ao salvar dados no arquivo:", error); //Ocorrendo um erro é exibido no console a mensagem de erro.
    }
}

const CLIENT_ID = "becff21beca2ab7163d82e6fba31c1b5763c01bf429ba3c6e9fbf5184f0a9829";
const CLIENT_SECRET = "gloas-5386b17b522703c7e75f60572b507393ba7d6aa1db6700a9a93e218f492d1147";
const GITLAB_URL = "https://gitlab.com/oauth/token";

//Iniciando o express
const app = express();
//Configuração do middleware no aplicativo Express para interpretar automaticamente o corpo das requisições como objetos JSON
app.use(express.json())
//Usando o cors passando as credenciais e verificando a origem. Uma aplicação B tenta acessar uma aplicação A, o cors vai ser a parte para que a aplicação A de acesso para a aplicação B, dessa forma está expondo a aplicação de forma externa.
app.use(cors({ credentials: true, origin: true }));

//Autenticação com o GitLab usando OAuth 2.0
app.get("/users/auth/gitlab/callback", (req, res) => {
    //Realizando uma requisição POST para obter o token
    //client_id, client_secret: São credenciais do cliente que identificam o aplicativo no GitLab.
    //code: É o código de autorização recebido do GitLab após a autenticação bem-sucedida do usuário.
    //grant_type: Indica o tipo de concessão, neste caso, "authorization_code".
    //redirect_uri: A URI para a qual o GitLab redirecionará após a autenticação.
    axios({
        method: "POST",
        url: `${GITLAB_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}&grant_type=authorization_code&redirect_uri=http://localhost:8080/users/auth/gitlab/callback`,
        headers: {
            'Content-Type': 'application/json' //Indicando que o corpo da requisição está em formato JSON.
        },
    })
        //Se a requisição for bem-sucedida o token de acesso é extraído da resposta e enviado de volta como parte da resposta para o cliente
        .then((response) => {
            const access_token = response.data.access_token  //Recebendo de volta o meu token
            res.send(`Bem-vindo! Seu token é: ${access_token}`) //Mensagem na tela para o usuário trazendo o token de acesso
        })
        //Se a solicitação acima for mal-sucedida executa o trecho do catch, exibido no console a mensagem de erro.
        .catch(err => console.log(err));
});

const PORT = 8080; //porta 

app.listen(PORT, () => {
    console.log(`Ligado na porta ${PORT}`);
});


/////////////////////////////////////////////////////////////////////////////// ROTAS PUBLICAS ///////////////////////////////////////////////////////////////////////////////

//Rota pública para ler os produtos
app.get("/produtos", (req, res) => {
    res.statusCode = 200; //200 é ok deu certo 
    res.json(Produtos) //Os dados são convertidos para o formato JSON antes de serem enviados como resposta
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Função para a validação do token
//req - objeto de solicitação
//res - objeto de resposta
//next - função que chama o próximo middleware na fila
const validacaoToken = (req, res, next) => {
    const token = req.headers['authorization']; //Obtém o token de autorização do cabeçalho da solicitação

    //Realiza a solicitação GET para um endpoint do proxy, com o token de autorização no cabeçalho.
    axios.get("http://localhost:8010/proxy/user", {
        headers: {
            Authorization: "Bearer " + token,
        },
    })
        //Se a solicitação acima for bem-sucedida executa o trecho do then
        .then((res) => { //Recebe por paramento a resposta, que no caso é o res
            req.headers['user'] = res.data; //Adicionando informações do usuário no cabeçalho da requisição
            return next(); //Após inserir os dados do usuário aos cabeçalhos da solicitação e dado um next para chamar o próximo middleware da fila
        })
        //Se a solicitação acima for mal-sucedida executa o trecho do catch
        .catch((error) => {
            console.log("Ocorreu um erro: " + error); //Ocorrendo um erro na requisição é exibido no console a mensagem de erro.
        });
}

/////////////////////////////////////////////////////////////////////////////// ROTAS PRIVADAS ///////////////////////////////////////////////////////////////////////////////

//Todos os endpoints a partir daqui utilizarao a autenticação
app.use("*", validacaoToken);


//CRUD GET PELO ID
//Realiza a busca do produto com base no id que é passado na URL
app.get("/produto/:id", (req, res) => {
    //Verifica se o parâmetro id na URL é um número válido
    if (isNaN(req.params.id)) {
        res.sendStatus(400); //Se não for válido a resposta é apresentada com o código de status 400 (Bad Request) 
    } else {
        let id = parseInt(req.params.id); //Caso o id for válido ocorre a converão do id para um valor numérico usando parseInt()
        let produto = Produtos.find(elem => elem.id == id); //Utiliza o find() para percorrer a lista de produtos (Produtos) buscando o pelo id que vou passado na URL, tal resultado é armazenado na variável produto.
        //Se o produto é diferente de undefined executa o if
        if (produto != undefined) {
            res.statusCode = 200; //200 é ok deu certo 
            res.json(produto); //Envia uma resposta JSON contendo as informações do produto encontrado.
        } else {
            res.sendStatus(404); //Se não encontrar nenhum produto envia uma resposta status 404 (Not Found).
        }
    }
});

//CRUD POST
//Realiza a inclusão do produto
app.post("/produto", (req, res) => {
    let { id, nome, preco, quantidade, categoria, fabricante } = req.body; //Realiazando o destructuring dos dados do corpo da requisição
    //Antes de realizar a inclusão de um novo produto verifica primeiro se há algum produto cadastrado com o mesmo Id, caso tenha é exibido uma mensagem, caso não tenha prossegue com a inserção das informações dando um push na lista de Produtos
    Produtos.find(elem => elem.id == id) ? res.status(400).json({ error: "Já existe um produto com este ID." }) :
        Produtos.push({
            id: id,
            nome: nome,
            preco: preco,
            quantidade: quantidade,
            categoria: categoria,
            fabricante: fabricante
        });
    saveProdutos(); //Salva o produtos que tá no arquivo com base no produtos que tem aqui 
    res.statusCode = 200; //200 é ok deu certo
    res.json({ Erro: "Salvo com sucesso!" });
});

//CRUD PUT
//Realiza a alteração do produto
app.put('/produto/:id', (req, res) => { //atualizando um produto 
    //Verifica se o parâmetro id na URL é um número válido
    if (isNaN(req.params.id)) {
        res.statusCode = 400; //Se não for válido a resposta é apresentada com o código de status 400 (Bad Request) 
        res.json({ Erro: "Informe um id válido!" });
    } else {
        let id = parseInt(req.params.id); //Caso o id for válido ocorre a converão do id para um valor numérico usando parseInt()
        let produto = Produtos.find(elem => elem.id == id); //Utiliza o find() para percorrer a lista de produtos (Produtos) buscando o pelo id que vou passado na URL, tal resultado é armazenado na variável produto.
        //Se o produto é diferente de undefined executa o if
        if (produto != undefined) {
            //Atualizando os dados com base nos dados fornecidos no corpo da requisição (req.body).
            let { nome, preco, quantidade, categoria, fabricante } = req.body;

            if (nome != undefined) {
                produto.nome = nome;
            }
            if (preco != undefined) {
                produto.preco = preco;
            }
            if (quantidade != undefined) {
                produto.quantidade = quantidade;
            }
            if (categoria != undefined) {
                produto.categoria = categoria;
            }
            if (fabricante != undefined) {
                produto.fabricante = fabricante;
            }
            saveProdutos(); //Atualiza os meus produtos
            res.statusCode = 200; //200 é ok deu certo
            res.json({ Erro: "Atualizado com sucesso!" });
        } else {
            res.statusCode = 404; //Se não encontrar nenhum produto envia uma resposta status 404 (Not Found).
            res.json({ Erro: "Não é possível atualizar pois o produto não está cadastrado" });
        }
    }
});

//CRUD DELETE 
//Realiza a exclusão do produto com base no id que é passado na URL
app.delete("/produto/:id", (req, res) => {
    //Verifica se o parâmetro id na URL é um número válido
    if (isNaN(req.params.id)) {
        res.statusCode = 400; //Se não for válido a resposta é apresentada com o código de status 400 (Bad Request)
        res.json({ Erro: "Informe um id válido!" });
    } else {
        let id = parseInt(req.params.id); //Caso o id for válido ocorre a converão do id para um valor numérico usando parseInt()
        let index = Produtos.findIndex(elem => elem.id === id); //Utiliza o find() para percorrer a lista de produtos (Produtos) buscando o pelo id que vou passado na URL, tal resultado é armazenado na variável produto.
        //Verifica se o index está na lista
        if (index !== -1) {
            Produtos.splice(index, 1); //Remove o produto da lista com base no id que foi passado
            saveProdutos(); //Salva depois de excluir
            res.statusCode = 200; //200 é ok deu certo
            res.json({ Erro: "Produto excluído com sucesso!" });
        } else {
            res.statusCode = 404; //Se não encontrar nenhum produto envia uma resposta status 404 (Not Found).
            res.json({ Erro: "Não é possível deletar pois o produto não está cadastrado" });
        }
    }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
# Atividade 4 - API REST no Render

API em Node.js com Express fazendo um CRUD de personagens de Harry Potter. Roda em um container Docker e está publicada no Render (plano free).

Link: [atividade4-i406.onrender.com](https://atividade4-i406.onrender.com)

## Rotas

| Método | Rota              | Descrição                                                   |
|--------|-------------------|-------------------------------------------------------------|
| GET    | `/`               | Mostra se a API está ok, o ambiente e o IP                  |
| GET    | `/personagem`     | Lista os personagens (dá pra filtrar com `?casa=Sonserina`) |
| GET    | `/personagem/:id` | Busca um personagem pelo id                                 |
| POST   | `/personagem`     | Cria um personagem                                          |
| PUT    | `/personagem/:id` | Atualiza todos os campos                                    |
| PATCH  | `/personagem/:id` | Atualiza só os campos enviados                              |
| DELETE | `/personagem/:id` | Remove um personagem                                        |

Exemplo de body:

```json
{ "nome": "Luna", "sobrenome": "Lovegood", "casa": "Corvinal" }
```

O `nome` é obrigatório no POST e no PUT, e a `casa` tem que ser Grifinória, Sonserina, Corvinal ou Lufa-Lufa.

Os dados ficam em memória, então quando o servidor reinicia volta tudo pros 3 personagens iniciais. No plano free o Render desliga o serviço depois de 15 min sem acesso, aí o primeiro acesso demora uns segundos e os dados resetam.

## Rodar localmente

```bash
npm install
npm start
./testar.sh
```

## Rodar com Docker

```bash
docker build -t atividade4 .
docker run --rm -p 8080:8080 atividade4
./testar.sh http://localhost:8080
```

## Deploy

O deploy foi feito no Render como Web Service usando o Dockerfile, ligado neste repositório. Todo push na `main` faz um deploy novo.

Para testar a versão online:

```bash
./testar.sh https://atividade4-i406.onrender.com
```

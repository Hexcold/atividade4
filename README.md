# Atividade 4 — API REST + Render

API REST em **Node.js + Express** com um CRUD de personagens de Hogwarts, empacotada com **Docker** e publicada no **[Render](https://render.com)** (plano gratuito, sem cartão de crédito).

## Rotas

| Método | Rota              | O que faz                                    | Sucesso |
|--------|-------------------|----------------------------------------------|---------|
| GET    | `/`               | Status do servidor (ambiente, IP público, commit) | 200 |
| GET    | `/personagem`     | Lista todos (filtro opcional `?casa=Sonserina`) | 200 |
| GET    | `/personagem/:id` | Busca um personagem                          | 200 / 404 |
| POST   | `/personagem`     | Cria um personagem                           | 201 |
| PUT    | `/personagem/:id` | Substitui **todos** os campos                | 200 / 404 |
| PATCH  | `/personagem/:id` | Altera **só** os campos enviados             | 200 / 404 |
| DELETE | `/personagem/:id` | Remove um personagem                         | 200 / 404 |

Corpo esperado (JSON):

```json
{ "nome": "Luna", "sobrenome": "Lovegood", "casa": "Corvinal" }
```

`nome` é obrigatório no POST e no PUT. `casa` precisa ser uma de: Grifinória, Sonserina, Corvinal, Lufa-Lufa.

> Os dados ficam em memória, então voltam ao estado inicial quando o container reinicia. No plano gratuito o Render desliga o serviço depois de 15 minutos sem acesso; a próxima requisição demora cerca de 1 minuto para acordar e os dados voltam ao inicial.

## Rodando localmente

```bash
npm install
npm start                 # http://localhost:8080
./testar.sh               # testa todas as rotas
```

## Rodando com Docker

```bash
docker build -t atividade4 .
docker run --rm -p 8080:8080 atividade4
./testar.sh http://localhost:8080
```

## Deploy no Render

O arquivo [render.yaml](render.yaml) descreve o serviço (Docker, plano `free`, região Virginia), então o Render faz tudo sozinho a partir do repositório no GitHub:

1. Suba esta pasta para um repositório público no GitHub.
2. Abra `https://render.com/deploy?repo=https://github.com/SEU_USUARIO/SEU_REPOSITORIO`, entre com a conta do GitHub e clique em **Deploy Blueprint**.
3. O Render constrói a imagem com o Dockerfile e publica em `https://atividade4-xxxx.onrender.com`.

Cada `git push` na branch principal gera um novo deploy automaticamente. Para testar o CRUD na nuvem:

```bash
./testar.sh https://atividade4-xxxx.onrender.com
```

A rota `/` mostra o ambiente (`Render`), o nome do serviço, o commit publicado e o IP público do servidor.

### Removendo depois da entrega

No painel do Render: **atividade4 → Settings → Delete Web Service**.

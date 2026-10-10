#!/usr/bin/env bash
# Testa todas as rotas do CRUD. Uso: ./testar.sh [URL]
# Ex.: ./testar.sh https://atividade4-xxxxx.a.run.app
URL="${1:-http://localhost:8080}"

passo() { printf '\n\033[1;36m>>> %s\033[0m\n' "$*"; }
json() { curl -s -w '\n[HTTP %{http_code}]\n' -H 'Content-Type: application/json' "$@"; }

passo "GET / (status do servidor)"
json "$URL/"

passo "GET /personagem (lista todos)"
json "$URL/personagem"

passo "POST /personagem (cria)"
RESPOSTA=$(curl -s -H 'Content-Type: application/json' -X POST "$URL/personagem" \
  -d '{"nome":"Luna","sobrenome":"Lovegood","casa":"Corvinal"}')
echo "$RESPOSTA"
ID=$(echo "$RESPOSTA" | sed -E 's/.*"id":([0-9]+).*/\1/')

passo "GET /personagem/$ID (busca pelo id)"
json "$URL/personagem/$ID"

passo "PUT /personagem/$ID (substitui tudo)"
json -X PUT "$URL/personagem/$ID" -d '{"nome":"Cedrico","sobrenome":"Diggory","casa":"Lufa-Lufa"}'

passo "PATCH /personagem/$ID (altera só a casa)"
json -X PATCH "$URL/personagem/$ID" -d '{"casa":"Grifinória"}'

passo "DELETE /personagem/$ID (remove)"
json -X DELETE "$URL/personagem/$ID"

passo "GET /personagem/$ID (deve dar 404)"
json "$URL/personagem/$ID"

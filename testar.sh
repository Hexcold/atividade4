#!/usr/bin/env bash
# uso: ./testar.sh [url]
URL="${1:-http://localhost:8080}"

req() {
    curl -s -w '\n[HTTP %{http_code}]\n\n' -H 'Content-Type: application/json' "$@"
}

echo ">>> GET /"
req "$URL/"

echo ">>> GET /personagem"
req "$URL/personagem"

echo ">>> POST /personagem"
RESPOSTA=$(curl -s -H 'Content-Type: application/json' -X POST "$URL/personagem" \
  -d '{"nome":"Luna","sobrenome":"Lovegood","casa":"Corvinal"}')
echo "$RESPOSTA"
echo
ID=$(echo "$RESPOSTA" | sed -E 's/.*"id":([0-9]+).*/\1/')

echo ">>> GET /personagem/$ID"
req "$URL/personagem/$ID"

echo ">>> PUT /personagem/$ID"
req -X PUT "$URL/personagem/$ID" -d '{"nome":"Cedrico","sobrenome":"Diggory","casa":"Lufa-Lufa"}'

echo ">>> PATCH /personagem/$ID"
req -X PATCH "$URL/personagem/$ID" -d '{"casa":"Grifinória"}'

echo ">>> DELETE /personagem/$ID"
req -X DELETE "$URL/personagem/$ID"

echo ">>> GET /personagem/$ID (tem que dar 404)"
req "$URL/personagem/$ID"

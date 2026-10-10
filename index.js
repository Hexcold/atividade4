const express = require('express');
const os = require('os');
const app = express();

app.use(express.json());
// O Render fica atrás de um proxy HTTPS
app.set('trust proxy', true);

// A plataforma informa a porta pela variável PORT (padrão 8080)
const PORT = process.env.PORT || 8080;

const CASAS = ['Grifinória', 'Sonserina', 'Corvinal', 'Lufa-Lufa'];

// "Banco de dados" em memória
let proximoId = 4;
let personagens = [
    { id: 1, nome: 'Harry', sobrenome: 'Potter', casa: 'Grifinória' },
    { id: 2, nome: 'Hermione', sobrenome: 'Granger', casa: 'Grifinória' },
    { id: 3, nome: 'Draco', sobrenome: 'Malfoy', casa: 'Sonserina' },
];

function validar(dados, parcial) {
    if (!parcial && !dados.nome) {
        return 'o campo nome é obrigatório';
    }
    if (dados.nome !== undefined && (typeof dados.nome !== 'string' || !dados.nome.trim())) {
        return 'nome inválido';
    }
    if (dados.casa !== undefined && !CASAS.includes(dados.casa)) {
        return `casa inválida, use: ${CASAS.join(', ')}`;
    }
    return null;
}

function buscarIndice(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ erro: 'id inválido' });
        return -1;
    }
    const indice = personagens.findIndex((p) => p.id === id);
    if (indice === -1) {
        res.status(404).json({ erro: 'personagem não encontrado' });
    }
    return indice;
}

// GET com timeout curto; devolve null se não responder
async function buscar(url) {
    try {
        const resposta = await fetch(url, { signal: AbortSignal.timeout(1500) });
        return resposta.ok ? await resposta.text() : null;
    } catch {
        return null;
    }
}

// O Render injeta variáveis RENDER_* no container; fora dele, é execução local
function infoNuvem() {
    if (process.env.RENDER) {
        return {
            ambiente: 'Render',
            servico: process.env.RENDER_SERVICE_NAME,
            instancia: process.env.RENDER_INSTANCE_ID,
            commit: process.env.RENDER_GIT_COMMIT?.slice(0, 7),
        };
    }
    return { ambiente: 'local' };
}

app.get('/', async (req, res) => {
    const ip = await buscar('https://api.ipify.org');
    res.json({
        mensagem: 'API ok :)',
        ...infoNuvem(),
        ipPublicoDoServidor: ip,
        hostname: os.hostname(),
        url: `${req.protocol}://${req.get('host')}`,
        rotas: [
            'GET    /personagem',
            'GET    /personagem/:id',
            'POST   /personagem',
            'PUT    /personagem/:id',
            'PATCH  /personagem/:id',
            'DELETE /personagem/:id',
        ],
    });
});

// READ - lista todos os personagens (filtro opcional ?casa=)
app.get('/personagem', (req, res) => {
    const { casa } = req.query;
    res.json(casa ? personagens.filter((p) => p.casa === casa) : personagens);
});

// READ - busca um personagem pelo id
app.get('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;
    res.json(personagens[indice]);
});

// CREATE - cria um personagem
app.post('/personagem', (req, res) => {
    const erro = validar(req.body || {}, false);
    if (erro) return res.status(400).json({ erro });

    const { nome, sobrenome, casa } = req.body;
    const personagem = { id: proximoId++, nome, sobrenome: sobrenome || null, casa: casa || null };
    personagens.push(personagem);
    res.status(201).location(`/personagem/${personagem.id}`).json(personagem);
});

// UPDATE (completo) - substitui todos os campos do personagem
app.put('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;

    const erro = validar(req.body || {}, false);
    if (erro) return res.status(400).json({ erro });

    const { nome, sobrenome, casa } = req.body;
    personagens[indice] = { id: personagens[indice].id, nome, sobrenome: sobrenome || null, casa: casa || null };
    res.json(personagens[indice]);
});

// UPDATE (parcial) - altera só os campos enviados
app.patch('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;

    const erro = validar(req.body || {}, true);
    if (erro) return res.status(400).json({ erro });

    const { nome, sobrenome, casa } = req.body;
    const alteracoes = Object.fromEntries(
        Object.entries({ nome, sobrenome, casa }).filter(([, valor]) => valor !== undefined)
    );
    personagens[indice] = { ...personagens[indice], ...alteracoes };
    res.json(personagens[indice]);
});

// DELETE - remove um personagem pelo id
app.delete('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;

    const [personagem] = personagens.splice(indice, 1);
    res.json({ mensagem: 'personagem removido', personagem });
});

app.use((req, res) => {
    res.status(404).json({ erro: 'rota não encontrada' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT} :)`);
});

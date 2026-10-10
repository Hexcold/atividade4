const express = require('express');
const os = require('os');
const app = express();

app.use(express.json());
app.set('trust proxy', true);

const PORT = process.env.PORT || 8080;
const CASAS = ['Grifinória', 'Sonserina', 'Corvinal', 'Lufa-Lufa'];

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

app.get('/', async (req, res) => {
    let ip = null;
    try {
        const resposta = await fetch('https://api.ipify.org', { signal: AbortSignal.timeout(2000) });
        ip = await resposta.text();
    } catch (erro) {
        console.log(`Deu erro ao buscar o ip: ${erro}`);
    }

    res.json({
        mensagem: 'API ok :)',
        ambiente: process.env.RENDER ? 'Render' : 'local',
        servico: process.env.RENDER_SERVICE_NAME,
        commit: process.env.RENDER_GIT_COMMIT,
        ip,
        hostname: os.hostname(),
    });
});

// READ - lista todos os personagens
app.get('/personagem', (req, res) => {
    if (req.query.casa) {
        return res.json(personagens.filter((p) => p.casa === req.query.casa));
    }
    res.json(personagens);
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
    res.status(201).json(personagem);
});

// UPDATE - atualiza um personagem pelo id
app.put('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;

    const erro = validar(req.body || {}, false);
    if (erro) return res.status(400).json({ erro });

    const { nome, sobrenome, casa } = req.body;
    personagens[indice] = { id: personagens[indice].id, nome, sobrenome: sobrenome || null, casa: casa || null };
    res.json(personagens[indice]);
});

// UPDATE - atualiza só os campos enviados
app.patch('/personagem/:id', (req, res) => {
    const indice = buscarIndice(req, res);
    if (indice === -1) return;

    const dados = req.body || {};
    const erro = validar(dados, true);
    if (erro) return res.status(400).json({ erro });

    const personagem = personagens[indice];
    if (dados.nome !== undefined) personagem.nome = dados.nome;
    if (dados.sobrenome !== undefined) personagem.sobrenome = dados.sobrenome;
    if (dados.casa !== undefined) personagem.casa = dados.casa;
    res.json(personagem);
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

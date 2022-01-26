// importação de dependência(s)
const express = require('express')
const fs = require('fs')
const hbs = require('hbs')


// variáveis globais deste módulo
let app = express();
const PORT = 3000
const db = {}


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))




// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas


// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
let core_path = process.cwd()
//app.set('views', './views')
app.set('view engine', 'hbs');
app.set('views', core_path + '\\server\\views');
db.data = JSON.parse(fs.readFileSync(core_path + '\\server\\data\\jogadores.json', 'utf8'))
app.get('/', function (req, res) {
    res.render('index', db.players, (err, html) => {
        if (err)
            res.status(500).send('' + err)
        res.send(html);
    });
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
db.data.gamesPerPlayer = JSON.parse(fs.readFileSync(core_path + '\\server\\data\\jogosPorJogador.json', 'utf8'))
app.get('/jogador/:steamid', (req, res) => {
    const steamid = req.params.steamid
    playerData = getPlayerDataBySteamId(steamid)
    if(!playerData){
        res.status(404).send(`Player not found`)
    }
    res.render('jogador', playerData, (err, html) => {
        if (err) {
            res.status(500).send(err);
        }
        res.send(html);
    });
});

const getPlayerDataBySteamId = (steamId) => {
    try{
        const player = db.data.players.find(player => player.steamid === steamId);
        if (!player) {
            return null;
        }
        const gamesPerPlayer = db.data.gamesPerPlayer[steamId];
        let orderedGameList = gamesPerPlayer.games.sort((a,b) => (a.playtime_forever < b.playtime_forever) ? 1 : ((b.playtime_forever < a.playtime_forever) ? -1 : 0))
        orderedGameList.map(game => {
            let fixedGame = game
            fixedGame.playtime_forever = Math.round(game.playtime_forever/60)
            return fixedGame;
        })
        return {
            player: player,
            game_count: gamesPerPlayer.game_count,
            unplayed: gamesPerPlayer.games.filter(game => game.playtime_forever === 0).length,
            topFive: orderedGameList.slice(0, 5),
            favorite: orderedGameList[0]
        }
    }
    catch(e){
        return null
    }
}

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client'));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT)
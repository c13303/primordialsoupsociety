/* fromage server 
 * 
 * CREATE THE MAP WITH COMMAND (root folder)
 * php bin/console app:create-fullmap 
 * ;-)
 * 
 * 
 * */

let handsize = 6;

var mysql = require('mysql');


var params = require('./params.js');
var tools = require('./tools.js');

var connection = mysql.createConnection({
    host: params.localhost,
    user: params.user,
    password: params.password,
    database: params.database
});
connection.connect();
console.log('Lancement serveur');

/* command line args */
function flush() {
    var flushsessionquery = "UPDATE `pss`.`fos_user` SET `sessiondata` = '' ";
    connection.query(flushsessionquery, function (err, rows, fields) {
        console.log('sessions FLUSHED!');
    });
}

process.argv.forEach(function (val, index, array) {
    if (val == '-flush') { //flush all sessions
        flush();
    }
});

var stdin = process.openStdin();

stdin.addListener("data", function (d) {
    var commande = d.toString().trim();
    console.log("you entered: [" +
            commande + "]");
    if (commande === 'flush') {
        flush();
    }
});



var WebSocketServer = require('ws').Server, wss = new WebSocketServer(
        {
            port: 8080,
            verifyClient: function (info, callback) {      /* AUTHENTIFICATION */
                try {
                    var urlinfo = info.req.url;
                    const ip = info.req.connection.remoteAddress;
                    urlinfo = urlinfo.replace('/', '');
                    urlinfo = urlinfo.split('-');
                    var username = urlinfo[1];
                    var token = urlinfo[0];
                    var query = 'SELECT id,ip,username FROM fos_user WHERE username= ? AND token = ?';
                    connection.query(query, [username, token], function (err, rows, fields) {
                        if (!rows || !rows[0])
                        {
                            callback(false);
                            return(false);
                        }
                        var n = ip.indexOf(rows[0].ip);
                        if (rows[0] && rows[0].id && n)
                        {
                            connection.query('UPDATE fos_user SET token="0" WHERE username=? AND token = ? ', [username, token]);
                            callback(true);
                        } else
                        {
                            console.log('access denier lol');
                            callback(false);
                        }
                    });
                } catch (e) {
                    console.log('erreur ');
                    console.log(e);
                }
            }
        }
);

var clients = [];
var map = {};
var cardIndex = {};
var fullmap = [];


cardIndex.reload = function reloadIndex() {
    var query = 'SELECT * FROM card';
    connection.query(query, function (err, rows, fields) {
        var cardindex = {};
        for (i = 0; i < rows.length; i++) {
            var id = rows[i].id;
            cardindex[id] = rows[i];
        }
        cardIndex.cardIndex = cardindex;
    });
};


map.getAllMap = function getAllMap() {
    var query = 'SELECT * FROM map';
    connection.query(query, function (err, rows, fields) {
        try {
            fullmap = tools.matrix(101, 101, 0);
            for (i = 0; i < rows.length; i++) {
                var line = rows[i];
                fullmap[line.X][line.Y] = line;
            }
            console.log('map loaded');
        } catch (e) {
            console.log(e);
        }
    });
}
map.getAllMap();


map.move = function move(ws, direction) {
    nextX = ws.x;
    nextY = ws.y;
    if (direction === 'up') {
        var nextY = ws.y + 1;
    }
    if (direction === 'down') {
        var nextY = ws.y - 1;
    }
    if (direction === 'right') {
        var nextX = ws.x + 1;
    }
    if (direction === 'left') {
        var nextX = ws.x - 1;
    }
    // TODO Map::MAX_X
    if (nextX > 99 || nextY > 99 || nextX < 0 || nextY < 0) {
        console.log(ws.id + ' map limits reached');
        ws.busy = 0;
        //ws.send(JSON.stringify({command : 'maplimits'}));
        return(null);
    }

    var query = 'UPDATE fos_user SET x= ? ,y= ? WHERE id= ?;';
    ws.x = nextX;
    ws.y = nextY;
    connection.query(query, [nextX, nextY, ws.id], function (err, rows, fields) {
        ws.send(JSON.stringify({command: 'moved', x: nextX, y: nextY}));
        map.checkMap(ws);
        map.playerList(ws, clients);
        map.whosthere(ws);
        map.update(ws);
    });
}


map.checkMap = function pssCheckMap(ws) {
    var query = 'SELECT id,name,description,user_id,file,x,y FROM map WHERE X=? AND Y=?';
    connection.query(query, [ws.x, ws.y], function (err, rows, fields) {
        try {
            if (!rows[0]) {
                console.log('leaving map :-(');
            }
            if (rows[0]) {
                var message = rows[0];
            }
            ws.busy = 0;
            ws.send(JSON.stringify({map: message}));
        } catch (e) {
            console.log(e);
        }
    });
}
/*
 * UPDATE LE PLAYER
 */
map.update = function pssUpdate(ws, id = null) {
    if (!id) {
        id = ws.id;
    }
    var query = 'SELECT x,y,karma,sex,life,sanity,score,speak,money,level,file,AI FROM fos_user WHERE id=?';
    connection.query(query, id, function (err, rows, fields) {
        if (rows) {
            ws.send(JSON.stringify({update: rows[0]}));
        }
    });
};

map.playerList = function playerList(ws, clients) {
    var list = [];
    for (i = 0; i < clients.length; i++) {
        list.push(clients[i].user);
    }
    wss.broadcastCommand('list', list);
}

map.isOnline = function isOnline(clients, id) {
    for (i = 0; i < clients.length; i++) {
        if (clients[i].user.is == id) {
            return(true);
        }
    }
    return(false);
};


map.whosthere = function whosThere(ws) {
    var query = 'SELECT id,username,x,y,speak,level,karma,sex,sanity,life,money,file FROM fos_user WHERE x=? AND y=?';
    var info = connection.query(query, [ws.x, ws.y], function (err, rows, fields) {
        ws.send(JSON.stringify({whosthere: rows}));
        // was in duel 
        // TODO what if not here anywmore ? 
        if (ws.session.duelmode) {
            console.log('restore duel ' + ws.id);
            cardIndex.reload();
            ws.updateDuelClient(1);
            ws.send(JSON.stringify({opponent: ws.session.ennemy.id}));
        }


    });

};

map.findClient = function findClient(clients, id) {
    for (i = 0; i < clients.length; i++) {
        if (clients[i].user.is == id)
        {
            return(clients[i]);
        }
    }
    return(false);
}





/*
 * Envoie une commande à tout le monde
 * @param {type} command
 * @param {type} data
 * @returns {undefined}
 */
wss.broadcastCommand = function broadcastCommand(command, data) {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({user: 'serveur', command: command, data: data}));
    });
};

/*
 * Envoie un msg a tout le monde
 * @param {type} msg
 * @returns {undefined}
 */
wss.broadcast = function broadcast(msg) {

    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
};




wss.on('connection', function aconnection(ws, req) {
    /* recognize authentified player */
    var urlinfo = req.url;
    const ip = req.connection.remoteAddress;
    urlinfo = urlinfo.replace('/', '');
    urlinfo = urlinfo.split('-');
    var username = urlinfo[1];
    var token = urlinfo[0];
    var query = 'SELECT id,ip,username,x,y,score,money,life,karma,sex,sanity,level,sessiondata FROM fos_user WHERE username=?';
    var info = connection.query(query, username, function (err, rows, fields) {
        ws.id = rows[0].id;
        ws.user = rows[0].username;
        ws.player = rows[0];
        ws.ip = rows[0].ip;
        ws.x = rows[0].x;
        ws.y = rows[0].y;

        try {
            if (rows[0].sessiondata && rows[0].sessiondata != 'undefined') {
                ws.session = JSON.parse(rows[0].sessiondata);

            } else {
                ws.session = {};
            }
        } catch (e) {
            console.log(e);
            ws.session = {};
        }

        ws.connected();

    });
    // on connect
    ws.connected = function connected() {
        console.log('--- client access granter ' + this.user + '@' + this.ip + '----');


        /* check if connected already, KICKING HIM */
        for (i = 0; i < clients.length; i++) {
            if (clients[i].user === this.user) {
                this.send(JSON.stringify({'user': 'serveur', 'message': 'utilisateur déjà connecté ! fermant connexion ' + this.user + '! '}));
                ws.cheater('refus de connexion : utilisateur déjà connecté !');
                this.close();
                return(null);
            }
        }

        /* send full map */
        ws.send(JSON.stringify({fullmap: fullmap}));

        /* reload is deck */
        // ws.updateDeck();     

        this.send(JSON.stringify({'user': 'serveur', 'message': 'coucou ' + this.user + '! '}));
        clients.push(this); /* add to client list */
        map.playerList(this, clients);
        map.checkMap(this);
        map.whosthere(this);

    };
    ws.cheater = function cheater(message) {
        ws.send(JSON.stringify({cheater: message}));
    };

    ws.updateSession = function updateSession() {
        var sessiondata = JSON.stringify(ws.session);
        var query = 'UPDATE fos_user SET sessiondata = ? WHERE id = ?';
        var info = connection.query(query, [sessiondata, ws.id], function (err, rows, fields) {
        });
    };

    ws.sendDeck = function () {
        ws.send(JSON.stringify({deck: ws.deck}));
    };

    // update player deck
    ws.updateDeck = function updateDeck(callback) {
        cardIndex.reload();
        var query = 'SELECT * FROM deck WHERE user_id = ? ORDER BY card_id ASC';
        var info = connection.query(query, this.id, function (err, rows, fields) {
            ws.deck = tools.formatAllDeck(rows, cardIndex.cardIndex);
            if (ws[callback] && typeof (ws[callback]) === "function") {
                ws[callback]();
            }
        });
    };
    
    ws.sendExpired = function sendExpired(){
        ws.send(JSON.stringify({expired: ws.session.cardsToRemove}));
    };





    /*
     * DUEL 
     */

    ws.updateDuelClient = function updateClientDuel(init) {
        var data = {
            player: {
                id: ws.player.id,
                username: ws.player.username,
                life: ws.player.life,
                sex: ws.player.sex,
                karma: ws.player.karma,
                sanity: ws.player.sanity,
                level: ws.player.level,
                money: ws.player.money,
                score: ws.player.score
            },
            ennemy: ws.session.ennemy,
            hand: ws.session.hand,
         //   ennemyHand: ws.session.ennemyHand,
            allowedToPlay: ws.session.allowedToPlay,
            duelTurn: ws.session.duelTurn,
            table: ws.session.table,
            last: ws.session.last,
            cardsToRemove:ws.session.cardsToRemove,

        }
        if (init) {
            var duel = 'go';
        } else {
            var duel = 'update';
        }
        ws.send(JSON.stringify({duel: duel, data: data}));

    };

    /*
     * INIT DUEL SERVER SIDE
     */
    ws.initDuel = function initDuel(json) { //commande duel,id    
        // console.log('duel init : ' + ws.id + ' vs ' + json.value);
        var adversaire_id = json.value;
        cardIndex.reload();
        ws.adversaire = adversaire_id;
        ws.session.isHost = 1;
        ws.updateDeck('initDuel2');
    };

    ws.initDuel2 = function initDuel2() {
        /* duel mode off or online */
        if (map.isOnline(clients, ws.adversaire)) {
            console.log('online duel');
            map.findClient(clients, ws.adversaire);
            ws.session.isOnline = 1;

            /* TODO SEND ALL DATA TO WS OPPONENT */
            /* wss find opponent ws */
            /* ws update */
            /* send to client */
            /* host wait for him */
            /* open the battle */

        } else {
            console.log('offline duel');
            ws.setEnnemy(ws.adversaire);
            ws.session.isOnline = 0;
        }
    }



    // init offline duel step 2 : get ennemy
    ws.setEnnemy = function setEnnemy(id) {
        var query = 'SELECT id,username,x,y,level,karma,sex,sanity,life FROM fos_user WHERE id = ? LIMIT 0,1';
        connection.query(query, id, function (err, rows, fields) {
            ws.session.ennemy = rows[0];
            ws.loadEnnemyDeck();
        });

    }

    // init offline duel step 3 : get ennemy deck
    ws.loadEnnemyDeck = function loadEnnemyDeck() {  /// ofline ennemy deck
        var query = 'SELECT * FROM deck WHERE user_id = ?';
        connection.query(query, this.adversaire, function (err, rows, fields) {
            if (!ws.deck.length || !rows.length) {
                console.log('error : empty deck');
            } else {

                ws.session.ennemyDeck = tools.formatAllDeck(rows, cardIndex.cardIndex);
                /*
                 * INIT THE DUEL CLIENT
                 */
                ws.session.player = ws.player;
                ws.session.player.sessiondata = ws.session.player.ip = ws.session.player.speak = '' ;  /// le player session est cleané
                ws.session.deck = tools.shuffle(ws.deck);
                ws.session.ennemyDeck = tools.shuffle(ws.session.ennemyDeck);
                ws.session.hand = tools.sixFirst(ws.session.deck);
                ws.session.ennemyHand = tools.sixFirst(ws.session.ennemyDeck);
                ws.session.duelTurn = 1;
                ws.session.duelmode = 1;
                ws.session.busy = 1;
                ws.session.table = [];
                ws.session.takenturns=[];
                ws.session.last = {};
                ws.player.life = 100;
                ws.session.ennemy.life = 100;

                if (ws.session.ennemy.karma > ws.player.karma) {
                    ws.session.allowedToPlay = 0; // adversaire

                } else {
                    ws.session.allowedToPlay = 1; // player
                }

                /* init front fight */

                ws.updateDuelClient(1);
                ws.updateSession();



            }

        });
    };





    /*
     * Player Played His Card
     */
    ws.playCard = function playCard(id_hand, idplayer) {
        /* json.value === ID de la main, not id card */
        /* security check if card in HAND */
        var card = 0;
        var IA = 0;
        var turn = ws.session.duelTurn;
        var localIndex = JSON.parse(JSON.stringify(cardIndex.cardIndex));
        console.log('Turn '+turn);
        if (idplayer !== ws.id) {
            var IA = 1;
        }
        
        if (!IA) {
            var Hand = ws.session.hand;
            var attacker = ws.session.player;
            var defender = ws.session.ennemy;
        } else { /* IA */
            var Hand = ws.session.ennemyHand;
            var attacker = ws.session.ennemy;
            var defender = ws.session.player;
        }
        if(id_hand){  
            for (i = 0; i < handsize; i++) {
                var cardInHand = Hand[i];
                if (cardInHand && cardInHand.deck_id === id_hand) {
                    /* find card in index */
                    var card = localIndex[cardInHand.id];
                    card.turnPosed = turn;
                    // removeCardFromHand
                    Hand.splice(i, 1);
                    break;
                }
            }
            if (!card) {
                ws.cheater('error : card not found');
                return(null);
            }
            /* set this card on table */
            ws.session.table[turn] = {
                id: card.id,
                deck_id: id_hand,
                card: card,
                attacker: attacker,
                defender: defender,
                turn: card.turns,
            };

            
        } else {
            
            cardInHand = null;
            card = null; 
            ws.session.table[turn] = {
                id: null,
                deck_id: null,
                card: null,
                attacker: attacker,
                defender: defender,
                turn: null,
            };
        }
        
        


        /* increment turn */
        ws.session.duelTurn++;

        /* turn table card expire */
        var expiredTable = tools.expiredCards(ws.session.table);
        ws.session.table = expiredTable.newTable;
        ws.session.cardsToRemove = expiredTable.cardsToRemove;   
              



        /* load shield and attacks */
        var damage = tools.calculateStrike(attacker, defender, ws.session.table);
        if (damage.totalDamage > 0) {
            defender.life -= damage.totalDamage;
        }
        if (damage.totalDamage < 0) {
            attacker.life += damage.totalDamage;
        }
        /*
         * Save Session Updated Values
         */
        if (!IA) {
            ws.session.hand = Hand;
            ws.session.allowedToPlay = 0;
            ws.session.player = attacker;
            ws.session.ennemy = defender;
        } else { /* IA */
            ws.session.ennemyHand = Hand;
            ws.session.allowedToPlay = 1;
            ws.session.ennemy = attacker;
            ws.session.player = defender;

            /* add card on table client */
            card.deck_id = id_hand;
            ws.send(JSON.stringify({duel: 'playerCard', data: cardInHand}));
        }
        ws.session.table[turn].log = ws.session.last = damage;           
        
        
        
        
        /* display the coup */
        ws.updateDuelClient(0);               
        
        ws.updateSession();

    };
    ws.skipTurn = function skipTurn(){
        ws.playCard(null,ws.id);
    };
    
    ws.takeCardIA = function takeCardIA(){
        /* shuffle deck then take first card not in hand nor in table */
        var deck = tools.shuffle(ws.session.ennemyDeck);
        var playedCards = tools.getPlayedCardsFromTable(ws.session.table);
        var hands = tools.getIdCardsFromHand(ws.session.ennemyHand);
        for (i = 0; i < deck.length; i++) {
            var newcard = deck[i];
            var id = deck[i].id;
            if (playedCards.indexOf(id) === -1 && hands.indexOf(id) === -1) {                
                break;
            }
        }
        ws.session.ennemyHand.push(newcard);
        ws.updateSession();
    };
    
    ws.takeCard = function takeCard() {
        if (ws.session.hand.length > 5) {
            ws.cheater('main pleine !');
            return(null);
        }
        if(ws.session.takenturns.indexOf(ws.session.duelTurn)>0){
            ws.cheater('déjà pris une carte ce tour !');
            return(null);
        }
        ws.session.takenturns.push(ws.session.duelTurn);
        /* shuffle deck then take first card not in hand nor in table */
        var deck = tools.shuffle(ws.session.deck);
        var playedCards = tools.getPlayedCardsFromTable(ws.session.table);
        var hands = tools.getIdCardsFromHand(ws.session.hand);
        for (i = 0; i < deck.length; i++) {
            var newcard = deck[i];
            var id = deck[i].id;
            if (playedCards.indexOf(id) === -1 && hands.indexOf(id) === -1) {
                console.log(id);
                break;
            }
        }
        ws.session.hand.push(newcard);
        ws.updateSession();
        ws.send(JSON.stringify({updateHand: ws.session.hand}));
    };


    ws.IAPlay = function IAPlay() {
        if(ws.session.duelTurn > 2){
            ws.takeCardIA();
        }
        var randomcard = Math.floor((Math.random() * ws.session.ennemyHand.length));
        console.log('IA ' + ws.session.ennemy.username + ' is playing card : ' + randomcard + '/' + ws.session.ennemyHand.length);
        ws.playCard(ws.session.ennemyHand[randomcard].deck_id, null);
    };








    /*read messages */
    ws.on('message', function incoming(message) {
        try {
            var json = JSON.parse(message);
            console.log(json);
            if (json.command === 'chat') {
                var message = {};
                message.message = json.value;
                message.user = ws.user;
                wss.broadcast(JSON.stringify(message));
            }

            /*
             *  0 LEVEL COMMANDS
             */

            if (!ws.session.busy && !ws.session.duelmode) {
                if (json.command === 'update') {
                    map.update(ws);
                }

                if (json.command === 'updateallmap') {
                    map.getAllMap();
                }

                if (json.command === 'duel') {
                    ws.initDuel(json);
                }


                if (json.command === 'move') {
                    map.move(ws, json.value);
                }

                if (json.command === 'getmycards') {
                    ws.updateDeck('sendDeck');
                }
                
                if (json.command === 'getexpired') {
                    ws.sendExpired();
                }
                
            } // end busy

            /* duel mode commands */
            if (ws.session.duelmode) {
                if (ws.session.allowedToPlay === 1) {
                    if (json.command === 'playcard') {
                        ws.playCard(json.value, ws.id);
                    }
                    if (json.command === 'takeCard') {
                        ws.takeCard();
                    }
                    if (json.command === 'skipTurn') {
                        ws.skipTurn();
                    }
                } else {
                    if (json.command === 'waitForOpponent') {
                        ws.IAPlay();
                    }
                }
            }

        } catch (e) {
            console.log(' - erreur -');
            console.log(e);
            ws.cheater(e.message);
        }
    });

    ws.on('close', function (message) {
        console.log(ws.user + ' disconnected');
        var index = clients.indexOf(ws);
        clients.splice(index, 1);
        map.playerList(ws, clients);
    });
});



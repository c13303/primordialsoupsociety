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
    password:  params.password,
    database:  params.database
});
connection.connect();
console.log('Lancement serveur');

/* command line args */
process.argv.forEach(function (val, index, array) {
   if(val=='-flush'){ //flush all sessions
       var flushsessionquery = "UPDATE `pss`.`fos_user` SET `sessiondata` = '' ";
       connection.query(flushsessionquery, function (err, rows, fields) {
           console.log('sessions FLUSHED!');
       });
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
                    var query = 'SELECT id,ip,username FROM fos_user WHERE username="' + username + '" AND token = "' + token + '"';
                    connection.query(query, function (err, rows, fields) {
                        if (!rows || !rows[0])
                        {
                            callback(false);
                            return(false);
                        }
                        var n = ip.indexOf(rows[0].ip);
                        if (rows[0] && rows[0].id && n)
                        {
                            console.log('access granter');
                            connection.query('UPDATE fos_user SET token="0" WHERE username="' + username + '" AND token = "' + token + '"');
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
}


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

    var query = 'UPDATE fos_user SET x=' + nextX + ',y=' + nextY + ' WHERE id=' + ws.id + ';';
    ws.x = nextX;
    ws.y = nextY;
    connection.query(query, function (err, rows, fields) {
        ws.send(JSON.stringify({command: 'moved', x: nextX, y: nextY}));
        map.checkMap(ws);
        map.playerList(ws, clients);
        map.whosthere(ws);
        map.update(ws);
    });
}


map.checkMap = function pssCheckMap(ws) {
    var query = 'SELECT id,name,description,user_id,file,x,y FROM map WHERE X=' + ws.x + ' AND Y=' + ws.y + '';
    connection.query(query, function (err, rows, fields) {
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

map.update = function pssUpdate(ws, id = null) {
    if (!id) {
        id = ws.id;
    }
    var query = 'SELECT x,y,karma,sex,life,sanity,score,speak,money,level,file,AI FROM fos_user WHERE id=' + id + '';
    connection.query(query, function (err, rows, fields) {
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
    var info = connection.query(query,[ws.x,ws.y],function (err, rows, fields) {
        ws.send(JSON.stringify({whosthere: rows}));
        // was in duel 
        // TODO what if not here anywmore ? 
        if (ws.session.duelmode) {
            console.log('restore duel '+ws.id);
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
    var info = connection.query(query, username,function (err, rows, fields) {
        ws.id = rows[0].id;
        ws.user = rows[0].username;
        ws.player = rows[0];        
        ws.ip = rows[0].ip;
        ws.x = rows[0].x;
        ws.y = rows[0].y;
        
        try{
            if(rows[0].sessiondata && rows[0].sessiondata != 'undefined'){ 
               ws.session = JSON.parse(rows[0].sessiondata);      
              
            } else{
               ws.session = {};
            }
        } catch(e){
            console.log(e);
            ws.session = {};
        }
     
        ws.connected();
        
    });
    // on connect
    ws.connected = function connected() {
        console.log('--- client connect ' + this.user + '@' + this.ip + '----');
       
        
        /* check if connected already, KICKING HIM */
        for (i = 0; i < clients.length; i++) { 
            if (clients[i].user == this.user) {
                this.send(JSON.stringify({'user': 'serveur', 'message': 'utilisateur déjà connecté ! fermant connexion ' + this.user + '! '}));
                ws.cheater('refus de connexion : utilisateur déjà connecté !');
                this.close();
                return(null);
            }
        }       
        
         /* send full map */
        ws.send(JSON.stringify({fullmap: fullmap}));
        
        /* reload is deck */
        ws.updateDeck();     
       
        this.send(JSON.stringify({'user': 'serveur', 'message': 'coucou ' + this.user + '! '}));
        clients.push(this); /* add to client list */
        map.playerList(this, clients);
        map.checkMap(this);
        map.whosthere(this);      
        
    }
    ws.cheater = function cheater(message){
        ws.send(JSON.stringify({cheater: message}));
    }
    
    ws.updateSession = function updateSession() {
        var sessiondata = JSON.stringify(ws.session);
        var query = 'UPDATE fos_user SET sessiondata = ? WHERE id = ?';       
        var info = connection.query(query, [sessiondata,ws.id],function (err, rows, fields) {         
        });
    }
        
    
    // update player deck
    ws.updateDeck = function updateDeck() {
        var query = 'SELECT * FROM deck WHERE user_id = ?';
        var info = connection.query(query, this.id,function (err, rows, fields) {
            ws.deck = rows;
        });
    }
    


    /*
     * DUEL 
     */
    
    ws.updateDuelClient = function updateClientDuel(init) {
        var data = {
            player: {
                life : ws.player.life,
                sex : ws.player.sex,
                karma : ws.player.karma,
                sanity : ws.player.sanity,
                level : ws.player.level,
                money: ws.player.money,
                score: ws.player.score
            },
            ennemy: ws.session.ennemy,
            hand: ws.session.hand,
            ennemyHand: ws.session.ennemyHand,
            allowedToPlay: ws.session.allowedToPlay,
            duelTurn : ws.session.duelTurn,
            table : ws.session.table,   
            last : ws.session.last
            
        }    
        if(init){
            var duel = 'go';
        } else {
            var duel = 'update';
        }
        ws.send(JSON.stringify({duel: duel, data: data}));
        
    }

    /*
     * INIT DUEL SERVER SIDE
     */
    ws.initDuel = function initDuel(json) { //commande duel,id        
        
        console.log('duel init : ' + ws.id + ' vs ' + json.value);
        var adversaire_id = json.value;

        cardIndex.reload();
        ws.adversaire = adversaire_id;
        ws.session.isHost = 1;  
        
        /* duel mode off or online */
        if (map.isOnline(clients, adversaire_id)) {
            console.log('online duel');
            map.findClient(clients, adversaire_id);
            ws.session.isOnline = 1;
                      
            /* TODO SEND ALL DATA TO WS OPPONENT */
            /* wss find opponent ws */
            /* ws update */
            /* send to client */
            /* host wait for him */
            /* open the battle */
            
        } else {
            console.log('offline duel');
            ws.setEnnemy(adversaire_id);
            ws.session.isOnline = 0;
        }
    }

    // init offline duel step 2 : get ennemy
    ws.setEnnemy = function setEnnemy(id) {
        var query = 'SELECT id,username,x,y,speak,level,karma,sex,sanity,life,money,file FROM fos_user WHERE id = ? LIMIT 0,1';
        var info = connection.query(query, id, function (err, rows, fields) {
            ws.session.ennemy = rows[0];
            ws.loadEnnemyDeck();
        });

    }

    // init offline duel step 3 : get ennemy deck
    ws.loadEnnemyDeck = function loadEnnemyDeck() {  /// ofline ennemy deck
        var query = 'SELECT * FROM deck WHERE user_id = ?';
        var info = connection.query(query, this.adversaire, function (err, rows, fields) {
            ws.ennemyDeck = rows;
            if (!ws.deck.length || !ws.ennemyDeck.length) {
                console.log('error : empty deck');
            } else {                
                
                /*
                 * INIT THE DUEL CLIENT
                 */
                ws.session.deck = tools.shuffle(ws.deck);
                ws.session.ennemyDeck = tools.shuffle(ws.ennemyDeck);
                ws.session.hand = tools.sixFirst(ws,cardIndex.cardIndex);
                ws.session.ennemyHand = tools.sixFirst(ws,cardIndex.cardIndex);
                ws.session.duelTurn = 1;
                ws.session.duelmode = 1;
                ws.session.busy = 1;
                ws.session.table = [];
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
    }
    
    /*
     * Player Played His Card
     */
    ws.playCard = function playCard(id_hand,idplayer){
        /* json.value === ID de la main, not id card */
        /* security check if card in HAND */
        var card = 0;
        var turn = ws.session.duelTurn;
        
        if(idplayer === ws.id){
            var Hand = ws.session.hand;
            var attacker = ws.player;
            var defender = ws.session.ennemy;
        } else { /* IA */
            var Hand = ws.session.ennemyHand;
            var attacker = ws.session.ennemy;
            var defender = ws.player;
        }

        for (i = 0; i < handsize; i++) {
            var cardInHand = Hand[i];
            if (cardInHand.deck_id === id_hand) {
                /* find card in index */
                var card = cardIndex.cardIndex[cardInHand.id];
                // removeCardFromHand
                Hand[i]=null; 
            }
        }
        if (!card) {
            ws.cheater('error : card not found');
        }

        /* set this card on table */
        ws.session.table[turn] = {
            id: card.id,
            deck_id: id_hand,
            card : card,
            attacker : attacker,
            defender : defender,
            turn: card.turns,
        };
        

        /* increment turn */
        ws.session.duelTurn++;
        

        /* load shield and attacks */
        var damage = tools.calculateStrike(attacker,defender, ws.session.table, cardIndex.cardIndex);
        
        
        if(damage.totalDamage>0){            
            defender.life-= damage.totalDamage;             
        }
        if(damage.totalDamage<0){
            attacker.life+= damage.totalDamage;
        }
        
        /*
         * Save Session Updated Values
         */
        if(idplayer === ws.id){
            ws.session.hand = Hand;
            ws.session.allowedToPlay = 0;
            ws.player = attacker; // save it
        } else { /* IA */
            ws.session.ennemyHand = Hand;
            ws.session.allowedToPlay = 1; 
            ws.session.ennemy = defender; // save it
        }
        
              
        ws.session.table[turn].log = ws.session.last = damage;        
        
        
        
        
        /* display the coup */
         ws.updateDuelClient(0);
         ws.updateSession();
         
         
         /* IA 
          * 
          */
         if(!ws.session.isOnline){
             ws.IAPlay();
             return(null);
         }
         
         
    }
    
    
    ws.IAPlay = function IAPlay(){
        
    }









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
            } // end busy
            
            /* duel mode commands */
            if(ws.session.duelmode){
                if(ws.session.allowedToPlay===1){
                    if (json.command === 'playcard') {                
                        ws.playCard(json.value,ws.id);  
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


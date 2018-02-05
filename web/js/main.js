/* Fromage Interactif ALL RIGHTS RESERVED */
var currentPCase = 0;
var currentOCase = 0;
var currentHCase = 0;
var currentMCase = 0;
var gridComplete = 0;
var updatedTable = [];
var playerId = 0;

function matrix(rows, cols, defaultValue) {
    var arr = [];
    for (var i = 0; i < rows; i++) {
        arr.push([]);
        arr[i].push(new Array(cols));
        for (var j = 0; j < cols; j++) {
            arr[i][j] = defaultValue;
        }
    }
    return arr;
}



function positionCard(isO) {

    var card = $('.waitforposition');
    card.each(function () {

        $(this).removeClass('waitforposition');
        if (!isO) {
            var select = '#scene .gridsquare' + currentPCase;
            $(this).appendTo(select);
            currentPCase++;
        }
        if (isO === 'O') {
            var select = '#sceneO .gridsquare' + currentOCase;
            $(this).appendTo(select);
            currentOCase++;
        }
        if (isO === 'H') {
            var select = '#hand .gridsquare' + currentHCase;
            $(this).appendTo(select);
            currentHCase++;
        }
        if (isO === 'M') {
            var select = '#mycards .gridsquare' + currentMCase;
            $(this).appendTo(select);
            currentMCase++;
        }
    });

}






function isolateOpponent(id_target) {
    var found = 0;
    $('.otherpeople').each(function () {
        if ($(this).data('id') !== id_target) {
            $(this).animate({opacity: 0.0}, 700, 'linear');
        }
    });
    $('#player' + id_target).css('margin-top', '0px');
    if (!$('#player' + id_target).data('id')) {
        alert('opponent not here ' + id_target);
    }
}

var allowedToPlay = 0;
var id = $('#nom').data('id');

function updateStats(player, opponent) {
    $('#pstats .life').html(player.life);    
    $('#ostats .life').html(opponent.life);    
}

/* HTML de la CARTE */
function makeCardHtml(data, someclass) {
    var html = '';
    html += '<div id="card' + data.deck_id + '" class="card turnposed'+data.turnPosed+' handcard ' + someclass + ' '+data.type+'" \n\
data-command="playcard" data-turns="'+data.turns+'" data-value="' + data.deck_id + '">';
    html += '<div class="name">' + data.name + '</div>';
    html += '<div class="carddesc">' + data.description + '</div>';
    html += '<div class="cardeffect">' + data.effect + '</div>';
    html += ' <div class="tur ic">' + data.turns + '</div>';
    html += '</div>';
    $('#positionner').append(html);
}

/*
 * Opponent pose 1 Carte
 */
function playerCard(card) {
    var html = makeCardHtml(card, 'opponentTableCard waitforposition turnactive');
    positionCard('O');
    
}

/*
 *  Charge Le DUEL
 */
function duelInit(message) {
    var data = message.data;
    var opponent = message.data.ennemy;
    var player = message.data.player;
    playerId = player.id;
    $('.mapStuff').hide();
    $('.duelstuff').show();
    $('#duel').show();
    $('.duelmode').show();
    $('.mainonly').hide();
    /*
     *  Pose la main du player 
     */
    setTimeout(function () {
        updateHand(data.hand);
        updateTable(data.table);
        duelUpdate(message);
    }, 1000); // [timer sinon ça chiale O_?] 


}
function updateTable(table) {
   
    currentPCase = currentOCase = 0;
    $('.turnactive').remove();
    /* Pose les cartes on the table */
    for (i = 0; i < table.length; i++) {
        var cardOnTable = table[i];
        if (cardOnTable && cardOnTable.card) {
            if (cardOnTable.attacker.id === playerId) {
                makeCardHtml(cardOnTable.card, 'waitforposition turnactive');
            }
            positionCard(null);
            if (cardOnTable.attacker.id !== playerId) {
                makeCardHtml(cardOnTable.card, 'waitforposition turnactive');
            }
            positionCard('O');
        }
    }
}

function updateHand(hand) {
    $('.playerhandcard').remove();
    currentHCase = 0;
    for (i = 0; i < hand.length; i++) {
        if (hand[i]) {
            makeCardHtml(hand[i], 'command playerhandcard waitforposition activehandcard');
            positionCard('H');
        }
    }
}



function duelUpdate(message) {
    var data = message.data;
    var opponent = message.data.ennemy;
    var player = message.data.player;
    var damage = message.data.last;

    allowedToPlay = data.allowedToPlay;

    if (allowedToPlay) { /// adversaire = IA/OPPONENT, prochain tour = player
        $('#self').css('border','10px solid #1fe01f');
        $('.otherpeople').css('border','none');
        $('.playerhandcard').addClass('command').addClass('activehandcard');
        $('#reload').removeClass('disabled').addClass('command');
        var nextAttacker = player;
        var nextDefender = opponent;        
        $('#oakarma').html(damage.attackKar);
        $('#oasex').html(damage.attackSex);
        $('#oasanity').html(damage.attackSan);
        $('#odkarma').html(damage.defenseKar);
        $('#odsex').html(damage.defenseSex);
        $('#odsanity').html(damage.defenseSan);
        
    } else {  /// adversaire = PLAYER, prochain tour = adversaire
        $('.otherpeople').css('border','10px solid #1fe01f');
        $('#self').css('border','none');
        $('#reload').addClass('disabled').removeClass('command');
        $('.playerhandcard').removeClass('command').removeClass('activehandcard');
        var nextAttacker = opponent;
        var nextDefender = player;
        
        $('#akarma').html(damage.attackKar);
        $('#asex').html(damage.attackSex);
        $('#asanity').html(damage.attackSan);
        $('#dkarma').html(damage.defenseKar);
        $('#dsex').html(damage.defenseSex);
        $('#dsanity').html(damage.defenseSan);
        
    }
    updateStats(player,opponent);  

    $('#turn').html(message.data.duelTurn);
       
    var text = '';
    
    if (damage.card) {
        text += '<p class="action">\n\<span class="playername">' + damage.attacker + '</span> pose <span class="cardname">' + damage.card.name + '</span><br/>';
    } else if(damage.attacker){
        text += '<p class="action">\n\<span class="playername">' + damage.attacker + '</span> passe le tour<br/>';
    }

    if (damage.totalDamage > 0) { // classic damage
        text += '<p class="action"><span class="playername">' + damage.defenser + '</span> reçoit ' + damage.totalDamage + ' points de dommages';
    }
    if (message.data.last.totalDamage < 0) { // contre-damaged
        text += '<p class="action"><span class="playername">' + damage.attacker + '</span> reçoit ' + damage.totalDamage + ' points de dommages';
    }

    

    text += "<p>C'est à <span class='playername'>" + nextAttacker.username + "</span> de jouer.</p>";
    $('#dueldesc').html(text);

    /* whats next ? */
    if (!allowedToPlay) {
        $('#dueldesc').append('<p><a href="#e" class="command updateturns" data-command="waitForOpponent" data-value="1">OK</a></p>');
    }
    
    updateTable(data.table);
}


function updateCardManager(cards) {
    $('#cardmanager').show();
    currentMCase = 0;
    for (i = 0; i < cards.length; i++) {
        makeCardHtml(cards[i], 'playerhandcard waitforposition managercard');
        positionCard('M');
    }
}

function completeIframe() {
    $('#loader').hide();
    $('#map #loadingimage').remove();
    $('#editframe').show();
}

$(document).ready(function () {



    $('.centralCol').fadeIn(200);
    /*editlink */
    $('.fullload').click(function () {
        $('#loader').show();
        var route = $(this).data('route');
        var idmap = $(this).data('idmap');
        if (route && idmap) {
            var link = route + '?idmap=' + idmap;
            window.location.replace(link);
        }

    });







    /* DOM READY */

    /*
     * copié en HTML pour plus de rapidité
     */
    gengrid(6, 1, $('#scene'));
    gengrid(6, 1, $('#sceneO'));
    gengrid(6, 1, $('#hand'));
    gengrid(6, 5, $('#mycards'));

    /* connect est lancé a lissue des 3 gengrid */
    function gengrid(n, j, div) {
        var output = '';
        var macase = 0;
        for (var i = 0; i < j; i++) {
            output += '<div class="row row' + i + '">';
            for (k = 0; k < n; k++) {
                output += '<div class="gridsquare gridsquare' + macase + '" title="' + macase + '"></div>';
                macase++;
            }
            output += '</div>';
        }
        div.append(output);

    }

    if ($('#token').val()) {
        connect($('#token').val(), $('#user').val());
    } else {
        console.log('offline mode');
    }


    var fullmap;
    var environs;

    function getEnvirons(x, y) {
        var range = 4;
        environs = matrix(9, 9, 0);
        var fromx = parseInt(x) - parseInt(range);
        var tox = parseInt(x) + parseInt(range) + 1;
        var fromy = parseInt(y) - parseInt(range) - 1;
        var toy = parseInt(y) + parseInt(range);
        var environ_x = 0;
        var environ_y = 0;
        var html;
        for (i = toy; i > fromy; i--) {
            environ_x = 0;
            html += '<tr>';
            for (j = fromx; j < tox; j++) {
                if (i >= 0 && i < 100 && j >= 0 && j < 100) {
                    var outputcase = '';
                    var thecase = fullmap[j][i];
                    if (thecase.file) {
                        var r = 207;
                        var g = 212 - (j + i);
                        var b = 134 - (j + i);
                        html += '<td class="casemap" style="background-color:rgb(' + r + ',' + g + ',' + b + ');" data-y="' + environ_y + '" data-x="' + environ_x + '">';
                        environs[environ_x][environ_y] = thecase;
                        outputcase = '<div class="hidden caseinfo">' + thecase.nom + '</div>!';
                    } else if (thecase.id && !thecase.file) {
                        var r = 220;
                        var g = 222 - (i);
                        var b = 194 - (j + i);
                        html += '<td style="background-color:rgb(' + r + ',' + g + ',' + b + ');" data-y="' + environ_y + '" data-x="' + environ_x + '">';
                        outputcase = '.';
                    }
                    if (environ_x === 4 && environ_y === 4) {
                        outputcase = '@';
                    }
                    html += outputcase;
                } else {
                    html += '<td class="blankmap" data-y="' + environ_y + '" data-x="' + environ_x + '">';
                }
                environ_x++;
                html += '</td>';
            }
            environ_y++;
            html += '</tr>';
        }
        $('#minimaptable').html(html);
    }


    function connect(token, user) {

        /* auth & connexion */
        var ws = new WebSocket('ws://51.15.167.221:8080/' + token + '-' + user);

        setTimeout(function () {
            if (ws.readyState != 1) {
                alert('serveur inaccessible');
            }
            if ($('#updatemap').val()) {
                var obj = {};
                obj.command = 'updateallmap';
                obj.value = 1;
                var json = JSON.stringify(obj);
                ws.send(json);
                $('#updatemap').val('');
                x = $('#updatemap').data('x');
                y = $('#updatemap').data('y');
                console.log(x);
                fullmap[x][y] = {
                    id: '?',
                    file: "penis",
                }
            }
        }, 3000);





        window.closeIframe = function () {
            $('#editbloc').html('').hide();
            var obj = {};
            obj.command = 'move';
            obj.value = null;
            var json = JSON.stringify(obj);
            ws.send(json);
        }



        /* message */
        ws.onmessage = function (event) {
            var message = JSON.parse(event.data);
            console.log(message);
            /* chat log */
            if (message.message) {
                $('#chat').append('<br/>' + message.user + ' : ' + message.message);
            }

            /* update stats */
            if (message.update) {
                var update = message.update;
                $.each(update, function (index, value) {
                    $('#' + index + ' .value').html(value);
                });
            }

            /*full map gros */
            if (message.fullmap) {
                fullmap = message.fullmap;
            }

            /*
             * update hand only
             */
            if (message.updateHand) {
                updateHand(message.updateHand);
            }


            /*update card manager */
            if (message.deck) {
                updateCardManager(message.deck);
            }
            
            


            /* list people in chat */
            if (message.command === 'list') {
                var list = message.data;
                $('#people .content').html('');
                $.each(list, function (index, value) {
                    $('#people .content').append(value + '<br/>');
                });
            }

            /* whos there map */
            if (message.whosthere) {
                var list = message.whosthere;
                console.log(list);
                var folder = $('#peoplehere').data('folder');
                $('#peoplehere').html('');
                var n = 0;
                $.each(list, function (index, value) {
                    if (value.id != $('#nom').data('id')) {
                        var offset = n * 100;
                        var html = '<div id="player' + value.id + '" style="margin-top:' + offset + 'px;" class="otherpeople card" data-id="' + value.id + '" data-username="' + value.username + '">\n\
<img data-id="' + value.id + '" src="' + folder + value.file + '" />';
                        html += '<div class="peopleinfo">' + value.username + ': ' + value.speak + '</div></div>';
                        $('#peoplehere').append(html);
                        n++;
                    }
                });
            }


            /*  reception map presente   */
            if (message.map) {
                var delay = 200;
                var title = message.map.name;
                var desc = message.map.description;
                var file = message.map.file;
                // console.log(message.map.x + ' ' + message.map.y);

                getEnvirons(message.map.x, message.map.y);
                $('#edit-link').hide();
                $('.fade').fadeOut(delay);
                $('.fade2').fadeOut(delay);
                $('.fade3').fadeOut(delay);
                $('#imagebg').fadeOut(delay);

                var folder = $('#mapimage').data('folder');
                if (message.map.user_id === $('#nom').data('id') || !message.map.user_id) {
                    $('#edit-link').show();
                }
                $('#edit-link').attr('data-idmap', message.map.id);
                timer1 = setTimeout(function () {
                    if (file) {
                        $('#imagebg').attr('src', folder + file + '?dummy=' + Math.floor(Math.random() * 999) + 1);
                    }

                }
                , delay);
                timer2 = setTimeout(function () {
                    $('#map .title .place').html(title);
                    $('#map .desc').html(desc);
                    $('.fade').fadeIn(400);
                    if (message.map.file) {
                        $('#imagebg').fadeIn(400);
                    }
                }, delay + 100);
                timer3 = setTimeout(function () {
                    $('.fade2').fadeIn(200);
                }, 1000);
                timer4 = setTimeout(function () {
                    $('.fade3').fadeIn(200);
                }, 1500);

            }


            /* restore opponent */
            if (message.opponent) {
                isolateOpponent(message.opponent);
            }

            if (message.cheater) {
                alert(message.cheater);
            }

            /* duel offline engaged */

            if (message.duel === 'go') {
                duelInit(message, ws);
            }

            if (message.duel === 'playerCard') {
                playerCard(message.data);
            }

            if (message.duel === 'update') {
                duelUpdate(message, ws);
            }
        };
        
        /*
         * Play Card Front Animation
         * CLICK ON YOUR CARD
         */
        $(document).on('click', '.activehandcard', function () {
            var turn = $('#turn').html();
            $(this).addClass('waitforposition').addClass('turnactive').removeClass('playerhandcard').addClass('turnposed'+turn);
            positionCard(null);           
            $('.activehandcard').removeClass('command').removeClass('activehandcard');            
            setTimeout(function () {
                /* replace other cards */
                $('.playerhandcard').addClass('waitforposition');
                currentHCase=0;
                positionCard('H');
            }, 1000);            
        });

        /* play OK play IA */
        $(document).on('click','.updateturns',function(){
            
        });


        /* send chat */
        $('#chatte').click(function () {
            var obj = {};
            obj.command = 'chat';
            obj.value = $('#inpute').val();
            var json = JSON.stringify(obj);
            ws.send(json);
            $('#inpute').val('');
        });

        /* send command standard */
        $(document).on('click', '.command', function () {
            var obj = {};
            obj.command = $(this).data('command');
            obj.value = $(this).data('value');
            var json = JSON.stringify(obj);
            console.log('send command ' + obj.command + ' ' + obj.value);
            try {
                ws.send(json);
            } catch (e) {
                window.location.reload();
            }
        });



        /* move command */
        $('.move .command').click(function () {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            $('#duelbg').fadeOut(700);
        });


        $('.infolieu').mouseover(function () {
            $(this).fadeOut(600);
        });



        /* click on people */
        $(document).on('click', '.otherpeople', function () {

            $('#imagebg').data('desc', $('.desc').html());
            $('#duelbg').fadeIn(700);
            var id_target = $(this).data('id');
            isolateOpponent(id_target);

            $('.desc').html('<strong>' + $(this).data('username') + '</strong> est là, et vous observe avec provocation.');
            $('.desc').append('<br/>Que voulez faire avec lui ? <br/><br/>');
            $('.desc').append('<li><a href="#duel">Examiner</a></li>');
            $('.desc').append('<li><a href="#duel" class="command" data-command="duel" data-value="' + id_target + '">Attaquer</a></li>');
            $('.desc').append('<li><a href="#duel">Echanger</a></li>');
            $('.desc').append('<li><a id="annuler" href="#duel">Annuler</a></li>');
        })

        $(document).on('click', '#annuler', function () {
            $('#duelbg').fadeOut(700);
            $('.desc').html($('#imagebg').data('desc'));
            $('.otherpeople').animate({opacity: 1}, 700, 'linear');
        });

        $('#closecardmanager').click(function () {
            $('#positionner').html('');
            $('.managercard').remove();
            $('#cardmanager').hide();
        });

        $('#reload').click(function () {
            $(this).addClass('disabled');
        });

    }

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                $('#left').trigger('click');
                break;

            case 38: // up
                $('#up').trigger('click');
                break;

            case 39: // right
                $('#right').trigger('click');
                break;

            case 40: // down
                $('#down').trigger('click');
                break;

            default:
                return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });




    /* END DOM READ*/
});
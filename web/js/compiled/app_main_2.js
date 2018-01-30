/* Fromage Interactif ALL RIGHTS RESERVED */

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

function isolateOpponent(id_target) {
    $('.otherpeople').each(function () {
        if ($(this).data('id') != id_target) {
            $(this).animate({opacity: 0.0}, 700, 'linear');
        }
    })    
    $('#player'+id_target).css('margin-top','0px');
}

var allowedToPlay = 0;

function updateStats(player,opponent) {
    $('#pstats .life').html(player.life);
    $('#pstats .karma').html(player.karma);
    $('#pstats .sex').html(player.sex);
    $('#pstats .sanity').html(player.sanity);
    
    $('#ostats .life').html(opponent.life);
    $('#ostats .karma').html(opponent.karma);
    $('#ostats .sex').html(opponent.sex);
    $('#ostats .sanity').html(opponent.sanity);
}

function duelInit(message) {
    var data = message.data;
    var opponent = message.data.ennemy;
    var player = message.data.player;
    $('.mapStuff').hide();
    $('.duelstuff').show();
    $('#duel').show();
    var html = '';
    for (i = 0; i < 6; i++) {
        console.log(data.hand[i]);
        var offset = i * 120;
        html += '<div style="margin-left:' + offset + 'px;" class="card handcard command activehandcard playerhandcard" data-command="playcard" data-value="' + data.hand[i].deck_id + '">';
        html += '<div class="name">' + data.hand[i].name + '</div>';
        html += '<div class="carddesc">' + data.hand[i].description + '</div>';
        html += '<div class="cardeffect">' + data.hand[i].effect + '</div>';
        html += '</div>';
    }
    $('#hand').html(html);
    duelUpdate(message);
}

function duelUpdate(message) {
    var data = message.data;
    var opponent = message.data.ennemy;
    var player = message.data.player;
    allowedToPlay = data.allowedToPlay;
    if(allowedToPlay){
        $('.playerhandcard').addClass('command').addClass('activehandcard');
        var nextAttacker = player;
        var nextDefender = opponent;
    } else{
        $('.playerhandcard').removeClass('command').removeClass('activehandcard');
        var nextAttacker = opponent;
        var nextDefender = player;
    }
    updateStats(player, opponent);
    $('#turn').html(message.data.duelTurn);
    var text='';
    if (message.data.last.totalDamage > 0) { // classic damage
        var damage = message.data.last;
        text += '<p class="action">' + damage.attacker + ' a infligé ' + damage.totalDamage + ' points de dommages à ' + damage.defenser + ' avec ' + damage.card.name + ' ! </p>';

    }
    text += "<p>C'est à " + nextAttacker.username + " de jouer.</p>";
    $('#dueldesc').html(text);
}










$(document).ready(function () {
    /* DOM READY */
    if ($('#token').val()) {
        connect($('#token').val(), $('#user').val());
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
        var environ_x = 0; var environ_y = 0;
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
                        outputcase = '<div class="hidden caseinfo">'+thecase.nom+'</div>!';
                    } 
                    else if (thecase.id && !thecase.file){
                        var r = 220 ;
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
                $('#chat').html('Erreur de connexion : <a href="">Réessayer ? </a>');
            }
            if($('#updatemap').val()) {
                var obj = {};
                obj.command = 'updateallmap';
                obj.value = 1;
                var json = JSON.stringify(obj);
                ws.send(json);
                $('#updatemap').val('');
                x = $('#updatemap').data('x'); y = $('#updatemap').data('y');
                console.log(x);
                fullmap[x][y]= {
                    id : '?',
                    file : "penis",
                }
            }
        }, 3000);
        
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
                $('.centralCol').fadeOut(delay);
                var folder = $('#mapimage').data('folder');
                if (message.map.user_id === $('#nom').data('id') || !message.map.user_id){
                    $('#edit-link').show();
                }
                $('#edit-link').attr('data-idmap', message.map.id);
                timer1 = setTimeout(function () {
                    if (file) {
                        $('#imagebg').attr('src', folder + file + '?dummy=' + Math.floor(Math.random() * 999) + 1);
                    }
                    $('.centralCol').fadeIn(delay * 2);
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
            
            if(message.cheater){
                alert(message.cheater);
            }
            
            /* duel offline engaged */
            
            if (message.duel === 'go') {
                duelInit(message);
            }
            
            if(message.duel === 'update'){
                duelUpdate(message);
            }

        }
        $(document).on('click','.activehandcard',function(){
            var offset = $('#turn').html() * 75 - 75;
            $(this).addClass('posed');
            $(this).css('margin-left',offset);
            $('.activehandcard').removeClass('command').removeClass('activehandcard');
        })

        /* send chat */
        $('#chatte').click(function () {
            var obj = {};
            obj.command = 'chat';
            obj.value = $('#inpute').val();
            var json = JSON.stringify(obj);
            ws.send(json);
            $('#inpute').val('');
        })

        /* send command standard */
        $(document).on('click','.command',function () {            
            var obj = {};
            obj.command = $(this).data('command');
            obj.value = $(this).data('value');
            var json = JSON.stringify(obj);
            console.log('send command '+obj.command+' '+obj.value);
            ws.send(json);
        })

        /*edit link */
        $('#edit-link').click(function () {
            var route = $(this).data('route');
            var idmap = $(this).data('idmap');
            window.location.replace(route + '?idmap=' + idmap);
        })

        /* move command */
        $('.move .command').click(function () {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            $('#duelbg').fadeOut(700);
        })


        $('.infolieu').mouseover(function () {
            $(this).fadeOut(600);
        })

        $('.fullload').click(function () {
            $('#wrapper').hide();
            $('#loader').show();
        })
        
        /* click on people */
        $(document).on('click','.otherpeople',function(){
            
            $('#imagebg').data('desc',$('.desc').html());
            $('#duelbg').fadeIn(700);
            var id_target = $(this).data('id');
            isolateOpponent(id_target);
            
            $('.desc').html('<strong>' + $(this).data('username')+'</strong> est là, et vous observe avec provocation.');
            $('.desc').append('<br/>Que voulez faire avec lui ? <br/><br/>');
            $('.desc').append('<li><a href="#duel">Examiner</a></li>');
            $('.desc').append('<li><a href="#duel" class="command" data-command="duel" data-value="'+id_target+'">Attaquer</a></li>');
            $('.desc').append('<li><a href="#duel">Echanger</a></li>');            
            $('.desc').append('<li><a id="annuler" href="#duel">Annuler</a></li>');
        })
        
        $(document).on('click','#annuler',function(){
            $('#duelbg').fadeOut(700);
            $('.desc').html($('#imagebg').data('desc'));
            $('.otherpeople').animate({opacity: 1}, 700, 'linear');
        });
        
        
        
    }

$(document).keydown(function(e) {
    switch(e.which) {
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

        default: return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});




    /* END DOM READ*/
});
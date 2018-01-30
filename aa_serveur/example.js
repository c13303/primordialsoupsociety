
var clients = [];
var client_name = [];
var position = {};
var ping = {};

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'c13303',
    password: 'jn3h02asdOeKjzHk',
    database: 'cehiho'
});
connection.connect();
// map_generation();


function toObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        rv[i] = arr[i];
    return rv;
}
function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i] == needle)
            return true;
    }
    return false;
}
var getQueryString = function (field, url) {
    var href = url ? url : window.location.href;
    var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
    var string = reg.exec(href);
    return string ? string[1] : null;
};




/*
 * 
 * TEST CLASS
 * 
 */



var Map = require('./nodejs_classes/map');
var Inventory = require('./nodejs_classes/inventory');
var Notices = require('./nodejs_classes/notices');
var Users = require('./nodejs_classes/users');
var Npc = require('./nodejs_classes/npc');





function erreur(ws, what)
{
    console.log('ERREUR ' + what);
    index = clients.indexOf(ws);
    disconnecting_name = client_name[index];
    clients.splice(index, 1);
    client_name.splice(index, 1);
    console.log(disconnecting_name + ' left the game');
    ws.disconnect();
}






function map_generation()
{
    connection.query('TRUNCATE TABLE `rooms`');
    connection.query('TRUNCATE TABLE `ours`');
    var width = 16;
    var height = 16;
    var room_types = ["home", "anpe", "bar", "rue", "empty"];
    var map = [];
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var de = Math.floor((Math.random() * room_types.length) + 0);
            var z = 0;
            connection.query('INSERT INTO rooms(id,name,x,y,z) VALUES(NULL,"' + room_types[de] + '",' + x + ',' + y + ',' + z + ')', function (err, rows, fields) {
            });
        }
    }
}
function get_Case(x, y, z, callback) {
    connection.query('SELECT id as room_id,name as room_name FROM rooms WHERE x=' + x + ' AND y=' + y + ' AND z=' + z + '', [], function (err, result)
    {
        if (err) {
            console.log(err);
        } else
        {
            callback(result);
        }
    });
}
function check_door(come_from, x, y, z)
{

    var original = get_Case(x, y, z, function (original) { // original        
        var droite = get_Case(x + 1, y, z, function (droite) { // original
            var gauche = get_Case(x - 1, y, z, function (gauche) { // original
                var top = get_Case(x, y + 1, z, function (top) { // original
                    var bottom = get_Case(x, y - 1, z, function (bottom) { // original

                        var result = {};

                        result.origin = original;
                        result.top = top;
                        result.right = droite;
                        result.left = gauche;
                        result.bottom = bottom;
                        return(result);

                    });
                });
            });
        });
    });

}














var WebSocketServer = require('ws').Server, wss = new WebSocketServer(
        {
            port: 8080,
            verifyClient: function (info, callback) {      /* AUTHENTIFICATION */

                var urlinfo = info.req.url;
                var cred_name = getQueryString('name', urlinfo);
                var cred_pass = getQueryString('token', urlinfo);
                console.log(cred_name + ' / ' + cred_pass);
                /*
                 var crypto = require('crypto');
                 var md5sum = crypto.createHash('md5').update(cred_pass).digest("hex");
                 */
                var query = 'SELECT id FROM ours WHERE name="' + cred_name + '" AND password="' + cred_pass + '"';
                console.log(query);
                connection.query(query, function (err, rows, fields) {

                    if (rows[0] && rows[0].id)
                    {
                        callback(true);
                        console.log('access granted');
                    } else
                    {
                        console.log('access deiné');
                        callback(false);

                    }


                });
            }
        }
);

wss.on('connection', function aconnection(ws) {
    console.log('--- CEHIHO SERVER STARTED ----');

    /* load map at connect */
    connection.query('SELECT *,1 as map_loaded FROM rooms ORDER BY x,y', function (err, rows, fields) {
        ws.send(JSON.stringify(rows));
    });



    /*read messages */
    ws.on('message', function incoming(message) {


        try
        {
            var json = JSON.parse(message);
        } catch (e)
        {
            console.log('invalid json');
            ws.send(JSON.stringify(e));
        }

        if (json)
        {
            var data = json.data;

            if (data.action == "init_player") //// on recoit id_player = initialisation player
            {

                console.log('> INIT : ' + data.player_name);
                clients.push(ws); //add client to list of active clients  
                client_name.push(data.player_name);


                connection.query('SELECT id,name,skin,x,y,z,screen_x,screen_y FROM ours WHERE name="' + data.player_name + '"', function (err, rows, fields) {
                    if (err)
                        throw err;
                    /* NEW PLAYER */
                    var ours = {"name": ""};

                    /*
                     * 
                     * LOAD PLAYER EXISTANT
                     * 
                     */
                    var C2array = [];
                    var nb = 0;
                    /* change SQL object to C2 array */
                    for (var i = 0, len = rows.length; i < len; i++) {
                        var ours = rows[i];
                        if (ours.screen_x == 0)
                            ours.screen_x = 300;
                        if (ours.screen_y == 0)
                            ours.screen_y = 300;
                        C2array.push([[ours.id], [ours.name], [ours.skin], [ours.x], [ours.y], [ours.z], ["player"], [ours.screen_x], [ours.screen_y]]);
                    }

                    var output_data = {
                        "c2array": true,
                        "size": [1, 9, 1],
                        "data":
                                C2array

                    };
                    var response_object = {
                        "c2dictionary": true,
                        "data": {
                            "contenu": output_data,
                            "nature": "init_player"
                        }

                    };
                    ws.send(JSON.stringify(response_object));
                    position[ours.name] = ours.x + "-" + ours.y + "-" + ours.z;



                });
            }












            if (data.command)
            {
                console.log('>>>> command : ' + data.command + ', from player : ' + data.player_name);
            }

            /*
             * 
             *  PLAYER CREATE
             */






            /*
             * 
             * 
             * 
             * 
             *  CHAT RECEPTION
             * 
             * 
             * 
             */

            if (data.chat)
            {
                console.log('SPOKEN CHAT : ' + data.chatteur + ' : ' + data.chat);
                // console.log(position);
                var chat = data.chat;
                
                
               

                /*
                 * 
                 *  CREATION OBJET
                 */
                if (chat.match("^add "))
                {
                    var what = chat.slice(4);
                    console.log('Object ' + what + ' asked');
                    var what_array = what.split(' ');
                    var what = what_array[0];



                    data.what = what;

                    if (what)
                    {
                        connection.query('SELECT count(id) as coune FROM map WHERE\n\
x= ' + data.x + ' AND y = ' + data.y + ' AND z = ' + data.z + ' AND screen_x = ' + data.screen_x + ' AND screen_y = ' + data.screen_y + '', function (err, rows, fields) {
                            if (err)
                                throw err;
                            else
                            {
                                console.log(rows);
                                var res = rows[0];
                                if (res.coune > 0)
                                {
                                    console.log('objet present');
                                    /* stackables ? */

                                } else
                                {
                                    console.log('free');

                                    var my_map = new Map(connection, data, 1);
                                    my_map.save(5);
                                    my_map.send_all_objects(ws, 0, data, clients, client_name, position, Notices);

                                }


                            }
                        });




                    }

                }


                /*
                 * 
                 * REGULAR CHAT NOTICE
                 */
                var msg_position = data.x + '-' + data.y + '-' + data.z;
                console.log('Message envoye dans ' + msg_position);
                for (var i = 0; i < clients.length; i++) {
                    client = clients[i];
                    sending_name = client_name[i];
                    positione = position[sending_name];
                    if (positione == msg_position)
                    {
                        console.log('-> Présence : ' + sending_name + ':' + positione);

                        var data_output = {
                            "c2dictionary": true,
                            "data": {
                                "chat_notif": 1,
                                "auteur": data.chatteur,
                                "message": data.chat
                            }
                        };
                        client.send(JSON.stringify(data_output));
                    }

                }
            } /// end chat



            /*
             *  TAKE OBJECT
             */
            if (data.command == "take_item")
            {

                console.log("take item " + data.what + " x " + data.qt);

                data.qt = parseInt(data.qt);
                if (!data.qt)
                    data.qt = 1;



                var my_map = new Map(connection, data, 1);

                my_map.delete(data.qt, function () {
                    my_map.send_all_objects(ws, 0, data, clients, client_name, position, Notices); // notif refresh objets ours presents case

                    /* inventory add */

                    var my_inv = new Inventory(connection, data.player_id, data.what, data.qt);
                    my_inv.save(function (callback) {
                        my_inv.refresh_inventory(ws);
                    });
                }); // delete item





            }


            /* GET INVENTORY */
            if (data.command == "get_inventory")
            {
                var inv_obj = new Inventory(connection, data.player_id, null, 1);
                inv_obj.refresh_inventory(ws);
            }

            
            if (data.command == "save_grid")
            {
                var data2 = JSON.parse(data.what);
                console.log(data2.data);
                for (var x = 0; x < 6; x++)
                {
                    for (var y = 0; y < 4; y++)
                    {
                        console.log(x+','+y+':'+data2[x]);
                    }
                }

            }
            
            
            /* LOAD NPC */
            if(data.command =="get_npcs")
            {
                var npc_methods = new Npc(connection);
                npc_methods.load_from_case(data.x,data.y,data.z,function(callback){
                    console.log(callback);
                    if(callback)
                    {
                        var data_output = {
                                     "c2dictionary": true,
                                        "data": {
                                        "return": "send_npcs",
                                        "what": JSON.stringify(callback)

                                        }
                                     };
                        ws.send(JSON.stringify(data_output));
                    }
                    
                });
                
                
            }








            /* DROP ITEM */
            if (data.command == "drop")
            {

                /*
                 * 
                 * check if case free .... 
                 */
                var my_map = new Map(connection, data, 1);
                my_map.load_case(function (callback) {
                    if (callback)
                    {
                        if (callback.what == data.what)
                        {
                            /* stack */
                        } else
                        {
                            /* forbid */
                            console.log('no drop allowed : different item');
                        }
                    } else
                    {
                        /*
                         * 
                         * add to case
                         */

                        var todrop = data.qt;
                        var item = new Inventory(connection, data.player_id, 0, 0);
                        item.load(data.what, function (callback) {    /// load objet inventory
                            console.log('Item DROP : x ' + data.qt);
                            item.qt = callback.qt;
                            item.type = callback.type;
                            item.what = callback.what;

                            if (callback.type == 'consume' || callback.type == 'weapon')
                            {
                                /* remove */
                                item.remove(parseInt(data.qt), function (callback) {

                                    item.refresh_inventory(ws);

                                    

                                    /* add on map */

                                    var my_map = new Map(connection, data, 1);
                                    my_map.save(data.qt);
                                    my_map.send_all_objects(ws, 0, data, clients, client_name, position, Notices);
                                });



                            }
                        });
                    }
                });




            }

            /* USE ITEM */
            if (data.command == "use_item")
            {

                var item = new Inventory(connection, data.player_id, 0, 0);
                item.load(data.what, function (callback) {
                    console.log('Item USE : ' + callback.type);
                    item.qt = callback.qt;
                    item.type = callback.type;
                    item.what = callback.what;
                    if (callback.type == 'consume')
                    {
                        item.remove(1, function (callback) {

                            item.refresh_inventory(ws);

                            var data_output = {
                                "c2dictionary": true,
                                "data": {
                                    "notice_type": "use_item",
                                    "what": callback.what,
                                    "qt": callback.qt
                                }
                            };
                            // new Notices(data, clients, client_name, position, JSON.stringify(data_output));
                            ws.send(JSON.stringify(data_output));

                        });
                    }
                });
            }





            /*
             *  CHECK DOOR
             */
            if (data.command == "get_doors")
            {
                var x = data.x;
                var y = data.y;
                var z = data.z;
                var result = {};
                var original = get_Case(x, y, z, function (original) { // original        
                    var droite = get_Case(x + 1, y, z, function (droite) { // original
                        var gauche = get_Case(x - 1, y, z, function (gauche) { // original
                            var top = get_Case(x, y + 1, z, function (top) { // original
                                var bottom = get_Case(x, y - 1, z, function (bottom) { // original
                                    var result = {};
                                    result.origin = original;
                                    result.top = top;
                                    result.right = droite;
                                    result.left = gauche;
                                    result.bottom = bottom;
                                    result.return = 'get_doors';
                                    ws.send(JSON.stringify(result));

                                });
                            });
                        });
                    });
                });


            }














            /*
             *  PLAYER LEAVE ROOM
             *  
             *  
             *  
             */
            if (data.disconnect > 0)
            {
                var leave_position = data.x + "-" + data.y + "-" + data.z;
                for (var i = 0; i < clients.length; i++) {
                    var client = clients[i];
                    if (position[client_name[i]] == leave_position && client_name[i] != data.player_name)
                    {
                        var data_ouput = {
                            "c2dictionary": true,
                            "data": {
                                "leave": data.player_id,
                                "player_name": data.player_name,
                                "door": data.come_from
                            }
                        };
                        client.send(JSON.stringify(data_ouput));
                    }
                }
            }



            /*
             * 
             *  PLAYER CLICK UPDATE
             */

            if (data.command == 'player_clic')
            {
                connection.query('UPDATE ours SET x=' + data.x + ',y=' + data.y + ',z=' + data.z + ',screen_x=' + data.dest_x + ',screen_y=' + data.dest_y + ' WHERE id=' + data.player_id + '', function (err, rows, fields) {
                });

                position[data.player_name] = data.x + "-" + data.y + "-" + data.z;
                for (var i = 0; i < clients.length; i++) {
                    var client = clients[i];
                    var connected_name = client_name[i];
                    positione = position[connected_name];
                    if (positione == position[data.player_name] && connected_name != data.player_name)
                    {
                        console.log('-> clic move notificatin');
                        var data_ouput = {
                            "c2dictionary": true,
                            "data": {
                                "return": "clic_move",
                                "player_id": data.player_id,
                                "dest_x": data.dest_x,
                                "dest_y": data.dest_y,
                                "going_out": data.going_out
                            }
                        };
                        client.send(JSON.stringify(data_ouput));
                    }
                }
            }


            /*
             * 
             *  PLAYER UPDATE + NOTIFY
             * 
             */

            if (data.command == 'player_update')
            {

                var come_from = data.come_from;
                /* UPDATE SQL */
                connection.query('UPDATE ours SET x=' + data.x + ',y=' + data.y + ',z=' + data.z + ',screen_x=' + data.screen_x + ',screen_y=' + data.screen_y + ' WHERE id=' + data.player_id + '', function (err, rows, fields) {
                    if (err)
                        throw err;
                    else
                    {

                        position[data.player_name] = data.x + "-" + data.y + "-" + data.z;
                        console.log('> UPDATE : ' + data.player_name + ' > position ' + position[data.player_name]);



                        var data_ouput = {
                            "c2dictionary": true,
                            "data": {
                                "return": "player_updated",
                            }
                        };
                        ws.send(JSON.stringify(data_ouput));

                        /* NOTIFY OTHER PLAYERS  */

                        for (var i = 0; i < clients.length; i++) {
                            var client = clients[i];
                            var connected_name = client_name[i];
                            positione = position[connected_name];
                            if (positione == position[data.player_name] && connected_name != data.player_name)
                            {
                                console.log('-> ' + connected_name + ' est dans la meme room:' + positione);
                                var data_ouput = {
                                    "c2dictionary": true,
                                    "data": {
                                        "newcomer": 1,
                                        "player_name": data.player_name,
                                        "skin": data.skin,
                                        "id": data.player_id,
                                        "screen_x": data.screen_x,
                                        "screen_y": data.screen_y,
                                        "come_from": come_from
                                    }
                                };
                                client.send(JSON.stringify(data_ouput));
                            }
                        }


                    } /// end player update inner


                });
            } //// end player update outer



            if (data.command == 'load_players_in_case')
            {
                /* LOAD ALL BEARS <3 
                 * 
                 * Renvoie au player qui update : la liste des ours de sa room
                 * 
                 * */


                connection.query('SELECT id,name,skin,screen_x,screen_y FROM ours WHERE  x=' + data.x + ' AND y='
                        + data.y + " AND z=" + data.z, function (err, rows, fields) {
                            if (err)
                                throw err;
                            var data = [];
                            var nb = 0;
                            /* change SQL object to C2 array */
                            for (var i = 0, len = rows.length; i < len; i++) {
                                var ours = rows[i];
                                var is_online = 0;
                                if (inArray(ours.name, client_name))
                                {
                                    is_online = 1;

                                }
                                data.push([[ours.id], [ours.name], [ours.skin], [is_online], [ours.screen_x], [ours.screen_y]]);
                                nb++;
                            }


                            output_data = {
                                "c2array": true,
                                "size": [nb, 6, 1],
                                "data": data

                            };


                            var response_object = {
                                "c2dictionary": true,
                                "data": {
                                    "contenu": output_data,
                                    "nature": "load_players"
                                }

                            };
                            ws.send(JSON.stringify(response_object));

                        });




            }


            /*
             *  CHARGEMENT BIBLE OBJETS
             */
            if (data.command == 'load_bible')
            {
                connection.query('SELECT * FROM bible_items;', function (err, rows, fields) {
                    if (err)
                        throw err;
                    var myobjects = {};
                    for (var i = 0; i < rows.length; ++i)
                    {
                        myobjects[i] = rows[i];
                    }
                    var response_object = {
                        "c2dictionary": true,
                        "data": {
                            "contenu": myobjects,
                            "return": "load_bible"
                        }
                    };
                    ws.send(JSON.stringify(response_object));

                });
            }









            /* CHARGEMENT objets pour solo */

            if (data.command == 'load_objects')
            {
                var my_map = new Map(connection, data, 1);
                my_map.send_all_objects(ws, 1, data, clients, client_name, position, Notices);
            }




        }


    });


    ws.on('close', function (message) {
        //Remove the disconnecting client from the list of clients
        index = clients.indexOf(ws);
        disconnecting_name = client_name[index];
        clients.splice(index, 1);
        client_name.splice(index, 1);
        console.log(disconnecting_name + ' left the game');

    });
});



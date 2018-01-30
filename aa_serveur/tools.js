/* Fromage Interactif ALL RIGHTS RESERVED */

module.exports = {
    matrix: function (rows, cols, defaultValue) {
        var arr = [];
        for (var i = 0; i < rows; i++) {
            arr.push([]);
            arr[i].push(new Array(cols));
            for (var j = 0; j < cols; j++) {
                arr[i][j] = defaultValue;
            }
        }
        return arr;
    },
    shuffle: function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }


        return array;
    },
    describeCardEffet: function (card) {
        var desc = '';
        if (card.type == 'Damage') {
            desc += 'Provoque un dommage de ';
        }
        if (card.type == 'Buff') {
            desc += 'Provoque un boost de ';
        }
        if (card.karma) {
            desc += card.karma + ' points de Karma,';
        }
        if (card.sex) {
            desc += card.sex + ' points de Sex-Appeal,';
        }
        if (card.sanity) {
            desc += card.sanity + ' points de Santé Mentale,';
        }
        if (card.turns) {
            desc += ' pour ' + card.turns + ' tours';
        }
        return(desc);

    },
    sixFirst: function (ws,cardIndex) { /// building the hand 6 Card for front play
        var deck = ws.deck;
        var index = cardIndex;
        var result = {};
        for (i = 0; i < 6; i++) {
            var card_id = deck[i].card_id;
            var deck_id = deck[i].id;
            result[i] = index[card_id];
            result[i].effect = module.exports.describeCardEffet(index[card_id]);
            result[i].deck_id = deck_id;
        }
        return(result);
    },
    calculateStrike(attacker,defenser,table,cardIndex){        
        
        var result = {};
        
        result.attackKar = attacker.karma;
        result.attackSex = attacker.sex;
        result.attackSan = attacker.sanity;
        
        result.defenseKar = defenser.karma;
        result.defenseSex = defenser.sex;
        result.defenseSan = defenser.sanity;        
        
        var effects = [];        
        for (i = 0; i < table.length; i++) {
            if (table[i]) {
                var id_card = table[i].id;
                var card = cardIndex[id_card];
                var cardPosee = table[i];

                if (card.special_name) {
                    effects.push(card.special_name);
                }
                if ((card.type === 'Damage' || card.type === 'Buff') && attacker.id === cardPosee.player) {
                    result.attackKar += card.karma;
                    result.attackSex += card.sex;
                    result.attackSan += card.sanity;
                }

                if ((card.type === 'Defense' || card.type === 'Buff') && defenser.id === table.player) {
                    result.defenseKar += card.karma;
                    result.defenseSex += card.sex;
                    result.defenseSan += card.sanity;
                }
            }
        }
        
        /* SEX > KARMA > SAN >
         * 
         *  Karma : Dominated by Sex (double shield)
         *  Karma : Dominate Sanity (ignore)
         *  Karma : Equaled by Karma
         *    
         *    */
        
        result.totalKar = result.attackKar - result.defenseKar - (result.defenseSex * 2);
        result.totalSex = result.attackSex - result.defenseSex - (result.defenseSan * 2);
        result.totalSan = result.attackSan - result.defenseSan - (result.defenseKar * 2);
        
        result.totalDamage = result.totalKar + result.totalSex + result.totalSan;
        
        result.effects = effects;
        result.attacker = attacker.username;
        result.defenser = defenser.username;
        
        result.card = card;
        
        return(result);
    }

};



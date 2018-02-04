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
        while (0 !== currentIndex) {            
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;            
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    },
    describeCardEffet: function (card) {
        var desc = '';
        if (card.type == 'Damage') {
            desc += '<div class="damage icgp">';
        }
        if (card.type == 'Buff') {
            desc += '<div class="buff icgp">';
        }
        if (card.karma) {
            desc += '<div class="ikar ic">'+ card.karma + '</div> ';
        }
        if (card.sanity) {
            desc += '<div class="isan ic">'+card.sanity + '</div>';
        }
        if (card.sex) {
            desc += '<div class="isex ic">'+card.sex + '</div>';
        }
        
        if (card.turns) {
            desc += ' <div class="tur ic">' + card.turns + ' </div>';
        }
        
        desc += '</div>';
        return(desc);

    },
    sixFirst: function (deck) { /// building the hand 6 Card for front play         
        var result = [];
        for (i = 0; i < 6; i++) {           
            result.push(deck[i]);
        }
        return(result);
    },
    formatAllDeck: function (deck,cardIndex) {
        var index = cardIndex;
        var result = [];
        for (i = 0; i < 30; i++) {
            var card_id = deck[i].card_id;
            var deck_id = deck[i].id;
            result.push(index[card_id]);
            result[i].effect = module.exports.describeCardEffet(index[card_id]);
            result[i].deck_id = deck_id;
        }
        return(result);
    },
    calculateStrike(attacker,defender,table){        
        
        var result = {};
        
        result.attackKar = attacker.karma;
        result.attackSex = attacker.sex;
        result.attackSan = attacker.sanity;
        
        result.defenseKar = defender.karma;
        result.defenseSex = defender.sex;
        result.defenseSan = defender.sanity;        
        
        var effects = [];  
        
        for (i = 0; i < table.length; i++) {
            if (table[i]) {
                var card = table[i].card;
                var cardPosee = table[i];
                if (card.special_name) {
                    effects.push(card.special_name);
                }
                if ((card.type === 'Damage' || card.type === 'Buff') && attacker.id === cardPosee.attacker.id) {
                    result.attackKar += card.karma;
                    result.attackSex += card.sex;
                    result.attackSan += card.sanity;
                }

                if ((card.type === 'Defense' || card.type === 'Buff') && defender.id === cardPosee.defender.id) {
                    result.defenseKar += card.karma;
                    result.defenseSex += card.sex;
                    result.defenseSan += card.sanity;
                }
            }
        }
        
        /*    wheel of power
         * 
         *     SEX  >  KARMA 
         *       ^     v
         *         SAN
         *    
         *    dominate = 1:0  (defense is ignored)
         *    equals = 1:1    (defense has ratio 1)
         *    dominated = 1:2 (defense has double ratio and can inflict return damage !)
         */
        result.totalKar = result.totalSex = result.totalSan = 0;
        if(result.attackKar){
            result.totalKar = result.attackKar - result.defenseKar - (result.defenseSex * 2);
        }
        if(result.attackSex){
            result.totalSex = result.attackSex - result.defenseSex - (result.defenseSan * 2);
        }
        if(result.attackSan){
            result.totalSan = result.attackSan - result.defenseSan - (result.defenseKar * 2);
        }
        
        result.totalDamage = result.totalKar + result.totalSex + result.totalSan;
        
        result.effects = effects;
        result.attacker = attacker.username;
        result.defenser = defender.username;
        
        result.card = card;
        
        return(result);
    }

};



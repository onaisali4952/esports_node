const mysql = require("pg");


// check login credential
const activePlayers = async (req, res) => {

    var pool = require('../controller/database');    

    const query = {
        text : "select players.player_id, players.gamertag, players.ranking, players.value, players.coach_id, players.player_status, players.player_image from players "        
        +" where player_status=$1",
        values: [1],
        rowMode: 'array'
    }

    const client = await pool.connect()

    await client.query(query, (err, playerdata) => {
        console.log(playerdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(playerdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'PlayerList',
                    items: playerdata.rows,
                    fields: playerdata.fields                    
                });    
            }else{
                console.log("No Players found");
                req.flash("info", "Update Players DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

const teams_list = async (req, res) => {

    var pool = require('../controller/database');    

    const query = {
        text : "select teams.team_id, teams.team_name, teams.team_name_short, teams.team_logo from teams ",
        rowMode: 'array'
    }

    const client = await pool.connect()

    await client.query(query, (err, teamdata) => {
        console.log(teamdata);
        if(err){
           // console.log(err);
            return res.redirect('/login');
        }else{
            if(teamdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'PlayerList',
                    items: teamdata.rows,
                    fields: teamdata.fields                    
                });    
            }else{
                console.log("No Teams found");
                req.flash("info", "Update Teams DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

module.exports = {activePlayers, teams_list}
const mysql = require("pg");

const matchesList = async (req, res) => {

    var pool = require('../controller/database');    

    const query = {
        text : "select matches.match_id, matches.match_type_id, tournament_id, matches.match_date, matches.replay_link, matches.played_against, matches.top_performer, matches.match_result, matches.match_location, match_type.match_type_name, array_agg(players.player_image) as player_images, array_agg(players.gamertag) as gamer_tags, a.gamertag as tp, "
        +" case when played_against is null then 'SEN_logo.jpg' else teams.team_logo end as team_logo, to_char(match_date, 'DD Mon, YYYY') as mdate "
        +" from matches  "
        +" join match_type on match_type.match_type_id = matches.match_type_id   join match_participants on match_participants.match_id = matches.match_id   "
        +" join players on match_participants.player_id = players.player_id "
        +" left join teams on matches.played_against = teams.team_name "
        +" join (select players.player_id, players.gamertag, players.player_image from players) as a on a.player_id = matches.top_performer "
        +" group by matches.match_id, match_type.match_type_id , a.gamertag, teams.team_logo ",
        
        rowMode: 'array'
    }

    //console.log(query.text);

    const client = await pool.connect()

    await client.query(query, (err, matchdata) => {
        console.log(matchdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(matchdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'MatchesList',
                    items: matchdata.rows,
                    fields: matchdata.fields                    
                });    
            }else{
                console.log("No Matches found");
                req.flash("info", "Update Matches DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

const playerMatchStat = async (req, res) => {
    var pool = require('../controller/database');    

    var gamertag = req.body.gamertag ;
    var matchid = req.body.matchid ;

    const query = {
        text : "select match_participants.match_id, match_participants.player_id,match_participants.kills, match_participants.deaths, match_participants.assists, match_participants.score, players.gamertag, players.player_image , players.ranking from "
        + " matches "
        + " join match_participants on match_participants.match_id = matches.match_id "
        + " join players on players.player_id = match_participants.player_id "
        + " where players.gamertag=$1 and matches.match_id=$2",
        values : [gamertag, matchid],
        rowMode: 'array'
    }

    console.log(query.text);

    const client = await pool.connect()

    await client.query(query, (err, matchdata) => {
        console.log(matchdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(matchdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'MatchesList',
                    items: matchdata.rows,
                    fields: matchdata.fields                    
                });    
            }else{
                console.log("No Matches found");
                req.flash("info", "Update Matches DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}


const matchesScheduler = async (req, res) => {
    var pool = require('../controller/database');    
    var params = []; 
    
    
    if(req.params['start'] == 'undefined' || req.params['start'] == null){
        MyDate = new Date();
        d = MyDate.getFullYear() +'-' + ('0' + (MyDate.getMonth()+1)).slice(-2)  + '-' + ('0' + MyDate.getDate()).slice(-2) ;
        params.push(d);
    } else {
        params.push(req.params['start']);
    }

    if(req.params['end'] == 'undefined' || req.params['end'] == null){
        MyDate = new Date();
        d = MyDate.getFullYear() +'-' + ('0' + (MyDate.getMonth()+1)).slice(-2)  + '-' + ('0' + MyDate.getDate()).slice(-2) ;
        params.push(d);
    } else {
        params.push(req.params['end']);
    }

    const query = {
        text : "select match_id, concat(match_date,'T01:00:00') as match_start, concat(match_date,'T11:50:00') as match_end, "
        +" played_against, match_location, match_type_name "
        +"  from matches "
        +"  join match_type on match_type.match_type_id=matches.match_type_id "
        +"  where match_date >= $1 and  match_date <= $2",
        values : [params[0], params[1]],
        rowMode: 'array'
    }

    console.log(query.text);
    
    const client = await pool.connect()

    await client.query(query, (err, eventdata) => {
        console.log(eventdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(eventdata.rowCount < 1){                
                res.status(200).jsonp({
                    type:'info',
                    msg : "No Visits Created Yet.",
                    data:''                   
                });           
            } else {
                
                var events =[];    

                for(var k = 0; eventdata.rowCount > k; k++){
                    
                    var bgColor =''; var color=''; var title='';
                    if(eventdata.rows[k][5]=='Match'){
                        bgColor = '#cf0038';
                        color='#ffffff';
                        title= 'Vs\n' +eventdata.rows[k][3]+' '+eventdata.rows[k][4];
                    }else{
                        bgColor = '#000000';
                        color='#ffffff';
                        title= 'Training\n'+eventdata.rows[k][4];
                    }

                    events.push({
                        id: eventdata.rows[k][0],                       
                        editable: 'false',
                        allDay:'true',                        
                        title: title,
                        backgroundColor: bgColor,                       
                        textColor: color,
                        borderColor: '#000000',                        
                        start: eventdata.rows[k][1],
                        end: eventdata.rows[k][2],
                        eventDisplay:"block"
                    });
                }                

                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'Events',
                    data: events,
                    fields: eventdata.fields                    
                });    
            }
           
        }
    })

    client.release()
}


const add_match = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }

    var pool = require('../controller/database');   
    const client = await pool.connect()

    var played_against = req.body.played_against;
    var match_type_id = req.body.match_type_id;
    var match_date = req.body.match_date;
    var reply_link = req.body.reply_link;
    var top_performer = req.body.top_performer;
    var match_result = req.body.match_result;
    var match_location = req.body.match_location;

    var participants = req.body.participants;

    if(played_against == "" || match_type_id == "" || match_date == "" || reply_link == "" || top_performer=="" || participants==""){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Invalid values passed'
        }); 
        return;
    } else {

        const maxidresult = await client.query('select max(match_id)+1 as match_id from matches');
        const newMatchId = maxidresult.rows[0].match_id;

        const insertquery = {
            text: "insert into matches(match_id, match_type_id, match_date, replay_link, played_against, top_performer, match_result, match_location ) "
            +" values($1, $2, $3, $4, $5, $6,$7, $8) ON CONFLICT (match_id) DO NOTHING",
            values:[newMatchId, match_type_id, match_date, reply_link, played_against, top_performer, match_result, match_location],
            rowMode: 'array'   
        }
        const result = await  client.query(insertquery);            
        
        console.log("matchid: " + newMatchId);
            if(newMatchId<0){
                console.log(err);
                res.status(200).jsonp({                                        
                    type:'error', 
                    msg:'Match Not Saved'
                }); 
                return;
            }else{                
                for(x=0; x<participants.length;x++){
                        
                    const p_query ={
                        text:"insert into match_participants(match_id, player_id, kills, deaths, assists, score)"
                        +"values($1,$2,$3,$4,$5,$6)",
                        values:[newMatchId, participants[x].player_id, participants[x].kills, participants[x].deaths, participants[x].assists, participants[x].score]
                    } 
                    await client.query(p_query, (err, pdata) => {
                        if(err){
                            console.log(err);
                            res.status(200).jsonp({                                        
                                type:'error', 
                                msg:'Participant Not Saved'
                            }); 
                            return;
                        }
                    });
                }


                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'Match Saved Successfully.'                                
                });    
            }
        
        
    }


}

module.exports = {matchesList, playerMatchStat, matchesScheduler, add_match}
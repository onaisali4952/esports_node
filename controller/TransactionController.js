const mysql = require("pg");

const transactionList = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }

    var pool = require('../controller/database');   

    const query = {
     text: "select account_voucher.voucher_id, account_heads.account_head_name, "
        +" concat(sponsor.sponsor_id,' ', sponsor.sponsor_name) as sponser_name, concat(employees.first_name,' ',employees.last_name) as employee_name, debit, credit, to_char(account_voucher.time_of_transaction, 'DD Mon, YYYY') as time_of_transaction "
        +" from account_voucher "
        +" join account_heads on account_voucher.id_account_head=account_heads.account_head_id "
        +" left join sponsor on sponsor.sponsor_id =account_voucher.sponsor_id "
        +" left join employees on employees.employee_id = account_voucher.employee_id "
        +" order by account_voucher.time_of_transaction asc",

     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, voucherdata) => {
        //console.log(voucherdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(voucherdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'VoucgherList',
                    items: voucherdata.rows,
                    fields: voucherdata.fields                    
                });    
            }else{
                console.log("No Voucher found");
                res.status(200).jsonp({                                        
                    type:'error', 
                    msg:'No voucher found',
                    items: [],
                    fields: []    
                });    
                //return res.redirect('/login');            
            }
        }
    })

    client.release()

}


const accountheads_list = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }


    var pool = require('../controller/database');   

    const query = {
     text: "select account_heads.account_head_id, account_heads.account_head_name "        
        +" from account_heads ",
     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, acdata) => {
        console.log(acdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(acdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'AccountHeads',
                    items: acdata.rows,
                    fields: acdata.fields                    
                });    
            }else{
                console.log("No Account Heads found");
                req.flash("info", "Update Account head DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

const sponsors_list = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }


    var pool = require('../controller/database');   

    const query = {
     text: "select sponsor.sponsor_id, sponsor.sponsor_name, amount_monthly "        
        +" from sponsor ",
     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, acdata) => {
        console.log(acdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(acdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'Sponsors',
                    items: acdata.rows,
                    fields: acdata.fields                    
                });    
            }else{
                console.log("No Sponsors found");
                req.flash("info", "Update Sponsors DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

const employees_list = async (req, res) => {

    
    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }



    var pool = require('../controller/database');   

    const query = {
     text: "select employees.employee_id, concat(employees.first_name,' ',employees.last_name) as employee_name, salary "        
        +" from employees ",
     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, empdata) => {
        console.log(empdata);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(empdata.rowCount > 0){
                res.status(200).jsonp({                                        
                    type:'success', 
                    msg:'Employees',
                    items: empdata.rows,
                    fields: empdata.fields                    
                });    
            }else{
                console.log("No Employees found");
                req.flash("info", "Update Employee DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}


const add_salary = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }


    var pool = require('../controller/database');   

    var employeeid = req.body.employeeid;
    var salary = req.body.salary;
    var transactiondate = req.body.transactiondate;

    if(employeeid == "" || salary == "" || transactiondate == ""){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Invalid values passed'
        }); 
        return;
    }

    const query = {
     text: "select account_heads.account_head_id "        
        +" from account_heads where upper(account_heads.account_head_name) like 'SALARY%'",
     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, ah) => {
        console.log(ah);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(ah.rowCount > 0){
                var accountheadid = ah.rows[0][0];
                ///insert new transaction
                const insertquery = {
                    text: "insert into account_voucher( id_account_head, time_of_transaction, employee_id, debit, credit ) "
                    +" values($1, $2, $3, $4, $5) ",
                    values:[accountheadid, transactiondate, employeeid, 0, salary]

                }

               // console.log(accountheadid);

                client.query(insertquery, (err, insertID) => {
                   // console.log(insertID);
                    if(err){
                        console.log(err);
                         res.status(200).jsonp({                                        
                                type:'error', 
                                msg:'Salary Not Saved'
                            }); 
                    }else{
                        if(insertID < 0){                           
                            res.status(200).jsonp({                                        
                                type:'error', 
                                msg:'Salary Not Saved'
                            });    
                        }else{                            
                            res.status(200).jsonp({                                        
                                type:'success', 
                                msg:'Salary Saved Successfully.'                                
                            });    
                        }
                    }
            
                });

               
            }else{
                console.log("No AccountHead found");
                req.flash("info", "Update Account head DB");
                return res.redirect('/login');            
            }
        }
    })

    client.release()

}

const add_revenue = async (req, res) => {


    if(res.locals.userrole!="Administrator"){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Not Allowed'
           
        });    
        return;
    }


    var pool = require('../controller/database');   

    var sponsorid = req.body.sponsorid;
    var amount = req.body.amount;
    var transactiondate = req.body.transactiondate;

    if(sponsorid == "" || amount == "" || transactiondate == ""){
        res.status(200).jsonp({                                        
            type:'error', 
            msg:'Invalid values passed'
        }); 
        return;
    }



    const query = {
     text: "select account_heads.account_head_id "        
        +" from account_heads where upper(account_heads.account_head_name) like 'SPONSOR%'",
     values:[],
     rowMode: 'array'   
    }

    const client = await pool.connect()

    await client.query(query, (err, ah) => {
        console.log(ah);
        if(err){
            console.log(err);
            return res.redirect('/login');
        }else{
            if(ah.rowCount > 0){
                var accountheadid = ah.rows[0][0];
                ///insert new transaction
                const insertquery = {
                    text: "insert into account_voucher( id_account_head, time_of_transaction, sponsor_id, debit, credit ) "
                    +" values($1, $2, $3, $4, '0') ",
                    values:[accountheadid, transactiondate, sponsorid, amount]

                }

               // console.log(accountheadid);

                client.query(insertquery, (err, insertID) => {
                    console.log(insertID);
                    if(err){
                        console.log(err);
                        req.flash("error", err);
                        //return res.redirect('/register');
                    }else{
                        if(insertID < 0){                           
                            res.status(200).jsonp({                                        
                                type:'error', 
                                msg:'Revenue Not Saved'
                            });    
                        }else{                            
                            res.status(200).jsonp({                                        
                                type:'success', 
                                msg:'Revenue Saved Successfully.'                                
                            });    
                        }
                    }
            
                });

               
            }else{
                console.log("No AccountHead found");
                res.status(200).jsonp({                                        
                    type:'error', 
                    msg:'No AccountHead found'
                });  
                //return res.redirect('/login');       
            }
        }
    })

    client.release()

}

module.exports = {transactionList, accountheads_list, sponsors_list, employees_list, add_salary, add_revenue}
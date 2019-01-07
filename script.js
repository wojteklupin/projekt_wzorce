const http = require('http');
const { parse } = require('querystring');
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "wzorce"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to the database!");
});

const server = http.createServer((req, res) => {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    var form;
    
    if(req.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            form = parse(body);
            console.log(form);
            if (typeof form.phaslo !== 'undefined') { // jesli to byla strona rejestracji
                if(form.haslo != form.phaslo) {
                    console.log("Podane hasła nie są takie same");
                    res.end("Podane hasla nie sa takie same");
                }
                else {
                    var sql = `INSERT INTO klienci (nazwisko, imie, bank, haslo, pieniadze) VALUES ('`+form.nazw+`', '`+form.imie+`', '`+form.bank+`', '`+form.haslo+`', 0)`;
                    con.query(sql, function (err, result) {
                        if(err) throw err;
                        console.log("1 record inserted into klienci");
                    });
                    
                    var rach;
                    var sql = `SELECT nr_rachunku FROM klienci order by nr_rachunku desc;`;
                    con.query(sql, function (err, result, fields) {
                        if(err) throw err;
                        rach = result[0].nr_rachunku;
                        res.end(`Utworzono konto klienta o nr rachunku `+rach+'. Zapamietaj!');
                        console.log("Nr rachunku: "+rach);
                    });
                }
            }
            else if(typeof form.rach_odb !== 'undefined') { // jesli to byla strona przelewu
                var sql = `SELECT pieniadze FROM klienci WHERE nr_rachunku = `+form.rach;
                con.query(sql, function(err,result) {
                    if(err) throw err;
                    else if(result[0].pieniadze < form.kwota) {
                        res.end("Zbyt mało pieniędzy na koncie");
                    }
                    else {
                        sql  = `UPDATE klienci SET pieniadze = pieniadze-${form.kwota} WHERE nr_rachunku = ${form.rach};`;
                        sql2 = `UPDATE klienci SET pieniadze = pieniadze+${form.kwota} WHERE nr_rachunku = ${form.rach_odb};`;
                        con.query(sql, function(err, result) {
                            if(err) res.end("Nie ma konta o takim nr rachunku");
                        });
                        con.query(sql2, function(err, result) {
                            if(err) throw err;
                            res.end("Przelane!");
                        });
                    }
                });
            }
            else { // jesli to byla strona logowania
                nr_rach = form.rach;
                var sql = `SELECT haslo, bank FROM klienci WHERE nr_rachunku = `+form.rach;
                con.query(sql, function (err, result) {
                    if(err) throw err;
                    if(result[0].haslo != form.haslo || result[0].bank != form.bank)
                        res.end("Nieprawidlowe nr rachunku lub/i haslo");
                    else {
                        sql = `SELECT pieniadze FROM klienci WHERE nr_rachunku = `+form.rach;
                        con.query(sql, function (err, result) {
                            if(err) throw err;
                            res.end(`<html>
                                       <head>
                                         <meta charset="UTF-8">
                                       </head>
                                       
                                       <body>
                                         Stan konta to ${result[0].pieniadze} złotych<br>
                                         Zrób przelew:<br>
                                         <form action="http://localhost:8080/" method="post">
                                           <table>
                                           <tr>
                                             <td>Twój nr rachunku:</td><td><input type="text" name="rach" readonly value=${form.rach}></td><td></td>
                                           </tr>
                                           <tr>
                                             <td>Nr rachunku odbiorcy:</td><td><input type="text" name="rach_odb"></td><td></td>
                                           </tr>
                                           <tr>
                                             <td>Kwota:</td><td><input type="text" name="kwota"></td><td><input type="submit" value="Przelej"></td>
                                           </tr>
                                           </table>
                                         </form>
                                       </body>
                                     </html>
                            `);
                        });
                    }
                });
            }
        });
    }
});

server.listen(8080);
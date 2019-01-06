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
            else { // jesli to byla strona logowania
                var sql = `SELECT haslo, bank FROM klienci WHERE nr_rachunku = `+form.rach;
                con.query(sql, function (err, result) {
                    if(err) throw err;
                    if(result[0].haslo != form.haslo || result[0].bank != form.bank)
                        res.end("Nieprawidlowe nr rachunku lub/i haslo");
                    else {
                        sql = `SELECT pieniadze FROM klienci WHERE nr_rachunku = `+form.rach;
                        con.query(sql, function (err, result) {
                            if(err) throw err;
                            res.end("Stan konta to "+result[0].pieniadze);
                        });
                    }
                });
            }
        });
    }
});

server.listen(8080);
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
            if(form.haslo != form.phaslo) {
                console.log("Podane hasła nie są takie same");
                res.end("Podane hasla nie sa takie same");
            }
            else {
                var sql = `INSERT INTO klienci (nazwisko, imie, bank, pieniadze) VALUES ('`+form.nazw+`', '`+form.imie+`', '`+form.bank+`', 0)`;
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
                    console.log(rach);
                });
            }
        });
    }
});

server.listen(8080);
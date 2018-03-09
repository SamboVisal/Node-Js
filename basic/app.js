var http = require('http');
var m = require('./module');
http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/html'});
  res.write(m.myModu()+req.url);
  res.end();
}).listen(8080);

m.greet();
var person = {
  firstname: 'sambo',
  lastname: 'visal',
  greets: function(){
    console.log('Hello ' + this.firstname + ' ' +this.lastname);
  }
}
person.greets();
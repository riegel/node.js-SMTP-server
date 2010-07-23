// Now On git - Fixed git Username I hope
//
// Instructions are for me (Terry Riegel) I am new to git
//
// STEP 1: git init                                                     # Get things rolling
//
// STEP 2: git add filename                                             # Add your files and send to github
//         git commit -m "initial project commit"
//         git remote add origin git@github.com:[username]/[repository]
//         git push origin master
//
// STEP 3: git commit -a -m "reason for the commit"                     # new commit, send it out
//         git push origin master
// STEP 4: ^ [do step 3 again]
//
//
// A Simple SMTP server to take email attachments and post them to the web
// The basic server is running and accepting connections
// It doesn't understand much yet, but can carry on a conversation 
// with other SMTP Servers
//
// This code has sharp edges beware, and is heavily in production
// you can contact me with comments riegel@clearimageonline.com
//
//
//
//
// Copyright (c) 2010 Terry Riegel
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



console.log('Clear Image Photo Emailer');

String.prototype.left = function (n) {
 if (n <= 0) {return "";}
 if (n > String(this).length) {return this;}
 return String(this).substring(0,n);
}
String.prototype.right = function(n) {
 if (n <= 0) {return "";}
 if (n > String(this).length) {return this;}
 return this.substr(this.length-n) ; 
}

var net = require('net');
var server = net.createServer(
 function (stream) {
  stream.setEncoding('utf8');
  stream.out=function(a){stream.write(a+'\r\n');console.info('>'+a);}
  stream.on('connect',
   function () {
    stream.out('220 SMTP to HTTP Photo Emailer');
    stream.state='welcome';
   }
  );
  stream.on('data',
   function (data) {
    // the incoming data may be multiple lines, not necessarily a single line at a time
    // this code assumes only one line at a time, so we spilt data initially then loop through it
    // The only reason to loop through it would be to replace any .. by itself on a line with a .
    // This seems like an edge case that may be ok if not implemented, and it would save the overhead
    // of going through each line of the body.
    //
    // Once I add code to parse the multi-part mime then I suppose I will have to traverse line by line
    //
    dataArray=data.split('\r\n');
    var i=0;
    for(i=0; i<dataArray.length-1; i=i+1){

     console.info('#'+dataArray[i].trim());
     if (stream.state=='data'){
      if(dataArray[i].trim()=='.'){stream.out('250 Ok, dont know what to do with it'); stream.state='welcome';}
      // Ok body line recieved send it along :)
         // code to save to disk goes here hmm async I suppose 
      // body line end
     } else{
      data=dataArray[i].trim();
      var cmd=dataArray[i].left(4).toUpperCase();
      var touch=false;
      if(cmd == 'HELO'){stream.out('250 mailer.youbelong.net'); touch=true;}
      if(cmd == 'MAIL' && dataArray[i].left(10).toUpperCase() == 'MAIL FROM:'){stream.out('250 MAIL...I hope thats right :)'); touch=true;}
      if(cmd == 'RCPT' && dataArray[i].left(8).toUpperCase()  == 'RCPT TO:'  ){stream.out('250 RCPT...I hope thats right :)'); touch=true;}
      if(cmd == 'DATA'){stream.state='data'; stream.out('354 Enter mail, end with "." on a line by itself'); touch=true;}
      if(cmd == 'NOOP'){stream.out('250 OK'); touch=true;}
      if(cmd == 'QUIT'){stream.out('221 Bye'); stream.destroy(); touch=true;}
      if(cmd == 'RSET'){stream.out('250 Reset OK'); touch=true;}

      if(cmd == 'HELP'){stream.out('214-Commands supported\r\n214 HELO MAIL RCPT DATA\r\n214 NOOP QUIT RSET HELP'); touch=true;}

      if(cmd == 'EXPN'){stream.out('550 EXPN not available'); touch=true;}
      if(cmd == 'EHLO' || data.left(4)=='SEND' || data.left(4)=='SAML' || data.left(4)=='SOML' | data.left(4)=='TURN'){stream.out('502 Unsupported here'); touch=true;}
      if(cmd == 'VRFY'){stream.out('252 VRFY not available'); touch=true;}

      if(!touch){stream.out('500 Unrecognized command');}
     }
    }


   }
  );
  stream.on('end',
   function () {
    console.info(' Unexpected End, Terminating connection.');
    stream.destroy();
   }
  );
 }
);
server.listen(25, '10.209.215.64');

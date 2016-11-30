function showMsg(msg1, msg2) {
    alert('hello ' + msg1 + ', ' + msg2);
}

function showRandom(n, m){
   //var result = Math.floor(Math.random()*(m-n+1)+n); 
   var result = Math.ceil(Math.random()*(m-n)+n); 

   return result;
}


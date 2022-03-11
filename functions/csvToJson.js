exports = function(csv){

  try {
    var lines=csv.split("\n");

    var result = [];
    
    var headers=lines[0].split(",");
    
    //console.log("*******  lines.length: " +  lines.length);

    const arrayLength = lines.length;

    for(var i=1;i<arrayLength;i++){
      
      //console.log("*******  lines.number: " +  i);
  	  
  	  var obj = {};
  	  var currentline=lines[i].split(",");
  
  	  for(var j=0;j<headers.length;j++){
  	    if(currentline[j] == ""){
          currentline[j] = null;
        }
  		  obj[headers[j]] = currentline[j];
  	  }
  	  
      // console.log("*******  obj: " +  JSON.stringify(obj));

  	  result.push(obj);
  
    }
  }
  catch(err) {
    console.log("csvToJson() error: ", err)
  }

  return JSON.stringify(result); 
};
exports = function(){
  const orgid = context.values.get("orgid");
  const tableName = context.values.get("gcpTable");

  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices`;

  return context.functions.execute("httpGetAtlas", url)
    .then(({ body }) => {
      const doc = JSON.parse(body.text());

      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {
        
        const results = doc.results;
        const length = results.length;
        
        const currentMonthInvoiceId = getCurrentMonthInvoiceId(doc).id;
        console.log("Syncing last month invoice, id :", currentMonthInvoiceId);
        //context.functions.execute("sendLastDayJsonsToBigQuery", currentMonthInvoiceId, tableName);
        sendLastDayJsonsToBigQuery(currentMonthInvoiceId, tableName);

      }        
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
  
};

function getCurrentMonthInvoiceId(json) {
  
  //Get last month date in format "YYYY-MM-DD"
  let date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth());
  let currentMonthDate = date.toISOString().slice(0,10);
  
  //use "created" field in Atlas get Invoices API
  return json.results.find(element => element.created.includes(currentMonthDate));

}




// Retrieve Atlas Invoices Items by Invoice ID in CSV, convert to JSON and send to Bigquery
function sendLastDayJsonsToBigQuery(invoiceID,tableName){
  
  
  const orgid = context.values.get("orgid");
  const numCsvHeader = context.values.get("numCsvHeader");

  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices/${invoiceID}`;
  
  return context.functions.execute("httpGetInvoiceCSV", url)
    .then(({ body }) => {
      
      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {
        
        let arrayInvoiceDetails = body.text().split(/\r?\n/);
        
        //console.log("*******  arrayInvoiceDetails: " +  JSON.stringify(arrayInvoiceDetails));

        arrayInvoiceDetails.splice(0, numCsvHeader);
        
        arrayInvoiceDetailsLastDay = keepOnlyLastDayInvoice(arrayInvoiceDetails);
        
        //Ajust Row names, Bigquery doesn't allow blank space, CSV header is available under CSV tab, in Atlas documentation: https://docs.atlas.mongodb.com/reference/api/organization-get-one-invoice/#response
        //arrayInvoiceDetailsLastDay.splice(0, 1, 'Date,UsageDate,Description,Note,OrganizationName,OrganizationID,Project,ProjectID,SKU,Region,Cluster,ReplicaSet,ConfigServer,Application,Unit,UnitPrice,Quantity,DiscountPercent,Amount');
        arrayInvoiceDetailsLastDay.unshift('Date,UsageDate,Description,Note,OrganizationName,OrganizationID,Project,ProjectID,SKU,Region,Cluster,ReplicaSet,ConfigServer,Application,Unit,UnitPrice,Quantity,DiscountPercent,Amount');
        
        const arrayInvoiceDetailsText = arrayInvoiceDetailsLastDay.join('\n');
        
       
        /*for(i=1; i<=arrayInvoiceDetails.length;i++){
          console.log("****arrayInvoiceDetails[i]+ " + i + " " + arrayInvoiceDetails[i]);
        }*/
        

        const json = context.functions.execute("csvToJson", arrayInvoiceDetailsText);
        const jsonObj = JSON.parse(json);
        const jsonsLength = jsonObj.length;
        
        //A maximum of 500 rows is recommended by GCP Bigquery, https://cloud.google.com/bigquery/quotas#tabledatalist_requests
        const chunk = 500;
        
        console.log("Syncing Invoice " + invoiceID + " ( " + jsonsLength + " items, " + chunk + " chunks)");

        syncJsonArrayByBatch(jsonObj, chunk, tableName);
        
        return jsonsLength;
      }
    })
    .catch(err => console.error(`Failed to insert invoice details: ${err}`));
}

function syncJsonArrayByBatch(jsons, chunk, tableName){
  
  const jsonsLength = jsons.length;
  
  var tempArray = [];
  
  try {
    
    for (index = 0; index < jsonsLength; index += chunk) {
      jsonChunk = jsons.slice(index, index+chunk);
      tempArray.push(jsonChunk);
    }
  
    const tempArrayLength = tempArray.length;
    
    for (i = 0; i < tempArrayLength; i++) {
      sendJsonsToBigQuery(tempArray[i], tableName);
    }
  
  } catch (err) {
    console.log("sendJsonsToBigQuery() error: ", err)
  }
    
}

function sendJsonsToBigQuery(json, tableName){
  
  const lengthJson = json.length;
  let invoiceJsonBigQuery = {};
  let arryRows = [];
  
  try {
    
      for (let i = 0; i < lengthJson; i++) {
    
        let jsonBody = {};
        jsonBody.json = json[i];
        arryRows.push(jsonBody);
      }
      
      invoiceJsonBigQuery.rows = arryRows;
      
      //console.log("*******  invoiceJsonBigQuery: " +  JSON.stringify(invoiceJsonBigQuery));

      return context.functions.execute("sendInvoiceToBigQuery", invoiceJsonBigQuery, tableName);
   
      
  } catch (err) {
    console.log("sendJsonsToBigQuery() error: ", err)
  }

}

function keepOnlyLastDayInvoice(arrayInvoiceDetails){
    
    const lastDayString = getLastDayString();

    console.log("Last date is: " + lastDayString);
    
    console.log("Toltal invoices number: " + arrayInvoiceDetails.length);

    let arrayInvoiceDetailsLastDay = arrayInvoiceDetails.filter(item => item.includes(lastDayString));
    
    console.log("Last day invoices number: " + arrayInvoiceDetailsLastDay.length);

    return arrayInvoiceDetailsLastDay;
}

function getLastDayString() {
  
  //Get last month date in format "YYYY-MM-DD"
  let today = new Date();
  let yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);
  var dd = yesterday.getDate();
  var mm = yesterday.getMonth()+1; 
  var yyyy = yesterday.getFullYear();
  
  if(dd<10) 
  {
      dd='0'+dd;
  } 
  
  if(mm<10) 
  {
      mm='0'+mm;
  } 
  
  yesterday = mm+'/'+ dd + '/'+yyyy;

  return yesterday;
}

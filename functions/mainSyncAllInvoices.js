
exports = function(){
  const orgid = context.values.get("orgid");
  
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices`;

  context.functions.execute("httpGetAtlas", url)
    .then(({ body }) => {
      const doc = JSON.parse(body.text());

      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {
        
        const results = doc.results;
        const length = results.length;
      

        console.log("<<=== Full replacement mode ===>>");
        console.log("Totolly " + length + " invoices will by synced from Atlas to Bigquery");
            
        const tableName = getTableName();
        
        context.functions.execute("createBigqueryTable", tableName)
          .then(result => {
            //TODO Integrety check : if total synced number is the same as bigquery inserted rows, delete the previous month's table
            processResults(results, tableName, length)
            .then(totalSyncedNumber => {
               console.log("Total synced invoice items number is: " + totalSyncedNumber);
               
               //Other tables are droped.
               context.functions.execute("deleteBigQueryTablesExcept", tableName); 
           })
        });
      }        
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
};

function getTableName(){

  const gcpTable = context.values.get("gcpTable");
  todayDateString = new Date().getTime();
  const tableName = gcpTable.concat("_",todayDateString);
  
  return tableName;
}

async function processResults(results, tableName, length){

  let totalInvoicesSynced = 0;
  
  //TODO For testing, to remove
  for (var i = 30; i < length; i++) {
    await context.functions.execute("syncInvoiceCsvById", results[i].id, tableName)
      .then(result => {
      totalInvoicesSynced = totalInvoicesSynced + result;
    })
  }
  
  /*for (var i = 0; i < length; i++) {
    await context.functions.execute("syncInvoiceCsvById", results[i].id, tableName)
      .then(result => {
      totalInvoicesSynced = totalInvoicesSynced + result;
    })
  }*/
  
  return totalInvoicesSynced;
}
exports = function(){
  
  // Sync all invoices except the current month's, this can be used as un initial sync, then use trigger to sync every last month invoices
  
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

        console.log("Totol invoices number is : " + length);
        
        //First creation of the table, delete, recreate and insert into the same might not working, see https://cloud.google.com/bigquery/docs/error-messages#metadata-errors-for-streaming-inserts
        context.functions.execute("createBigqueryTable", tableName)
          .then(result => {
            
              //TODO Integrety check : if total synced numbers is the same as bigquery inserted rows
              processResults(results, tableName, length)
              .then(totalSyncedNumber => {
                console.log("Total synced invoice items number is: " + totalSyncedNumber);
              })
          });
      }        
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
  
};

function getCurrentMonthInvoieDate() {
  
  //Get last month date in format "YYYY-MM-DD"
  let date = new Date();
  date.setDate(1);
  let lastMonthDate = date.toISOString().slice(0,10);
  
  return lastMonthDate;
}

async function processResults(results, tableName, length){

  let totalInvoicesSynced = 0;
  const currentMonthInvoieDate = getCurrentMonthInvoieDate();
  
  //TODO For testing, to remove
  for (var i = 52; i < length; i++) {
    if(!results[i].created.includes(currentMonthInvoieDate)){
        console.log("mainSyncPreviousInvoices: Sync for : " + currentMonthInvoieDate);

        await context.functions.execute("syncInvoiceCsvById", results[i].id, tableName)
        .then(result => {
          totalInvoicesSynced = totalInvoicesSynced + result;
        })
    }  
  }
  
  /*for (var i = 0; i < length; i++) {
    if(!results[i].created.includes(currentMonthInvoieDate)){
        await context.functions.execute("syncInvoiceCsvById", results[i].id, tableName)
        .then(result => {
          totalInvoicesSynced = totalInvoicesSynced + result;
        })
    }  
  }     */ 
        
  
  return totalInvoicesSynced;
}

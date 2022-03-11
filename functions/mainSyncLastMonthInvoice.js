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
        
        const lastMonthInvoiceId = getLastMonthInvoiceId(doc).id;
        console.log("Syncing last month invoice, id :", lastMonthInvoiceId);
        context.functions.execute("syncInvoiceCsvById", lastMonthInvoiceId, tableName);

      }        
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
  
};

function getLastMonthInvoiceId(json) {
  
  //Get last month date in format "YYYY-MM-DD"
  let date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth()-1);
  let lastMonthDate = date.toISOString().slice(0,10);
  let lastMonthId;
  
  //use "created" field in Atlas get Invoices API
  return json.results.find(element => element.created.includes(lastMonthDate));
}

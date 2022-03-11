exports = async function(invoiceJson, tableName) {
  
  //let invoiceJson = {"rows":[{"json":{"Date":"11/30/2017","UsageDate":"11/30/2017","Description":"Credit (*4123)","Note":null,"OrganizationName":"Professional Services","OrganizationID":"5a05659cd383ad74f1cc1047","Project":"Damien Gasparina","ProjectID":"5a0566b9c0c6e33bd1ac0a51","SKU":"Credit","Region":null,"Cluster":null,"ReplicaSet":null,"ConfigServer":null,"Application":null,"Unit":null,"UnitPrice":"-0.010000","Quantity":"1688.0","DiscountPercent":"0.0","Amount":"-16.88"}}]};
  //let tableName = "Invoice";
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");
  const gcpTable = tableName;
  let ejson_body = null;
  
  try {
      
      console.log("Sending invoices to BigQuery Table: " + gcpTable);
    
      return context.http.post({
            url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets/${gcpDataset}/tables/${gcpTable}/insertAll`,
            headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
            body: invoiceJson,
            encodeBodyAsJSON: true
        }).then(response => {
          // The response body is encoded as raw BSON.Binary. Parse it to JSON.
          const ejson_body = EJSON.parse(response.body.text());
          console.log("sendInvoiceToBigQuery: " + JSON.stringify(ejson_body));
          return ejson_body;
        })
  
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }
};

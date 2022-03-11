exports = async function(tableName) {
  
  let result;
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");
  
  const query = {"query": `SELECT count(1) FROM [${gcpProject}:${gcpDataset}.${tableName}]` };
  console.log("The query is : " + JSON.stringify(query));
  
  try {
    
      const response = await context.http.post({
      url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/queries`,
      headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
      body: query,
      encodeBodyAsJSON: true
    })
    
    // The response body is a BSON.Binary object. Parse it and return.
    result = response.body.text();
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }

  return result;
};
exports = async function() {
  
  let result;
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");

  try {
    
      const response = await context.http.get({
      url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets/${gcpDataset}/tables`,
      headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
      encodeBodyAsJSON: true
    })
    
    result = JSON.parse(response.body.text());
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }
  
  return result;
};
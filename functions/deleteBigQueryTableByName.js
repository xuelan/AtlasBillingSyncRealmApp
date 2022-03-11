exports = async function(tableName) {
  
  let result;
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");
  
  try {
    
      const response = await context.http.delete({
      url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets/${gcpDataset}/tables/${tableName}`,
      headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
      encodeBodyAsJSON: true
    })
    
  
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }
};
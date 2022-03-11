exports = async function(tableName) {
  
  let result;
  
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  const gcpDataset = context.values.get("gcpDataset");
  const tableReference =   {"tableReference":     {      "projectId": gcpProject,      "datasetId": gcpDataset,      "tableId": tableName    },    "schema": {    "fields": [      {        "name": "Date",        "type": "String"      },      {        "name": "UsageDate",        "type": "String"      },      {        "name": "Description",        "type": "String"      },      {        "name": "Note",        "type": "String"      },      {        "name": "OrganizationName",        "type": "String"      },      {        "name": "OrganizationID",        "type": "String"      },      {        "name": "Project",        "type": "String"      },      {        "name": "ProjectID",        "type": "String"      },      {        "name": "SKU",        "type": "String"      },      {        "name": "Region",        "type": "String"      },      {        "name": "Cluster",        "type": "String"      },      {        "name": "ReplicaSet",        "type": "String"      },      {        "name": "ConfigServer",        "type": "String"      },      {        "name": "Application",        "type": "String"      },      {        "name": "Unit",        "type": "String"      },      {        "name": "UnitPrice",        "type": "Float"      },      {        "name": "Quantity",        "type": "Float"      },      {        "name": "DiscountPercent",        "type": "Float"      },      {        "name": "Amount",        "type": "Float"      }    ]  }}
  
  try {
    
      const response = await context.http.post({
      url: `https://bigquery.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets/${gcpDataset}/tables`,
      headers: {"Content-Type": [ "application/json" ], "Accept": [ "application/json" ], "Authorization": [`Bearer ${token}`]},
      body: tableReference,
      encodeBodyAsJSON: true
    })
    
    // The response body is a BSON.Binary object. Parse it and return.
    result = JSON.stringify(response);
    console.log( "Table created: " + tableName);
  
  }  
  catch(err) {
    console.log("sendInvoiceToBigQiery() error: " + err);
  }

  return result;
};
exports = function(id){
  const orgid = context.values.get("orgid");
  
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/orgs/${orgid}/invoices/${id}`;

  return context.functions.execute("httpGetAtlas", url)
    .then(({ body }) => {
      
      if (body.error) {
        console.error(`Error ${body}: '${body.detail}'`);
        return null;
      } else {
        console.log(`Current invoice details: '${body.text()}'`);
      }
    })
    .catch(err => console.error(`Failed to insert billing doc: ${err}`));
  
};
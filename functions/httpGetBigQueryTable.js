exports = async function() {
  const token = context.values.get("gcpToken");
  const gcpProject = context.values.get("gcpProject");
  
  const response = await context.http.get({ url: `https://www.googleapis.com/bigquery/v2/projects/${gcpProject}/datasets`, headers: {"Authorization": [`Bearer ${token}`] }});
  
  // The response body is a BSON.Binary object. Parse it and return.
  return EJSON.parse(response.body.text());
};
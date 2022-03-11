# Atlas Billing Sync Application

As a sample code (not for production use), this MongoDB Realm application can be used to sync MongoDB Atlas Organization’s invoices to GCP Bigquery tables. There 2 sync modes supported.

## Documentation

Please read [MongoDB Realm](https://docs.mongodb.com/realm/) and [MongoDB Atlas](https://docs.atlas.mongodb.com/) for more details.

You can use [Realm CLI](https://docs.mongodb.com/realm/deploy/realm-cli-reference/) to [import](https://docs.mongodb.com/realm/deploy/realm-cli-reference/#import-an-application) / [export](https://docs.mongodb.com/realm/deploy/realm-cli-reference/#export-an-application) Realm application's code, following an example:

```bash
realm-cli login --api-key="XXXXXXX" --private-api-key="********-****-****-****-***********"

realm-cli whoami

realm-cli import \
  --app-id=mybillingapp-xxx \
  --path=./myBillingApp \
  --strategy=merge 
```

## Mode 1: full replacement
In this mode, we need to create a new table (name: “Invoice_[timestamp]”), retrieve billing info from Atlas and sync all the invoices items to Bigquery, once it’s finished successfully, we delete the previous tables. To achieve this we use Realm Function: **mainSyncAllInvoices()** (for the reason why not replacing old data, see [GCP metadata errors for streaming inserts](https://cloud.google.com/bigquery/docs/error-messages#metadata-errors-for-streaming-inserts)). 

Note that this model includes the current month’s ongoing invoices data.


## Mode 2: initial sync + trigger syncing last month invoice
In this mode, we can do initial sync for retrieving all the previous invoices items from Atlas except for the current month, sync them to Bigquery. We will create a new table (name: “Invoice”). To achieve this we use Realm Function: **mainSyncPreviousInvoices()**

Then schedule a Realm trigger for syncing the last month’s invoices items at the beginning of each month (currently disabled and set to the 5th day of each month). Logs of enabled triggers can be found in the left menu: MANAGE/logs. To achieve this we use Realm Function: **mainSyncLastMonthInvoice()**

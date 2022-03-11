exports = function(exceptTableName){
  
  try {
      context.functions.execute("getBigQueryTables")
      .then(function(result) {
      
      result.tables.forEach(x => {
        
        const tableName = x.tableReference.tableId;
        if(tableName != exceptTableName) {
          context.functions.execute("deleteBigQueryTableByName", tableName);
          console.log("Table " + tableName + " deleted");
        } 
      });
    });
    
  } catch (err) {
    console.log("Error in deleteBigQueryTablesExcept(), error: " + err)
  }

};


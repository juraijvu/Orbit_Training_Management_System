#!/bin/bash

# Get current date for the filename
DATE=$(date +"%Y-%m-%d")
EXPORT_FILE="orbit_institute_db_export_${DATE}.sql"

# Export the database
echo "Exporting database to ${EXPORT_FILE}..."
PGPASSWORD=$PGPASSWORD pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE > $EXPORT_FILE

if [ $? -eq 0 ]; then
  echo "Database export completed successfully!"
  echo "File saved as: ${EXPORT_FILE}"
  echo "You can download this file from the Replit file browser."
else
  echo "Error exporting database. Please check the connection details."
fi
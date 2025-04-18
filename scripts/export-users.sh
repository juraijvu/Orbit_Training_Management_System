#!/bin/bash

# Export just the users table
echo "Exporting users table..."
PGPASSWORD=$PGPASSWORD pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE --table=users --data-only > users_export.sql

if [ $? -eq 0 ]; then
  echo "Users export completed successfully!"
  echo "File saved as: users_export.sql"
  echo "You can download this file from the Replit file browser."
else
  echo "Error exporting users. Please check the connection details."
fi
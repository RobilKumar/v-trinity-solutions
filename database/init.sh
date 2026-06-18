#!/bin/bash
set -e
echo "Waiting for SQL Server to be ready..."
until /opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -Q "SELECT 1" &>/dev/null; do
  sleep 3
done
echo "SQL Server ready. Running init scripts..."

/opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -i /scripts/schemas/001_core_schema.sql
echo "Schema created."

/opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -i /scripts/schemas/002_indexes_seeds.sql
echo "Seed data loaded."

/opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -i /scripts/procedures/sp_core.sql
echo "Stored procedures created."

/opt/mssql-tools18/bin/sqlcmd -S sqlserver -U sa -P "$MSSQL_SA_PASSWORD" -C -i /scripts/seeds/admin_user.sql
echo "Admin user ready."

echo "Database initialization complete!"

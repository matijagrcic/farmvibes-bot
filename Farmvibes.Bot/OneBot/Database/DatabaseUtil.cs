using System.Collections.Generic;
using System.Data;
using System.Data.Common;

namespace OneBot.Database
{
    public class DatabaseUtil
    {

        public string connString { get; protected set; }
        public string providerName { get; protected set; }

        /// <summary>
        /// Creates an instance with the given connection string
        /// </summary>
        /// <param name="connString">The connection string</param>
        public DatabaseUtil(string connString, string providerName)
        {
            this.connString = connString;
            this.providerName = providerName;
        }

        /// <summary>
        /// Executes the gives SQL query
        /// </summary>
        /// <param name="query">The SQL query to be executed</param>
        /// <param name="Parameters">Query parameters and their values</param>
        /// <returns>Number of rows affected</returns>
        public int ExecuteCommand(string query, Dictionary<string, object> Parameters = null)
        {
            return ExecuteCommand(connString, providerName, query, Parameters);
        }

        /// <summary>
        /// Executes the given SQL query
        /// </summary>
        /// <param name="connString">Connection string to the database</param>
        /// <param name="providerName">Db provider invariant name</param>
        /// <param name="query">The SQL query to be executed</param>
        /// <param name="Parameters">Query parameters and their values</param>
        /// <returns>Number of rows affected</returns>
        public static int ExecuteCommand(string connString, string providerName, string query, Dictionary<string, object> Parameters = null)
        {
            DbProviderFactories.RegisterFactory("System.Data.SQLite", System.Data.SQLite.SQLiteFactory.Instance);
            var factory = DbProviderFactories.GetFactory(providerName);

            //Create Query
            using (var conn = factory.CreateConnection())
            {
                conn.ConnectionString = connString;
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = query;

                    //Add Parameters
                    if (Parameters != null)
                    {
                        foreach (var kvp in Parameters)
                        {
                            var parameter = factory.CreateParameter();
                            parameter.ParameterName = kvp.Key;
                            parameter.Value = kvp.Value;
                            cmd.Parameters.Add(parameter);
                        }
                    }

                    //Execute Query
                    conn.Open();
                    return cmd.ExecuteNonQuery();
                }
            }
        }

        /// <summary>
        /// Query an SQL database
        /// </summary>
        /// <param name="query">Select query that returns a data table</param>
        /// <param name="Parameters">Query parameters with their values</param>
        /// <returns>Query results as a DataTable</returns>
        public DataTable Select(string query, Dictionary<string, object> Parameters = null)
        {
            return Select(connString, providerName, query, Parameters);
        }

        /// <summary>
        /// Query an SQL database
        /// </summary>
        /// <param name="connString">Connection string to the database</param>
        /// <param name="providerName">DB provider invariant name</param>
        /// <param name="query">Select query that returns a data table</param>
        /// <param name="Parameters">Query parameters with their values</param>
        /// <returns>Query results as a DataTable</returns>
        public static DataTable Select(string connString, string providerName, string query, Dictionary<string, object> Parameters = null)
        {
            DbProviderFactories.RegisterFactory("System.Data.SQLite", System.Data.SQLite.SQLiteFactory.Instance);
            var factory = DbProviderFactories.GetFactory(providerName);
            var dt = new DataTable();

            //Create Query
            using (var conn = factory.CreateConnection())
            {
                conn.ConnectionString = connString;
                using (var cmd = conn.CreateCommand())
                using (var da = factory.CreateDataAdapter())
                {
                    cmd.CommandText = query;
                    da.SelectCommand = cmd;

                    //Add Parameters
                    if (Parameters != null)
                    {
                        foreach (var kvp in Parameters)
                        {
                            var parameter = cmd.CreateParameter();
                            parameter.ParameterName = kvp.Key;
                            parameter.Value = kvp.Value;
                            cmd.Parameters.Add(parameter);
                        }
                    }

                    //Execute Query
                    conn.Open();
                    da.Fill(dt);
                    return dt;
                }
            }
        }

    }
}
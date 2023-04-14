using Microsoft.Data.Sqlite;
using System;
using System.Collections.Generic;
using System.Data;

namespace OneBot.Services;

public class ContentCache
{

    private const string _connectionString = "Data Source=cache.db;Cache=Shared";


    /// <summary>
    /// Executes the given SQL query
    /// </summary>
    /// <param name="parameters">Query parameters and their values</param>
    /// <returns>Number of rows affected</returns>
    public void InsertContent(Dictionary<string, object> parameters = null)
    {
        var query =
            "INSERT INTO ContentTable" +
            " (service, menu, content, service_types, trees, locations, administrative_units, channels, languages, createAt) " +
            "VALUES($services, $menu, $contents, $service_types, $trees, $locations, $administrative_units, $channels, $languages, $createAt)";

        ExecuteCommand(query, parameters);
    }

    /// <summary>
    /// Query an SQL database
    /// </summary>
    /// <param name="query">Select query that returns a data table</param>
    /// <param name="parameters">Query parameters with their values</param>
    /// <returns>Query results as a DataTable</returns>
    public DataTable Select(string query, Dictionary<string, object> parameters = null)
    {
        var dataTable = new DataTable();

        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            //Execute Query
            using var command = connection.CreateCommand();
            command.CommandText = query;

            //Add Parameters
            if (parameters != null)
            {
                foreach (var kvp in parameters)
                {
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = kvp.Key;
                    parameter.Value = kvp.Value;
                    command.Parameters.Add(parameter);
                }
            }

            var reader = command.ExecuteReader();
            dataTable.Load(reader);
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "thrown at Select()", ex);
        }
        return dataTable;
    }


    /// <summary>
    /// Executes the given SQL query
    /// </summary>
    /// <param name="query">The SQL query to be executed</param>
    /// <param name="parameters">Query parameters and their values</param>
    /// <returns>Number of rows affected</returns>
    private void ExecuteCommand(string query, Dictionary<string, object> parameters = null)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            using var cmd = connection.CreateCommand();
            cmd.CommandText = query;

            //Add Parameters
            if (parameters != null)
            {
                foreach (var kvp in parameters)
                {
                    var parameter = new SqliteParameter();
                    if (parameter == null)
                    {
                        continue;
                    }

                    parameter.ParameterName = kvp.Key;
                    parameter.Value = kvp.Value;
                    cmd.Parameters.Add(parameter);
                }
            }

            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "thrown at ExecuteCommand()", ex);
        }
    }

    /// <summary>
    /// Creates the sqlite inmemory for data used accross the bot
    /// </summary>
    /// <returns>column rows in the db </returns>
    public void CreateTables()
    {
        try
        {
            var query = "CREATE TABLE IF NOT EXISTS ContentTable " +
            "(id INTEGER PRIMARY KEY, service TEXT, menu TEXT, content TEXT, service_types TEXT, " +
                "trees TEXT, locations TEXT, administrative_units TEXT, channels TEXT, languages TEXT, constraints TEXT, createAt TEXT);";

            //create Table for holding content
            ExecuteCommand(query);
        }
        catch (Exception ex)
        {
            var exception =
                new Exception(
                    message:
                    $"Stack trace - {ex.StackTrace} -- Failed to create table or/and add content initially", ex);
            throw exception;
        }
    }

    public int CountRecords()
    {
        int rowCount = 0;
        try
        {
            var query = $"SELECT COUNT(id) FROM ContentTable";

            using var connection = new SqliteConnection(_connectionString);
            //Execute Query
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = query;

            rowCount = Convert.ToInt32(command.ExecuteScalar());
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message + "thrown at CountRecords()", ex);
        }
        return rowCount;
    }

    public void DeleteRecords(int count)
    {
        count = count - 2;
        var query = $"DELETE FROM ContentTable WHERE ID IN (SELECT ID FROM ContentTable ORDER BY ID ASC LIMIT {count})";
        ExecuteCommand(query);
    }

}
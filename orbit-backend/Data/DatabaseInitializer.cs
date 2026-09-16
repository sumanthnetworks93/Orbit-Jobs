using Microsoft.EntityFrameworkCore;

namespace Orbit.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(OrbitDbContext db)
    {
        await db.Database.EnsureCreatedAsync();
        await EnsureStartupColumnsAsync(db);
        await EnsureJobColumnsAsync(db);
    }

    private static async Task EnsureStartupColumnsAsync(OrbitDbContext db)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        await using (var connection = db.Database.GetDbConnection())
        {
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = "PRAGMA table_info('Startups');";

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                columns.Add(reader.GetString(1));
            }
        }

        if (!columns.Contains("ExternalKey"))
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Startups ADD COLUMN ExternalKey TEXT NULL;");
        }

        if (!columns.Contains("SourceUrl"))
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Startups ADD COLUMN SourceUrl TEXT NULL;");
        }

        await db.Database.ExecuteSqlRawAsync(
            "CREATE UNIQUE INDEX IF NOT EXISTS IX_Startups_ExternalKey ON Startups(ExternalKey) WHERE ExternalKey IS NOT NULL;");
    }

    private static async Task EnsureJobColumnsAsync(OrbitDbContext db)
    {
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var startupIdNotNull = false;

        await using (var connection = db.Database.GetDbConnection())
        {
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }

            await using var command = connection.CreateCommand();
            command.CommandText = "PRAGMA table_info('Jobs');";

            await using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var name = reader.GetString(1);
                columns.Add(name);

                if (name.Equals("StartupId", StringComparison.OrdinalIgnoreCase) && !reader.IsDBNull(3))
                {
                    startupIdNotNull = reader.GetInt32(3) == 1;
                }
            }
        }

        if (!columns.Contains("ExternalKey"))
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Jobs ADD COLUMN ExternalKey TEXT NULL;");
        }

        if (!columns.Contains("SourceUrl"))
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Jobs ADD COLUMN SourceUrl TEXT NULL;");
        }

        if (!columns.Contains("PostedAt"))
        {
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Jobs ADD COLUMN PostedAt TEXT NULL;");
        }

        if (startupIdNotNull)
        {
            await db.Database.ExecuteSqlRawAsync("""
                CREATE TABLE IF NOT EXISTS Jobs_new (
                    Id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    Title TEXT NOT NULL,
                    Company TEXT NOT NULL,
                    Location TEXT NOT NULL,
                    JobType TEXT NOT NULL,
                    Tags TEXT NOT NULL,
                    Salary TEXT NOT NULL,
                    Initial TEXT NOT NULL,
                    Color TEXT NOT NULL,
                    StartupId INTEGER NULL,
                    ExternalKey TEXT NULL,
                    SourceUrl TEXT NULL,
                    PostedAt TEXT NULL
                );
                """);

            await db.Database.ExecuteSqlRawAsync("""
                INSERT INTO Jobs_new (Id, Title, Company, Location, JobType, Tags, Salary, Initial, Color, StartupId, ExternalKey, SourceUrl, PostedAt)
                SELECT Id, Title, Company, Location, JobType, Tags, Salary, Initial, Color, StartupId, ExternalKey, SourceUrl, PostedAt
                FROM Jobs;
                """);

            await db.Database.ExecuteSqlRawAsync("DROP TABLE Jobs;");
            await db.Database.ExecuteSqlRawAsync("ALTER TABLE Jobs_new RENAME TO Jobs;");
        }

        await db.Database.ExecuteSqlRawAsync(
            "CREATE UNIQUE INDEX IF NOT EXISTS IX_Jobs_ExternalKey ON Jobs(ExternalKey) WHERE ExternalKey IS NOT NULL;");
    }
}

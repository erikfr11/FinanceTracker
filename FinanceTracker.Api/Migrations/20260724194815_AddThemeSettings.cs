using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinanceTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ThemeSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DarkPageBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkCardBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkSurfaceBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkBorderColor = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkTextPrimary = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkTextSecondary = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    DarkTextMuted = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightPageBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightCardBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightSurfaceBg = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightBorderColor = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightTextPrimary = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightTextSecondary = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    LightTextMuted = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    PrimaryColor = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    IncomeColor = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false),
                    ExpenseColor = table.Column<string>(type: "character varying(9)", maxLength: 9, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThemeSettings", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ThemeSettings",
                columns: new[] { "Id", "DarkBorderColor", "DarkCardBg", "DarkPageBg", "DarkSurfaceBg", "DarkTextMuted", "DarkTextPrimary", "DarkTextSecondary", "ExpenseColor", "IncomeColor", "LightBorderColor", "LightCardBg", "LightPageBg", "LightSurfaceBg", "LightTextMuted", "LightTextPrimary", "LightTextSecondary", "PrimaryColor" },
                values: new object[] { 1, "#334155", "#0f172a", "#020617", "#1e293b", "#94a3b8", "#f1f5f9", "#cbd5e1", "#ef4444", "#10b981", "#e2e8f0", "#ffffff", "#f8fafc", "#f1f5f9", "#64748b", "#0f172a", "#475569", "#2563eb" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ThemeSettings");
        }
    }
}

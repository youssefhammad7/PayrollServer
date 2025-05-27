using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PayrollServer.Infrastructure.Migrations
{
    public partial class Absence : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AbsenceRecords_EmployeeId_Month_Year",
                table: "AbsenceRecords");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "AbsenceRecords");

            migrationBuilder.RenameColumn(
                name: "DaysAbsent",
                table: "AbsenceRecords",
                newName: "AbsenceDays");

            migrationBuilder.AddColumn<decimal>(
                name: "AdjustmentPercentage",
                table: "AbsenceRecords",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AbsenceThresholds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MinAbsenceDays = table.Column<int>(type: "int", nullable: false),
                    MaxAbsenceDays = table.Column<int>(type: "int", nullable: true),
                    AdjustmentPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AbsenceThresholds", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRecords_EmployeeId_Year_Month",
                table: "AbsenceRecords",
                columns: new[] { "EmployeeId", "Year", "Month" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceThresholds_Name",
                table: "AbsenceThresholds",
                column: "Name",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AbsenceThresholds");

            migrationBuilder.DropIndex(
                name: "IX_AbsenceRecords_EmployeeId_Year_Month",
                table: "AbsenceRecords");

            migrationBuilder.DropColumn(
                name: "AdjustmentPercentage",
                table: "AbsenceRecords");

            migrationBuilder.RenameColumn(
                name: "AbsenceDays",
                table: "AbsenceRecords",
                newName: "DaysAbsent");

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "AbsenceRecords",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AbsenceRecords_EmployeeId_Month_Year",
                table: "AbsenceRecords",
                columns: new[] { "EmployeeId", "Month", "Year" });
        }
    }
}

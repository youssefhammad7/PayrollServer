using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PayrollServer.Infrastructure.Migrations
{
    public partial class Incentives : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SalaryRecords_EmployeeId",
                table: "SalaryRecords");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "SalaryRecords",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "Incentives",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsTaxable = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incentives", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Incentives_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SalaryRecords_EmployeeId_EffectiveDate",
                table: "SalaryRecords",
                columns: new[] { "EmployeeId", "EffectiveDate" },
                unique: true,
                filter: "[EffectiveDate] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Incentives_EmployeeId",
                table: "Incentives",
                column: "EmployeeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Incentives");

            migrationBuilder.DropIndex(
                name: "IX_SalaryRecords_EmployeeId_EffectiveDate",
                table: "SalaryRecords");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "SalaryRecords",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.CreateIndex(
                name: "IX_SalaryRecords_EmployeeId",
                table: "SalaryRecords",
                column: "EmployeeId");
        }
    }
}

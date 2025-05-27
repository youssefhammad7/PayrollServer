using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PayrollServer.Infrastructure.Migrations
{
    public partial class PayrollEntities : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EmploymentStatus",
                table: "Employees",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "EmployeeId",
                table: "Employees",
                newName: "EmployeeNumber");

            migrationBuilder.RenameIndex(
                name: "IX_Employees_EmployeeId",
                table: "Employees",
                newName: "IX_Employees_EmployeeNumber");

            migrationBuilder.AlterColumn<DateTime>(
                name: "HiringDate",
                table: "Employees",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateTable(
                name: "PayrollSnapshots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Month = table.Column<int>(type: "int", nullable: false),
                    BaseSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DepartmentIncentiveAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    ServiceYearsIncentiveAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    AttendanceAdjustmentAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false, defaultValue: 0m),
                    GrossSalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DepartmentIncentivePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ServiceYearsIncentivePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    AttendanceAdjustmentPercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    AbsenceDays = table.Column<int>(type: "int", nullable: true),
                    YearsOfService = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollSnapshots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PayrollSnapshots_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PayrollSnapshots_EmployeeId_Year_Month",
                table: "PayrollSnapshots",
                columns: new[] { "EmployeeId", "Year", "Month" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PayrollSnapshots");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Employees",
                newName: "EmploymentStatus");

            migrationBuilder.RenameColumn(
                name: "EmployeeNumber",
                table: "Employees",
                newName: "EmployeeId");

            migrationBuilder.RenameIndex(
                name: "IX_Employees_EmployeeNumber",
                table: "Employees",
                newName: "IX_Employees_EmployeeId");

            migrationBuilder.AlterColumn<DateTime>(
                name: "HiringDate",
                table: "Employees",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}

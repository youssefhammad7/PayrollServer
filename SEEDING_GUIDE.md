# PayrollServer Data Seeding Guide

## Overview

This document describes the comprehensive data seeding strategy implemented for the PayrollServer system. The seeding provides realistic test data that demonstrates all features of the payroll system.

## Seeding Strategy

The data seeding follows a hierarchical approach, ensuring dependencies are satisfied in the correct order:

### 1. Foundation Data
- **Roles & Users**: Admin roles and default admin user
- **Job Grades**: Three salary grades (First, Second, Third) with salary ranges
- **Departments**: Seven departments with different incentive percentages
- **Service Brackets**: Six service year brackets with increasing incentive percentages
- **Absence Thresholds**: Six attendance rules affecting payroll adjustments

### 2. Employee Data
- **Employees**: 16 realistic employees across all departments and job grades
- **Salary Records**: Historical and current salary data for each employee
- **Absence Records**: 6 months of attendance data with realistic patterns
- **Incentives**: Various bonuses and awards (performance, project, referral, etc.)

### 3. Calculated Data
- **Payroll Snapshots**: 3 months of calculated payroll data showing complete salary breakdowns

## Data Details

### Departments (7 total)
| Department | Incentive % | Description |
|------------|-------------|-------------|
| Human Resources | 8.5% | Employee management and policies |
| Information Technology | 12.0% | Software development and IT support |
| Finance | 10.0% | Financial planning and accounting |
| Sales | 15.0% | Revenue generation and client relations |
| Marketing | 9.0% | Brand promotion and market research |
| Operations | 7.5% | Process management and efficiency |
| Customer Service | 6.0% | Customer support and satisfaction |

### Job Grades (3 total)
| Grade | Salary Range | Description |
|-------|--------------|-------------|
| First | $30,000 - $50,000 | Entry-level positions |
| Second | $50,000 - $80,000 | Mid-level positions |
| Third | $80,000 - $120,000 | Senior-level positions |

### Service Brackets (6 total)
| Bracket | Years | Incentive % | Description |
|---------|-------|-------------|-------------|
| New Employee | 0-1 | 0% | First year of employment |
| Early Career | 1-3 | 2% | Building experience |
| Established Employee | 3-5 | 4% | Proven contributor |
| Experienced Professional | 5-10 | 6% | Subject matter expert |
| Senior Professional | 10-15 | 8% | Leadership role |
| Veteran Employee | 15+ | 10% | Long-term dedication |

### Absence Thresholds (6 total)
| Threshold | Days | Adjustment % | Impact |
|-----------|------|--------------|--------|
| Perfect Attendance | 0 | +5% | Bonus for no absences |
| Excellent Attendance | 1 | +2% | Minor bonus |
| Good Attendance | 2 | 0% | No adjustment |
| Acceptable Attendance | 3 | -2% | Small deduction |
| Poor Attendance | 4-5 | -5% | Moderate deduction |
| Unacceptable Attendance | 6+ | -10% | Significant deduction |

### Employees (16 total)
The seeding creates 16 employees distributed across:
- All 7 departments (2-3 employees each)
- All 3 job grades (mix of experience levels)
- Hiring dates spanning 2015-2023 (realistic service years)
- Diverse names, addresses, and contact information

### Salary Records
- Historical salary progression based on years of service
- Annual increases of approximately 5%
- Salaries positioned within job grade ranges
- Current salary records for payroll calculations

### Absence Records
- 6 months of attendance data per employee
- Realistic absence patterns with seasonal variations
- Higher absence rates in winter months
- Varied patterns based on employee tenure

### Incentives
Multiple types of incentives are seeded:
- **Performance Bonuses**: Annual bonuses (5-15% of salary)
- **Project Bonuses**: IT and Sales completion bonuses ($500-$3,000)
- **Spot Awards**: Recognition awards ($100-$500)
- **Referral Bonuses**: Employee referral rewards ($1,000)
- **Service Awards**: Long-term service recognition ($100/year)
- **Holiday Bonuses**: Year-end bonuses (8% of salary)

### Payroll Snapshots
- 3 months of calculated payroll data
- Complete breakdown of salary components:
  - Base salary
  - Department incentive amount
  - Service years incentive amount
  - Attendance adjustment amount
  - Gross salary total
- Historical percentages and metadata

## Running the Seeding

### Automatic Seeding
The seeding runs automatically when the application starts:

```bash
dotnet run --project PayrollServer
```

The seeding is idempotent - it will only run if the data doesn't already exist.

### Manual Database Reset
To reset and re-seed the database:

1. Delete the database (if using SQL Server LocalDB):
```bash
# Stop the application first
# Then delete the database files or use SQL Server Management Studio
```

2. Run the application again:
```bash
dotnet run --project PayrollServer
```

### Seeding Order
The seeders run in this specific order to maintain referential integrity:

1. `RoleSeeder` - Identity roles
2. `DefaultAdminSeeder` - Admin user
3. `JobGradeSeeder` - Job grade definitions
4. `DepartmentSeeder` - Department setup
5. `ServiceBracketSeeder` - Service year brackets
6. `AbsenceThresholdSeeder` - Attendance rules
7. `EmployeeSeeder` - Employee records
8. `SalaryRecordSeeder` - Salary history
9. `AbsenceRecordSeeder` - Attendance records
10. `IncentiveSeeder` - Bonus and incentive records
11. `PayrollSnapshotSeeder` - Calculated payroll data

## Verification

After seeding, you can verify the data through:

### API Endpoints
- `GET /api/employees` - View all employees
- `GET /api/departments` - View departments with incentives
- `GET /api/payroll/snapshots` - View calculated payroll data

### Database Queries
```sql
-- Check employee count by department
SELECT d.Name, COUNT(e.Id) as EmployeeCount
FROM Departments d
LEFT JOIN Employees e ON d.Id = e.DepartmentId
WHERE d.IsDeleted = 0 AND (e.IsDeleted = 0 OR e.IsDeleted IS NULL)
GROUP BY d.Name;

-- Check payroll snapshots
SELECT e.FirstName, e.LastName, p.Year, p.Month, p.GrossSalary
FROM PayrollSnapshots p
JOIN Employees e ON p.EmployeeId = e.Id
WHERE p.IsDeleted = 0
ORDER BY p.Year DESC, p.Month DESC, e.LastName;
```

## Customization

To modify the seeding data:

1. **Employee Data**: Edit `EmployeeSeeder.cs` to add/modify employee records
2. **Department Incentives**: Adjust percentages in `DepartmentSeeder.cs`
3. **Salary Ranges**: Modify ranges in `JobGradeSeeder.cs`
4. **Service Brackets**: Update brackets in `ServiceBracketSeeder.cs`
5. **Absence Rules**: Modify thresholds in `AbsenceThresholdSeeder.cs`

## Benefits

This comprehensive seeding provides:

✅ **Realistic Data**: Names, addresses, and employment patterns  
✅ **Complete Coverage**: All entities and relationships populated  
✅ **Historical Context**: Multi-month data for trend analysis  
✅ **Calculation Examples**: Demonstrates payroll calculation logic  
✅ **Edge Cases**: Various scenarios (perfect attendance, long service, etc.)  
✅ **Immediate Testing**: Ready-to-use data for frontend development  
✅ **Demo Ready**: Professional data for presentations and demos  

## Troubleshooting

### Common Issues

1. **Foreign Key Errors**: Ensure seeders run in the correct order
2. **Duplicate Data**: Seeders are idempotent but check for existing data
3. **Migration Issues**: Run `dotnet ef database update` if needed
4. **Connection Issues**: Verify connection string in `appsettings.json`

### Logs
Check the application logs for seeding progress and any errors:
- Successful seeding shows count of records created
- Skipped seeding shows when data already exists
- Errors show detailed exception information 
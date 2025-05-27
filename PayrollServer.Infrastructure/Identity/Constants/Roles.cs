namespace PayrollServer.Infrastructure.Identity.Constants
{
    public static class Roles
    {
        public const string Admin = "Admin";
        public const string HRClerk = "HR Clerk";
        public const string ReadOnly = "Read-Only";

        public static readonly string[] All = { Admin, HRClerk, ReadOnly };

        public static readonly Dictionary<string, string> Descriptions = new()
        {
            { Admin, "Full access to all system features including user management and configuration." },
            { HRClerk, "Access to employee, payroll, and attendance management." },
            { ReadOnly, "View-only access to employee information and reports." }
        };
    }
} 
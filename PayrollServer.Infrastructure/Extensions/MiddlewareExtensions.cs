using Microsoft.AspNetCore.Builder;
using PayrollServer.Infrastructure.Middleware;

namespace PayrollServer.Infrastructure.Extensions
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
} 
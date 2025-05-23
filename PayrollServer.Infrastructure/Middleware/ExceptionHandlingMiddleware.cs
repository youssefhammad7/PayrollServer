using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using PayrollServer.Domain.Exceptions;
using PayrollServer.Infrastructure.Exceptions;
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace PayrollServer.Infrastructure.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = exception switch
            {
                // Domain exceptions
                EntityNotFoundException => HttpStatusCode.NotFound,
                InvalidEntityStateException => HttpStatusCode.BadRequest,
                BusinessRuleViolationException => HttpStatusCode.BadRequest,
                DomainException => HttpStatusCode.BadRequest,
                
                // Infrastructure exceptions
                InvalidCredentialsException => HttpStatusCode.Unauthorized,
                UserNotFoundException => HttpStatusCode.NotFound,
                AccountLockedException => HttpStatusCode.Forbidden,
                AccountDeactivatedException => HttpStatusCode.Forbidden,
                EmailAlreadyConfirmedException => HttpStatusCode.BadRequest,
                TokenValidationException => HttpStatusCode.BadRequest,
                IdentityServiceException => HttpStatusCode.BadRequest,
                InfrastructureException => HttpStatusCode.BadRequest,
                
                // Default for unhandled exceptions
                _ => HttpStatusCode.InternalServerError
            };

            var response = new
            {
                status = (int)statusCode,
                success = false,
                message = GetUserFriendlyMessage(exception, statusCode),
                error = new
                {
                    type = exception.GetType().Name,
                    detail = exception.Message
                }
            };

            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }

        private static string GetUserFriendlyMessage(Exception exception, HttpStatusCode statusCode)
        {
            return statusCode switch
            {
                HttpStatusCode.NotFound => "The requested resource was not found.",
                HttpStatusCode.BadRequest => "The request was invalid or cannot be processed.",
                HttpStatusCode.Unauthorized => "Authentication failed or user is not authorized.",
                HttpStatusCode.Forbidden => "You do not have permission to access this resource.",
                HttpStatusCode.InternalServerError => "An unexpected error occurred on the server.",
                _ => "An error occurred while processing your request."
            };
        }
    }
} 
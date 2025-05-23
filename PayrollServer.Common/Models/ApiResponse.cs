using System;
using System.Collections.Generic;

namespace PayrollServer.Common.Models
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public IEnumerable<string>? Errors { get; set; }
        public int StatusCode { get; set; }

        // Success response with data
        public static ApiResponse<T> Success(T data, string? message = null, int statusCode = 200)
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                Data = data,
                Message = message ?? "Operation completed successfully",
                StatusCode = statusCode
            };
        }

        // Success response without data
        public static ApiResponse<T> Success(string? message = null, int statusCode = 200)
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                Message = message ?? "Operation completed successfully",
                StatusCode = statusCode
            };
        }

        // Error response with message
        public static ApiResponse<T> Fail(string message, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Message = message,
                StatusCode = statusCode
            };
        }

        // Error response with multiple errors
        public static ApiResponse<T> Fail(IEnumerable<string> errors, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Errors = errors,
                StatusCode = statusCode
            };
        }

        // Error response with exception
        public static ApiResponse<T> Fail(Exception ex, int statusCode = 500)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Message = ex.Message,
                StatusCode = statusCode
            };
        }
    }

    // Non-generic version for responses without data
    public class ApiResponse : ApiResponse<object>
    {
        public static new ApiResponse Success(string? message = null, int statusCode = 200)
        {
            return new ApiResponse
            {
                IsSuccess = true,
                Message = message ?? "Operation completed successfully",
                StatusCode = statusCode
            };
        }

        public static new ApiResponse Fail(string message, int statusCode = 400)
        {
            return new ApiResponse
            {
                IsSuccess = false,
                Message = message,
                StatusCode = statusCode
            };
        }

        public static new ApiResponse Fail(IEnumerable<string> errors, int statusCode = 400)
        {
            return new ApiResponse
            {
                IsSuccess = false,
                Errors = errors,
                StatusCode = statusCode
            };
        }

        public static new ApiResponse Fail(Exception ex, int statusCode = 500)
        {
            return new ApiResponse
            {
                IsSuccess = false,
                Message = ex.Message,
                StatusCode = statusCode
            };
        }
    }
} 
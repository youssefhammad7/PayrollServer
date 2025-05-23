using System.Net;

namespace PayrollServer.Application.Models.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int Status { get; set; }
        public T? Data { get; set; }

        public static ApiResponse<T> Create(T? data = default, string message = "", HttpStatusCode statusCode = HttpStatusCode.OK)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Status = (int)statusCode,
                Data = data
            };
        }

        public static ApiResponse<T> SuccessResponse(T? data, string message = "Operation completed successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Status = (int)HttpStatusCode.OK,
                Data = data
            };
        }

        public static ApiResponse<T> Created(T? data, string message = "Resource created successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Status = (int)HttpStatusCode.Created,
                Data = data
            };
        }

        public static ApiResponse<T> Failed(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)statusCode,
                Data = default
            };
        }

        public static ApiResponse<T> NotFound(string message = "Resource not found")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)HttpStatusCode.NotFound,
                Data = default
            };
        }

        public static ApiResponse<T> BadRequest(string message = "Invalid request")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)HttpStatusCode.BadRequest,
                Data = default
            };
        }

        public static ApiResponse<T> Unauthorized(string message = "Unauthorized access")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)HttpStatusCode.Unauthorized,
                Data = default
            };
        }

        public static ApiResponse<T> Forbidden(string message = "Access forbidden")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)HttpStatusCode.Forbidden,
                Data = default
            };
        }

        public static ApiResponse<T> ServerError(string message = "Internal server error")
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Status = (int)HttpStatusCode.InternalServerError,
                Data = default
            };
        }
    }

    // Non-generic version for responses without data
    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse SuccessResponse(string message = "Operation completed successfully")
        {
            return new ApiResponse
            {
                Success = true,
                Message = message,
                Status = (int)HttpStatusCode.OK,
                Data = null
            };
        }

        public static ApiResponse Failed(string message, HttpStatusCode statusCode = HttpStatusCode.BadRequest)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Status = (int)statusCode,
                Data = null
            };
        }
    }
} 
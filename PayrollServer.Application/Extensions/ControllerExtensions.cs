using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.Models.Common;
using System.Net;

namespace PayrollServer.Application.Extensions
{
    public static class ControllerExtensions
    {
        public static ActionResult<ApiResponse<T>> ToResponse<T>(this ControllerBase controller, ApiResponse<T> response)
        {
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> OkResponse<T>(this ControllerBase controller, T data, string message = "")
        {
            var response = ApiResponse<T>.SuccessResponse(data, message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<object>> OkResponse(this ControllerBase controller, string message = "Operation completed successfully")
        {
            var response = ApiResponse.SuccessResponse(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> CreatedResponse<T>(this ControllerBase controller, T data, string message = "Resource created successfully")
        {
            var response = ApiResponse<T>.Created(data, message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> NotFoundResponse<T>(this ControllerBase controller, string message = "Resource not found")
        {
            var response = ApiResponse<T>.NotFound(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> BadRequestResponse<T>(this ControllerBase controller, string message = "Invalid request")
        {
            var response = ApiResponse<T>.BadRequest(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<object>> BadRequestResponse(this ControllerBase controller, string message = "Invalid request")
        {
            var response = ApiResponse.Failed(message, HttpStatusCode.BadRequest);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> UnauthorizedResponse<T>(this ControllerBase controller, string message = "Unauthorized access")
        {
            var response = ApiResponse<T>.Unauthorized(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> ForbiddenResponse<T>(this ControllerBase controller, string message = "Access forbidden")
        {
            var response = ApiResponse<T>.Forbidden(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<T>> ServerErrorResponse<T>(this ControllerBase controller, string message = "Internal server error")
        {
            var response = ApiResponse<T>.ServerError(message);
            return controller.StatusCode(response.Status, response);
        }

        public static ActionResult<ApiResponse<object>> ServerErrorResponse(this ControllerBase controller, string message = "Internal server error")
        {
            var response = ApiResponse.Failed(message, HttpStatusCode.InternalServerError);
            return controller.StatusCode(response.Status, response);
        }
    }
} 
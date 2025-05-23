using Microsoft.AspNetCore.Mvc;
using PayrollServer.Models;
using System;
using System.Collections.Generic;

namespace PayrollServer.Extensions
{
    public static class ControllerExtensions
    {
        public static ActionResult WithApiResponse<T>(this ControllerBase controller, ApiResponse<T> response)
        {
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiOk<T>(this ControllerBase controller, T data, string message = null)
        {
            var response = ApiResponse<T>.Success(data, message);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiOk(this ControllerBase controller, string message = null)
        {
            var response = ApiResponse.Success(message);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiCreated<T>(this ControllerBase controller, T data, string message = null)
        {
            var response = ApiResponse<T>.Success(data, message, 201);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiBadRequest(this ControllerBase controller, string message)
        {
            var response = ApiResponse.Fail(message, 400);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiBadRequest(this ControllerBase controller, IEnumerable<string> errors)
        {
            var response = ApiResponse.Fail(errors, 400);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiNotFound(this ControllerBase controller, string message = "Resource not found")
        {
            var response = ApiResponse.Fail(message, 404);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiUnauthorized(this ControllerBase controller, string message = "Unauthorized access")
        {
            var response = ApiResponse.Fail(message, 401);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiForbidden(this ControllerBase controller, string message = "Forbidden access")
        {
            var response = ApiResponse.Fail(message, 403);
            return controller.StatusCode(response.StatusCode, response);
        }

        public static ActionResult ApiServerError(this ControllerBase controller, Exception ex)
        {
            var response = ApiResponse.Fail(ex, 500);
            return controller.StatusCode(response.StatusCode, response);
        }
    }
} 
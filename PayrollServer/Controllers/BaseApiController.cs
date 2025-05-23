using Microsoft.AspNetCore.Mvc;

namespace PayrollServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
    }
} 
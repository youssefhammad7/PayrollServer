using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollServer.Application.DTOs.SalaryRecord;
using PayrollServer.Application.Features.SalaryRecord.Requests;
using PayrollServer.Application.Interfaces.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PayrollServer.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SalaryRecordsController : ControllerBase
    {
        private readonly ISalaryRecordService _salaryRecordService;

        public SalaryRecordsController(ISalaryRecordService salaryRecordService)
        {
            _salaryRecordService = salaryRecordService;
        }

        // GET: api/SalaryRecords
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalaryRecordDto>>> GetSalaryRecords([FromQuery] int? employeeId = null)
        {
            var salaryRecords = await _salaryRecordService.GetAllSalaryRecordsAsync(employeeId);
            return Ok(salaryRecords);
        }

        // GET: api/SalaryRecords/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SalaryRecordDto>> GetSalaryRecord(int id)
        {
            var salaryRecord = await _salaryRecordService.GetSalaryRecordByIdAsync(id);
            return Ok(salaryRecord);
        }

        // GET: api/SalaryRecords/employee/5/history
        [HttpGet("employee/{employeeId}/history")]
        public async Task<ActionResult<IEnumerable<SalaryRecordDto>>> GetSalaryHistory(int employeeId)
        {
            var salaryHistory = await _salaryRecordService.GetSalaryHistoryForEmployeeAsync(employeeId);
            return Ok(salaryHistory);
        }

        // GET: api/SalaryRecords/employee/5/current
        [HttpGet("employee/{employeeId}/current")]
        public async Task<ActionResult<SalaryRecordDto>> GetCurrentSalary(int employeeId)
        {
            var currentSalary = await _salaryRecordService.GetCurrentSalaryForEmployeeAsync(employeeId);
            return Ok(currentSalary);
        }

        // POST: api/SalaryRecords
        [HttpPost]
        public async Task<ActionResult<SalaryRecordDto>> CreateSalaryRecord(CreateSalaryRecordRequest request)
        {
            var salaryRecord = await _salaryRecordService.CreateSalaryRecordAsync(request);
            return CreatedAtAction(nameof(GetSalaryRecord), new { id = salaryRecord.Id }, salaryRecord);
        }

        // PUT: api/SalaryRecords/5
        [HttpPut("{id}")]
        public async Task<ActionResult<SalaryRecordDto>> UpdateSalaryRecord(int id, UpdateSalaryRecordRequest request)
        {
            var salaryRecord = await _salaryRecordService.UpdateSalaryRecordAsync(id, request);
            return Ok(salaryRecord);
        }

        // DELETE: api/SalaryRecords/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteSalaryRecord(int id)
        {
            var result = await _salaryRecordService.DeleteSalaryRecordAsync(id);
            return Ok(result);
        }
    }
} 
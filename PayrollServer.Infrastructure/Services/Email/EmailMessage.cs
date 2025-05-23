using System.Collections.Generic;

namespace PayrollServer.Infrastructure.Services.Email
{
    public class EmailMessage
    {
        public required string To { get; set; }
        public string? From { get; set; }
        public required string Subject { get; set; }
        public required string Body { get; set; }
        public bool IsHtml { get; set; } = true;
        public List<EmailAttachment> Attachments { get; set; } = new List<EmailAttachment>();
    }

    public class EmailAttachment
    {
        public required string FileName { get; set; }
        public required byte[] Content { get; set; }
        public required string ContentType { get; set; }
    }
} 
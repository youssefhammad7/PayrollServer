# PayrollServer Database Reset Script
# This script helps reset the database and re-run seeding

Write-Host "PayrollServer Database Reset Script" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

# Check if we're in the correct directory
if (-not (Test-Path "PayrollServer.sln")) {
    Write-Host "Error: Please run this script from the solution root directory" -ForegroundColor Red
    exit 1
}

# Function to stop any running instances
function Stop-Application {
    Write-Host "Stopping any running PayrollServer instances..." -ForegroundColor Yellow
    Get-Process -Name "PayrollServer" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Function to reset database using Entity Framework
function Reset-Database {
    Write-Host "Resetting database..." -ForegroundColor Yellow
    
    try {
        # Drop the database
        dotnet ef database drop --project PayrollServer.Infrastructure --startup-project PayrollServer --force
        Write-Host "Database dropped successfully" -ForegroundColor Green
        
        # Apply migrations
        dotnet ef database update --project PayrollServer.Infrastructure --startup-project PayrollServer
        Write-Host "Database migrations applied successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Error during database reset: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Function to run the application and seed data
function Start-Application {
    Write-Host "Starting application to run seeding..." -ForegroundColor Yellow
    
    try {
        # Build the solution first
        dotnet build PayrollServer.sln
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed"
        }
        
        Write-Host "Application built successfully" -ForegroundColor Green
        Write-Host "Starting application (seeding will run automatically)..." -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop the application after seeding completes" -ForegroundColor Cyan
        
        # Run the application
        dotnet run --project PayrollServer
    }
    catch {
        Write-Host "Error starting application: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Main execution
try {
    # Confirm action
    $confirmation = Read-Host "This will delete all existing data and re-seed the database. Continue? (y/N)"
    if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
        Write-Host "Operation cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    # Stop any running instances
    Stop-Application
    
    # Reset database
    if (-not (Reset-Database)) {
        exit 1
    }
    
    Write-Host ""
    Write-Host "Database reset complete!" -ForegroundColor Green
    Write-Host "The application will now start and automatically seed the database with test data." -ForegroundColor Cyan
    Write-Host ""
    
    # Start application
    Start-Application
}
catch {
    Write-Host "Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Write-Host ""
    Write-Host "Script execution completed" -ForegroundColor Green
} 
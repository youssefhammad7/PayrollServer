#!/bin/bash

# PayrollServer Database Reset Script
# This script helps reset the database and re-run seeding

echo "PayrollServer Database Reset Script"
echo "==================================="

# Check if we're in the correct directory
if [ ! -f "PayrollServer.sln" ]; then
    echo "Error: Please run this script from the solution root directory"
    exit 1
fi

# Function to stop any running instances
stop_application() {
    echo "Stopping any running PayrollServer instances..."
    pkill -f "PayrollServer" 2>/dev/null || true
    sleep 2
}

# Function to reset database using Entity Framework
reset_database() {
    echo "Resetting database..."
    
    # Drop the database
    if ! dotnet ef database drop --project PayrollServer.Infrastructure --startup-project PayrollServer --force; then
        echo "Error: Failed to drop database"
        return 1
    fi
    echo "Database dropped successfully"
    
    # Apply migrations
    if ! dotnet ef database update --project PayrollServer.Infrastructure --startup-project PayrollServer; then
        echo "Error: Failed to apply migrations"
        return 1
    fi
    echo "Database migrations applied successfully"
    
    return 0
}

# Function to run the application and seed data
start_application() {
    echo "Starting application to run seeding..."
    
    # Build the solution first
    if ! dotnet build PayrollServer.sln; then
        echo "Error: Build failed"
        return 1
    fi
    
    echo "Application built successfully"
    echo "Starting application (seeding will run automatically)..."
    echo "Press Ctrl+C to stop the application after seeding completes"
    
    # Run the application
    dotnet run --project PayrollServer
    
    return 0
}

# Main execution
main() {
    # Confirm action
    echo -n "This will delete all existing data and re-seed the database. Continue? (y/N): "
    read -r confirmation
    if [ "$confirmation" != "y" ] && [ "$confirmation" != "Y" ]; then
        echo "Operation cancelled"
        exit 0
    fi
    
    # Stop any running instances
    stop_application
    
    # Reset database
    if ! reset_database; then
        exit 1
    fi
    
    echo ""
    echo "Database reset complete!"
    echo "The application will now start and automatically seed the database with test data."
    echo ""
    
    # Start application
    start_application
}

# Run main function
main "$@" 
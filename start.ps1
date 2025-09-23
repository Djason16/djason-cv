Clear-Host

# Display mode selection menu
Write-Host "Select mode:"
Write-Host "D - Development (Nuxt 4 + Express)"
Write-Host "G - Generate site (static)"
Write-Host "B - Build site"

# Read user input and convert to uppercase
$key = Read-Host "Select mode (D=Dev, G=Generate, B=Build)" | ForEach-Object { $_.ToUpper() }

# Function to start a server in a new PowerShell window
function Start-Server {
    param (
        [string]$Path,      # Project path
        [string]$Name,      # Server name for display
        [string]$Command    # Command to run
    )

    # PowerShell script to execute in the new window
    $scriptBlock = @"
Set-Location '$Path'
Write-Host '$Name starting...' -ForegroundColor Green

try {
    Invoke-Expression '$Command'   # Run the command
} catch {
    Write-Host "Error: `$(`$_.Exception.Message)" -ForegroundColor Red
} finally {
    Write-Host ''
    Write-Host '$Name finished.' -ForegroundColor Yellow
    `$choice = Read-Host 'Keep window open? (Y to keep, N to close)'
    
    if (`$choice -eq 'Y' -or `$choice -eq 'y' -or `$choice -eq '') {
        Write-Host 'Window will remain open. You can run additional commands.'
        # Keep the PowerShell session interactive
    } else {
        Write-Host 'Closing window...'
        exit
    }
}
"@

    # Open a new PowerShell window and execute the script
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $scriptBlock
}

# Handle user selection
switch ($key) {
    "D" {
        Write-Host "`nStarting development servers..." -ForegroundColor Cyan

        # Start frontend Nuxt 4
        Start-Server -Path "$PSScriptRoot\app" -Name "Frontend (Nuxt 4)" -Command "npm run dev"

        Start-Sleep -Seconds 2

        # Start backend Express
        Start-Server -Path "$PSScriptRoot\api" -Name "Backend (Express)" -Command "npm run dev"

        Write-Host "`nBoth servers started in separate windows." -ForegroundColor Green
        Write-Host "Check the individual windows for server status." -ForegroundColor Yellow
    }

    "G" {
        Write-Host "`nGenerating site..." -ForegroundColor Cyan
        Start-Server -Path "$PSScriptRoot\app" -Name "Site Generator" -Command "npm run generate"
    }

    "B" {
        Write-Host "`nBuilding site..." -ForegroundColor Cyan
        Start-Server -Path "$PSScriptRoot\app" -Name "Site Builder" -Command "npm run build"
    }

    default {
        Write-Host "`nInvalid selection. Exiting..." -ForegroundColor Red
        Read-Host "Press Enter to exit"
    }
}
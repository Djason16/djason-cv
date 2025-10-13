Clear-Host

# Display mode selection menu
Write-Host "Select mode:"
Write-Host "D - Development (Nuxt 4)"
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

$appPath = Join-Path $PSScriptRoot "app"

# Handle user selection
switch ($key) {
    "D" {
        Write-Host "`nStarting Nuxt 4 development server..." -ForegroundColor Cyan
        Start-Server -Path $appPath -Name "Nuxt 4 Development" -Command "npm run dev -- --host"
        Write-Host "`nNuxt 4 server started." -ForegroundColor Green
    }

    "G" {
        Write-Host "`nGenerating site..." -ForegroundColor Cyan
        Start-Server -Path $appPath -Name "Site Generator" -Command "npm run generate"
    }

    "B" {
        Write-Host "`nBuilding site..." -ForegroundColor Cyan
        Start-Server -Path $appPath -Name "Site Builder" -Command "npm run build"
    }

    default {
        Write-Host "`nInvalid selection. Exiting..." -ForegroundColor Red
        Read-Host "Press Enter to exit"
    }
}
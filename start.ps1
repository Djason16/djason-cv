# Launch frontend (Nuxt 3) dev server in the "app" folder
Start-Process cmd.exe -ArgumentList "/c cd `"$PSScriptRoot\app`" && npm run dev" -WindowStyle Normal

# Launch backend (Node.js API) dev server in the "api" folder
Start-Process cmd.exe -ArgumentList "/c cd `"$PSScriptRoot\api`" && npm run dev" -WindowStyle Normal

# Notify user
Write-Host "`nFrontend (Nuxt 3) and backend (Node.js API) servers started in separate windows."
Write-Host "Close the windows to stop the servers."
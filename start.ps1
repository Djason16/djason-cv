# Lancer npm run dev dans app
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"$PSScriptRoot\app`" && npm run dev" -WindowStyle Normal

# Lancer npm run dev dans api
Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"$PSScriptRoot\api`" && npm run dev" -WindowStyle Normal

Write-Host "`nLes deux serveurs ont ete lances dans des fenetres separees."
Write-Host "Ferme les fenetres pour arreter les serveurs."
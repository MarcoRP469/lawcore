<#
Start-EdgeDebug.ps1
Script para iniciar Microsoft Edge con remote debugging.
Uso:
  .\start-edge-debug.ps1
  .\start-edge-debug.ps1 -Url "http://localhost:3000"
#>
param(
    [string]$Url = ''
)

function Start-EdgeWithDebug {
    param(
        [string]$exePath,
        [string]$url
    )
    $args = @('--remote-debugging-port=9222')
    if ($url -ne '') { $args += $url }
    Start-Process -FilePath $exePath -ArgumentList $args
}

# Intentar comando msedge
$msedgeCmd = Get-Command msedge -ErrorAction SilentlyContinue
if ($msedgeCmd) {
    Write-Host "Usando: $($msedgeCmd.Source)"
    Start-EdgeWithDebug -exePath $msedgeCmd.Source -url $Url
    exit 0
}

# Rutas comunes
$possiblePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

foreach ($p in $possiblePaths) {
    if (Test-Path $p) {
        Write-Host "Found msedge at $p"
        Start-EdgeWithDebug -exePath $p -url $Url
        exit 0
    }
}

Write-Host "No se encontró msedge en las rutas comunes ni en PATH. Instala Edge o añadelo al PATH." -ForegroundColor Yellow
exit 1

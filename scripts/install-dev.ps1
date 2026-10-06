$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " SFX Studio - Extension Installer" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Registry hack for PlayerDebugMode
Write-Host "`n[1/3] Enabling Adobe PlayerDebugMode..." -ForegroundColor Yellow
foreach ($i in 7..11) {
    $path = "HKCU:\Software\Adobe\CSXS.$i"
    if (!(Test-Path $path)) {
        New-Item -Path $path -Force | Out-Null
    }
    Set-ItemProperty -Path $path -Name "PlayerDebugMode" -Value "1"
}

# 2. Verify Build Output
Write-Host "`n[2/3] Verifying extension build..." -ForegroundColor Yellow
if (!(Test-Path "$ProjectRoot\dist")) {
    Write-Error "The dist folder was not found. Please run 'npm run build' first."
    exit 1
}

# 3. Copy files
Write-Host "`n[3/3] Copying extension files to Adobe CEP folder..." -ForegroundColor Yellow
$extName = "com.sfxstudio.panel"
$cepPath = "$env:APPDATA\Adobe\CEP\extensions\$extName"

if (Test-Path $cepPath) {
    Remove-Item -Recurse -Force $cepPath
}
New-Item -ItemType Directory -Force -Path $cepPath | Out-Null

Copy-Item -Recurse -Force "$ProjectRoot\CSXS" "$cepPath\"
Copy-Item -Recurse -Force "$ProjectRoot\dist" "$cepPath\"
Copy-Item -Recurse -Force "$ProjectRoot\jsx" "$cepPath\"

Write-Host "`n[Success] Extension installed to:" -ForegroundColor Green
Write-Host $cepPath -ForegroundColor Green

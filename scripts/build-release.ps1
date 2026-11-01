# Proton PRO Build & Release Packaging Script
param(
    [string]$Version = ""
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$SourceDir = Join-Path $Root "Proton PRO"
$ManifestPath = Join-Path $SourceDir "manifest.json"
$DistDir = Join-Path $Root "dist"

if (-not (Test-Path $ManifestPath)) {
    Write-Error "manifest.json not found at $ManifestPath"
}

$manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
if (-not $Version) {
    $Version = $manifest.version
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Proton PRO Extension Release Packager" -ForegroundColor Magenta
Write-Host "   Version: v$Version" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

$ZipName = "proton-pro-v$Version.zip"
$ZipPath = Join-Path $DistDir $ZipName

if (Test-Path $ZipPath) {
    Remove-Item -Force $ZipPath
    Write-Host "[*] Removed existing archive: $ZipName" -ForegroundColor Yellow
}

Write-Host "[*] Packaging extension from '$SourceDir'..." -ForegroundColor Cyan

# Package clean zip
Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipPath -CompressionLevel Optimal

if (Test-Path $ZipPath) {
    $fileItem = Get-Item $ZipPath
    $hash = (Get-FileHash $ZipPath -Algorithm SHA256).Hash
    $len = $fileItem.Length
    $sizeMB = [math]::Round($len / 1MB, 2)

    # Save checksum file
    $ChecksumFile = Join-Path $DistDir "proton-pro-v$Version.sha256"
    "$hash  $ZipName" | Out-File -FilePath $ChecksumFile -Encoding utf8

    Write-Host ""
    Write-Host "[OK] Package successfully generated!" -ForegroundColor Green
    Write-Host "     File:     $ZipPath" -ForegroundColor White
    Write-Host "     Size:     $sizeMB MB ($len bytes)" -ForegroundColor White
    Write-Host "     SHA-256:  $hash" -ForegroundColor Yellow
    Write-Host "     Checksum: $ChecksumFile" -ForegroundColor White
    Write-Host "==================================================" -ForegroundColor Cyan
} else {
    Write-Error "Failed to generate release zip package."
}

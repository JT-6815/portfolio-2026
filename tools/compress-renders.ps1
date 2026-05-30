param(
  [int]$Quality = 86
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $projectRoot "renders"
$outputDir = Join-Path $projectRoot "web-renders"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Add-Type -AssemblyName System.Drawing

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object {
  $_.MimeType -eq "image/jpeg"
}

$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
  [System.Drawing.Imaging.Encoder]::Quality,
  [int64]$Quality
)

Get-ChildItem $sourceDir -Filter "page-*.png" | ForEach-Object {
  $image = [System.Drawing.Image]::FromFile($_.FullName)
  $outputPath = Join-Path $outputDir ($_.BaseName + ".jpg")
  $image.Save($outputPath, $encoder, $encoderParams)
  $image.Dispose()
  Write-Output ("Compressed {0} -> {1}" -f $_.Name, $outputPath)
}

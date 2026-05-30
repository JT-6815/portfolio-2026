param(
  [Parameter(Mandatory = $true)]
  [string]$PdfPath,

  [int]$DestinationWidth = 1680
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $projectRoot "renders"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

Add-Type -AssemblyName System.Runtime.WindowsRuntime

function Get-AsTaskMethod([string]$paramTypeName, [int]$genericCount) {
  [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq "AsTask" -and
    $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq $paramTypeName -and
    $_.GetGenericArguments().Count -eq $genericCount
  } | Select-Object -First 1
}

$asTaskOp = Get-AsTaskMethod "IAsyncOperation`1" 1
$asTaskAction = Get-AsTaskMethod "IAsyncAction" 0

function Await-Op($operation, $type) {
  $task = $asTaskOp.MakeGenericMethod($type).Invoke($null, @($operation))
  $task.Wait()
  return $task.Result
}

function Await-Action($action) {
  $task = $asTaskAction.Invoke($null, @($action))
  $task.Wait()
}

$resolvedPdf = (Resolve-Path $PdfPath).Path
$pdfFile = Await-Op ([Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]::GetFileFromPathAsync($resolvedPdf)) ([Windows.Storage.StorageFile])
$pdfDoc = Await-Op ([Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime]::LoadFromFileAsync($pdfFile)) ([Windows.Data.Pdf.PdfDocument])

for ($index = 0; $index -lt $pdfDoc.PageCount; $index++) {
  $pageNumber = $index + 1
  $page = $pdfDoc.GetPage($index)

  $options = [Windows.Data.Pdf.PdfPageRenderOptions, Windows.Data.Pdf, ContentType = WindowsRuntime]::new()
  $options.DestinationWidth = [uint32]$DestinationWidth
  $options.DestinationHeight = [uint32][math]::Round($DestinationWidth * $page.Size.Height / $page.Size.Width)

  $stream = [Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime]::new()
  Await-Action ($page.RenderToStreamAsync($stream, $options))
  $stream.Seek(0)

  $netStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($stream)
  $outputPath = Join-Path $outputDir ("page-{0:00}.png" -f $pageNumber)
  $fileStream = [System.IO.File]::Create($outputPath)
  $netStream.CopyTo($fileStream)
  $fileStream.Dispose()
  $netStream.Dispose()

  Write-Output ("Rendered page {0} -> {1}" -f $pageNumber, $outputPath)
}

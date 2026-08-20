$ErrorActionPreference = 'Stop'

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$WorkspaceRoot = Split-Path $ProjectRoot -Parent
$CacheRoot = Join-Path $WorkspaceRoot '.cache'

$env:NPM_CONFIG_CACHE = Join-Path $CacheRoot 'npm'
$env:NPM_CONFIG_PREFIX = Join-Path $CacheRoot 'npm-prefix'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $CacheRoot 'ms-playwright'
$env:LOCALAPPDATA = Join-Path $CacheRoot 'localappdata'
$env:APPDATA = Join-Path $CacheRoot 'appdata'
$env:TEMP = Join-Path $CacheRoot 'tmp'
$env:TMP = $env:TEMP

New-Item -ItemType Directory -Force -Path @(
  $env:NPM_CONFIG_CACHE,
  $env:NPM_CONFIG_PREFIX,
  $env:PLAYWRIGHT_BROWSERS_PATH,
  $env:LOCALAPPDATA,
  $env:APPDATA,
  $env:TEMP
) | Out-Null

Set-Location $ProjectRoot

. (Join-Path $PSScriptRoot 'set-e-drive-env.ps1')

npm run test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run test:e2e
exit $LASTEXITCODE

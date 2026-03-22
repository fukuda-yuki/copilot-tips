param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Paths
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if (-not $Paths -or $Paths.Count -eq 0) {
  Write-Error "Provide one or more file paths or glob patterns."
}

function Resolve-MarkdownFiles {
  param(
    [string[]]$InputPaths
  )

  $resolved = New-Object System.Collections.Generic.List[string]

  foreach ($inputPath in $InputPaths) {
    if ([string]::IsNullOrWhiteSpace($inputPath)) {
      continue
    }

    if ($inputPath -match '^(?<base>.+?)[/\\]\*\*[/\\](?<leaf>[^/\\]+)$') {
      $base = $Matches.base
      $leaf = $Matches.leaf

      if (Test-Path $base) {
        Get-ChildItem -Path $base -Recurse -File -Filter $leaf | ForEach-Object {
          $resolved.Add($_.FullName)
        }
      }

      continue
    }

    if ($inputPath.IndexOfAny(@('*', '?', '[')) -ge 0) {
      Get-ChildItem -Path $inputPath -File | ForEach-Object {
        $resolved.Add($_.FullName)
      }
      continue
    }

    if (Test-Path $inputPath -PathType Leaf) {
      $resolved.Add((Resolve-Path $inputPath).Path)
    }
  }

  $resolved |
    Sort-Object -Unique
}

function Normalize-Target {
  param(
    [string]$RawTarget
  )

  $target = $RawTarget.Trim()
  if ($target.StartsWith("<") -and $target.EndsWith(">")) {
    $target = $target.Trim("<", ">")
  }

  $spaceIndex = $target.IndexOf(" ")
  if ($spaceIndex -gt 0) {
    $target = $target.Substring(0, $spaceIndex)
  }

  return $target
}

function Test-RemoteLink {
  param(
    [string]$Target
  )

  $headers = @{
    "User-Agent" = "awesome-copilot-ja-dotnet-mvc-link-check"
  }

  try {
    $response = Invoke-WebRequest -Uri $Target -Method Head -MaximumRedirection 5 -TimeoutSec 30 -Headers $headers
    return $null
  } catch {
    try {
      $response = Invoke-WebRequest -Uri $Target -Method Get -MaximumRedirection 5 -TimeoutSec 30 -Headers $headers
      return $null
    } catch {
      return $_.Exception.Message
    }
  }
}

function Resolve-SelfRepoLink {
  param(
    [string]$Target
  )

  $cleanTarget = $Target.Split("#")[0]
  if ([string]::IsNullOrWhiteSpace($cleanTarget)) {
    return $null
  }

  $blobPattern = '^https://github\.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/blob/[^/]+/(?<path>.+)$'
  $rawPattern = '^https://raw\.githubusercontent\.com/FUKUDA-YUKI/awesome-copilot-ja-dotnet-mvc/[^/]+/(?<path>.+)$'

  if ($cleanTarget -match $blobPattern -or $cleanTarget -match $rawPattern) {
    $relativePath = $Matches.path -replace '/', [System.IO.Path]::DirectorySeparatorChar
    $candidate = Join-Path $repoRoot $relativePath
    if (Test-Path $candidate) {
      return $candidate
    }
  }

  return $null
}

function Test-LocalLink {
  param(
    [string]$SourceFile,
    [string]$Target
  )

  $cleanTarget = $Target.Split("#")[0]
  if ([string]::IsNullOrWhiteSpace($cleanTarget)) {
    return $null
  }

  $baseDir = Split-Path -Parent $SourceFile
  if ([string]::IsNullOrWhiteSpace($baseDir)) {
    $baseDir = "."
  }

  $candidate = Join-Path $baseDir $cleanTarget
  if (Test-Path $candidate) {
    return $null
  }

  return "missing local path"
}

$files = Resolve-MarkdownFiles -InputPaths $Paths
if (-not $files -or $files.Count -eq 0) {
  Write-Error "No files matched the supplied paths."
}

$pattern = '!\[[^\]]*\]\((?<target>[^)]+)\)|\[[^\]]+\]\((?<target>[^)]+)\)'
$failures = New-Object System.Collections.Generic.List[string]
$seen = [System.Collections.Generic.HashSet[string]]::new()

foreach ($file in $files) {
  $content = Get-Content -Raw -Encoding UTF8 $file
  $matches = [regex]::Matches($content, $pattern)

  foreach ($match in $matches) {
    $target = Normalize-Target -RawTarget $match.Groups["target"].Value

    if ([string]::IsNullOrWhiteSpace($target)) {
      continue
    }

    if (
      $target.StartsWith("#") -or
      $target.StartsWith("mailto:") -or
      $target.StartsWith("tel:")
    ) {
      continue
    }

    $key = "$file|$target"
    if (-not $seen.Add($key)) {
      continue
    }

    if ($target -match '^https?://') {
      $localSelfRepoPath = Resolve-SelfRepoLink -Target $target
      if ($localSelfRepoPath) {
        continue
      }

      $errorMessage = Test-RemoteLink -Target $target
      if ($errorMessage) {
        $failures.Add("$file -> $target : $errorMessage")
      }
      continue
    }

    $errorMessage = Test-LocalLink -SourceFile $file -Target $target
    if ($errorMessage) {
      $failures.Add("$file -> $target : $errorMessage")
    }
  }
}

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host ("Link check passed for {0} file(s)." -f $files.Count)

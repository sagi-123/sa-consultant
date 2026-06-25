Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\shame\.gemini\antigravity\brain\86950e86-a949-4a9e-8f6c-c59d3972c837\favicon_square_1782243950753.png"
$icoPath = "public\favicon.ico"
$pngPath = "public\favicon.png"

$sizes = @(16, 32, 48, 64)

Write-Host "`n📸 Loading source image..."
$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath).Path)

# ---------- Save a crisp 64x64 PNG favicon.png ----------
$bmp64 = New-Object System.Drawing.Bitmap(64, 64)
$g64 = [System.Drawing.Graphics]::FromImage($bmp64)
$g64.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g64.DrawImage($src, 0, 0, 64, 64)
$g64.Dispose()
$bmp64.Save((Join-Path (Get-Location) $pngPath), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp64.Dispose()
Write-Host "✅ favicon.png saved (64x64)"

# ---------- Build proper multi-size ICO binary ----------
$pngStreams = @()
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $pngStreams += @{ size = $size; bytes = $ms.ToArray() }
    $ms.Dispose()
    Write-Host "  Resized to ${size}x${size}: $($pngStreams[-1].bytes.Length) bytes"
}

$src.Dispose()

# ICO structure
$count      = $pngStreams.Count
$headerSize = 6
$dirSize    = 16 * $count
$dataStart  = $headerSize + $dirSize

$allBytes = New-Object System.Collections.Generic.List[byte]

# ICONDIR header (6 bytes)
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]0))   # reserved
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]1))   # type = ICO
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]$count))

# ICONDIRENTRY directory (16 bytes each) — placeholder, we'll fill offsets later
$dirBytes = New-Object 'byte[]' ($dirSize)
$allBytes.AddRange($dirBytes)

# Image data + fill directory
$offset = $dataStart
for ($i = 0; $i -lt $count; $i++) {
    $entry = $pngStreams[$i]
    $sz    = $entry.size
    $buf   = $entry.bytes
    $len   = $buf.Length
    $de    = $headerSize + $i * 16

    # Write ICONDIRENTRY into the list
    $allBytes[$de + 0] = [byte]($sz -ge 256 ? 0 : $sz)   # width
    $allBytes[$de + 1] = [byte]($sz -ge 256 ? 0 : $sz)   # height
    $allBytes[$de + 2] = 0                                  # color count
    $allBytes[$de + 3] = 0                                  # reserved
    $b = [System.BitConverter]::GetBytes([uint16]1); $allBytes[$de+4]=$b[0]; $allBytes[$de+5]=$b[1]   # planes
    $b = [System.BitConverter]::GetBytes([uint16]32); $allBytes[$de+6]=$b[0]; $allBytes[$de+7]=$b[1]  # bpp
    $b = [System.BitConverter]::GetBytes([uint32]$len); $allBytes[$de+8]=$b[0]; $allBytes[$de+9]=$b[1]; $allBytes[$de+10]=$b[2]; $allBytes[$de+11]=$b[3]  # size
    $b = [System.BitConverter]::GetBytes([uint32]$offset); $allBytes[$de+12]=$b[0]; $allBytes[$de+13]=$b[1]; $allBytes[$de+14]=$b[2]; $allBytes[$de+15]=$b[3]  # offset

    $allBytes.AddRange($buf)
    $offset += $len
}

$outFull = Join-Path (Get-Location) $icoPath
[System.IO.File]::WriteAllBytes($outFull, $allBytes.ToArray())

$kb = [math]::Round($allBytes.Count / 1024, 1)
$sizeList = $sizes -join ', '
Write-Host "`n✅ favicon.ico written: $outFull ($kb KB, $count sizes: ${sizeList}px)"
Write-Host "`n🎉 Done! Both favicon files are ready to commit."

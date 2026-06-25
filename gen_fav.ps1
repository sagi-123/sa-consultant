Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\shame\.gemini\antigravity\brain\86950e86-a949-4a9e-8f6c-c59d3972c837\favicon_square_1782243950753.png"
$icoPath = "C:\Users\shame\SA consultant\sa-elevate\sa-elevate\public\favicon.ico"
$pngPath = "C:\Users\shame\SA consultant\sa-elevate\sa-elevate\public\favicon.png"
$sizes   = @(16, 32, 48, 64)
Write-Host "Loading source..."
$src = [System.Drawing.Image]::FromFile($srcPath)
$bmp64 = New-Object System.Drawing.Bitmap(64, 64)
$g64 = [System.Drawing.Graphics]::FromImage($bmp64)
$g64.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g64.DrawImage($src, 0, 0, 64, 64)
$g64.Dispose()
$bmp64.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp64.Dispose()
Write-Host "favicon.png saved (64x64)"
$pngStreams = New-Object System.Collections.ArrayList
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $null = $pngStreams.Add(@{ size = $size; bytes = $ms.ToArray() })
    $ms.Dispose()
    Write-Host "  Processed ${size}x${size}"
}
$src.Dispose()
$count     = $pngStreams.Count
$dataStart = 6 + 16 * $count
$allBytes  = New-Object System.Collections.Generic.List[byte]
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]0))
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]1))
$allBytes.AddRange([System.BitConverter]::GetBytes([uint16]$count))
for ($j = 0; $j -lt (16 * $count); $j++) { $allBytes.Add(0) }
$offset = $dataStart
for ($i = 0; $i -lt $count; $i++) {
    $entry = $pngStreams[$i]
    $sz  = [int]$entry.size
    $buf = $entry.bytes
    $len = $buf.Length
    $de  = 6 + $i * 16
    $allBytes[$de+0] = [byte]$(if ($sz -ge 256) { 0 } else { $sz })
    $allBytes[$de+1] = [byte]$(if ($sz -ge 256) { 0 } else { $sz })
    $allBytes[$de+2] = 0
    $allBytes[$de+3] = 0
    $b = [System.BitConverter]::GetBytes([uint16]1);         $allBytes[$de+4]=$b[0];  $allBytes[$de+5]=$b[1]
    $b = [System.BitConverter]::GetBytes([uint16]32);        $allBytes[$de+6]=$b[0];  $allBytes[$de+7]=$b[1]
    $b = [System.BitConverter]::GetBytes([uint32]$len);      $allBytes[$de+8]=$b[0];  $allBytes[$de+9]=$b[1];  $allBytes[$de+10]=$b[2]; $allBytes[$de+11]=$b[3]
    $b = [System.BitConverter]::GetBytes([uint32]$offset);   $allBytes[$de+12]=$b[0]; $allBytes[$de+13]=$b[1]; $allBytes[$de+14]=$b[2]; $allBytes[$de+15]=$b[3]
    $allBytes.AddRange($buf)
    $offset += $len
}
[System.IO.File]::WriteAllBytes($icoPath, $allBytes.ToArray())
Write-Host "favicon.ico written successfully!"
Write-Host "DONE"

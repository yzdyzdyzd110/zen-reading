Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $PSCommandPath }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$form = New-Object System.Windows.Forms.Form
$form.Text = 'ZenReading - 禅定阅读'
$form.Size = New-Object System.Drawing.Size(360, 200)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

$label = New-Object System.Windows.Forms.Label
$label.Text = 'ZenReading'
$label.Font = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$label.ForeColor = [System.Drawing.Color]::FromArgb(0x7a, 0x9a, 0x7d)
$label.AutoSize = $true
$label.Location = New-Object System.Drawing.Point(60, 20)

$sub = New-Object System.Windows.Forms.Label
$sub.Text = '禅定阅读 · 沉浸式学习'
$sub.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$sub.ForeColor = [System.Drawing.Color]::Gray
$sub.AutoSize = $true
$sub.Location = New-Object System.Drawing.Point(62, 52)

$btnStart = New-Object System.Windows.Forms.Button
$btnStart.Text = 'Start Server'
$btnStart.Size = New-Object System.Drawing.Size(260, 34)
$btnStart.Location = New-Object System.Drawing.Point(50, 82)
$btnStart.FlatStyle = 'Flat'
$btnStart.BackColor = [System.Drawing.Color]::FromArgb(0x7a, 0x9a, 0x7d)
$btnStart.ForeColor = [System.Drawing.Color]::White
$btnStart.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btnStart.Add_Click({
    Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $scriptDir
    $form.Close()
})

$btnExit = New-Object System.Windows.Forms.Button
$btnExit.Text = 'Exit'
$btnExit.Size = New-Object System.Drawing.Size(260, 30)
$btnExit.Location = New-Object System.Drawing.Point(50, 124)
$btnExit.FlatStyle = 'Flat'
$btnExit.ForeColor = [System.Drawing.Color]::Gray
$btnExit.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$btnExit.Add_Click({ $form.Close() })

$form.Controls.Add($label)
$form.Controls.Add($sub)
$form.Controls.Add($btnStart)
$form.Controls.Add($btnExit)
[void] $form.ShowDialog()

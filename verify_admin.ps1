function Req($method, $url, $body = $null, $token = $null) {
    $wreq = [System.Net.WebRequest]::Create($url)
    $wreq.Method = $method
    $wreq.ContentType = "application/json"
    if ($token) { $wreq.Headers.Add("Authorization", "Bearer $token") }
    if ($body) {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $wreq.ContentLength = $bytes.Length
        $s = $wreq.GetRequestStream()
        $s.Write($bytes, 0, $bytes.Length)
        $s.Close()
    } else { $wreq.ContentLength = 0 }
    try {
        $res = $wreq.GetResponse()
        $reader = New-Object System.IO.StreamReader($res.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Close()
        return @{ status = [int]$res.StatusCode; body = $content }
    } catch [System.Net.WebException] {
        $code = [int]$_.Exception.Response.StatusCode
        $errReader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errBody = $errReader.ReadToEnd()
        $errReader.Close()
        return @{ status = $code; body = $errBody }
    }
}

$pass = 0
$fail = 0

function Check($label, $cond, $detail = "") {
    if ($cond) {
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $label  $detail" -ForegroundColor Red
        $script:fail++
    }
}

Write-Host "`n=== 1. Frontend serves index.html ===" -ForegroundColor Cyan
$r = Req "GET" "http://localhost:3000"
Check "HTTP 200" ($r.status -eq 200)
Check "Contains <div id=app>" ($r.body -match 'id="app"')

Write-Host "`n=== 2. Unknown route /dashboard redirects (SPA fallback) ===" -ForegroundColor Cyan
$r2 = Req "GET" "http://localhost:3000/dashboard"
Check "HTTP 200 (SPA serves index.html)" ($r2.status -eq 200)
Check "Contains <div id=app>" ($r2.body -match 'id="app"')

Write-Host "`n=== 3. Admin login API ===" -ForegroundColor Cyan
$r3 = Req "POST" "http://localhost:3000/api/auth/admin/login" '{"email":"admin@example.com","password":"adminpass"}'
Check "HTTP 200" ($r3.status -eq 200)
$loginJson = $r3.body | ConvertFrom-Json
Check "success=true" ($loginJson.success -eq $true)
Check "role=ADMIN" ($loginJson.user.role -eq "ADMIN")
Check "token present" (-not [string]::IsNullOrEmpty($loginJson.token))
$token = $loginJson.token
Write-Host "    token length=$($token.Length)"

Write-Host "`n=== 4. POST /api/search/orders (admin token) ===" -ForegroundColor Cyan
$r4 = Req "POST" "http://localhost:3000/api/search/orders" '{"page":0,"size":5}' $token
Check "HTTP 200 (not 500)" ($r4.status -eq 200)
$ordersJson = $r4.body | ConvertFrom-Json
Check "success=true" ($ordersJson.success -eq $true)
Check "has totalHits field" ($null -ne $ordersJson.totalHits)
Check "has orders array" ($null -ne $ordersJson.orders)
Write-Host "    totalHits=$($ordersJson.totalHits)  totalRevenue=$($ordersJson.totalRevenue)"

Write-Host "`n=== 5. GET /api/products (dashboard products fetch) ===" -ForegroundColor Cyan
$r5 = Req "GET" "http://localhost:3000/api/products?page=1&limit=5" $null $token
Check "HTTP 200" ($r5.status -eq 200)
$prodJson = $r5.body | ConvertFrom-Json
Check "success=true" ($prodJson.success -eq $true)
Check "totalItems=335" ($prodJson.pagination.totalItems -eq 335)
Check "has data array" ($prodJson.data.Count -gt 0)
Check "products have images" (-not [string]::IsNullOrEmpty($prodJson.data[0].images))
Check "products have price_minor" ($prodJson.data[0].price_minor -gt 0)
Write-Host "    totalItems=$($prodJson.pagination.totalItems)  sample='$($prodJson.data[0].title)'"

Write-Host "`n=== 6. GET /api/products?page=1&limit=5&sortBy=rating&order=desc (top products) ===" -ForegroundColor Cyan
$r6 = Req "GET" "http://localhost:3000/api/products?page=1&limit=5&sortBy=rating&order=desc" $null $token
Check "HTTP 200" ($r6.status -eq 200)
$topJson = $r6.body | ConvertFrom-Json
Check "has data" ($topJson.data.Count -gt 0)

Write-Host "`n=== 7. Verify MongoDB data intact ===" -ForegroundColor Cyan
$mongoCount = docker exec ecom-java-mongo mongosh ecommerce --quiet --eval "db.products.countDocuments()" 2>&1
Check "335 products in MongoDB" ($mongoCount.Trim() -eq "335")

Write-Host "`n==============================" -ForegroundColor Cyan
Write-Host "PASSED: $pass   FAILED: $fail" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
if ($fail -eq 0) {
    Write-Host "All checks passed. Admin dashboard is fully operational." -ForegroundColor Green
}

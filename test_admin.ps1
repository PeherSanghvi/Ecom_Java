$creds = [System.Text.Encoding]::UTF8.GetBytes('{"email":"admin@example.com","password":"adminpass"}')
$wreq = [System.Net.WebRequest]::Create("http://localhost:8083/api/auth/admin/login")
$wreq.Method = "POST"
$wreq.ContentType = "application/json"
$wreq.ContentLength = $creds.Length
$stream = $wreq.GetRequestStream()
$stream.Write($creds, 0, $creds.Length)
$stream.Close()
$wres = $wreq.GetResponse()
$reader = New-Object System.IO.StreamReader($wres.GetResponseStream())
$body = $reader.ReadToEnd()
$reader.Close()
$json = $body | ConvertFrom-Json
$token = $json.token
Write-Host "Login OK, role=$($json.user.role), tokenLen=$($token.Length)"

# Now test search/orders with token
$payload = [System.Text.Encoding]::UTF8.GetBytes('{"page":0,"size":5}')
$wreq2 = [System.Net.WebRequest]::Create("http://localhost:8083/api/search/orders")
$wreq2.Method = "POST"
$wreq2.ContentType = "application/json"
$wreq2.ContentLength = $payload.Length
$wreq2.Headers.Add("Authorization", "Bearer $token")
$s2 = $wreq2.GetRequestStream()
$s2.Write($payload, 0, $payload.Length)
$s2.Close()
try {
    $res2 = $wreq2.GetResponse()
    $r2 = New-Object System.IO.StreamReader($res2.GetResponseStream())
    $b2 = $r2.ReadToEnd()
    $r2.Close()
    Write-Host "search/orders response: $b2"
} catch [System.Net.WebException] {
    $statusCode = [int]$_.Exception.Response.StatusCode
    Write-Host "search/orders ERROR status=$statusCode"
    $errReader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body: $($errReader.ReadToEnd())"
}

# Test products endpoint
$wreq3 = [System.Net.WebRequest]::Create("http://localhost:8083/api/products?page=1&limit=3")
$wreq3.Method = "GET"
$wreq3.Headers.Add("Authorization", "Bearer $token")
$res3 = $wreq3.GetResponse()
$r3 = New-Object System.IO.StreamReader($res3.GetResponseStream())
$b3 = $r3.ReadToEnd()
$r3.Close()
$productsJson = $b3 | ConvertFrom-Json
Write-Host "products totalItems=$($productsJson.pagination.totalItems)"

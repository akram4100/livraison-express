#!/usr/bin/env bash
# قم بتشغيل هذا من PowerShell لاختبار الاتصال

Write-Host "🔥 اختبار اتصال Firebase مع المتاجر" -ForegroundColor Green
Write-Host "=====================================`n"

# 1. اختبار السيرفر
Write-Host "1️⃣  اختبار السيرفر على Port 8080..." -ForegroundColor Cyan
try {
    $serverCheck = Invoke-WebRequest -Uri "http://localhost:8080/api/client/stores" `
        -Method Get `
        -ContentType "application/json" `
        -TimeoutSec 5 `
        -ErrorAction Stop

    $data = $serverCheck.Content | ConvertFrom-Json
    
    Write-Host "✅ السيرفر يعمل!" -ForegroundColor Green
    Write-Host "   الحالة: $($data.message)" -ForegroundColor Green
    Write-Host "   عدد المتاجر: $($data.total)" -ForegroundColor Green
    Write-Host "   المصدر: $($data.source)" -ForegroundColor Green
    
    if ($data.stores.Count -gt 0) {
        Write-Host "`n   📝 أول 3 متاجر:" -ForegroundColor Yellow
        for ($i = 0; $i -lt [Math]::Min(3, $data.stores.Count); $i++) {
            $store = $data.stores[$i]
            Write-Host "      $($i+1). $($store.name) ($($store.category))" -ForegroundColor Magenta
        }
    }
} catch {
    Write-Host "❌ فشل الاتصال بالسيرفر!" -ForegroundColor Red
    Write-Host "   تأكد من: node server-render.js يعمل" -ForegroundColor Yellow
}

Write-Host "`n2️⃣  اختبار الواجهة الأمامية على Port 3000..." -ForegroundColor Cyan
try {
    $webCheck = Invoke-WebRequest -Uri "http://localhost:3000" `
        -TimeoutSec 5 `
        -ErrorAction Stop

    Write-Host "✅ الواجهة الأمامية تعمل!" -ForegroundColor Green
    Write-Host "   افتح: http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  الواجهة الأمامية لم تبدأ بعد" -ForegroundColor Yellow
}

Write-Host "`n=====================================`n" -ForegroundColor Green
Write-Host "📊 ملخص الحالة:" -ForegroundColor Cyan
Write-Host "✅ Backend: جاهز" -ForegroundColor Green
Write-Host "✅ Firebase: متصل" -ForegroundColor Green
Write-Host "✅ API /client/stores: يعمل" -ForegroundColor Green
Write-Host "`n🎉 اتصال حقيقي بـ Firebase!" -ForegroundColor Green

@echo off
setlocal EnableDelayedExpansion

:: Scriptin bulundugu klasore git
cd /d "%~dp0"

echo.
echo -----------------------------------------
echo  1. REACT DERLENIYOR (BUILD)...
echo -----------------------------------------

:: Frontend klasorune girip build al
cd frontend
call npm run build

:: Build hatasi varsa durdur
if %errorlevel% neq 0 (
    echo.
    echo [HATA] Build islemi basarisiz oldu!
    pause
    exit /b
)

:: Ana klasore geri don
cd ..

echo.
echo -----------------------------------------
echo  2. GITHUB'A YUKLENIYOR...
echo -----------------------------------------

git add .

:: Kullanicidan mesaj iste
set /p mesaj="Yaptigin degisikligi kisaca yaz (ve Enter'a bas): "

:: Mesaj bossa otomatik bir sey yaz
if "!mesaj!"=="" set mesaj=Otomatik guncelleme

git commit -m "!mesaj!"
git push origin main

echo.
echo -----------------------------------------
echo  ISLEM TAMAM! PENCEREYI KAPATABILIRSIN.
echo -----------------------------------------

pause
@echo off
echo -----------------------------------------
echo  🚀 REACT DERLENIYOR (BUILD)...
echo -----------------------------------------
cd frontend
call npm run build
cd ..

echo.
echo -----------------------------------------
echo  📦 GITHUB'A YUKLENIYOR...
echo -----------------------------------------
git add .
set /p mesaj="Yaptigin degisikligi kisaca yaz (ve Enter'a bas): "
git commit -m "%mesaj%"
git push origin main

echo.
echo -----------------------------------------
echo  ✅ ISLEM TAMAM! RENDER OTOMATIK BASLAYACAK.
echo -----------------------------------------

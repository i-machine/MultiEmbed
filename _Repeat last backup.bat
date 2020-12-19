@echo off

if not exist Backups goto end

if not exist "Backups\Last backup name.txt" goto end

for /f "usebackq delims=" %%a in ("Backups\Last backup name.txt") do set LastBackupName=%%a

call "_Make backup.bat" "%LastBackupName%"

:end

@echo off
cls
title Make backup

set ProjectDir=%CD%
if not exist Backups md Backups

date /T > date.tmp
time /T > time.tmp
set /p d=<date.tmp
set /p t=<time.tmp
set cd=%d:/=-%
set ct=%t::=-%
del date.tmp /Q
del time.tmp /Q

set LastBackup=
if exist "Backups\Last backup.txt" for /f "usebackq delims=" %%a in ("Backups\Last backup.txt") do set LastBackup=%%a

set LastBackupName=
if exist "Backups\Last backup name.txt" for /f "usebackq delims=" %%a in ("Backups\Last backup name.txt") do set LastBackupName=%%a

if "%~1" == "" goto inputName

set BackupName=%~1

goto doBackup

:inputName
echo Make backup
echo.
if not "%LastBackupName%" == "" (
	echo Last backup:
	echo %LastBackupName%
	echo.
	echo To repeat the last backup, leave backup name blank
	echo.
)

set /p BackupName=Enter backup name:

if "%BackupName%" == "" goto repeatLastBackup
goto doBackup

:repeatLastBackup
set BackupName=%LastBackupName%
if "%BackupName%" == "" goto end

goto doBackup

:doBackup
echo Making backup "%BackupName%" ...
title Making backup "%BackupName%" ...

echo Backups > Exclude.tmp
echo libraries >> Exclude.tmp
echo node_modules >> Exclude.tmp
echo jspm_packages >> Exclude.tmp

if exist "Backups\%BackupName%.zip" del "Backups\%BackupName%.zip" /Q

"c:\Program Files\7-zip\7z.exe" a -r -x@Exclude.tmp "Backups\%BackupName%.zip"

echo %BackupName%>"Backups\Last backup name.txt"
echo %cd% %ct%    %BackupName%>"Backups\Last backup.txt"
echo %cd% %ct%    %BackupName%>>"Backups\Backups log.txt"

del Exclude.tmp

:end

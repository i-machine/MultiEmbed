@echo off
set ProjectDir=%CD%

echo Updating libraries ...
title Updating libraries ...

set Source=Local
if exist CDN.txt set Source=CDN
if exist Dev.txt set Source=Root
if exist Local.txt set Source=Local
if exist Root.txt set Source=Root
if exist Offline.txt set Source=Root
if exist Production.txt set Source=Local

if not exist libraries md libraries
if not exist css md css

pushd C:\xampp\htdocs\Libraries\Propagate\
call Propagate.bat "%ProjectDir%" %Source%
popd

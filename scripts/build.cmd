@echo off
for /d %%D in ("%~dp0..\.tools\node-*") do set "NODE_DIR=%%D"
if not defined NODE_DIR (
  echo No se encontro Node en .tools\
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
call "%NODE_DIR%\npm.cmd" run build

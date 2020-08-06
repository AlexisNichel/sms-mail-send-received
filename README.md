# GPRS-GSM-Oracle
Conector Modulo serial con DB oracle para el envío de mensajes

#Previo (Drivers)
- Conectar lector al puerto usb
- Ingresar a administrador de dispositivos y localizar el dispositivo con nombre CP2102 
- Si el dispositivo es desconocido tenemos que instalar el Driver del mismo: https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers
Obs: Descargar versión que corresponda.
- Instalar el Driver que corresponda según la arquitectura (x86 o x64)
- Acceder nuevamente al administrador de dispositivos, en la zona de “puertos com y lpt” verificar y recordar el puerto al que se asigno.

#Instrucciones
1. Instalar git en su pc. (Este paso se puede omitir al instalar en la máquina del cliente)
2. Instalar node (v8) recomendada. https://nodejs.org/dist/latest-v8.x/ bajar el msi que corresponda a la arquitectura. Luego de instalar abrir una consola y escribir "node -v" para verificar que las variables de entornos estén correctas. La consola debe lanzar la versión de node.
3. Instalar oracle XE (11g) recomendada. (XE es para pruebas), Esto posiblemente ya se encuentre instalado en la máquina del cliente.
4. Ejecutar consola como admin y ejecutar "npm install -g windows-build-tools" (tambien se puede instalar las librerias de compilacion independiente python 2.7, gcc o g++). Es muy importante que la consola sea ejecutada como admin. Este proceso tarda bastante (Entre 10 min y 1 hora dependiendo del internet).
5. Clonar repositorio https://github.com/AlexisNichel/sms-mail-send-received.git , si se omitió paso 1 se debe descargar como zip y descomprimir.
6. Crear carpeta con nombre "logs" en el directorio raíz del proyecto (A futuro lo agrego al proyecto para omitir este paso).
7. Ejecutar npm install y rezar para que compile, si no compila la cagaste en el paso 4 o falta actualizar algo en tu pc.
8. Ejecutar el script db.sql en la consola de oracle. Para ello hay que abrir la consola, ejecutar conn y poner las credenciales.
9. Configurar el archivo config.json con los parametros de la db y del puerto serial. En puerto se puede especificar el puerto por ejemplo "COM3" o se puede poner "auto" para que se conecte al primero que encuentra.
10. Ejecutar npm install pm2 -g 
11. Cargar datos en la db, el estado debe ser "0". Cuando el mensaje es enviado se pasa a "1".
12. Ejecutar pm2 start app.js
13. Configurar el startup de pm2 http://pm2.keymetrics.io/docs/usage/startup/ , si es windows crear un starup cmd

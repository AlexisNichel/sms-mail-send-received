

El presente manual describe el funcionamiento e instalación del software necesario para el módulo SMS desarrollado por la empresa CREAR S.R.L. para el envío masivo de mensajes previamente cargados en una base de datos.

ADVERTENCIA	IMPORTANTE
 No exponer la unidad al rocío o lluvia.	Por favor lea éste manual de instalación y operación detenidamente antes de usar el equipo, y manténgalo guardado para futuras referencias.

LIMPIEZA	AVISO
Desconecte la unidad de la corriente eléctrica antes de proceder con la limpieza. No utilice productos de limpieza con alcohol y amoniaco. Utilice un trapo ligeramente humedecido con agua para limpiar la parte externa de la unidad.	Cualquier modificación o service no autorizado y/o uso no adecuado para equipos electrónicos  anula la garantía.  Ante cualquier consulta, comunicarse con el servicio técnico de CREAR S.R.L.


Descripción del módulo SMS

Figura 1: Módulo SMS


El dispositivo es compacto y fácil de instalar lo que facilita al responsable de la instalación una comodidad en la puesta a punto para cumplir con el propósito.
El módulo dispone de una entrada para la tarjeta SIM (Chip) y otra para el conector de alimentación (Power), ambas entradas están debidamente especificadas con instrucciones gráficas indicadoras. Además consta de un led indicador de conexión que parpadeará dependiendo del funcionamiento del mismo y un cable USB incorporado para establecer conexión con la máquina del cliente.

El Módulo utiliza un SIM de tamaño estándar (no micro, no nano) cuyas dimensiones se especifican en la Tabla 1 y en la Figura 2 se realiza una comparación con los distintos tamaños y formas geométricas de los SIM disponibles para su identificación, el requerido se resalta en el recuadro de color rojo.


Tarjeta SIM	Largo x Ancho x Espesor (mm)
Mini-SIM	25 x 15 x 0,76

Tabla 1: Dimensiones del SIM utilizado en el Módulo SMS.
Figura 2: Comparación de los distintos SIM disponibles, en recuadro rojo  el utilizado en el módulo SMS.

El módulo soporta todas las bandas de frecuencias habilitadas en Paraguay GSM (850 – 1900 MHz) logrando así su flexibilidad para operar con cualquier proveedor de telefonía móvil.
La disposición del SIM en el módulo se puede apreciar en la Figura 3.a, en dónde es de suma importancia la correcta inserción ya que caso contrario imposibilitaría el correcto funcionamiento.
Figura 3: a) Módulo SMS con el SIM  insertado. b) Vista Frontal dónde se observa el LED indicador y la conexión de alimentación o Power.

El dispositivo cuenta con un cable USB para establecer la comunicación con el ordenador y lograr así las distintas configuraciones y consultas requeridas con la base de datos para el envío y recepción de mensajes (SMS).

El encendido del LED (Rojo) indicador nos permite conocer si el módulo se encuentra funcionando correctamente y si se estableció  la comunicación en la red. El comportamiento del parpadeo del LED se muestra en la Tabla 2.

Estado	Descripción
Encendido por unos segundos	Inicialización
Parpadeo constante rápido	Conectando a la red
Parpadeo constante lento	Conexión establecida correctamente.

Tabla 2: Comportamiento de LED indicador del estado de conexión del módulo SMS.


Como el puerto USB del ordenador no puede suministrar la corriente necesaria para el módulo, se requiere de una fuente externa de alimentación continúa DC de 9V 2A (ver Figura 4 cómo referencia) conectado al conector dispuesto al lado del led indicador, cómo se muestra en Figura 3.b, de tal manera que el dispositivo pueda operar de manera óptima.



Figura 4: Adaptador de alimentación 9V 2A corriente continua.












Instalación y configuración del módulo SMS

A continuación detallamos los requerimientos (Drivers e Instrucciones) necesarios para establecer la conexión del Módulo SMS con la base de datos Oracle para el envío de mensajes.

IMPORTANTE: Se debe realizar un Backup del directorio SMS Oracle que se encuentra en el escritorio y guardar en un medio externo.

Instalación de drivers

•	Conectar lector al puerto USB
•	Conectar la fuente de alimentación al dispositivo y a la red eléctrica
•	Ingresar a administrador de dispositivos y localizar el dispositivo con nombre CP2102
•	Si el dispositivo no es reconocido se debe instalar el Driver  que puede ser bajado de: https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers Observación: Descargar versión que corresponda a la arquitectura (x86 o x64) y el Sistema Operativo.
•	Instalar el Driver.
•	Acceder nuevamente al Administrador de dispositivos, en la zona de “Puertos (COM y LPT)” verificar que esté reconocido y recordar el puerto que le fue asignado.

Instrucciones para la instalación de la aplicación

1.	Crear el directorio SMS Oracle y bajar el backup previamente realizado.
2.	Instalar Node (v12) recomendada en el ordenador donde está instalado el módulo. Descargar de: https://nodejs.org/download/release/v12.18.3/ bajar el msi que corresponda a la arquitectura. Luego de instalar abrir una consola y escribir "node -v" para verificar que las variables de entorno estén correctas. La consola debe indicar la versión de node.
3.	Ejecutar consola como admin y ejecutar "npm install -g windows-build-tools" (también se puede instalar las librerías de compilación independiente python 2.7, gcc o g++). Es muy importante que la consola sea ejecutada como administrador. Este proceso puede demorar considerablemente (Entre 10 min. a 1 hora dependiendo de la conexión a internet).
4.	Ejecutar npm install esperar a que compile, si no compila probar actualizar Windows, y verificar que los path del compilador de C++, Python y Node se encuentren configurados correctamente y luego reintentar.
5.	Ejecutar el script db.sql que se adjuntó (también se encuentra en el directorio SMS Oracle del escritorio) en la consola de Oracle. Para ello hay que abrir la consola, ejecutar conn y poner las credenciales. También se puede realizar por medio del oracle developer.
 
Se creará la siguiente tabla:


6.	Configurar el archivo config.json con los parámetros de la Base de Datos (DB) y el puerto serial, también las credenciales para el acceso al Oracle. En puerto se puede especificar con el que verificamos inicialmente donde está conectado el módulo SMS, por ejemplo "COM3" o se puede poner "auto" para que se conecte al primero que encuentre.
7.	Ejecutar "node app.js" y verificar que la conexión se inicie correctamente. En este punto puede dar problemas de dependencias de librería "Oracle Instant Client library" si no coincide con la versión del sistema operativo, para ello debemos descargarlo desde la página de Oracle: https://www.oracle.com/database/technologies/instant-client.html. Necesitaremos tener creada una cuenta en Oracle.
8.	Ejecutar npm install pm2 -g (permite levantar la app y mantenerla activa)
9.	Cargar datos en la Base de Datos, el estado al debe ser "0". Cuando el mensaje es enviado la aplicación lo cambia a "1".
10.	Ejecutar pm2 start app.js
11.	Configurar el startup de pm2 http://pm2.keymetrics.io/docs/usage/startup/ , si es Windows crear un starup cmd.
12.	 Ejecutar pm2 restart all para que se reinicie la aplicación.




















Identificación de problemas

Posibles Problemas	Soluciones
El módulo no enciende (LED indicador en OFF permanente)	•	Verificar el funcionamiento de la fuente Alimentación.
•	Revisar el estado en que se encuentra el conector auxiliar del módulo SMS
El LED del módulo parpadea muy rápido	•	Asegúrese de la correcta inserción cómo del tamaño del SIM utilizado
•	Verificar el estado de la antena del módulo
No es posible establecer comunicación con el ordenador	•	Chequear la correcta asignación del puerto COM
•	El Baud rate indicado en el Ordenador no es el correcto
No envía ni recibe SMS	•	Asegúrese de la correcta inserción cómo del tamaño del SIM utilizado
•	Verificar que el SIM posea saldo suficiente
•	Chequear el funcionamiento óptimo de la fuente de alimentación 9V 2A
•	Verificar conexión con la base de datos


Procedimiento para el envío de SMS

Para el envío de mensajes se deberán grabar en la tabla TOSEND de la base de datos especificada los datos a grabar, el estado deberá ser 0 inicialmente y cuando el mensaje sea transmitido pasará a 1.

Ejemplo de mensaje a transmitir:


Luego de transmitido:

Procedimiento para la recepción de SMS

Los mensajes recibidos se grabarán en la tabla RECEIVED de la base de datos especificada. Según se muestra a modo de ejemplo en la figura siguiente:










Procedimiento para el envío masivos de emails

El sistema también permite el envío masivo de emails por medio de un procedimiento similar al de envío de sms, que en el campo indicado por protocolo debe cambiarse a mail en lugar de sms. Para el efecto se debe configurar el sistema con los datos del servidor de envío de mensajes del cliente.
Se deberán grabar en la tabla TOSEND de la base de datos especificada los datos a enviar, el estado deberá ser 0 inicialmente y cuando el mensaje sea transmitido pasará a 1.


Luego de enviado






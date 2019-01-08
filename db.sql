----------------------------------------------
-- Export file for user CREARSRL            --
-- Created by Alexis Granja                 --
----------------------------------------------



prompt
prompt Creating table TOSEND
prompt =======================
prompt
create table TOSEND
(
  id          NUMBER,
  nombre      VARCHAR2(50),
  mensaje     VARCHAR2(500),
  asunto      VARCHAR2(50),
  numero      VARCHAR2(50),
  email       VARCHAR2(50),
  protocolo   VARCHAR2(10),
  created      VARCHAR2(10),
  send        VARCHAR2(10),
  estado      NUMBER(1)
)
nologging;
prompt
prompt Creating procedure TOSEND_UPDATES
prompt =====================================
prompt
create or replace procedure TOSEND_UPDATES(
    v_id NUMBER,
    v_output  OUT NUMBER
) IS
    v_error EXCEPTION;
BEGIN
    v_output := 0;

    BEGIN
        UPDATE tosend
        SET estado = 1 WHERE id = v_id;
        COMMIT;
    EXCEPTION
    WHEN OTHERS THEN
        RAISE v_error;
    END;

EXCEPTION
WHEN v_error THEN
    v_output := 1;
    ROLLBACK;

WHEN OTHERS THEN
    v_output := 1;
    ROLLBACK;

end TOSEND_UPDATES;
/

prompt
prompt Creating table RECEIVED
prompt =======================
prompt
create table RECEIVED
(
  receivedfrom        VARCHAR2(50),
  mensaje             VARCHAR2(500),
  receiveddate        VARCHAR2(50),
  receivedtime        VARCHAR2(50),
  estado              NUMBER(1)
)
nologging;
prompt
prompt Creating procedure RECEIVED_INSERT
prompt =====================================
prompt
create or replace procedure RECEIVED_INSERT(
    v_from      VARCHAR2,
    v_mensaje   VARCHAR2,
    v_date      VARCHAR2,
    v_time      VARCHAR2,
    v_estado    NUMBER,
    v_output  OUT NUMBER

) IS
    v_error EXCEPTION;
BEGIN
    v_output := 0;

    BEGIN
         INSERT INTO RECEIVED(
            receivedfrom,             mensaje,        receiveddate,            receivedtime,
            estado        
        )VALUES(
            v_from,                   v_mensaje,      v_date,                  v_time,
            v_estado
        );
        COMMIT;
    EXCEPTION
    WHEN OTHERS THEN
        RAISE v_error;
    END;

EXCEPTION
WHEN v_error THEN
    v_output := 1;
    ROLLBACK;

WHEN OTHERS THEN
    v_output := 1;
    ROLLBACK;

end RECEIVED_INSERT;
/

spool off
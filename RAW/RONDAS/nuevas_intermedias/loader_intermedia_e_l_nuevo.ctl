load data
  infile 'lic_emp.csv'
  into table DATOS_LICITACIONES_LIC_EMP
  fields terminated by ","
  (ID_LICITANTE,ID_EMPRESA)

import re
import sys
import poplib
from email import parser

pop_conn = poplib.POP3_SSL('outlook.office365.com')
pop_conn.user('email account')
pop_conn.pass_('password')

#Obtener mensajes del servidor. En 'pop_conn.list()[1]' se encuentran todos los correos recibidos.
messages = [pop_conn.retr(i) for i in range(1, len(pop_conn.list()[1]) + 1)]
# :
messages = ["\n".join(mssg[1]) for mssg in messages]
#Parse message intom an email object:
messages = [parser.Parser().parsestr(mssg) for mssg in messages]
for message in messages:
    print message['subject']
pop_conn.quit()

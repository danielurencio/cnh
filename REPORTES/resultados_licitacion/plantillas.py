# coding: latin1
import pandas as pd
import xlwings as xw



class Reporte(object):
    def __init__(self,archivo,hoja):
        self.wb = xw.Book(archivo)
        self.sheet = self.wb.sheets[hoja]

    def datos_grales(self):
        self.sheet.range("A2").value = u"t\xedtulo".encode("latin1")


if __name__ == "__main__":
    reporte = Reporte("plantilla_0.xlsx","A")


// Sistema Integral - User Mirror Seeds (read-only reference data)
// These represent users from the SI system for validation and autocomplete purposes
// Tabla origen referencial:
// - Código: TbUsuCVen
// - Estado: TbUsuEReg ("*" = Inactivo, vacío = Activo)
// - Nombre de usuario Sistema Integral: TbUsuDAbv

import type { SiUserMirror } from "../siUserMirrorStorage";

export const seedSiUsers: SiUserMirror[] = [
  {
    integralSystemUserId: "1",
    integralSystemUserValue: "CANNY J.",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "2",
    integralSystemUserValue: "JPEREZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "3",
    integralSystemUserValue: "MRODRIGUEZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "4",
    integralSystemUserValue: "LSANCHEZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "5",
    integralSystemUserValue: "JHERNANDEZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "6",
    integralSystemUserValue: "PGUTIERREZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "7",
    integralSystemUserValue: "DMORALES",
    integralSystemUserStatus: "*",
    status: "Inactivo",
  },
  {
    integralSystemUserId: "8",
    integralSystemUserValue: "BLEON",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "9",
    integralSystemUserValue: "AJIMENEZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
  {
    integralSystemUserId: "10",
    integralSystemUserValue: "VRAMIREZ",
    integralSystemUserStatus: "",
    status: "Activo",
  },
];

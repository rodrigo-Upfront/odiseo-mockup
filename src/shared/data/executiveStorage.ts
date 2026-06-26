const EXECUTIVES_STORAGE_KEY = "odiseo_commercial_executives";

export type ExecutiveStatus = "Activo" | "Inactivo";

export type ExecutiveRecord = {
  id: string | number;
  code: string;
  name: string;
  status: ExecutiveStatus;
};

export type CommercialExecutiveRecord = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone?: string;
  area: "Comercial";
  position: string;
  status: ExecutiveStatus;
  createdAt: string;
  updatedAt: string;
};

const INITIAL_EXECUTIVES: CommercialExecutiveRecord[] = [
  { id: 1, code: "EJC-000001", name: "JOSÉ CANNY", email: "jose.canny@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 2, code: "EJC-000002", name: "AUGUSTO OTERO", email: "augusto.otero@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 3, code: "EJC-000003", name: "DIANA FERNANDEZ", email: "diana.fernandez@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 4, code: "EJC-000004", name: "GUSTAVO LOBATÓN", email: "gustavo.lobaton@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 5, code: "EJC-000005", name: "OSWALDO LOAYZA", email: "oswaldo.loayza@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 6, code: "EJC-000006", name: "MATEO PALOMINO", email: "mateo.palomino@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 7, code: "EJC-000007", name: "FERNANDO PATRONI", email: "fernando.patroni@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 8, code: "EJC-000008", name: "DAVID RODRIGUEZ", email: "david.rodriguez@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 9, code: "EJC-000009", name: "MAYLIN AYON", email: "maylin.ayon@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 10, code: "EJC-000010", name: "MARCELO RODRÍGUEZ", email: "mrodriguez@peruplast.com.pe", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 11, code: "EJC-000011", name: "REYNALDO PORTELLA", email: "reynaldo.portella@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 12, code: "EJC-000012", name: "RAMON CISNEROS", email: "ramon.cisneros@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 13, code: "EJC-000013", name: "ALDO BOERO", email: "aldo.boero@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 14, code: "EJC-000014", name: "ZULAY CISNEROS", email: "zulay.cisneros@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 15, code: "EJC-000015", name: "GLORIA RAMOS", email: "gramos@peruplast.com.pe", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 16, code: "EJC-000016", name: "FRANK PANIZO", email: "francisco.panizo@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 17, code: "EJC-000017", name: "FRANCISCO SANCHEZ", email: "francisco.sanchezr@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 18, code: "EJC-000018", name: "EDUARDO BARBERENA", email: "eduardo.barberena@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 19, code: "EJC-000019", name: "MARK ADAMY", email: "mark.adamy@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 20, code: "EJC-000020", name: "MARTIN BELLIDO", email: "martin.bellido@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 21, code: "EJC-000021", name: "MANUEL HUERTA", email: "manuel.huerta@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 22, code: "EJC-000022", name: "IVAN SALCEDO", email: "ivan.salcedo@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 23, code: "EJC-000023", name: "CRISTIAN CORTES", email: "cristian.cortes@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 24, code: "EJC-000024", name: "LUZ SEGURA", email: "luz.segura@amcor.com.co", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 25, code: "EJC-000025", name: "CARLOS OLIVARES", email: "colivares@amcor.cl", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 26, code: "EJC-000026", name: "CASA", email: "casa@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 27, code: "EJC-000027", name: "CARLOS ZAMBRANO", email: "carlos.zambrano@amcor.com.co", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 28, code: "EJC-000028", name: "HOUSE ACCOUNT", email: "house.account@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 29, code: "EJC-000029", name: "SEBASTIAN ESCOBAR", email: "sebastian.escobar@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 30, code: "EJC-000030", name: "JEAN PAUL COLOMA", email: "jeanpaul.coloma@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 31, code: "EJC-000031", name: "MARIBEL OLAVE", email: "maribel.olave@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 32, code: "EJC-000032", name: "ANDREA OJEDA", email: "andrea.ojeda@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 33, code: "EJC-000033", name: "ALBERTO HIMEDE", email: "alberto.himede@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 34, code: "EJC-000034", name: "MIGUEL MORALES", email: "miguel.morales@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 35, code: "EJC-000035", name: "BERNARDO VALENCIA", email: "bernardo.valencia@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 36, code: "EJC-000036", name: "GUSTAVO TORRES", email: "gustavo.torres@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 37, code: "EJC-000037", name: "LUIS ENCISO", email: "luis.enciso@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 38, code: "EJC-000038", name: "DIEGO CATRIEL", email: "diego.catriel@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 39, code: "EJC-000039", name: "SERGIO MEDINA", email: "sergio.medina@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 40, code: "EJC-000040", name: "BRUNO MOSTO", email: "bruno.mosto@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 41, code: "EJC-000041", name: "LINA MARIA SIERRA", email: "lina.sierra@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 42, code: "EJC-000042", name: "FLORIAN RITTMEYER", email: "florian.rittmeyer@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 43, code: "EJC-000043", name: "EDUARDO POSADA", email: "eduardo.posada@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 44, code: "EJC-000044", name: "MARIA LUISA CIEZA", email: "maria.cieza@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 45, code: "EJC-000045", name: "LUCILE GARCIA", email: "lucille.garcia@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 46, code: "EJC-000046", name: "MARINA PEREZ", email: "marina.perez@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 47, code: "EJC-000047", name: "CINTHYA ARRIOLA", email: "cinthya.arriola@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 48, code: "EJC-000048", name: "MARIO CORDOBA", email: "mario.cordoba@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 49, code: "EJC-000049", name: "SIREL SARA", email: "sirel.sara@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 50, code: "EJC-000050", name: "MIGUEL R. RODRIGUEZ", email: "miguel.rodriguezm@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 51, code: "EJC-000051", name: "JORGE GUZMAN", email: "jorge.guzman@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 52, code: "EJC-000052", name: "AARON LOZANO", email: "Aaron.Lozano@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 53, code: "EJC-000053", name: "JOSE SOTO", email: "jose.soto@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 54, code: "EJC-000054", name: "STEPHANY BLANDON", email: "stephany.blandon@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 55, code: "EJC-000055", name: "JHON HERNANDEZ", email: "jhon.hernandez@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 56, code: "EJC-000056", name: "KATIA GUARDAMINO", email: "katia.guardamino@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 57, code: "EJC-000057", name: "ISMAEL HUAMANI", email: "Ismael.Huamani@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 58, code: "EJC-000058", name: "ISMAEL QUISPE", email: "ismael.quispe@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 59, code: "EJC-000059", name: "MARIA JOSE JARAMILLO", email: "mariajose.jaramillo@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Inactivo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 60, code: "EJC-000060", name: "ELIANA OLARTE", email: "eliana.olarte@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 61, code: "EJC-000061", name: "ZULMA ACEVEDO", email: "Zulma.Acevedo@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 62, code: "EJC-000062", name: "PATRICIA SANCHEZ", email: "patricia.sanchez@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 63, code: "EJC-000063", name: "BRYAN DEUDOR", email: "bryan.deudor@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 64, code: "EJC-000064", name: "NERY ORLANDO SOSA SANCHEZ", email: "nery.sosa@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 65, code: "EJC-000065", name: "JESUS PENA", email: "jesus.pena@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: 66, code: "EJC-000066", name: "LUIS ALVARADO", email: "luis.alvarado@amcor.com", area: "Comercial", position: "Ejecutivo Comercial", status: "Activo", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
];

function safeParseArray<T>(value: string | null): T[] {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistExecutives(records: CommercialExecutiveRecord[]) {
  localStorage.setItem(EXECUTIVES_STORAGE_KEY, JSON.stringify(records));
}

export function getCreatedExecutives(): CommercialExecutiveRecord[] {
  return safeParseArray<CommercialExecutiveRecord>(
    localStorage.getItem(EXECUTIVES_STORAGE_KEY)
  );
}

export function getExecutiveRecords(): CommercialExecutiveRecord[] {
  const createdExecutives = getCreatedExecutives();

  const createdCodes = new Set(
    createdExecutives.map((executive) => executive.code)
  );

  const createdEmails = new Set(
    createdExecutives.map((executive) => executive.email)
  );

  const initialWithoutDuplicates = INITIAL_EXECUTIVES.filter(
    (executive) =>
      !createdCodes.has(executive.code) &&
      !createdEmails.has(executive.email)
  );

  return [...createdExecutives, ...initialWithoutDuplicates];
}

export function getActiveExecutiveRecords(): CommercialExecutiveRecord[] {
  return getExecutiveRecords().filter(
    (executive) => executive.status === "Activo"
  );
}

export function getExecutiveById(
  id: string | number
): CommercialExecutiveRecord | undefined {
  const numId = typeof id === "string" ? parseInt(id, 10) : id;
  return getExecutiveRecords().find((executive) => executive.id === numId);
}

export function getExecutiveByCode(
  code: string
): CommercialExecutiveRecord | undefined {
  return getExecutiveRecords().find((executive) => executive.code === code);
}

export function saveExecutiveRecord(record: CommercialExecutiveRecord) {
  const saved = getCreatedExecutives();

  const filtered = saved.filter(
    (executive) =>
      executive.code !== record.code && executive.email !== record.email
  );

  persistExecutives([record, ...filtered]);
}

export function updateExecutiveRecord(
  code: string,
  updatedRecord: CommercialExecutiveRecord
) {
  const saved = getCreatedExecutives();

  const existsInCreated = saved.some((executive) => executive.code === code);

  if (!existsInCreated) {
    persistExecutives([
      {
        ...updatedRecord,
        code,
        updatedAt: new Date().toISOString(),
      },
      ...saved,
    ]);

    return;
  }

  const updated = saved.map((executive) =>
    executive.code === code
      ? {
          ...executive,
          ...updatedRecord,
          code,
          updatedAt: new Date().toISOString(),
        }
      : executive
  );

  persistExecutives(updated);
}

export function deactivateExecutiveRecord(code: string) {
  const executive = getExecutiveByCode(code);

  if (!executive) return;

  updateExecutiveRecord(code, {
    ...executive,
    status: "Inactivo",
    updatedAt: new Date().toISOString(),
  });
}

export function getNextExecutiveId() {
  const executives = getExecutiveRecords();
  const ids = executives.map((executive) => Number(executive.id)).filter(Boolean);

  return Math.max(0, ...ids) + 1;
}

export function getNextExecutiveCode() {
  const nextId = getNextExecutiveId();
  return `EJC-${String(nextId).padStart(6, "0")}`;
}
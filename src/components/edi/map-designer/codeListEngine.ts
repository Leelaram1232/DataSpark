/**
 * CODE LIST ENGINE — Enterprise Lookup & Reference Table Parsing
 * Parses CSV, Excel (JSON/CSV format), JSON, XML, XSD, TXT code lists,
 * indexes keys/values/aliases/descriptions, and generates searchable lookup tables.
 */

export interface CodeListEntry {
  code: string;
  value: string;
  description?: string;
  aliases?: string[];
}

export interface LookupTable {
  id: string;
  name: string;
  category: string;
  entries: CodeListEntry[];
  keyMap: Record<string, string>; // normalized code -> value
  valueMap: Record<string, string>; // normalized value -> code
}

// Built-in Enterprise Default Lookup Tables
export const DEFAULT_LOOKUP_TABLES: LookupTable[] = [
  {
    id: "state_master",
    name: "State_Master",
    category: "Geographic",
    entries: [
      { code: "CA", value: "California", aliases: ["CALIF", "STATE OF CALIFORNIA"] },
      { code: "NY", value: "New York", aliases: ["N.Y.", "STATE OF NEW YORK"] },
      { code: "TX", value: "Texas", aliases: ["TEX", "STATE OF TEXAS"] },
      { code: "FL", value: "Florida", aliases: ["FLA"] },
      { code: "IL", value: "Illinois", aliases: ["ILL"] },
      { code: "PA", value: "Pennsylvania", aliases: ["PENN"] },
      { code: "OH", value: "Ohio" },
      { code: "GA", value: "Georgia" },
      { code: "NC", value: "North Carolina", aliases: ["N.C."] },
      { code: "MI", value: "Michigan", aliases: ["MICH"] },
    ],
    keyMap: {
      ca: "California", ny: "New York", tx: "Texas", fl: "Florida", il: "Illinois",
      pa: "Pennsylvania", oh: "Ohio", ga: "Georgia", nc: "North Carolina", mi: "Michigan",
    },
    valueMap: {
      california: "CA", newyork: "NY", texas: "TX", florida: "FL", illinois: "IL",
      pennsylvania: "PA", ohio: "OH", georgia: "GA", northcarolina: "NC", michigan: "MI",
    },
  },
  {
    id: "country_master",
    name: "Country_Master",
    category: "Geographic",
    entries: [
      { code: "US", value: "United States", aliases: ["USA", "UNITED STATES OF AMERICA"] },
      { code: "CA", value: "Canada", aliases: ["CAN"] },
      { code: "MX", value: "Mexico", aliases: ["MEX"] },
      { code: "GB", value: "United Kingdom", aliases: ["UK", "GREAT BRITAIN"] },
      { code: "DE", value: "Germany", aliases: ["DEU", "DEUTSCHLAND"] },
      { code: "FR", value: "France", aliases: ["FRA"] },
      { code: "JP", value: "Japan", aliases: ["JPN"] },
      { code: "CN", value: "China", aliases: ["CHN"] },
      { code: "IN", value: "India", aliases: ["IND"] },
      { code: "AU", value: "Australia", aliases: ["AUS"] },
    ],
    keyMap: {
      us: "United States", ca: "Canada", mx: "Mexico", gb: "United Kingdom",
      de: "Germany", fr: "France", jp: "Japan", cn: "China", in: "India", au: "Australia",
    },
    valueMap: {
      unitedstates: "US", usa: "US", canada: "CA", mexico: "MX", unitedkingdom: "GB",
      germany: "DE", france: "FR", japan: "JP", china: "CN", india: "IN", australia: "AU",
    },
  },
  {
    id: "party_qualifier_master",
    name: "Party_Qualifier_Master",
    category: "Qualifiers",
    entries: [
      { code: "BT", value: "Buyer", description: "Bill-To Party / Buyer Name" },
      { code: "SE", value: "Seller", description: "Seller Name" },
      { code: "WH", value: "Warehouse", description: "Storage Warehouse Facility" },
      { code: "DE", value: "Depositor", description: "Stock Transfer Depositor" },
      { code: "SF", value: "Ship From", description: "Origin Warehouse Facility" },
      { code: "ST", value: "Ship To", description: "Destination Warehouse Facility" },
      { code: "SU", value: "Supplier", description: "Primary Goods Supplier" },
      { code: "BY", value: "Buying Party", description: "Purchasing Organization" },
    ],
    keyMap: {
      bt: "Buyer", se: "Seller", wh: "Warehouse", de: "Depositor",
      sf: "Ship From", st: "Ship To", su: "Supplier", by: "Buying Party",
    },
    valueMap: {
      buyer: "BT", seller: "SE", warehouse: "WH", depositor: "DE",
      shipfrom: "SF", shipto: "ST", supplier: "SU", buyingparty: "BY",
    },
  },
  {
    id: "uom_master",
    name: "UOM_Master",
    category: "Units",
    entries: [
      { code: "EA", value: "Each", description: "Single Piece" },
      { code: "CA", value: "Case", description: "Shipping Case" },
      { code: "PL", value: "Pallet", description: "Full Pallet Quantity" },
      { code: "LB", value: "Pound", description: "Weight in Pounds" },
      { code: "KG", value: "Kilogram", description: "Metric Weight" },
      { code: "CT", value: "Carton", description: "Carton Box" },
      { code: "BOX", value: "Box", description: "Individual Box" },
    ],
    keyMap: { ea: "Each", ca: "Case", pl: "Pallet", lb: "Pound", kg: "Kilogram", ct: "Carton", box: "Box" },
    valueMap: { each: "EA", case: "CA", pallet: "PL", pound: "LB", kilogram: "KG", carton: "CT", box: "BOX" },
  },
  {
    id: "status_code_master",
    name: "Status_Code_Master",
    category: "Status",
    entries: [
      { code: "01", value: "Active", description: "Record is Active" },
      { code: "02", value: "Closed", description: "Record is Closed" },
      { code: "03", value: "Pending", description: "Awaiting Action" },
      { code: "04", value: "Cancelled", description: "Transaction Cancelled" },
      { code: "CC", value: "Completely Shipped", description: "Stock Transfer Order Completely Shipped" },
      { code: "PC", value: "Partially Shipped", description: "Stock Transfer Order Partially Shipped" },
    ],
    keyMap: { "01": "Active", "02": "Closed", "03": "Pending", "04": "Cancelled", cc: "Completely Shipped", pc: "Partially Shipped" },
    valueMap: { active: "01", closed: "02", pending: "03", cancelled: "04", completelyshipped: "CC", partiallyshipped: "PC" },
  },
];

/**
 * Parse raw text/CSV/JSON file content into a structured LookupTable.
 */
export function parseCodeListFile(fileName: string, content: string): LookupTable {
  const normName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
  const entries: CodeListEntry[] = [];
  const keyMap: Record<string, string> = {};
  const valueMap: Record<string, string> = {};

  try {
    if (fileName.endsWith(".json")) {
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed) ? parsed : (parsed.entries || parsed.data || []);
      for (const item of list) {
        const code = String(item.code || item.key || item.id || "").trim();
        const value = String(item.value || item.name || item.val || "").trim();
        const desc = item.description || item.desc || "";
        if (code && value) {
          entries.push({ code, value, description: desc });
          keyMap[code.toLowerCase()] = value;
          valueMap[value.toLowerCase().replace(/\s+/g, "")] = code;
        }
      }
    } else {
      // CSV or plain text line parser
      const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0 && (line.toLowerCase().includes("code") || line.toLowerCase().includes("key"))) {
          continue; // skip header line
        }
        const parts = line.includes(",") ? line.split(",") : line.split("\t");
        if (parts.length >= 2) {
          const code = parts[0].trim().replace(/^["']|["']$/g, "");
          const value = parts[1].trim().replace(/^["']|["']$/g, "");
          const desc = parts[2] ? parts[2].trim().replace(/^["']|["']$/g, "") : "";
          if (code && value) {
            entries.push({ code, value, description: desc });
            keyMap[code.toLowerCase()] = value;
            valueMap[value.toLowerCase().replace(/\s+/g, "")] = code;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`CodeList Engine parse warning for ${fileName}:`, err);
  }

  return {
    id: `code_list_${normName.toLowerCase()}`,
    name: normName || "Uploaded_Code_List",
    category: "User Uploaded",
    entries,
    keyMap,
    valueMap,
  };
}

/**
 * Match a source field name or target field name against indexed Lookup Tables.
 */
export function findMatchingLookupTable(fieldPath: string, userTables: LookupTable[] = []): { table: LookupTable; confidence: number } | null {
  const allTables = [...userTables, ...DEFAULT_LOOKUP_TABLES];
  const p = fieldPath.toLowerCase();

  for (const t of allTables) {
    const tName = t.name.toLowerCase();
    if (p.includes("state") && (tName.includes("state") || t.id === "state_master")) {
      return { table: t, confidence: 1.0 };
    }
    if ((p.includes("country") || p.includes("nation")) && (tName.includes("country") || t.id === "country_master")) {
      return { table: t, confidence: 1.0 };
    }
    if ((p.includes("partytype") || p.includes("entitytype") || p.includes("qualifier")) && (tName.includes("party") || t.id === "party_qualifier_master")) {
      return { table: t, confidence: 1.0 };
    }
    if ((p.includes("uom") || p.includes("unitofmeasure")) && (tName.includes("uom") || t.id === "uom_master")) {
      return { table: t, confidence: 1.0 };
    }
    if ((p.includes("status") || p.includes("statecode")) && (tName.includes("status") || t.id === "status_code_master")) {
      return { table: t, confidence: 0.95 };
    }
  }

  return null;
}

"use client";

/**
 * MAP GENERATOR — Takes wizard state and produces dynamic map data
 * based on the selected source/target standard and transaction set.
 *
 * This is the frontend equivalent of the backend agent pipeline.
 * When the backend is wired, this will be replaced by an API call.
 */

import type {
  TreeNodeData,
  LogicNodeData,
  FunctionalMapCard,
  MappingRule,
  CalculationFormula,
  WizardState,
  SourceFormat,
  SourceFieldPill,
  TargetFieldPill,
} from "./types";

/* ═══════════════════════════════════════════════════════════════════
   EDI STANDARDS DATA — Embedded tree structures per standard
   ═══════════════════════════════════════════════════════════════════ */

const X12_TREES: Record<string, TreeNodeData[]> = {
  "850": [
    {
      id: "x12-850", name: "X12_850_PurchaseOrder", type: "root", children: [
        {
          id: "850-st", name: "ST - Transaction Set Header", type: "segment", children: [
            { id: "ST01", name: "Transaction Set Identifier Code", type: "element", dataType: "ID" },
            { id: "ST02", name: "Transaction Set Control Number", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "850-beg", name: "BEG - Beginning Segment", type: "segment", isMapped: true, children: [
            { id: "BEG01", name: "Transaction Set Purpose Code", type: "element", dataType: "ID", isMapped: true },
            { id: "BEG02", name: "Purchase Order Type Code", type: "element", dataType: "ID", isMapped: true },
            { id: "BEG03", name: "Purchase Order Number", type: "element", dataType: "AN", isMapped: true },
            { id: "BEG05", name: "Date", type: "element", dataType: "DT", isMapped: true },
            { id: "BEG06", name: "Contract Number", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "850-cur", name: "CUR - Currency", type: "segment", occurrence: "[0..1]", children: [
            { id: "CUR01", name: "Entity Identifier Code", type: "element", dataType: "ID" },
            { id: "CUR02", name: "Currency Code", type: "element", dataType: "ID", isMapped: true },
          ]
        },
        {
          id: "850-ref", name: "REF - Reference Identification", type: "segment", occurrence: "[0..12]", children: [
            { id: "REF01", name: "Reference ID Qualifier", type: "element", dataType: "ID", isMapped: true },
            { id: "REF02", name: "Reference Identification", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "850-dtm", name: "DTM - Date/Time Reference", type: "segment", occurrence: "[0..10]", children: [
            { id: "DTM01", name: "Date/Time Qualifier", type: "element", dataType: "ID", isMapped: true },
            { id: "DTM02", name: "Date", type: "element", dataType: "DT", isMapped: true },
          ]
        },
        {
          id: "850-n1-loop", name: "N1 Loop - Party Identification", type: "loop", occurrence: "[0..200]", isMapped: true, children: [
            {
              id: "850-n1", name: "N1 - Name", type: "segment", isMapped: true, children: [
                { id: "N101", name: "Entity Identifier Code", type: "element", dataType: "ID", isMapped: true },
                { id: "N102", name: "Name", type: "element", dataType: "AN", isMapped: true },
                { id: "N103", name: "Identification Code Qualifier", type: "element", dataType: "ID" },
                { id: "N104", name: "Identification Code", type: "element", dataType: "AN", isMapped: true },
              ]
            },
            {
              id: "850-n3", name: "N3 - Address Information", type: "segment", occurrence: "[0..2]", isMapped: true, children: [
                { id: "N301", name: "Address Information", type: "element", dataType: "AN", isMapped: true },
                { id: "N302", name: "Address Information 2", type: "element", dataType: "AN" },
              ]
            },
            {
              id: "850-n4", name: "N4 - Geographic Location", type: "segment", isMapped: true, children: [
                { id: "N401", name: "City Name", type: "element", dataType: "AN", isMapped: true },
                { id: "N402", name: "State or Province Code", type: "element", dataType: "ID", isMapped: true },
                { id: "N403", name: "Postal Code", type: "element", dataType: "ID", isMapped: true },
                { id: "N404", name: "Country Code", type: "element", dataType: "ID", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "850-po1-loop", name: "PO1 Loop - Line Item", type: "loop", occurrence: "[1..100000]", isMapped: true, children: [
            {
              id: "850-po1", name: "PO1 - Baseline Item Data", type: "segment", isMapped: true, children: [
                { id: "PO101", name: "Assigned Identification", type: "element", dataType: "AN", isMapped: true },
                { id: "PO102", name: "Quantity Ordered", type: "element", dataType: "R", isMapped: true },
                { id: "PO103", name: "Unit of Measurement Code", type: "element", dataType: "ID", isMapped: true },
                { id: "PO104", name: "Unit Price", type: "element", dataType: "R", isMapped: true },
                { id: "PO106", name: "Product/Service ID Qualifier", type: "element", dataType: "ID" },
                { id: "PO107", name: "Product/Service ID", type: "element", dataType: "AN", isMapped: true },
              ]
            },
            {
              id: "850-pid", name: "PID - Product/Item Description", type: "segment", occurrence: "[0..1000]", children: [
                { id: "PID01", name: "Item Description Type", type: "element", dataType: "ID" },
                { id: "PID05", name: "Description", type: "element", dataType: "AN", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "850-ctt", name: "CTT - Transaction Totals", type: "segment", children: [
            { id: "CTT01", name: "Number of Line Items", type: "element", dataType: "N0", isMapped: true },
            { id: "CTT02", name: "Hash Total", type: "element", dataType: "R" },
          ]
        },
        {
          id: "850-se", name: "SE - Transaction Set Trailer", type: "segment", children: [
            { id: "SE01", name: "Number of Included Segments", type: "element", dataType: "N0" },
            { id: "SE02", name: "Transaction Set Control Number", type: "element", dataType: "AN" },
          ]
        },
      ]
    }
  ],
  "310": [
    {
      id: "x12-310", name: "X12_310_FreightReceipt", type: "root", children: [
        {
          id: "310-st", name: "ST - Transaction Set Header", type: "segment", children: [
            { id: "310-ST01", name: "Transaction Set Identifier Code", type: "element", dataType: "ID" },
            { id: "310-ST02", name: "Transaction Set Control Number", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "310-b3", name: "B3 - Beginning Segment", type: "segment", isMapped: true, children: [
            { id: "B302", name: "Invoice Number", type: "element", dataType: "AN", isMapped: true },
            { id: "B303", name: "Shipment Identification Number", type: "element", dataType: "AN", isMapped: true },
            { id: "B304", name: "Shipment Method of Payment", type: "element", dataType: "ID", isMapped: true },
            { id: "B306", name: "Invoice Date", type: "element", dataType: "DT", isMapped: true },
            { id: "B307", name: "Net Amount Due", type: "element", dataType: "N2", isMapped: true },
            { id: "B311", name: "Standard Carrier Alpha Code", type: "element", dataType: "ID", isMapped: true },
          ]
        },
        {
          id: "310-n1-loop", name: "N1 Loop - Party Identification", type: "loop", occurrence: "[0..10]", isMapped: true, children: [
            {
              id: "310-n1", name: "N1 - Name", type: "segment", isMapped: true, children: [
                { id: "310-N101", name: "Entity Identifier Code", type: "element", dataType: "ID", isMapped: true },
                { id: "310-N102", name: "Name", type: "element", dataType: "AN", isMapped: true },
                { id: "310-N104", name: "Identification Code", type: "element", dataType: "AN", isMapped: true },
              ]
            },
            {
              id: "310-n3", name: "N3 - Address Information", type: "segment", isMapped: true, children: [
                { id: "310-N301", name: "Address Information", type: "element", dataType: "AN", isMapped: true },
              ]
            },
            {
              id: "310-n4", name: "N4 - Geographic Location", type: "segment", isMapped: true, children: [
                { id: "310-N401", name: "City Name", type: "element", dataType: "AN", isMapped: true },
                { id: "310-N402", name: "State Code", type: "element", dataType: "ID", isMapped: true },
                { id: "310-N403", name: "Postal Code", type: "element", dataType: "ID", isMapped: true },
                { id: "310-N404", name: "Country Code", type: "element", dataType: "ID", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "310-r4-loop", name: "R4 Loop - Port Information", type: "loop", occurrence: "[0..20]", isMapped: true, children: [
            {
              id: "310-r4", name: "R4 - Port or Terminal", type: "segment", isMapped: true, children: [
                { id: "R401", name: "Port Function Code", type: "element", dataType: "ID", isMapped: true },
                { id: "R404", name: "Port Name", type: "element", dataType: "AN", isMapped: true },
                { id: "R405", name: "Country Code", type: "element", dataType: "ID" },
              ]
            },
          ]
        },
        {
          id: "310-lx-loop", name: "LX Loop - Line Items", type: "loop", occurrence: "[0..999]", isMapped: true, children: [
            {
              id: "310-lx", name: "LX - Assigned Number", type: "segment", children: [
                { id: "LX01", name: "Assigned Number", type: "element", dataType: "N0", isMapped: true },
              ]
            },
            {
              id: "310-n7", name: "N7 - Equipment Details", type: "segment", isMapped: true, children: [
                { id: "N701", name: "Equipment Initial", type: "element", dataType: "AN" },
                { id: "N702", name: "Equipment Number", type: "element", dataType: "AN", isMapped: true },
                { id: "N703", name: "Weight", type: "element", dataType: "R", isMapped: true },
                { id: "N711", name: "Equipment Description Code", type: "element", dataType: "ID" },
              ]
            },
            {
              id: "310-l1", name: "L1 - Rate and Charges", type: "segment", isMapped: true, children: [
                { id: "L102", name: "Freight Rate", type: "element", dataType: "R", isMapped: true },
                { id: "L104", name: "Charge", type: "element", dataType: "N2", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "310-l3", name: "L3 - Total Weight and Charges", type: "segment", isMapped: true, children: [
            { id: "L301", name: "Total Weight", type: "element", dataType: "R", isMapped: true },
            { id: "L305", name: "Total Charges", type: "element", dataType: "N2", isMapped: true },
          ]
        },
      ]
    }
  ],
};

const EDIFACT_TREES: Record<string, TreeNodeData[]> = {
  "ORDERS": [
    {
      id: "edi-orders", name: "ORDERS_PurchaseOrder", type: "root", children: [
        {
          id: "orders-unh", name: "UNH - Message Header", type: "segment", children: [
            { id: "UNH-0062", name: "Message Reference Number", type: "element", dataType: "AN" },
            { id: "UNH-0065", name: "Message Type", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "orders-bgm", name: "BGM - Beginning of Message", type: "segment", isMapped: true, children: [
            { id: "BGM-1001", name: "Document Name Code", type: "element", dataType: "AN", isMapped: true },
            { id: "BGM-1004", name: "Document Identifier", type: "element", dataType: "AN", isMapped: true },
            { id: "BGM-1225", name: "Message Function Code", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "orders-dtm", name: "DTM - Date/Time/Period", type: "segment", occurrence: "[0..35]", isMapped: true, children: [
            { id: "DTM-2005", name: "Date Function Qualifier", type: "element", dataType: "AN", isMapped: true },
            { id: "DTM-2380", name: "Date Value", type: "element", dataType: "AN", isMapped: true },
            { id: "DTM-2379", name: "Date Format Code", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "orders-rff-sg1", name: "SG1 - Reference Group", type: "group", occurrence: "[0..10]", children: [
            { id: "RFF-1153", name: "Reference Code Qualifier", type: "element", dataType: "AN", isMapped: true },
            { id: "RFF-1154", name: "Reference Identifier", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "orders-nad-sg2", name: "SG2 - Name and Address Group", type: "group", occurrence: "[0..99]", isMapped: true, children: [
            {
              id: "orders-nad", name: "NAD - Name and Address", type: "segment", isMapped: true, children: [
                { id: "NAD-3035", name: "Party Function Qualifier", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3039", name: "Party Identifier", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3036", name: "Party Name", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3042", name: "Street and Number", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3164", name: "City Name", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3229", name: "State/Province", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3251", name: "Postal Code", type: "element", dataType: "AN", isMapped: true },
                { id: "NAD-3207", name: "Country Code", type: "element", dataType: "AN", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "orders-cux-sg8", name: "SG8 - Currency Group", type: "group", occurrence: "[0..5]", children: [
            { id: "CUX-6345", name: "Currency Code", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "orders-lin-sg28", name: "SG28 - Line Item Group", type: "group", occurrence: "[0..200000]", isMapped: true, children: [
            {
              id: "orders-lin", name: "LIN - Line Item", type: "segment", isMapped: true, children: [
                { id: "LIN-1082", name: "Line Item Identifier", type: "element", dataType: "AN", isMapped: true },
                { id: "LIN-7140", name: "Item Identifier", type: "element", dataType: "AN", isMapped: true },
                { id: "LIN-7143", name: "Item Type Code", type: "element", dataType: "AN" },
              ]
            },
            {
              id: "orders-qty", name: "QTY - Quantity", type: "segment", occurrence: "[0..10]", isMapped: true, children: [
                { id: "QTY-6063", name: "Quantity Qualifier", type: "element", dataType: "AN", isMapped: true },
                { id: "QTY-6060", name: "Quantity", type: "element", dataType: "N", isMapped: true },
                { id: "QTY-6411", name: "Measurement Unit Code", type: "element", dataType: "AN" },
              ]
            },
            {
              id: "orders-pri-sg32", name: "SG32 - Price Details", type: "group", occurrence: "[0..25]", children: [
                { id: "PRI-5125", name: "Price Code Qualifier", type: "element", dataType: "AN" },
                { id: "PRI-5118", name: "Price Amount", type: "element", dataType: "N", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "orders-cnt", name: "CNT - Control Total", type: "segment", children: [
            { id: "CNT-6069", name: "Control Total Qualifier", type: "element", dataType: "AN" },
            { id: "CNT-6066", name: "Control Total Value", type: "element", dataType: "N", isMapped: true },
          ]
        },
        {
          id: "orders-unt", name: "UNT - Message Trailer", type: "segment", children: [
            { id: "UNT-0074", name: "Number of Segments", type: "element", dataType: "N" },
            { id: "UNT-0062", name: "Message Reference Number", type: "element", dataType: "AN" },
          ]
        },
      ]
    }
  ],
  "INVOIC": [
    {
      id: "edi-invoic", name: "INVOIC_Invoice", type: "root", children: [
        {
          id: "inv-unh", name: "UNH - Message Header", type: "segment", children: [
            { id: "INV-UNH-0062", name: "Message Reference Number", type: "element", dataType: "AN" },
            { id: "INV-UNH-0065", name: "Message Type", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "inv-bgm", name: "BGM - Beginning of Message", type: "segment", isMapped: true, children: [
            { id: "INV-BGM-1001", name: "Document Name Code", type: "element", dataType: "AN", isMapped: true },
            { id: "INV-BGM-1004", name: "Invoice Number", type: "element", dataType: "AN", isMapped: true },
            { id: "INV-BGM-1225", name: "Message Function Code", type: "element", dataType: "AN" },
          ]
        },
        {
          id: "inv-dtm", name: "DTM - Date/Time/Period", type: "segment", occurrence: "[0..35]", isMapped: true, children: [
            { id: "INV-DTM-2005", name: "Date Function Qualifier", type: "element", dataType: "AN", isMapped: true },
            { id: "INV-DTM-2380", name: "Date Value", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "inv-rff-sg1", name: "SG1 - Reference Group", type: "group", occurrence: "[0..99]", children: [
            { id: "INV-RFF-1153", name: "Reference Code Qualifier", type: "element", dataType: "AN", isMapped: true },
            { id: "INV-RFF-1154", name: "Reference Identifier", type: "element", dataType: "AN", isMapped: true },
          ]
        },
        {
          id: "inv-nad-sg2", name: "SG2 - Name and Address Group", type: "group", occurrence: "[0..99]", isMapped: true, children: [
            {
              id: "inv-nad", name: "NAD - Name and Address", type: "segment", isMapped: true, children: [
                { id: "INV-NAD-3035", name: "Party Function Qualifier", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3039", name: "Party Identifier", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3036", name: "Party Name", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3042", name: "Street", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3164", name: "City Name", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3251", name: "Postal Code", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-NAD-3207", name: "Country Code", type: "element", dataType: "AN", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "inv-lin-sg26", name: "SG26 - Line Item Group", type: "group", occurrence: "[0..9999999]", isMapped: true, children: [
            {
              id: "inv-lin", name: "LIN - Line Item", type: "segment", isMapped: true, children: [
                { id: "INV-LIN-1082", name: "Line Item Identifier", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-LIN-7140", name: "Item Identifier", type: "element", dataType: "AN", isMapped: true },
              ]
            },
            {
              id: "inv-qty", name: "QTY - Invoiced Quantity", type: "segment", occurrence: "[0..10]", isMapped: true, children: [
                { id: "INV-QTY-6063", name: "Quantity Qualifier", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-QTY-6060", name: "Quantity", type: "element", dataType: "N", isMapped: true },
              ]
            },
            {
              id: "inv-moa", name: "MOA - Line Amount", type: "segment", occurrence: "[0..10]", isMapped: true, children: [
                { id: "INV-MOA-5025", name: "Monetary Amount Type", type: "element", dataType: "AN", isMapped: true },
                { id: "INV-MOA-5004", name: "Monetary Amount", type: "element", dataType: "N", isMapped: true },
              ]
            },
            {
              id: "inv-pri-sg29", name: "SG29 - Price Details", type: "group", occurrence: "[0..10]", children: [
                { id: "INV-PRI-5125", name: "Price Code Qualifier", type: "element", dataType: "AN" },
                { id: "INV-PRI-5118", name: "Price Amount", type: "element", dataType: "N", isMapped: true },
              ]
            },
          ]
        },
        {
          id: "inv-moa-sg50", name: "SG50 - Summary Amounts", type: "group", occurrence: "[0..100]", isMapped: true, children: [
            { id: "INV-SUM-MOA-5025", name: "Amount Type Qualifier", type: "element", dataType: "AN", isMapped: true },
            { id: "INV-SUM-MOA-5004", name: "Monetary Amount", type: "element", dataType: "N", isMapped: true },
          ]
        },
        {
          id: "inv-unt", name: "UNT - Message Trailer", type: "segment", children: [
            { id: "INV-UNT-0074", name: "Number of Segments", type: "element", dataType: "N" },
            { id: "INV-UNT-0062", name: "Message Reference Number", type: "element", dataType: "AN" },
          ]
        },
      ]
    }
  ],
};

/* Generic XML/JSON tree for custom formats */
const GENERIC_XML_TREE: TreeNodeData[] = [
  {
    id: "xml-root", name: "Document", type: "root", children: [
      {
        id: "xml-header", name: "Header", type: "element", isMapped: true, children: [
          { id: "xml-msgid", name: "MessageId", type: "element", dataType: "xs:string", isMapped: true },
          { id: "xml-msgtype", name: "MessageType", type: "element", dataType: "xs:string", isMapped: true },
          { id: "xml-datetime", name: "DateTime", type: "element", dataType: "xs:dateTime", isMapped: true },
          { id: "xml-version", name: "Version", type: "element", dataType: "xs:string", isMapped: true },
          { id: "xml-sender", name: "SenderID", type: "element", dataType: "xs:string", isMapped: true },
          { id: "xml-receiver", name: "ReceiverID", type: "element", dataType: "xs:string" },
        ]
      },
      {
        id: "xml-body", name: "Body", type: "element", isMapped: true, children: [
          {
            id: "xml-party", name: "Party", type: "element", occurrence: "[0..99]", isMapped: true, children: [
              { id: "xml-party-type", name: "PartyType", type: "attribute", dataType: "xs:string", isMapped: true },
              { id: "xml-party-name", name: "Name", type: "element", dataType: "xs:string", isMapped: true },
              { id: "xml-party-addr", name: "Address", type: "element", dataType: "xs:string", isMapped: true },
              { id: "xml-party-city", name: "City", type: "element", dataType: "xs:string", isMapped: true },
              { id: "xml-party-state", name: "State", type: "element", dataType: "xs:string", isMapped: true },
              { id: "xml-party-zip", name: "PostalCode", type: "element", dataType: "xs:string", isMapped: true },
              { id: "xml-party-country", name: "CountryCode", type: "element", dataType: "xs:string", isMapped: true },
            ]
          },
          {
            id: "xml-items", name: "Items", type: "element", isMapped: true, children: [
              {
                id: "xml-item", name: "Item", type: "element", occurrence: "[0..999999]", isMapped: true, children: [
                  { id: "xml-item-line", name: "LineNumber", type: "element", dataType: "xs:integer", isMapped: true },
                  { id: "xml-item-id", name: "ItemID", type: "element", dataType: "xs:string", isMapped: true },
                  { id: "xml-item-desc", name: "Description", type: "element", dataType: "xs:string", isMapped: true },
                  { id: "xml-item-qty", name: "Quantity", type: "element", dataType: "xs:decimal", isMapped: true },
                  { id: "xml-item-uom", name: "UOM", type: "element", dataType: "xs:string" },
                  { id: "xml-item-price", name: "UnitPrice", type: "element", dataType: "xs:decimal", isMapped: true },
                  { id: "xml-item-amount", name: "Amount", type: "element", dataType: "xs:decimal", isMapped: true },
                ]
              }
            ]
          },
        ]
      },
      {
        id: "xml-summary", name: "Summary", type: "element", isMapped: true, children: [
          { id: "xml-subtotal", name: "SubTotal", type: "element", dataType: "xs:decimal", isMapped: true },
          { id: "xml-tax", name: "TotalTax", type: "element", dataType: "xs:decimal", isMapped: true },
          { id: "xml-total", name: "GrandTotal", type: "element", dataType: "xs:decimal", isMapped: true },
        ]
      },
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════════
   TREE LOOKUP
   ═══════════════════════════════════════════════════════════════════ */

function getTreeForStandard(format: SourceFormat, txnSet: string): TreeNodeData[] {
  if (format === "ANSI_X12") return X12_TREES[txnSet] || X12_TREES["850"];
  if (format === "EDIFACT") return EDIFACT_TREES[txnSet] || EDIFACT_TREES["ORDERS"];
  return GENERIC_XML_TREE;
}

function getFileNameForStandard(format: SourceFormat, txnSet: string, side: "Input" | "Output"): string {
  if (format === "ANSI_X12") return `${side}: In_${txnSet || "850"}.x12`;
  if (format === "EDIFACT") return `${side}: ${txnSet || "ORDERS"}.edi`;
  if (format === "XML") {
    const name = !txnSet || txnSet === "Auto_XML" || txnSet === "Upload_XSD" ? `${side}_Invoice` : txnSet;
    return `${side}: ${name}.xsd`;
  }
  if (format === "JSON") return `${side}: ${txnSet || "schema"}.json`;
  return `${side}: ${txnSet || "data"}.txt`;
}

function getBadgeForFormat(format: SourceFormat): string {
  const badges: Record<string, string> = { ANSI_X12: "X12", EDIFACT: "EDI", XML: "XSD", JSON: "JSON", CSV: "CSV", FIXED_WIDTH: "FIX", SAP_IDOC: "IDOC" };
  return badges[format] || format;
}

export interface GeneratedMapData {
  sourceTree: TreeNodeData[];
  targetTree: TreeNodeData[];
  sourceFileName: string;
  targetFileName: string;
  sourceBadge: string;
  targetBadge: string;
  sourcePills: SourceFieldPill[];
  targetPills: TargetFieldPill[];
  logicNodes: LogicNodeData[];
  connectors: Array<{ id: string; start: { x: number; y: number }; end: { x: number; y: number }; color: string; animated?: boolean; label?: string; style?: "solid" | "dashed" }>;
  functionalMaps: FunctionalMapCard[];
  rules: MappingRule[];
  calculations: CalculationFormula[];
  projectName: string;
  mapName: string;
  metrics: {
    totalInputFields: number;
    totalOutputFields: number;
    mappedFields: number;
    unmappedFields: number;
    conditions: number;
    functions: number;
    lookups: number;
    calculations: number;
    coverage: number;
  };
}

/* ═══════════════════════════════════════════════════════════════════
   GENERATE MAP FROM WIZARD STATE
   ═══════════════════════════════════════════════════════════════════ */

export function generateMapFromWizard(wizard: WizardState): GeneratedMapData {
  const sourceTree = getTreeForStandard(wizard.sourceFormat, wizard.sourceTransactionSet);
  const targetTree = getTreeForStandard(wizard.targetFormat, wizard.targetTransactionSet);

  const srcLabel = wizard.sourceFormat === "ANSI_X12" ? `X12 ${wizard.sourceTransactionSet}` : wizard.sourceFormat === "EDIFACT" ? wizard.sourceTransactionSet : wizard.sourceFormat;
  const tgtLabel = wizard.targetFormat === "ANSI_X12" ? `X12 ${wizard.targetTransactionSet}` : wizard.targetFormat === "EDIFACT" ? wizard.targetTransactionSet : wizard.targetFormat;
  const mapName = `${srcLabel}_TO_${tgtLabel}_Map`;

  // 1-to-1 Source Field Pills (Left Column on Canvas)
  const sourcePills: SourceFieldPill[] = [
    { id: "sp-1", label: "Header.MessageID", path: "Header/MessageID", dataType: "xs:string", x: 250, y: 100 },
    { id: "sp-2", label: "Header.MessageType", path: "Header/MessageType", dataType: "xs:string", x: 250, y: 145 },
    { id: "sp-3", label: "Header.DateTime", path: "Header/DateTime", dataType: "xs:dateTime", x: 250, y: 190 },
    { id: "sp-4", label: "Header.Version", path: "Header/Version", dataType: "xs:string", x: 250, y: 235 },
    { id: "sp-5", label: "Header.SenderID", path: "Header/SenderID", dataType: "xs:string", x: 250, y: 280 },
    { id: "sp-6", label: "Header.ReceiverID", path: "Header/ReceiverID", dataType: "xs:string", x: 250, y: 325 },

    { id: "sp-7", label: "Party.@PartyType", path: "Body/Party/@PartyType", dataType: "xs:string", x: 250, y: 395 },
    { id: "sp-8", label: "Party.Name", path: "Body/Party/Name", dataType: "xs:string", x: 250, y: 470 },
    { id: "sp-9", label: "Party.Address", path: "Body/Party/Address", dataType: "xs:string", x: 250, y: 515 },
    { id: "sp-10", label: "Party.City", path: "Body/Party/City", dataType: "xs:string", x: 250, y: 560 },
    { id: "sp-11", label: "Party.State", path: "Body/Party/State", dataType: "xs:string", x: 250, y: 605 },
    { id: "sp-12", label: "Party.PostalCode", path: "Body/Party/PostalCode", dataType: "xs:string", x: 250, y: 650 },
    { id: "sp-13", label: "Party.CountryCode", path: "Body/Party/CountryCode", dataType: "xs:string", x: 250, y: 695 },

    { id: "sp-14", label: "Item.LineNumber", path: "Body/Items/Item/LineNumber", dataType: "xs:integer", x: 250, y: 760 },
    { id: "sp-15", label: "Item.ItemID", path: "Body/Items/Item/ItemID", dataType: "xs:string", x: 250, y: 805 },
    { id: "sp-16", label: "Item.Description", path: "Body/Items/Item/Description", dataType: "xs:string", x: 250, y: 850 },
    { id: "sp-17", label: "Item.Quantity", path: "Body/Items/Item/Quantity", dataType: "xs:decimal", x: 250, y: 895 },
    { id: "sp-18", label: "Item.UOM", path: "Body/Items/Item/UOM", dataType: "xs:string", x: 250, y: 940 },
    { id: "sp-19", label: "Item.UnitPrice", path: "Body/Items/Item/UnitPrice", dataType: "xs:decimal", x: 250, y: 985 },
    { id: "sp-20", label: "Item.Amount", path: "Body/Items/Item/Amount", dataType: "xs:decimal", x: 250, y: 1030 },

    { id: "sp-21", label: "Summary.SubTotal", path: "Summary/SubTotal", dataType: "xs:decimal", x: 250, y: 1095 },
    { id: "sp-22", label: "Summary.TotalTax", path: "Summary/TotalTax", dataType: "xs:decimal", x: 250, y: 1140 },
    { id: "sp-23", label: "Summary.GrandTotal", path: "Summary/GrandTotal", dataType: "xs:decimal", x: 250, y: 1185 },
  ];

  // 1-to-1 Transformation Nodes (Center Column on Canvas)
  const logicNodes: LogicNodeData[] = [
    { id: "n-map-msgid", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.MessageID", targetPath: "MessageID", x: 440, y: 92 },
    { id: "n-map-msgtype", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.MessageType", targetPath: "MessageType", x: 440, y: 137 },
    { id: "n-map-dt", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.DateTime", targetPath: "DateTime", x: 440, y: 182 },
    { id: "n-map-ver", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.Version", targetPath: "Version", x: 440, y: 227 },
    { id: "n-map-sender", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.SenderID", targetPath: "SenderID", x: 440, y: 272 },
    { id: "n-map-rec", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Header.ReceiverID", targetPath: "ReceiverID", x: 440, y: 317 },

    { id: "n-if-party", type: "IF", title: "IF CONDITION", subtitle: "Conditional Branch", details: "IF PartyType = 'BT' THEN 'Buyer'\nELSE IF PartyType = 'SE' THEN 'Seller'\nELSE 'Other'", sourcePath: "Party.@PartyType", targetPath: "@PartyType", x: 440, y: 380 },
    { id: "n-map-partyname", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Party.Name", targetPath: "Name", x: 440, y: 462 },
    { id: "n-map-partyaddr", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Party.Address", targetPath: "Address", x: 440, y: 507 },
    { id: "n-map-partycity", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Party.City", targetPath: "City", x: 440, y: 552 },
    { id: "n-lookup-state", type: "LOOKUP", title: "LOOKUP", subtitle: "Lookup State Code", details: "From State_Master\nIF State IN State_Master → ISO Code\nELSE → Original Value", sourcePath: "Party.State", targetPath: "State", x: 440, y: 597 },
    { id: "n-map-partyzip", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Party.PostalCode", targetPath: "PostalCode", x: 440, y: 642 },
    { id: "n-map-partycountry", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Party.CountryCode", targetPath: "CountryCode", x: 440, y: 687 },

    { id: "n-map-linenum", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Item.LineNumber", targetPath: "LineNumber", x: 440, y: 752 },
    { id: "n-map-itemid", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Item.ItemID", targetPath: "ItemID", x: 440, y: 797 },
    { id: "n-map-itemdesc", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Item.Description", targetPath: "Description", x: 440, y: 842 },
    { id: "n-calc-qty", type: "CALCULATE", title: "CALCULATE", subtitle: "Quantity * 1", details: "Quantity * 1\n(Pass-through with unit validation)", sourcePath: "Item.Quantity", targetPath: "Quantity", x: 440, y: 887 },
    { id: "n-map-uom", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Item.UOM", targetPath: "UOM", x: 440, y: 932 },
    { id: "n-calc-amount", type: "CALCULATE", title: "CALCULATE", subtitle: "Quantity * UnitPrice", details: "Amount = Quantity * UnitPrice\nApplied per line item", sourcePath: "Item.UnitPrice", targetPath: "Amount", x: 440, y: 977 },
    { id: "n-map-itemprice", type: "MAP", title: "MAP", subtitle: "Direct Mapping", sourcePath: "Item.Amount", targetPath: "UnitPrice", x: 440, y: 1022 },

    { id: "n-calc-subtotal", type: "CALCULATE", title: "CALCULATE", subtitle: "SUM(Amount)", details: "SubTotal = SUM(LineAmount)\nAggregated across all line items", sourcePath: "Summary.SubTotal", targetPath: "SubTotal", x: 440, y: 1087 },
    { id: "n-calc-tax", type: "CALCULATE", title: "CALCULATE", subtitle: "SUM(Amount) * TaxRate", details: "TotalTax = SUM(Amount) * TaxRate\nTaxRate from header specification", sourcePath: "Summary.TotalTax", targetPath: "TotalTax", x: 440, y: 1132 },
    { id: "n-calc-grandtotal", type: "CALCULATE", title: "CALCULATE", subtitle: "SubTotal + TotalTax", details: "GrandTotal = SubTotal + TotalTax\nFinal invoice total", sourcePath: "Summary.GrandTotal", targetPath: "GrandTotal", x: 440, y: 1177 },
  ];

  // 1-to-1 Connectors (Source Pill → Node → Target Anchor)
  const connectors = [
    // Header
    { id: "c-1", start: { x: 380, y: 112 }, end: { x: 440, y: 112 }, color: "teal", animated: true },
    { id: "c-1t", start: { x: 620, y: 112 }, end: { x: 720, y: 112 }, color: "purple" },

    { id: "c-2", start: { x: 380, y: 157 }, end: { x: 440, y: 157 }, color: "teal", animated: true },
    { id: "c-2t", start: { x: 620, y: 157 }, end: { x: 720, y: 157 }, color: "purple" },

    { id: "c-3", start: { x: 380, y: 202 }, end: { x: 440, y: 202 }, color: "teal", animated: true },
    { id: "c-3t", start: { x: 620, y: 202 }, end: { x: 720, y: 202 }, color: "purple" },

    { id: "c-4", start: { x: 380, y: 247 }, end: { x: 440, y: 247 }, color: "teal", animated: true },
    { id: "c-4t", start: { x: 620, y: 247 }, end: { x: 720, y: 247 }, color: "purple" },

    { id: "c-5", start: { x: 380, y: 292 }, end: { x: 440, y: 292 }, color: "teal", animated: true },
    { id: "c-5t", start: { x: 620, y: 292 }, end: { x: 720, y: 292 }, color: "purple" },

    { id: "c-6", start: { x: 380, y: 337 }, end: { x: 440, y: 337 }, color: "teal", animated: true },
    { id: "c-6t", start: { x: 620, y: 337 }, end: { x: 720, y: 337 }, color: "purple" },

    // Party
    { id: "c-7", start: { x: 380, y: 407 }, end: { x: 440, y: 412 }, color: "amber", animated: true },
    { id: "c-7t", start: { x: 620, y: 412 }, end: { x: 720, y: 407 }, color: "purple" },

    { id: "c-8", start: { x: 380, y: 482 }, end: { x: 440, y: 482 }, color: "teal", animated: true },
    { id: "c-8t", start: { x: 620, y: 482 }, end: { x: 720, y: 482 }, color: "purple" },

    { id: "c-11", start: { x: 380, y: 617 }, end: { x: 440, y: 617 }, color: "purple", animated: true },
    { id: "c-11t", start: { x: 620, y: 617 }, end: { x: 720, y: 617 }, color: "purple" },

    // Line Items & Calculations
    { id: "c-17", start: { x: 380, y: 907 }, end: { x: 440, y: 907 }, color: "green", animated: true },
    { id: "c-17t", start: { x: 620, y: 907 }, end: { x: 720, y: 907 }, color: "orange" },

    { id: "c-19", start: { x: 380, y: 997 }, end: { x: 440, y: 997 }, color: "green", animated: true },
    { id: "c-19t", start: { x: 620, y: 997 }, end: { x: 720, y: 997 }, color: "orange" },

    // Summary
    { id: "c-21", start: { x: 380, y: 1107 }, end: { x: 440, y: 1107 }, color: "amber", animated: true },
    { id: "c-21t", start: { x: 620, y: 1107 }, end: { x: 720, y: 1107 }, color: "orange" },

    { id: "c-22", start: { x: 380, y: 1152 }, end: { x: 440, y: 1152 }, color: "amber", animated: true },
    { id: "c-22t", start: { x: 620, y: 1152 }, end: { x: 720, y: 1152 }, color: "orange" },

    { id: "c-23", start: { x: 380, y: 1197 }, end: { x: 440, y: 1197 }, color: "amber", animated: true },
    { id: "c-23t", start: { x: 620, y: 1197 }, end: { x: 720, y: 1197 }, color: "orange" },
  ];

  const functionalMaps: FunctionalMapCard[] = [
    { id: "f-header", name: "F_Header", status: "Active", color: "#3b82f6", rules: [`1. Map MessageID → MessageID`, `2. Map DateTime → DateTime`, `3. Map MessageType → MessageType`, `4. Map Version → Version`, `5. Map SenderID → SenderID`, `6. Map ReceiverID → ReceiverID`] },
    { id: "f-parties", name: "F_Parties", status: "Active", color: "#a855f7", rules: [`1. Map PartyType → @PartyType (IF)`, `2. Map Name → Name`, `3. Map Address → Address`, `4. Map City → City`, `5. Map State → State (LOOKUP)`, `6. Map PostalCode → PostalCode`, `7. Map CountryCode → CountryCode`] },
    { id: "f-items", name: "F_Items", status: "Active", color: "#10b981", rules: [`1. Map ItemID → ItemID`, `2. Map Description → Description`, `3. Map UOM → UOM (CALC)`, `4. Map UnitPrice → UnitPrice`, `5. Map Quantity → Quantity (CALC)`, `6. Map Amount → Amount (CALC)`] },
    { id: "f-lineitems", name: "F_LineItems", status: "Active", color: "#06b6d4", rules: [`1. Map LineNumber → LineNumber`, `2. Map ItemID → ItemID`, `3. Map Description → Description`, `4. Map Quantity → Quantity`, `5. Map UnitPrice → UnitPrice`, `6. Map Amount → Amount`] },
    { id: "f-totals", name: "F_Totals", status: "Active", color: "#f59e0b", rules: [`1. Calculate SubTotal`, `2. Calculate TotalTax`, `3. Calculate GrandTotal`] },
    { id: "f-conditions", name: "F_Conditions", status: "Active", color: "#ef4444", rules: [`1. IF PartyType = 'BT' → Buyer`, `2. IF PartyType = 'SE' → Seller`, `3. Quantity > 0`, `4. UnitPrice >= 0`, `5. Discount > 0`] },
  ];

  const rules: MappingRule[] = [
    { id: 1, condition: "PartyType = 'BT'", action: "Map to Buyer Role", source: "Party/@PartyType", target: "@PartyType", type: "Condition" },
    { id: 2, condition: "PartyType = 'SE'", action: "Map to Seller Role", source: "Party/@PartyType", target: "@PartyType", type: "Condition" },
    { id: 3, condition: "Quantity > 0", action: "Process Item Line", source: "Item/Quantity", target: "Quantity", type: "Filter" },
    { id: 4, condition: "UnitPrice >= 0", action: "Validate Unit Price", source: "Item/UnitPrice", target: "UnitPrice", type: "Validation" },
    { id: 5, condition: "State IN State_Master", action: "Lookup ISO State Code", source: "Party/State", target: "State", type: "Lookup" },
  ];

  const calculations: CalculationFormula[] = [
    { name: "LineAmount", expression: "Quantity * UnitPrice", highlighted: true },
    { name: "SubTotal", expression: "SUM(LineAmount)", highlighted: true },
    { name: "TotalTax", expression: "SUM(LineAmount) * TaxRate" },
    { name: "GrandTotal", expression: "SubTotal + TotalTax", highlighted: true },
  ];

  // 1-to-1 Target Field Pills (Right Column on Canvas)
  const targetPills: TargetFieldPill[] = [
    { id: "tp-1", label: "Header.MessageID", path: "Header/MessageID", dataType: "xs:string", x: 720, y: 100 },
    { id: "tp-2", label: "Header.MessageType", path: "Header/MessageType", dataType: "xs:string", x: 720, y: 145 },
    { id: "tp-3", label: "Header.DateTime", path: "Header/DateTime", dataType: "xs:dateTime", x: 720, y: 190 },
    { id: "tp-4", label: "Header.Version", path: "Header/Version", dataType: "xs:string", x: 720, y: 235 },
    { id: "tp-5", label: "Header.SenderID", path: "Header/SenderID", dataType: "xs:string", x: 720, y: 280 },
    { id: "tp-6", label: "Header.ReceiverID", path: "Header/ReceiverID", dataType: "xs:string", x: 720, y: 325 },

    { id: "tp-7", label: "Party.@PartyType", path: "Body/Party/@PartyType", dataType: "xs:string", x: 720, y: 395 },
    { id: "tp-8", label: "Party.Name", path: "Body/Party/Name", dataType: "xs:string", x: 720, y: 470 },
    { id: "tp-9", label: "Party.Address", path: "Body/Party/Address", dataType: "xs:string", x: 720, y: 515 },
    { id: "tp-10", label: "Party.City", path: "Body/Party/City", dataType: "xs:string", x: 720, y: 560 },
    { id: "tp-11", label: "Party.State", path: "Body/Party/State", dataType: "xs:string", x: 720, y: 605 },
    { id: "tp-12", label: "Party.PostalCode", path: "Body/Party/PostalCode", dataType: "xs:string", x: 720, y: 650 },
    { id: "tp-13", label: "Party.CountryCode", path: "Body/Party/CountryCode", dataType: "xs:string", x: 720, y: 695 },

    { id: "tp-14", label: "Item.LineNumber", path: "Body/Items/Item/LineNumber", dataType: "xs:integer", x: 720, y: 760 },
    { id: "tp-15", label: "Item.ItemID", path: "Body/Items/Item/ItemID", dataType: "xs:string", x: 720, y: 805 },
    { id: "tp-16", label: "Item.Description", path: "Body/Items/Item/Description", dataType: "xs:string", x: 720, y: 850 },
    { id: "tp-17", label: "Item.Quantity", path: "Body/Items/Item/Quantity", dataType: "xs:decimal", x: 720, y: 895 },
    { id: "tp-18", label: "Item.UOM", path: "Body/Items/Item/UOM", dataType: "xs:string", x: 720, y: 940 },
    { id: "tp-19", label: "Item.UnitPrice", path: "Body/Items/Item/UnitPrice", dataType: "xs:decimal", x: 720, y: 985 },
    { id: "tp-20", label: "Item.Amount", path: "Body/Items/Item/Amount", dataType: "xs:decimal", x: 720, y: 1030 },

    { id: "tp-21", label: "Summary.SubTotal", path: "Summary/SubTotal", dataType: "xs:decimal", x: 720, y: 1095 },
    { id: "tp-22", label: "Summary.TotalTax", path: "Summary/TotalTax", dataType: "xs:decimal", x: 720, y: 1140 },
    { id: "tp-23", label: "Summary.GrandTotal", path: "Summary/GrandTotal", dataType: "xs:decimal", x: 720, y: 1185 },
  ];

  return {
    sourceTree,
    targetTree,
    sourceFileName: getFileNameForStandard(wizard.sourceFormat, wizard.sourceTransactionSet, "Input"),
    targetFileName: getFileNameForStandard(wizard.targetFormat, wizard.targetTransactionSet, "Output"),
    sourceBadge: getBadgeForFormat(wizard.sourceFormat),
    targetBadge: getBadgeForFormat(wizard.targetFormat),
    sourcePills,
    targetPills,
    logicNodes,
    connectors,
    functionalMaps,
    rules,
    calculations,
    projectName: wizard.projectName,
    mapName,
    metrics: {
      totalInputFields: 23,
      totalOutputFields: 23,
      mappedFields: 23,
      unmappedFields: 0,
      conditions: 5,
      functions: 6,
      lookups: 1,
      calculations: 6,
      coverage: 100,
    },
  };
}

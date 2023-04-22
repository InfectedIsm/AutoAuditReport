export type Finding = {
  severity: string;
  auditTag: string;
  description: string;
  occurence: number;
  code: CodeSnippet[];
};

type CodeSnippet = {
  lineStart: number;
  lineEnd: number;
  codeSnippet: string;
};

type FindingsBySeverity = {
  severity: string;
  findings: Finding[];
};

export type FindingsMap = {
  [auditKey: string]: Finding;
};

export type AuditMap = {
  //key: severity
  [auditKey: string]: FindingsBySeverity[];
};

export const extractCodeFromLines = ( lines: string[], lineStart: number, lineEnd: number, offset: number): string => {
  return lineStart===lineEnd ?
    lines[offset+lineStart]
    :lines.slice(offset+ lineStart, offset+lineEnd).join("\n");
};


export type AuditTagData = {
  auditKey: string;
  description: string;
  lineStart: number;
  lineEnd: number;
};

//array matching key with severity (ex: GXX = Gas, NCXX = Non Critical, LXX = Low, MXX = Medium, HXX = High)
export const auditKeyToSeverity = (auditKey: string): string => {
  const prefix = auditKey.slice(0, 1);

  switch (prefix) {
    case "G":
      return "Gas";
    case "N":
      return "Non Critical";
    case "L":
      return "Low";
    case "M":
      return "Medium";
    case "H":
      return "High";
    case "C":
      return "Critical";
    default:
      throw new Error(`Unknown audit key prefix: ${prefix}`);
  }
};



/**
* Object representing a finding
* A finding is an audit tag with its description
* There can be multiple occurences of the same finding in the codebase
* each occurence is represented by a code snippet
*/
export type Finding = {
  auditKey: string;
  description: string;
  occurence: number;
  code: CodeSnippet[];
};

/**
* Object representing a code snippet and its relative position in the file in regard to the audit tag
*/
type CodeSnippet = {
  tagLine: number;      
  relativeStart: number;//relative to the audit tag
  relativeEnd: number;  //relative to the audit tag
  codeSnippet: string;
};

/**
* TODO: can be removed, redundant of key of AuditMap
*/
export type FindingsBySeverity = {
  severity: string;
  findings: Finding;
};

/**
* Map of all findings
*/
export type FindingsMap = {
  [auditKey: string]: Finding;
};

/**
* Used to easily iterate over the severities to generate the report
*/
export type AuditMap = {
  [severity: string]: FindingsBySeverity[];
};

/**
* Extract the code snippet from the lines array
* @param lines: array of string representing the file
* @param offset: line where the audit tag is
* @param lineStart: start line relative to offset
* @param lineEnd: end line relative to offset
* @returns the code snippet
*/
export const extractCodeFromLines = ( lines: string[], offset: number, lineStart: number, lineEnd: number): string => {
  return lineStart===lineEnd ?
    lines[offset+lineStart]
    :lines.slice(offset+ lineStart, offset+lineEnd+1).join("\n");
};

//
/**
 * array matching key with severity (ex: GXX = Gas, NCXX = Non Critical, LXX = Low, MXX = Medium, HXX = High)
 * @param auditKey: string representing the audit key
 * @returns string representing the severity
*/
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


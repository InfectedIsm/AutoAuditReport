//import files.ts
import { File, pathToFile, fileToLines } from "./utils/files";

type FindingsBySeverity = {
  severity: string;
  findings: Finding[];
};

type FindingsMap = {
  [auditKey: string]: Finding;
};

type Finding = {
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

const extractCodeFromLines = ( lines: string[], lineStart: number, lineEnd: number, offset: number): string => {
  return lineStart===lineEnd ?
    lines[offset+lineStart]
    :lines.slice(offset+ lineStart, offset+lineEnd).join("\n");
};

type AuditTag = {
  auditKey: string;
  description: string;
  lineStart: number;
  lineEnd: number;
};

//array matching key with severity (ex: GXX = Gas, NCXX = Non Critical, LXX = Low, MXX = Medium, HXX = High)
const auditKeyToSeverity = (auditKey: string): string => {
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

type AuditMap = {
  //key: severity
  [auditKey: string]: FindingsBySeverity[];
};

//for now path is one file, but it will be a folder
const FileToAuditMap = (path: string): AuditMap => {
  //generate an array of string with each line
  const file = pathToFile(path);
  const lines = fileToLines(file);
  const auditMap: AuditMap = {};
  const findingsMap: FindingsMap = {};

  //actual audit tag processed
  let currentAuditTag: AuditTag | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("//@audit")) {
      //this match each audit tag and get the level (G/NC/L/...), the code (01, 02, 03, ...) and the description that follows
      let match = line.match(
        /\/\/@audit - ([A-Z]+)(\d+) - (.*) \[L(\d+)-L(\d+)\]/
      );
      match =
        match || line.match(/\/\/@audit - ([A-Z]+)(\d+) - (.*) \[L(\d+)\]/);
      // console.log(match);

      if (match) {
        const level = match[1];
        const auditCode = match[2];
        const description = match[3];
        const lineStart = match[4];
        const lineEnd = match[5] ?? match[4];
        const auditKey = level + auditCode;

        currentAuditTag = {
          auditKey,
          description,
          lineStart: parseInt(lineStart),
          lineEnd: parseInt(lineEnd),
        };

        
        const Finding: Finding = {
          severity: auditKeyToSeverity(auditKey),
          auditTag: auditKey,
          description: currentAuditTag.description,
          occurence: 1,
          code: [{
            lineStart: currentAuditTag.lineStart,
            lineEnd: currentAuditTag.lineEnd,
            //slice doesn't work if lineStart === lineEnd
            codeSnippet: extractCodeFromLines(lines, currentAuditTag.lineStart, currentAuditTag.lineEnd, i),
          }]
        };

        // console.log(Finding);
        // console.log("auditKey", auditKey);
        // this line means that if the auditKey is not in the map, it will be added
        if(!findingsMap[auditKey]){
          // console.log("auditKey not in map");
          findingsMap[auditKey] = Finding;
        //if the auditKey is already in the map, it will be added to the code array
        }else{
          // console.log("auditKey in map");
          findingsMap[auditKey].occurence++;
          findingsMap[auditKey].code.push({
            lineStart: currentAuditTag.lineStart,
            lineEnd: currentAuditTag.lineEnd,
            //slice doesn't work if lineStart === lineEnd
            codeSnippet: Finding.code[0].codeSnippet,
            });
        }
        console.log(findingsMap[auditKey]);
      }
    }
  }
  console.log(findingsMap);
  return auditMap;
};

// const generateReport = (auditMap: AuditMap): string => {
// 	let report = '';

// 	const levels = ['NC', 'Low', 'Medium', 'High'];
// 	for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
// 		const level = levels[levelIndex];
// 		const levelAudits = Object.values(auditMap).filter(finding => finding.level === level);

// 		if (levelAudits.length > 0) {
// 			report += `## ${level}\n\n`;

// 			for (let i = 0; i < levelAudits.length; i++) {
// 				const { level, codeSnippet } = levelAudits[i];
// 				const lines = codeSnippet.trim().split('\n');

// 				const uniqueSnippet = [...new Set(lines)];

// 				report += `#### ${level}${i + 1}\n\n`;
// 				report += '```' + '\n';
// 				report += uniqueSnippet.join('\n');
// 				report += '\n```' + '\n\n';
// 			}
// 		}
// 	}

// 	return report;
// };
const auditMap = FileToAuditMap(
  "C:/Users/Salah/Documents/Coding/AutoAuditReport/contracts/Test.sol"
);
// const report = generateReport(auditMap);
// fs.writeFileSync('C:/Users/Salah/Documents/Coding/4naly3er/contracts/example/Test.txt', report);

console.log("Report generated successfully.");

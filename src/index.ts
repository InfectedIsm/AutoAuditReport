//import files.ts
import { pathToFile, fileToLines } from "./utils/files";
import {Finding, FindingsMap, AuditMap, AuditTagData, 
  auditKeyToSeverity, extractCodeFromLines, FindingsBySeverity } from "./utils/findings";

//for now path is one file, but it will be a folder
const FileToAuditMap = (path: string, tagKeyword?: string): AuditMap => {
  //generate an array of string with each line
  const file = pathToFile(path);
  const lines = fileToLines(file);
  const findingsMap: FindingsMap = {};
  const auditMap: AuditMap = {};

  //actual audit tag processed
  let currentProcessedAuditTag: AuditTagData | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const usedTagKeyword = (tagKeyword ?? "@audit - ");
    if (line.startsWith("//"+usedTagKeyword)) {
      //2 cases: one line code snippet [LXX] or multi line [LXX-LYY]
      let match = line.match(new RegExp(`/\/${usedTagKeyword}([A-Z]+)(\\d+) - (.*) \\[L(\\d+)-L(\\d+)\\]`)); 
      match = match || line.match(new RegExp(`/\/${usedTagKeyword}([A-Z]+)(\\d+) - (.*) \\[L(\\d+)\\]`));

      if (match) {
        const level = match[1];
        const auditCode = match[2];
        const description = match[3];
        const lineStart = match[4];
        const lineEnd = match[5] ?? match[4];
        const auditKey = level + auditCode;

        currentProcessedAuditTag = {
          auditKey,
          description,
          lineStart: parseInt(lineStart),
          lineEnd: parseInt(lineEnd),
        };

        
        const currentProcessedfinding: Finding = {
          //probably not needed as it is also in SeverityByFinding
          // severity: auditKeyToSeverity(auditKey),
          auditTag: auditKey,
          description: currentProcessedAuditTag.description,
          occurence: 1,
          code: [{
            line: i,
            relativeStart: currentProcessedAuditTag.lineStart,
            relativeEnd: currentProcessedAuditTag.lineEnd,
            //slice doesn't work if lineStart === lineEnd
            codeSnippet: extractCodeFromLines(lines, currentProcessedAuditTag.lineStart, currentProcessedAuditTag.lineEnd, i),
          }]
        };

        // this line means that if the auditKey is not in the map, it will be added
        if(!findingsMap[auditKey]){
          findingsMap[auditKey] = currentProcessedfinding;
        //if the auditKey is already in the map, it will be added to the code array
        }else{
          findingsMap[auditKey].occurence++;
          findingsMap[auditKey].code.push(currentProcessedfinding.code[0]);
        }
        
      }
    }
  }
  // console.log(findingsMap);

  // export type FindingsBySeverity = {
  //   severity: string;
  //   findings: Finding;
  // };

  const allAuditKeys = Object.keys(findingsMap);
  for (const auditKey of allAuditKeys) {
    const f : FindingsBySeverity = {
      severity: auditKeyToSeverity(auditKey),
      findings: findingsMap[auditKey],
    }
    if(!auditMap[f.severity]){
      auditMap[f.severity] = [f];
    }else{
      auditMap[f.severity].push(f);
    }
  }
  
  for(const key in auditMap){
    console.log(auditMap[key]);

  }
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
  // "C:/Users/Salah/Documents/Coding/C4Audit/2023-04-rubicon/contracts/RubiconMarket.sol"
);
// const report = generateReport(auditMap);
// fs.writeFileSync('C:/Users/Salah/Documents/Coding/4naly3er/contracts/example/Test.txt', report);

console.log("Report generated successfully.");

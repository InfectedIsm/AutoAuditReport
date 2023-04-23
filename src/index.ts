//import files.ts
import fs from "fs";
import { pathToFile, fileToLines } from "./utils/files";
import {Finding, FindingsMap, FindingsBySeverity,
  AuditMap, auditKeyToSeverity, 
  extractCodeFromLines } from "./utils/findings";

//for now path is one file, but it will be a folder
const FileToAuditMap = (path: string, tagKeyword?: string): AuditMap => {
  //generate an array of string with each line
  const file = pathToFile(path);
  const lines = fileToLines(file);

  const findingsMap: FindingsMap = {};
  const auditMap: AuditMap = {};

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
    const line = lines[lineNumber].trim();
    const usedTagKeyword = (tagKeyword ?? "@audit - ");
    if (line.startsWith("//"+usedTagKeyword)) {
      //2 cases: one line code snippet [LXX] or multi line [LXX-LYY]
      let match = line.match(new RegExp(`/\/${usedTagKeyword}([A-Z]+)(\\d+) - (.*) \\[L(\\d+)-L(\\d+)\\]`)); 
      match = match || line.match(new RegExp(`/\/${usedTagKeyword}([A-Z]+)(\\d+) - (.*) \\[L(\\d+)\\]`));

      if (match) {
        const level = match[1];
        const auditCode = match[2];
        const description = match[3];
        const relativeLineStart = match[4];
        const relativeLineEnd = match[5] ?? match[4];
        const auditKey = level + auditCode;
      
        const currentProcessedfinding: Finding = {
          auditKey: auditKey,
          description: description,
          occurence: 1,
          code: [{
            tagLine: lineNumber,
            relativeStart: parseInt(relativeLineStart),
            relativeEnd: parseInt(relativeLineEnd),
            //slice doesn't work if lineStart === lineEnd
            codeSnippet: extractCodeFromLines(lines, lineNumber, parseInt(relativeLineStart), parseInt(relativeLineEnd)),
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
  console.log(findingsMap);

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

  fs.writeFile("auditMap.json", JSON.stringify(auditMap), (err) => {
    if(err){
      console.log(err);
    }else{
      console.log("File successfully written");
    }
  });

  for (const severity in auditMap) {
    console.log(`## ${severity} issues`);
    const findingsBySeverity = auditMap[severity];
  
    for (const finding of findingsBySeverity) {
      const { auditKey, description, occurence, code } = finding.findings;
      console.log(`#### ${auditKey} - ${description} (occurence: ${occurence})`);
  
      for (let i = 0; i < code.length; i++) {
        const { relativeStart, relativeEnd, codeSnippet } = code[i];
        console.log(`L${relativeStart}-L${relativeEnd}`);
        console.log('```solidity');
        console.log(codeSnippet);
        console.log('```');
      }
    }
  }
  // for(const key in auditMap){
  //   console.log(auditMap[key]);

  // }
  return auditMap;
};

const generateReport = (auditMap: AuditMap) => {

  const outputStream = fs.createWriteStream('report.md');
  // Loop through each severity level and generate report
  for (const severity in auditMap) {
    outputStream.write(`## ${severity} issues\n`);
    const findingsBySeverity = auditMap[severity];
  
    for (const finding of findingsBySeverity) {
      const { auditKey, description, occurence, code } = finding.findings;
      outputStream.write(`#### ${auditKey} - ${description} (occurence: ${occurence})\n`);
      outputStream.write(`write your description here\n`);
  
      for (let i = 0; i < code.length; i++) {
        const { relativeStart, relativeEnd, codeSnippet } = code[i];
        outputStream.write(`L${relativeStart}-L${relativeEnd}\n`);
        outputStream.write('```solidity\n');
        outputStream.write(codeSnippet + '\n');
        outputStream.write('```\n');
      }
    }
  }
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
generateReport(auditMap);
// fs.writeFileSync('C:/Users/Salah/Documents/Coding/4naly3er/contracts/example/Test.txt', report);

console.log("Report generated successfully.");

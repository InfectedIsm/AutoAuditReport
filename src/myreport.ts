import fs from 'fs';

type FindingsBySeverity = {
	severity: string;
	findings: Finding[];
};

type Finding = {
	auditKey: string;
	description: string;
	codeSnippet: CodeSnippet;
};

type CodeSnippet = {
	lineStart: number;
	lineEnd: number;
	codeSnippet: string;
};

type AuditMap = {
	//key: severity
	[key: string]: FindingsBySeverity[];	
};

const readSolidityFile = (filename: string): string => {
	//correct
	return fs.readFileSync(filename, 'utf8');
};

const findAudits = (content: string): AuditMap => {
	//generate an array of string with each line
	const lines = content.split('\n');
	const auditMap: AuditMap = {};

	//actual audit tag processed
	let currentAuditTag: Finding | null = null;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line.startsWith('//@audit')) {
			//this match each audit tag and get the level (G/NC/L/...), the code (01, 02, 03, ...) and the description that follows
			let match = line.match(/\/\/@audit - ([A-Z]+)(\d+) - (.*) \[L(\d+)-L(\d+)\]/);
			match = match || line.match(/\/\/@audit - ([A-Z]+)(\d+) - (.*) \[L(\d+)\]/);
			console.log(match);
			if (match) {
				const level = match[1];
				const auditCode = match[2];
				const description = match[3];
				const lineStart = match[4];
				const lineEnd = match[5] ?? '0';				
				console.log("lineEnd:", lineEnd);
				const auditKey = level + auditCode;
				
				currentAuditTag = {
					description,
					codeSnippet: '',
				};

				//
				if (!auditMap[auditKey]) {
				}
			}
	}
	console.log(auditMap);
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

const solidityFile = readSolidityFile('C:/Users/Salah/Documents/Coding/AutoAuditReport/contracts/Test.sol');
const auditMap = findAudits(solidityFile);
// const report = generateReport(auditMap);
// fs.writeFileSync('C:/Users/Salah/Documents/Coding/4naly3er/contracts/example/Test.txt', report);

console.log('Report generated successfully.');

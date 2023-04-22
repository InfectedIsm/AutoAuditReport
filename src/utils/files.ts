import fs from 'fs';

export type File = {
	filename: string;
	path: string;
	content: string;
};

const readSolidityFile = (filename: string): string => {
	//correct
	return fs.readFileSync(filename, 'utf8');
};

export const fileToLines = (file: File): string[] => {
	return file.content.split('\n');
};

export const pathToFile = (path: string): File => {
	let file: File;
	const filename: string = path.split('/').pop() || '';
	file = {
		filename,
		path,
		content: readSolidityFile(path),
	};
	return file;
}; 

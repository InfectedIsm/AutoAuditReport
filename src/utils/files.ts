import fs from 'fs';

/**
 * Object representing a file to analyze
 */
export type File = {
	filename: string;
	path: string;
	content: string;
};

/**
 * Reads a file and returns its content 
 * @param filename - The name of the file to read
 * @returns The content of the file
 */
const readSolidityFile = (filename: string): string => {
	//correct
	return fs.readFileSync(filename, 'utf8');
};

/**
 * Splits a file content into an array of lines
 * @param file - The file to split
 * @returns An array of lines
 */
export const fileToLines = (file: File): string[] => {
	return file.content.split('\n');
};

/**
 * Converts a path to a file object
 * @param path - The path of the file as a string
 * @returns A populated file object
 */
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

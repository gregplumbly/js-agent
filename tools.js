import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Tool definitions
export const toolDefinitions = [
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file to read'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'list_files',
    description: 'List files and directories in a given path',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The directory path to list (defaults to current directory)'
        }
      }
    }
  },
  {
    name: 'edit_file',
    description: `Edit a text file by replacing specific text.

To edit a file:
1. Use 'old_str' to specify the exact text you want to replace
2. Use 'new_str' to specify what to replace it with
3. The old_str must match exactly (including whitespace)
4. To create a new file, use old_str as empty string ""

Example: To change "fizzBuzz(100)" to "fizzBuzz(15)", use old_str="fizzBuzz(100)" and new_str="fizzBuzz(15)"`,
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to the file'
        },
        old_str: {
          type: 'string',
          description: 'Text to search for - must match exactly and must only have one match exactly'
        },
        new_str: {
          type: 'string',
          description: 'Text to replace old_str with'
        }
      },
      required: ['path', 'old_str', 'new_str']
    }
  }
];

// Tool execution functions
export function executeReadFile(path) {
  try {
    const content = readFileSync(path, 'utf8');
    return content;
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

export function executeListFiles(path = '.') {
  try {
    const files = readdirSync(path);
    return files.join('\n');
  } catch (error) {
    return `Error listing directory: ${error.message}`;
  }
}

function createNewFile(filePath, content) {
  try {
    const dir = dirname(filePath);
    if (dir !== '.') {
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(filePath, content, 'utf8');
    return `Successfully created file ${filePath}`;
  } catch (error) {
    return `Failed to create file: ${error.message}`;
  }
}

export function executeEditFile(path, oldStr, newStr) {
  try {
    if (!path || oldStr === newStr) {
      return 'Error: invalid input parameters';
    }

    if (!existsSync(path)) {
      if (oldStr === '') {
        return createNewFile(path, newStr);
      }
      return 'Error: file does not exist';
    }

    const oldContent = readFileSync(path, 'utf8');
    const newContent = oldContent.replaceAll(oldStr, newStr);

    if (oldContent === newContent && oldStr !== '') {
      return 'Error: old_str not found in file';
    }

    writeFileSync(path, newContent, 'utf8');
    return 'OK';
  } catch (error) {
    return `Error editing file: ${error.message}`;
  }
}

// Main tool executor
export function executeTool(toolName, input) {
  switch (toolName) {
    case 'read_file':
      return executeReadFile(input.path);
    case 'list_files':
      return executeListFiles(input.path);
    case 'edit_file':
      return executeEditFile(input.path, input.old_str, input.new_str);
    default:
      return `Unknown tool: ${toolName}`;
  }
}
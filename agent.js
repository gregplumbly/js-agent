import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import { readFileSync, readdirSync } from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class SimpleAgent {
  constructor() {
    this.conversation = [];
    this.tools = [
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
      }
    ];
  }

  executeReadFile(path) {
    try {
      const content = readFileSync(path, 'utf8');
      return content;
    } catch (error) {
      return `Error reading file: ${error.message}`;
    }
  }

  executeListFiles(path = '.') {
    try {
      const files = readdirSync(path);
      return files.join('\n');
    } catch (error) {
      return `Error listing directory: ${error.message}`;
    }
  }

  executeTool(toolName, input) {
    switch (toolName) {
      case 'read_file':
        return this.executeReadFile(input.path);
      case 'list_files':
        return this.executeListFiles(input.path);
      default:
        return `Unknown tool: ${toolName}`;
    }
  }

  async chat() {
    console.log('Agent: Hello! I\'m your AI assistant. Type "exit" to quit.\n');
    
    while (true) {
      const userInput = await this.getUserInput('You: ');
      
      if (userInput.toLowerCase() === 'exit') {
        console.log('Agent: Goodbye!');
        break;
      }

      this.conversation.push({
        role: 'user',
        content: userInput
      });

      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: this.conversation,
          tools: this.tools
        });

        let assistantMessage = '';
        const toolResults = [];
        const toolOutputs = [];

        for (const contentBlock of response.content) {
          if (contentBlock.type === 'text') {
            assistantMessage += contentBlock.text;
          } else if (contentBlock.type === 'tool_use') {
            const toolResult = this.executeTool(contentBlock.name, contentBlock.input);
            toolResults.push({
              tool_use_id: contentBlock.id,
              content: toolResult
            });
            toolOutputs.push(toolResult);
          }
        }

        if (assistantMessage) {
          console.log(`Agent: ${assistantMessage}\n`);
        }

        toolOutputs.forEach(output => {
          console.log(`${output}\n`);
        });

        this.conversation.push({
          role: 'assistant',
          content: response.content
        });

        if (toolResults.length > 0) {
          this.conversation.push({
            role: 'user',
            content: toolResults.map(result => ({
              type: 'tool_result',
              tool_use_id: result.tool_use_id,
              content: result.content
            }))
          });

          // Get Claude's response to the tool results
          const followUpResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            messages: this.conversation,
            tools: this.tools
          });

          let followUpMessage = '';
          for (const contentBlock of followUpResponse.content) {
            if (contentBlock.type === 'text') {
              followUpMessage += contentBlock.text;
            }
          }

          if (followUpMessage) {
            console.log(`Agent: ${followUpMessage}\n`);
          }

          this.conversation.push({
            role: 'assistant',
            content: followUpResponse.content
          });
        }

      } catch (error) {
        console.error('Error:', error.message);
      }
    }

    rl.close();
  }

  getUserInput(prompt) {
    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        resolve(answer);
      });
    });
  }
}

const agent = new SimpleAgent();
agent.chat();
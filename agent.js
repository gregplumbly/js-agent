import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';
import { toolDefinitions, executeTool } from './tools.js';

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
    this.tools = toolDefinitions;
  }

  async processResponse(response) {
    let assistantMessage = '';
    const toolResults = [];
    const toolOutputs = [];

    for (const contentBlock of response.content) {
      if (contentBlock.type === 'text') {
        assistantMessage += contentBlock.text;
      } else if (contentBlock.type === 'tool_use') {
        const toolResult = executeTool(contentBlock.name, contentBlock.input);
        toolResults.push({
          tool_use_id: contentBlock.id,
          content: toolResult
        });
        toolOutputs.push(toolResult);
      }
    }

    // Display assistant message first
    if (assistantMessage) {
      console.log(`Agent: ${assistantMessage}\n`);
    }

    // Then display tool outputs
    toolOutputs.forEach(output => {
      console.log(`${output}\n`);
    });

    return { assistantMessage, toolResults };
  }

  async handleToolResults(toolResults) {
    if (toolResults.length === 0) return;

    // Add tool results to conversation
    this.conversation.push({
      role: 'user',
      content: toolResults.map(result => ({
        type: 'tool_result',
        tool_use_id: result.tool_use_id,
        content: result.content
      }))
    });

    // Get Claude's follow-up response
    const followUpResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: this.conversation,
      tools: this.tools
    });

    const { toolResults: followUpToolResults } = await this.processResponse(followUpResponse);

    // Add follow-up response to conversation
    if (followUpResponse.content && followUpResponse.content.length > 0) {
      this.conversation.push({
        role: 'assistant',
        content: followUpResponse.content
      });
    }

    // Handle any additional tool calls recursively
    if (followUpToolResults.length > 0) {
      this.conversation.push({
        role: 'user',
        content: followUpToolResults.map(result => ({
          type: 'tool_result',
          tool_use_id: result.tool_use_id,
          content: result.content
        }))
      });

      // Get a final summary response
      const finalResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: this.conversation
      });

      let finalMessage = '';
      for (const contentBlock of finalResponse.content) {
        if (contentBlock.type === 'text') {
          finalMessage += contentBlock.text;
        }
      }

      if (finalMessage) {
        console.log(`Agent: ${finalMessage}\n`);
      }

      // Add final response to conversation
      if (finalResponse.content && finalResponse.content.length > 0) {
        this.conversation.push({
          role: 'assistant',
          content: finalResponse.content
        });
      }
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

        const { toolResults } = await this.processResponse(response);

        // Add initial response to conversation
        if (response.content && response.content.length > 0) {
          this.conversation.push({
            role: 'assistant',
            content: response.content
          });
        }

        // Handle any tool results
        await this.handleToolResults(toolResults);

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
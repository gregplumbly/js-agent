# JavaScript AI Agent

A simple AI agent implementation in JavaScript, inspired by [Thorsten Ball's "How to Build an Agent"](https://ampcode.com/how-to-build-an-agent) tutorial.

## Overview

This project demonstrates that building a functional AI agent is surprisingly straightforward. As Thorsten Ball puts it: "The emperor has no clothes" - the complexity we imagine around AI agents often doesn't exist. This JavaScript implementation proves that a working, code-editing agent can be built in under 200 lines of code.

## What This Agent Can Do

- **Chat with Claude**: Maintains conversation context across multiple exchanges
- **Read files**: Uses the `read_file` tool to access file contents
- **List directories**: Uses the `list_files` tool to explore the filesystem
- **Solve problems**: Can read riddles from files, analyze code, or help with development tasks

## Key Insights

The tutorial emphasizes that AI agents are fundamentally simple:

1. **Tell the model what tools exist** - Define available functions with clear descriptions
2. **Let the model request tool execution** - Claude decides when and how to use tools
3. **Execute and return results** - Run the requested tools and feed results back to Claude

That's it. The "magic" is in the LLM's ability to understand context and choose appropriate tools.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Anthropic API key:
```
ANTHROPIC_API_KEY=your_key_here
```

3. Run the agent:
```bash
npm start
```

## Usage Examples

- `"What files can you see in this directory?"` - Lists current directory contents
- `"Read the package.json file"` - Shows file contents
- `"Help me solve the riddle in secret-file.txt"` - Reads and analyzes file content

## Architecture

The agent follows a simple loop:
1. Get user input
2. Send conversation + available tools to Claude
3. Process Claude's response (text and/or tool use)
4. Execute any requested tools
5. Send tool results back to Claude for follow-up
6. Display final response
7. Repeat

## Tools Implementation

Each tool requires:
- **Name**: Identifier for the tool
- **Description**: What the tool does
- **Input schema**: Expected parameters
- **Execution function**: JavaScript function that performs the work

Current tools:
- `read_file`: Reads file contents using Node.js `fs.readFileSync`
- `list_files`: Lists directory contents using `fs.readdirSync`

## Philosophy

This implementation validates Thorsten Ball's core thesis: "It's not that hard to build a fully functioning, code-editing agent." The real work is in practical engineering details, not in understanding some arcane AI architecture.

The power lies in the LLM itself - these models are incredibly capable at understanding context, making decisions, and using tools appropriately.

## Extending the Agent

Adding new tools is straightforward:
1. Add tool definition to the `tools` array
2. Implement the execution function
3. Add case to the `executeTool` switch statement

The agent automatically handles the conversation flow and tool result processing.
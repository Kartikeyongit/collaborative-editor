const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class CodeExecutor {
  constructor() {
    this.executionTimeout = 10000; // 10 seconds
  }

  async execute(code, language) {
    const executionId = uuidv4();
    const workDir = path.join(__dirname, '../../temp', executionId);

    try {
      // Create temp directory
      fs.mkdirSync(workDir, { recursive: true });

      let result;
      switch (language) {
        case 'javascript':
          result = await this.executeJavaScript(code, workDir);
          break;
        case 'python':
          result = await this.executePython(code, workDir);
          break;
        case 'java':
          result = await this.executeJava(code, workDir);
          break;
        case 'cpp':
          result = await this.executeCpp(code, workDir);
          break;
        case 'typescript':
          result = await this.executeTypeScript(code, workDir);
          break;
        default:
          result = { output: `Language ${language} not supported yet`, success: false };
      }

      return result;
    } catch (error) {
      return { 
        output: `Execution error: ${error.message}`, 
        success: false,
        error: error.message 
      };
    } finally {
      // Cleanup temp files
      this.cleanup(workDir);
    }
  }

  async executeJavaScript(code, workDir) {
    const dockerCommand = `docker run --rm \
      --network none \
      --memory=100m \
      --cpus=0.5 \
      -v ${workDir}:/code \
      -w /code \
      node:18-alpine \
      node -e "${this.escapeCode(code)}"`;

    return this.runDocker(dockerCommand);
  }

  async executePython(code, workDir) {
    const filePath = path.join(workDir, 'script.py');
    fs.writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm \
      --network none \
      --memory=100m \
      --cpus=0.5 \
      -v ${workDir}:/code \
      -w /code \
      python:3.11-alpine \
      python script.py`;

    return this.runDocker(dockerCommand);
  }

  async executeJava(code, workDir) {
    // Extract class name or use Main as default
    const className = 'Main';
    const filePath = path.join(workDir, `${className}.java`);
    fs.writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm \
      --network none \
      --memory=200m \
      --cpus=0.5 \
      -v ${workDir}:/code \
      -w /code \
      eclipse-temurin:17-alpine \
      sh -c "javac ${className}.java && java ${className}"`;

    return this.runDocker(dockerCommand);
  }

  async executeCpp(code, workDir) {
    const filePath = path.join(workDir, 'program.cpp');
    fs.writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm \
      --network none \
      --memory=100m \
      --cpus=0.5 \
      -v ${workDir}:/code \
      -w /code \
      gcc:latest \
      sh -c "g++ -o program program.cpp && ./program"`;

    return this.runDocker(dockerCommand);
  }

  async executeTypeScript(code, workDir) {
    const filePath = path.join(workDir, 'script.ts');
    fs.writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm \
      --network none \
      --memory=150m \
      --cpus=0.5 \
      -v ${workDir}:/code \
      -w /code \
      node:18-alpine \
      sh -c "npm install -g typescript && tsc script.ts && node script.js"`;

    return this.runDocker(dockerCommand);
  }

  runDocker(command) {
    return new Promise((resolve) => {
      const child = exec(command, { timeout: this.executionTimeout }, (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            resolve({ output: 'Execution timeout - code took too long', success: false });
          } else {
            resolve({ 
              output: stderr || error.message || 'Execution failed', 
              success: false,
              error: error.message 
            });
          }
        } else {
          resolve({
            output: stdout || stderr || 'Code executed (no output)',
            success: true
          });
        }
      });
    });
  }

  escapeCode(code) {
    // Escape double quotes and backslashes for shell
    return code
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  cleanup(workDir) {
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error.message);
    }
  }
}

// Fallback executor for when Docker isn't available
class FallbackExecutor {
  async execute(code, language) {
    if (language === 'javascript') {
      return this.executeJavaScriptSafely(code);
    }
    return { 
      output: `${language} execution requires Docker. Only JavaScript is available without Docker.\nTip: Install Docker for full language support.`, 
      success: false 
    };
  }

  executeJavaScriptSafely(code) {
    return new Promise((resolve) => {
      try {
        // Create a sandboxed environment
        const sandbox = {
          console: {
            log: (...args) => {
              logs.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' '));
            },
            error: (...args) => {
              logs.push('Error: ' + args.join(' '));
            },
            warn: (...args) => {
              logs.push('Warning: ' + args.join(' '));
            }
          },
          setTimeout: undefined,
          setInterval: undefined,
          require: undefined,
          process: undefined,
          global: undefined
        };
        
        const logs = [];
        
        // Execute in sandbox
        const func = new Function('sandbox', `
          with (sandbox) {
            ${code}
          }
        `);
        
        func(sandbox);
        
        resolve({
          output: logs.join('\n') || 'Code executed successfully (no output)',
          success: true
        });
      } catch (error) {
        resolve({
          output: `Runtime Error: ${error.message}`,
          success: false
        });
      }
    });
  }
}

// Choose executor based on Docker availability
let executor;
try {
  exec('docker --version', (error) => {
    if (error) {
      console.log('Docker not available, using JavaScript fallback only');
      executor = new FallbackExecutor();
    } else {
      console.log('Docker detected, full language support enabled');
      executor = new CodeExecutor();
    }
  });
} catch {
  executor = new FallbackExecutor();
}

// Ensure executor is always initialized
setTimeout(() => {
  if (!executor) {
    executor = new FallbackExecutor();
  }
}, 100);

module.exports = {
  execute: (code, language) => executor.execute(code, language)
};
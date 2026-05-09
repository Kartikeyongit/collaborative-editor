// Mock AI suggestions by language
const suggestionsDB = {
  javascript: {
    snippets: [
      {
        label: 'console.log',
        insertText: 'console.log(${1:value});',
        detail: 'Log output to console',
        documentation: 'Prints a message to the console'
      },
      {
        label: 'async function',
        insertText: 'async function ${1:name}(${2:params}) {\n  ${3:body}\n}',
        detail: 'Create async function',
        documentation: 'Creates an asynchronous function that returns a promise'
      },
      {
        label: 'try/catch',
        insertText: 'try {\n  ${1:code}\n} catch (${2:error}) {\n  console.error(${2:error});\n}',
        detail: 'Error handling block',
        documentation: 'Catches and handles exceptions'
      },
      {
        label: 'forEach',
        insertText: '${1:array}.forEach((${2:item}) => {\n  ${3:body}\n});',
        detail: 'Loop through array',
        documentation: 'Executes a function for each array element'
      },
      {
        label: 'map',
        insertText: '${1:array}.map((${2:item}) => {\n  return ${3:transformed};\n});',
        detail: 'Transform array',
        documentation: 'Creates a new array by transforming each element'
      },
      {
        label: 'class',
        insertText: 'class ${1:ClassName} {\n  constructor(${2:params}) {\n    ${3:body}\n  }\n}',
        detail: 'Create a class',
        documentation: 'Defines a new class with constructor'
      }
    ],
    completions: {
      'cons': 'console.log(${1:value});',
      'func': 'function ${1:name}(${2:params}) {\n  ${3:body}\n}',
      'arr': 'const ${1:name} = [${2:elements}];',
      'obj': 'const ${1:name} = {\n  ${2:key}: ${3:value}\n};'
    }
  },
  
  python: {
    snippets: [
      {
        label: 'print',
        insertText: 'print(${1:value})',
        detail: 'Print to console',
        documentation: 'Prints a value to the standard output'
      },
      {
        label: 'def function',
        insertText: 'def ${1:name}(${2:params}):\n    ${3:body}',
        detail: 'Define function',
        documentation: 'Creates a new function'
      },
      {
        label: 'class',
        insertText: 'class ${1:ClassName}:\n    def __init__(self, ${2:params}):\n        ${3:body}',
        detail: 'Create class',
        documentation: 'Defines a new class with constructor'
      },
      {
        label: 'for loop',
        insertText: 'for ${1:item} in ${2:iterable}:\n    ${3:body}',
        detail: 'For loop',
        documentation: 'Iterates over items in an iterable'
      },
      {
        label: 'list comprehension',
        insertText: '[${1:expression} for ${2:item} in ${3:iterable}]',
        detail: 'List comprehension',
        documentation: 'Creates a new list using a compact syntax'
      },
      {
        label: 'try/except',
        insertText: 'try:\n    ${1:code}\nexcept ${2:Exception} as ${3:e}:\n    print(${3:e})',
        detail: 'Exception handling',
        documentation: 'Catches and handles exceptions'
      }
    ],
    completions: {
      'pri': 'print(${1:value})',
      'def': 'def ${1:name}(${2:params}):\n    ${3:body}',
      'imp': 'import ${1:module}',
      'fro': 'from ${1:module} import ${2:name}'
    }
  },
  
  java: {
    snippets: [
      {
        label: 'System.out.println',
        insertText: 'System.out.println(${1:value});',
        detail: 'Print to console',
        documentation: 'Prints a line to standard output'
      },
      {
        label: 'main method',
        insertText: 'public static void main(String[] args) {\n    ${1:body}\n}',
        detail: 'Main method',
        documentation: 'Entry point for Java application'
      },
      {
        label: 'for loop',
        insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3:body}\n}',
        detail: 'For loop',
        documentation: 'Standard for loop with counter'
      },
      {
        label: 'try/catch',
        insertText: 'try {\n    ${1:code}\n} catch (${2:Exception} ${3:e}) {\n    ${3:e}.printStackTrace();\n}',
        detail: 'Exception handling',
        documentation: 'Catches and handles exceptions'
      }
    ],
    completions: {
      'sys': 'System.out.println(${1:value});',
      'pub': 'public class ${1:Name} {\n    ${2:body}\n}',
      'imp': 'import ${1:package};\n'
    }
  },
  
  cpp: {
    snippets: [
      {
        label: 'cout',
        insertText: 'std::cout << ${1:value} << std::endl;',
        detail: 'Print to console',
        documentation: 'Prints to standard output'
      },
      {
        label: 'main function',
        insertText: 'int main() {\n    ${1:body}\n    return 0;\n}',
        detail: 'Main function',
        documentation: 'Entry point of the program'
      },
      {
        label: 'for loop',
        insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n    ${3:body}\n}',
        detail: 'For loop',
        documentation: 'Standard for loop'
      }
    ],
    completions: {
      'cou': 'std::cout << ${1:value} << std::endl;',
      'inc': '#include <${1:header}>',
      'vec': 'std::vector<${1:type}> ${2:name};'
    }
  },
  
  typescript: {
    snippets: [
      {
        label: 'interface',
        insertText: 'interface ${1:Name} {\n  ${2:property}: ${3:type};\n}',
        detail: 'Define interface',
        documentation: 'Creates a TypeScript interface'
      },
      {
        label: 'type',
        insertText: 'type ${1:Name} = {\n  ${2:property}: ${3:type};\n};',
        detail: 'Define type',
        documentation: 'Creates a type alias'
      },
      {
        label: 'async function',
        insertText: 'async function ${1:name}(${2:params}: ${3:types}): Promise<${4:returnType}> {\n  ${5:body}\n}',
        detail: 'Async function with types',
        documentation: 'Creates typed async function'
      }
    ],
    completions: {
      'cons': 'const ${1:name}: ${2:type} = ${3:value};',
      'int': 'interface ${1:Name} {\n  ${2:property}: ${3:type};\n}',
      'fun': 'function ${1:name}(${2:params}): ${3:returnType} {\n  ${4:body}\n}'
    }
  }
};

class AISuggestionService {
  getSnippets(language) {
    const langData = suggestionsDB[language] || suggestionsDB.javascript;
    return langData.snippets || [];
  }

  getCompletions(word, language) {
    if (!word || word.length < 2) return [];
    
    const langData = suggestionsDB[language] || suggestionsDB.javascript;
    const completions = langData.completions || {};
    const results = [];
    
    for (const [key, value] of Object.entries(completions)) {
      if (key.startsWith(word.toLowerCase())) {
        results.push({
          label: key,
          insertText: value,
          detail: `Complete with ${key}`,
          kind: 'Completion'
        });
      }
    }
    
    return results;
  }

  getContextSuggestions(code, language, cursorPosition) {
    const lines = code.split('\n');
    const currentLine = lines[cursorPosition?.lineNumber - 1] || '';
    const lastWord = currentLine.split(/\s+/).pop() || '';
    
    // Return completions based on what user is typing
    const completions = this.getCompletions(lastWord, language);
    
    // Add snippets relevant to context
    const snippets = this.getSnippets(language).slice(0, 3);
    
    return {
      completions,
      snippets,
      context: {
        language,
        lineCount: lines.length,
        currentWord: lastWord
      }
    };
  }
}

module.exports = new AISuggestionService();
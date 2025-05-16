class Calculator {
    constructor() {
        this.input = document.getElementById('calulator_input');
        this.result = document.getElementById('calulator_result');
        this.currentInput = '';
        this.bracketCount = 0;
        this.maxInputLength = 20;
        
        this.initializeButtons();
        this.initializeKeyboardInput();
        this.initializeToggle();
        this.initializeClickOutside();
        
        // Cleanup on window unload
        window.addEventListener('unload', () => {
            if (this.calculateTimeout) {
                clearTimeout(this.calculateTimeout);
            }
        });
    }

    initializeToggle() {
        const toggleButton = document.getElementById('toggle_calc');
        const calculator = document.getElementById('calculator');
        
        toggleButton.addEventListener('click', () => {
            calculator.classList.toggle('active');
            toggleButton.classList.toggle('active');
        });
    }

    initializeClickOutside() {
        // Add click event listener to the document
        document.addEventListener('click', (event) => {
            const calculator = document.getElementById('calculator');
            const toggleButton = document.getElementById('toggle_calc');
            
            // Check if click is outside calculator and toggle button
            if (!calculator.contains(event.target) && !toggleButton.contains(event.target)) {
                calculator.classList.remove('active');
                toggleButton.classList.remove('active');
            }
        });
    }

    initializeButtons() {
        // Number buttons
        const numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        numbers.forEach((num, index) => {
            document.getElementById(num).addEventListener('click', () => this.appendNumber(index));
        });

        // Operator buttons
        document.getElementById('plus').addEventListener('click', () => this.appendOperator('+'));
        document.getElementById('minus').addEventListener('click', () => this.appendOperator('-'));
        document.getElementById('multiply').addEventListener('click', () => this.appendOperator('×'));
        document.getElementById('divide').addEventListener('click', () => this.appendOperator('÷'));
        document.getElementById('percent').addEventListener('click', () => this.appendOperator('%'));
        
        // Special buttons
        document.getElementById('dot').addEventListener('click', () => this.appendDot());
        document.getElementById('bracket').addEventListener('click', () => this.appendBracket());
        document.getElementById('nagate').addEventListener('click', () => this.negate());
        document.getElementById('clear_all').addEventListener('click', () => this.clear());
        document.getElementById('backspace').addEventListener('click', () => this.backspace());
        document.getElementById('equals').addEventListener('click', (event) => this.calculate(event));
    }

    initializeKeyboardInput() {
        document.addEventListener('keydown', (event) => {
            if (event.key >= '0' && event.key <= '9') {
                this.appendNumber(parseInt(event.key));
            } else {
                switch (event.key) {
                    case '+': this.appendOperator('+'); break;
                    case '-': this.appendOperator('-'); break;
                    case '*': this.appendOperator('×'); break;
                    case '/': this.appendOperator('÷'); break;
                    case '%': this.appendOperator('%'); break;
                    case '.': this.appendDot(); break;
                    case '(': case ')': this.appendBracket(); break;
                    case 'Enter': this.calculate({ target: { id: 'equals' } }); break;
                    case 'Backspace': this.backspace(); break;
                    case 'Escape': this.clear(); break;
                }
            }
        });
    }

    appendNumber(number) {
        if (this.currentInput.length >= this.maxInputLength) return;
        this.currentInput += number;
        this.updateDisplay();
    }

    appendOperator(operator) {
        if (this.currentInput.length >= this.maxInputLength) return;
        if (this.currentInput !== '' && !this.endsWithOperator()) {
            this.currentInput += operator;
            this.updateDisplay();
        }
    }

    evaluateExpression(expression) {
        // Handle percentages before tokenizing
        expression = expression.replace(/(\d+\.?\d*)\s*%/g, (match, number, offset) => {
            const percentValue = parseFloat(number) / 100;
            
            // Look backwards to find what this percentage applies to
            let baseNumber = '';
            let pos = offset - 1;
            let operator = '';
            
            // Skip whitespace
            while (pos >= 0 && /\s/.test(expression[pos])) pos--;
            
            // Find the operator
            if (pos >= 0 && /[+\-*\/]/.test(expression[pos])) {
                operator = expression[pos];
                pos--;
                // Skip whitespace after operator
                while (pos >= 0 && /\s/.test(expression[pos])) pos--;
            }
            
            // Find the base number
            while (pos >= 0 && /[\d.]/.test(expression[pos])) {
                baseNumber = expression[pos] + baseNumber;
                pos--;
            }
            
            if (baseNumber) {
                const base = parseFloat(baseNumber);
                // Calculate the percentage value
                const result = base * percentValue;
                
                // For subtraction, we want to subtract the percentage
                if (operator === '-') {
                    return String(result);
                }
                // For division, we want to divide by the percentage
                if (operator === '/') {
                    return String(result);
                }
                // For addition and multiplication
                return String(result);
            }
            
            return String(percentValue);
        });

        const tokens = expression.match(/\d+\.?\d*|\+|\-|\*|\/|\(|\)/g) || [];
        const output = [];
        const operators = [];
        
        const precedence = {
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2
        };
        
        const applyOperator = () => {
            const b = parseFloat(output.pop());
            const a = parseFloat(output.pop());
            const op = operators.pop();
            
            switch(op) {
                case '+': output.push(a + b); break;
                case '-': output.push(a - b); break;
                case '*': output.push(a * b); break;
                case '/': output.push(a / b); break;
            }
        };
        
        tokens.forEach(token => {
            if (!isNaN(token)) {
                output.push(token);
            } else if (token === '(') {
                operators.push(token);
            } else if (token === ')') {
                while (operators.length && operators[operators.length - 1] !== '(') {
                    applyOperator();
                }
                operators.pop(); // Remove '('
            } else {
                while (operators.length && operators[operators.length - 1] !== '(' && 
                       precedence[operators[operators.length - 1]] >= precedence[token]) {
                    applyOperator();
                }
                operators.push(token);
            }
        });
        
        while (operators.length) {
            applyOperator();
        }
        
        return output[0];
    }

    isValidExpression(expression) {
        // More detailed validation with specific error messages
        if (/[^0-9+\-*/.()% ]/.test(expression)) {
            throw new Error('Invalid characters in expression');
        }
        if (/[+\-*/.]{2,}/.test(expression)) {
            throw new Error('Multiple operators in a row');
        }
        if (/^\D/.test(expression) && !expression.startsWith('(') && !expression.startsWith('-')) {
            throw new Error('Expression must start with a number or parenthesis');
        }
        
        // Check for division by zero after percentage conversion
        const numbers = expression.match(/\d+\.?\d*%?/g) || [];
        for (const num of numbers) {
            if (num.endsWith('%')) {
                const value = parseFloat(num) / 100;
                if (value === 0) {
                    throw new Error('Cannot divide by zero (0%)');
                }
            } else if (parseFloat(num) === 0) {
                throw new Error('Cannot divide by zero');
            }
        }
        
        return true;
    }

    appendDot() {
        if (this.currentInput.length >= this.maxInputLength) return;
        if (this.currentInput === '' || this.endsWithOperator()) {
            this.currentInput += '0.';
        } else if (!this.getLastNumber().includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    appendBracket() {
        if (this.currentInput.length >= this.maxInputLength) return;
        if (this.bracketCount === 0 || this.currentInput.endsWith('(')) {
            this.currentInput += '(';
            this.bracketCount++;
        } else {
            this.currentInput += ')';
            this.bracketCount--;
        }
        this.updateDisplay();
    }

    negate() {
        if (this.currentInput !== '') {
            const lastNumber = this.getLastNumber();
            const negatedNumber = lastNumber.startsWith('-') ? 
                lastNumber.substring(1) : '-' + lastNumber;
            this.currentInput = this.currentInput.slice(0, -lastNumber.length) + negatedNumber;
            this.updateDisplay();
        }
    }

    clear() {
        this.currentInput = '';
        this.result.value = '';
        this.bracketCount = 0;
        this.updateDisplay();
    }

    backspace() {
        if (this.currentInput.endsWith('(')) this.bracketCount--;
        if (this.currentInput.endsWith(')')) this.bracketCount++;
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateDisplay();
    }

    calculate(event) {
        try {
            let expression = this.currentInput;
            
            // Empty input check
            if (!expression.trim()) {
                throw new Error('Please enter an expression');
            }

            // Handle incomplete parentheses
            if (this.bracketCount > 0) {
                expression += ')'.repeat(this.bracketCount);
            }

            // Replace operators
            expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Validate expression
            this.isValidExpression(expression);

            const result = this.evaluateExpression(expression);
            
            // Check for division by zero
            if (!isFinite(result)) {
                throw new Error('Cannot divide by zero');
            }

            // Check if result is valid
            if (isNaN(result)) {
                throw new Error('Invalid calculation');
            }

            if (event && event.target.id === 'equals') {
                this.currentInput = String(result);
                this.input.value = this.currentInput;
                this.result.value = '';
                this.bracketCount = 0;
            } else {
                this.result.value = result;
            }
        } catch (error) {
            if (event && event.target.id === 'equals') {
                // More user-friendly error messages
                let errorMessage = error.message;
                switch (errorMessage) {
                    case 'Invalid characters in expression':
                        errorMessage = 'Only numbers and basic operators are allowed';
                        break;
                    case 'Multiple operators in a row':
                        errorMessage = 'Please check your operators';
                        break;
                    case 'Expression must start with a number or parenthesis':
                        errorMessage = 'Start with a number or bracket';
                        break;
                    case 'Invalid calculation':
                        errorMessage = 'Please check your expression';
                        break;
                    default:
                        if (errorMessage === 'Error') {
                            errorMessage = 'Invalid expression';
                        }
                }
                this.result.value = errorMessage;
            } else {
                this.result.value = '';
            }
        }
    }

    endsWithOperator() {
        return /[+\-*\/×÷%]$/.test(this.currentInput);
    }

    getLastNumber() {
        return this.currentInput.split(/[+\-*\/×÷%()]/).pop();
    }

    updateDisplay() {
        this.input.value = this.currentInput;
        
        if (this.calculateTimeout) {
            clearTimeout(this.calculateTimeout);
        }
        
        if (this.currentInput !== '') {
            this.calculateTimeout = setTimeout(() => {
                this.calculate();
            }, 150);
        } else {
            this.result.value = '';
        }
    }
}

// Initialize calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// too lazy to code today
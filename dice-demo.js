// Demo script to test dice combination logic in browser console
// Paste this into the browser console on the character-sheet page after opening the dice modal

function demonstrateDiceCombination() {
    console.log('🎲 Demonstrating Smart Dice Combination Logic');
    console.log('='.repeat(50));
    
    // Get the dice expression input
    const expressionInput = document.getElementById('dice-expression');
    if (!expressionInput) {
        console.error('Dice expression input not found. Make sure the dice modal is open.');
        return;
    }
    
    const tests = [
        {
            description: 'Starting fresh, adding d20',
            start: '',
            addDice: 20,
            expected: '1d20'
        },
        {
            description: 'Adding another d20 (should combine to 2d20)',
            start: '1d20',
            addDice: 20,
            expected: '2d20'
        },
        {
            description: 'Adding d6 to 2d20 (should add new term)',
            start: '2d20',
            addDice: 6,
            expected: '2d20+1d6'
        },
        {
            description: 'Adding another d6 (should combine to 2d6)',
            start: '2d20+1d6',
            addDice: 6,
            expected: '2d20+2d6'
        },
        {
            description: 'Adding d4 to complex expression',
            start: '2d20+2d6+5',
            addDice: 4,
            expected: '2d20+2d6+1d4+5'
        },
        {
            description: 'Adding another d4 (should combine)',
            start: '2d20+2d6+1d4+5',
            addDice: 4,
            expected: '2d20+2d6+2d4+5'
        }
    ];
    
    tests.forEach((test, index) => {
        console.log(`\nTest ${index + 1}: ${test.description}`);
        console.log(`Starting expression: "${test.start}"`);
        
        // Set the starting expression
        expressionInput.value = test.start;
        
        // Simulate adding the dice
        const result = combineWithExistingDice(test.start, test.addDice);
        
        console.log(`Adding d${test.addDice}`);
        console.log(`Result: "${result}"`);
        console.log(`Expected: "${test.expected}"`);
        
        if (result === test.expected) {
            console.log('✅ PASS');
        } else {
            console.log('❌ FAIL');
        }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log('Demo complete! Try clicking the dice buttons in the modal to see it in action.');
}

// Auto-run if in console
if (typeof window !== 'undefined') {
    console.log('Dice combination demo loaded. Run demonstrateDiceCombination() to see it in action.');
}

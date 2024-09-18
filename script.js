document.addEventListener('DOMContentLoaded', function() {
    const DOCElements = {
        startGameButton: document.getElementById('start-game'),
        startMenu: document.getElementById('start-menu'),
        settingsButton: document.getElementById('settings'),
        quitGameButton: document.getElementById('quit-game'),
        gameBoard: document.getElementById('game-board'),
        backToMenuButton: document.getElementById('back-to-menu'),
        diceDisplay: document.getElementById('dice-display'),
        rollDiceButton: document.getElementById('roll-dice'),
        player1Grid: document.getElementById('player1-grid'),
        player2Grid: document.getElementById('player2-grid'),
        player1Cells: document.querySelectorAll('#player1-grid .cell'),
        player2Cells: document.querySelectorAll('#player2-grid .cell'),
        player1Numbers: document.querySelectorAll('#player1-numbers .number'),
        player2Numbers: document.querySelectorAll('#player2-numbers .number'),
        player1Total: document.querySelector('#player1-total .total-number'),
        player2Total: document.querySelector('#player2-total .total-number')
    };

    let currentPlayer = 1; // 1 for Player 1, 2 for Player 2
    let rolledValue = null; // Store the value of the last dice roll
    let gameActive = false; // Track if the game is in progress

    // Column scores for each player
    let player1ColumnScores = [0, 0, 0];
    let player2ColumnScores = [0, 0, 0];

    // Function to roll the dice
    function rollDice() {
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const randomNumber = Math.floor(Math.random() * 6);
        rolledValue = randomNumber + 1;
        const diceFace = diceFaces[randomNumber];
        
        DOCElements.diceDisplay.textContent = diceFace;
        gameActive = true;
    }

    // Function to calculate column score
    function calculateColumnScore(columnCells) {
        const diceCount = {};
        columnCells.forEach(cell => {
            const value = parseInt(cell.textContent, 10);
            if (!isNaN(value)) {
                diceCount[value] = (diceCount[value] || 0) + 1;
            }
        });

        let columnScore = 0;
        for (const value in diceCount) {
            const count = diceCount[value];
            const diceValue = parseInt(value, 10);

            switch (count) {
                case 1:
                    columnScore += diceValue;
                    break;
                case 2:
                    columnScore += diceValue * 4;
                    break;
                case 3:
                    columnScore += diceValue * 9;
                    break;
                default:
                    columnScore += diceValue;
                    break;
            }
        }
        return columnScore;
    }

    // Function to calculate and update total score
    function updateTotalScore(playerScores, totalDisplay) {
        const totalScore = playerScores.reduce((sum, score) => sum + score, 0);
        totalDisplay.textContent = totalScore;
    }

    // Function to check if a player has filled all cells
    function checkGameEnd(playerCells) {
        return Array.from(playerCells).every(cell => cell.textContent !== '');
    }

    // Function to check and remove matching numbers from the other player's grid
function checkAndRemoveMatchingNumbers(otherPlayerCells, otherPlayerScores, otherPlayerNumbers, otherPlayerTotal, currentColumnIndex) {
    // Create arrays for columns of the other player
    const otherPlayerColumns = [[], [], []];
    otherPlayerCells.forEach((cell, index) => {
        const columnIndex = index % 3;
        if (cell.textContent) {
            otherPlayerColumns[columnIndex].push(cell);
        }
    });

    // Remove numbers only from the matching column
    const columnCells = otherPlayerColumns[currentColumnIndex];
    columnCells.forEach(cell => {
        if (parseInt(cell.textContent, 10) === rolledValue) {
            cell.textContent = '';
        }
    });

    // Update scores for the affected column
    const newColumnScore = calculateColumnScore(columnCells);
    otherPlayerScores[currentColumnIndex] = newColumnScore;
    otherPlayerNumbers[currentColumnIndex].textContent = newColumnScore;
    updateTotalScore(otherPlayerScores, otherPlayerTotal);
}

// Function to handle cell clicks
function handleCellClick(event, playerCells, playerScores, playerNumbers, totalDisplay) {
    if (!gameActive || rolledValue === null) return;

    const cell = event.target;
    const cellIndex = Array.from(playerCells).indexOf(cell);
    const columnIndex = cellIndex % 3;
    const columnCells = Array.from(playerCells).filter((_, index) => index % 3 === columnIndex);
    const rowIndex = Math.floor(cellIndex / 3);

    let canPlace = true;
    for (let i = 0; i < rowIndex; i++) {
        if (columnCells[i].textContent === '') {
            canPlace = false;
            break;
        }
    }

    if (canPlace && cell.textContent === '') {
        cell.textContent = rolledValue;
        const newColumnScore = calculateColumnScore(columnCells);
        playerScores[columnIndex] = newColumnScore;
        playerNumbers[columnIndex].textContent = newColumnScore;
        updateTotalScore(playerScores, totalDisplay);

        // Check and remove matching numbers from the other player's grid
        if (currentPlayer === 1) {
            checkAndRemoveMatchingNumbers(DOCElements.player2Cells, player2ColumnScores, DOCElements.player2Numbers, DOCElements.player2Total, columnIndex);
        } else {
            checkAndRemoveMatchingNumbers(DOCElements.player1Cells, player1ColumnScores, DOCElements.player1Numbers, DOCElements.player1Total, columnIndex);
        }

        if (checkGameEnd(playerCells)) {
            endGame();
            return;
        }

        rolledValue = null;
        gameActive = false;
        switchPlayer();
    } else {
        DOCElements.diceDisplay.textContent = `Invalid move, fill from top to bottom!`;
    }
}
    // Function to switch the current player
    function switchPlayer() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        DOCElements.diceDisplay.textContent = `Player ${currentPlayer}'s turn`;
    }

    // Function to end the game, display results, and reset the game state
    function endGame() {
        const player1TotalScore = parseInt(DOCElements.player1Total.textContent, 10);
        const player2TotalScore = parseInt(DOCElements.player2Total.textContent, 10);
        let winnerMessage = '';

        if (player1TotalScore > player2TotalScore) {
            winnerMessage = 'Player 1 wins!';
        } else if (player1TotalScore < player2TotalScore) {
            winnerMessage = 'Player 2 wins!';
        } else {
            winnerMessage = 'It\'s a tie!';
        }

        alert(`Game Over!\n\nPlayer 1 Score: ${player1TotalScore}\nPlayer 2 Score: ${player2TotalScore}\n\n${winnerMessage}`);
        
        // Reset the game state
        resetGame();
    }

    // Function to reset the game state to default
    function resetGame() {
        // Clear all cells
        DOCElements.player1Cells.forEach(cell => cell.textContent = '');
        DOCElements.player2Cells.forEach(cell => cell.textContent = '');

        // Reset scores
        player1ColumnScores = [0, 0, 0];
        player2ColumnScores = [0, 0, 0];
        DOCElements.player1Numbers.forEach(number => number.textContent = '0');
        DOCElements.player2Numbers.forEach(number => number.textContent = '0');
        DOCElements.player1Total.textContent = '0';
        DOCElements.player2Total.textContent = '0';

        // Reset dice display
        DOCElements.diceDisplay.textContent = '🎲';

        // Hide game board and show start menu
        DOCElements.gameBoard.style.display = 'none';
        DOCElements.startMenu.style.display = 'block';
        
        // Reset game state variables
        currentPlayer = 1;
        rolledValue = null;
        gameActive = false;
    }

    // Start Game button click event
    DOCElements.startGameButton.addEventListener('click', function() {
        DOCElements.startMenu.style.display = 'none';
        DOCElements.gameBoard.style.display = 'block';
        DOCElements.diceDisplay.textContent = "Player 1's turn";
        currentPlayer = 1;
    });

    // Back to Menu button click event
    DOCElements.backToMenuButton.addEventListener('click', function() {
        DOCElements.gameBoard.style.display = 'none';
        DOCElements.startMenu.style.display = 'block';
    });

    // Roll the Dice button click event
    DOCElements.rollDiceButton.addEventListener('click', rollDice);

    // Add click event listeners to all cells for Player 1 and Player 2
    DOCElements.player1Cells.forEach(cell => {
        cell.addEventListener('click', function(event) {
            if (currentPlayer === 1) {
                handleCellClick(event, DOCElements.player1Cells, player1ColumnScores, DOCElements.player1Numbers, DOCElements.player1Total);
            }
        });
    });

    DOCElements.player2Cells.forEach(cell => {
        cell.addEventListener('click', function(event) {
            if (currentPlayer === 2) {
                handleCellClick(event, DOCElements.player2Cells, player2ColumnScores, DOCElements.player2Numbers, DOCElements.player2Total);
            }
        });
    });
});

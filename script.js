class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.vsAI = false;

        this.cells = document.querySelectorAll('.cell');
        this.status = document.getElementById('status');
        this.resetButton = document.getElementById('reset');
        this.vsAIButton = document.getElementById('vs-ai');
        this.vsPlayerButton = document.getElementById('vs-player');
        this.muteButton = document.getElementById('mute-button');
        this.winningLine = document.getElementById('winning-line');

        this.backgroundMusic = document.getElementById('background-music');
        this.moveSound = document.getElementById('move-sound');
        this.winSound = document.getElementById('win-sound');

        this.cells.forEach(cell => cell.addEventListener('click', () => this.makeMove(cell)));
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.vsAIButton.addEventListener('click', () => this.setGameMode(true));
        this.vsPlayerButton.addEventListener('click', () => this.setGameMode(false));
        this.muteButton.addEventListener('click', () => this.toggleMute());

        this.updateStatus();
        this.playBackgroundMusic();
    }

    setGameMode(ai) {
        this.vsAI = ai;
        this.resetGame();
        this.vsAIButton.classList.toggle('active', ai);
        this.vsPlayerButton.classList.toggle('active', !ai);
    }

    makeMove(cell) {
        if (this.gameOver || cell.classList.contains('x') || cell.classList.contains('o')) return;

        const index = cell.dataset.index;
        this.board[index] = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        this.playMoveSound();

        const winResult = this.checkWinner();
        if (winResult) {
            this.gameOver = true;
            this.updateStatus(`Player ${this.currentPlayer} wins!`);
            this.highlightWinningCells(winResult);
            this.playWinSound();
        } else if (this.board.every(cell => cell !== null)) {
            this.gameOver = true;
            this.updateStatus("It's a draw!");
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateStatus();

            if (this.vsAI && this.currentPlayer === 'O') {
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    makeAIMove() {
        const bestMove = this.findBestMove();
        if (bestMove !== -1) {
            this.makeMove(this.cells[bestMove]);
        }
    }

    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === null) {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = null;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const scores = {
            X: -1,
            O: 1,
            draw: 0
        };

        let result = this.checkWinner();
        if (result) return scores[result.winner];

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        for (let i = 0; i < winPatterns.length; i++) {
            const [a, b, c] = winPatterns[i];
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return { winner: this.board[a], pattern: i };
            }
        }

        if (this.board.every(cell => cell !== null)) {
            return { winner: 'draw', pattern: null };
        }

        return null;
    }

    highlightWinningCells(winResult) {
        const { pattern } = winResult;
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6]             // Diagonals
        ];

        const [a, b, c] = winPatterns[pattern];
        this.cells[a].classList.add('winner');
        this.cells[b].classList.add('winner');
        this.cells[c].classList.add('winner');

        this.drawWinningLine(pattern);
    }

    drawWinningLine(patternIndex) {
        const lineClasses = [
            'horizontal', 'horizontal', 'horizontal',
            'vertical', 'vertical', 'vertical',
            'diagonal-1', 'diagonal-2'
        ];
        const linePositions = [
            '16.67%', '50%', '83.33%',
            '16.67%', '50%', '83.33%',
            '0', '0'
        ];

        this.winningLine.className = lineClasses[patternIndex];
        if (patternIndex < 3) {
            this.winningLine.style.top = linePositions[patternIndex];
        } else if (patternIndex < 6) {
            this.winningLine.style.left = linePositions[patternIndex];
        }
        setTimeout(() => this.winningLine.classList.add('active'), 50);
    }

    updateStatus(message) {
        this.status.textContent = message || `Player ${this.currentPlayer}'s turn`;
        this.status.classList.add('neon-flicker');
        setTimeout(() => this.status.classList.remove('neon-flicker'), 1000);
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.cells.forEach(cell => {
            cell.classList.remove('x', 'o', 'winner');
        });
        this.winningLine.className = '';
        this.winningLine.style.top = '';
        this.winningLine.style.left = '';
        this.updateStatus();
    }

    playBackgroundMusic() {
        this.backgroundMusic.volume = 0.5;
        this.backgroundMusic.play();
    }

    playMoveSound() {
        this.moveSound.currentTime = 0;
        this.moveSound.play();
    }

    playWinSound() {
        this.winSound.play();
    }

    toggleMute() {
        const isMuted = this.backgroundMusic.muted;
        this.backgroundMusic.muted = !isMuted;
        this.moveSound.muted = !isMuted;
        this.winSound.muted = !isMuted;
        this.muteButton.textContent = isMuted ? 'Mute' : 'Unmute';
    }
}

const game = new TicTacToe();
const gamegrid = (() => {
    const grid = ["","","","","","","","",""];

    const getGrid = () => grid;

    const getAvailableMoves = () => {
        const moves = [];
        grid.forEach((block, index) => {
            if (!Boolean(block)) moves.push(index);
        });
        return moves;
    };

    const getBlock = index => grid[index];

    const markSquare = (index, mark) => {
        grid[index] = mark;
    };

    const isSquareMarked = index => Boolean(getBlock(index));

    const reset = () => {
        for(let i = 0; i < grid.length; i++) {
            grid[i] = "";
        }
    }

    return {getGrid, getAvailableMoves, getBlock, markSquare, isSquareMarked, reset};
})();

const view = (() => {
    const _message = document.getElementById('message');
    const _boardSquares = Array.from(document.querySelectorAll('#game-grid .block'));
    const _resetBtn = document.getElementById('reset');
    
    const _init = (() => {
        for (let i = 0; i < _boardSquares.length; i++) {
            _boardSquares[i].addEventListener('click', () => {
                gameController.markSquare(i);
            });
        }
        _resetBtn.addEventListener('click', () => {
            gameController.reset()
        });
    })();

    const updateBoard = gamegrid => {
        for (let i = 0; i < _boardSquares.length; i++) {
            _boardSquares[i].textContent = gamegrid.getBlock(i);
        }
    }

    const setMessage = msg => {
        _message.textContent = msg;
    }

    return {updateBoard, setMessage};
})();

const Player = (mark, isHuman) => {
    const _mark = mark;
    const _isHuman = isHuman;
    const getMark = () => _mark;
    const getIsHuman = () => _isHuman;
    return {getMark, getIsHuman};
}

const gameController = ((gamegrid, view) => {
    const _playerX = Player('X', true);
    const _playerO = Player('O', false);
    let _round;
    let _currentPlayer;
    let _gameOver;

    const _switchCurrentPlayer = () => {
        _currentPlayer = (_currentPlayer === _playerX) ? _playerO : _playerX;
        view.setMessage(`Player ${_currentPlayer.getMark()}'s turn`);
        
        if (!_currentPlayer.getIsHuman()) {
            _playAIRound();
        }
    }

    const markSquare = index => {
        if (!_gameOver && !gamegrid.isSquareMarked(index)) {
            gamegrid.markSquare(index, _currentPlayer.getMark());
            view.updateBoard(gamegrid);
            const winner = _checkForWin();
            if (winner) {
                _gameOver = true;
                view.setMessage(`Player ${winner} wins!`);
            } else if (_round === 9) {
                _gameOver = true;
                view.setMessage('Draw');
            } else {
                _round++;
                _switchCurrentPlayer();
            }
        }
    };

    const _playAIRound = () => {
        let bestScore = -Infinity;
        let bestMove;
        const availableMoves = gamegrid.getAvailableMoves();

        availableMoves.forEach(move => {
            gamegrid.markSquare(move, "O");
            let score = _minimax(gamegrid, 0, false);
            gamegrid.markSquare(move, "");

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        markSquare(bestMove);
    };

    const _minimax = (gamegrid, depth, isMaximizing) => {
        const scores = {X: -10, O: 10};
        let winner = _checkForWin();
        if (winner) return scores[winner];
        else if (gamegrid.getAvailableMoves().length === 0) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            const availableMoves = gamegrid.getAvailableMoves();

            availableMoves.forEach(move => {
                gamegrid.markSquare(move, "O");
                let score = _minimax(gamegrid, depth + 1, false);
                gamegrid.markSquare(move, "");

                bestScore = Math.max(score, bestScore);
            });

            return bestScore;
        } else {
            let bestScore = Infinity;
            const availableMoves = gamegrid.getAvailableMoves();

            availableMoves.forEach(move => {
                gamegrid.markSquare(move, "X");
                let score = _minimax(gamegrid, depth + 1, true);
                gamegrid.markSquare(move, "");

                bestScore = Math.min(score, bestScore);
            });

            return bestScore;
        }
    };

    const _checkForWin = () => {
        const winningBoards = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ];

        if (winningBoards.some(board => board.every(index => gamegrid.getBlock(index) === _playerX.getMark()))) return _playerX.getMark();
        else if (winningBoards.some(board => board.every(index => gamegrid.getBlock(index) === _playerO.getMark()))) return _playerO.getMark();
        return;
    };

    const reset = () => {
        _round = 1;
        _currentPlayer = _playerX;
        _gameOver = false;

        gamegrid.reset();
        view.updateBoard(gamegrid);
        view.setMessage(`Player ${_currentPlayer.getMark()}'s turn`);
    }

    return {markSquare, reset};
})(gamegrid, view);

gameController.reset();
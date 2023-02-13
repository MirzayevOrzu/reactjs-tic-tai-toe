import { useState } from "react";

function Square({ value, onSquareClick, isWinnerSquare }) {
    return (
        <button
            className={isWinnerSquare ? "square winner-square" : "square"}
            onClick={onSquareClick}
        >
            {value}
        </button>
    );
}

function Board({ xIsNext, squares, onPlay }) {
    const [winner, winnerSquares] = calculateWinner(squares);
    let status;
    if (winner) {
        status = "Winner: " + winner;
    } else if (!squares.includes(null)) {
        status = "Draw";
    } else {
        status = "Next player: " + (xIsNext ? "X" : "O");
    }

    function handleClick(i) {
        const [hasWinner] = calculateWinner(squares);
        if (squares[i] || hasWinner) {
            return;
        }
        const nextSquares = squares.slice();
        if (xIsNext) {
            nextSquares[i] = "X";
        } else {
            nextSquares[i] = "O";
        }
        onPlay(nextSquares);
    }

    return (
        <>
            <div className="status">{status}</div>
            {Array(3)
                .fill("")
                .map((_, i) => (
                    <div className="board-row" key={i}>
                        {Array(3)
                            .fill("")
                            .map((_, j) => {
                                const loc = i * 3 + j;
                                return (
                                    <Square
                                        key={j}
                                        value={squares[loc]}
                                        onSquareClick={() => handleClick(loc)}
                                        isWinnerSquare={winnerSquares?.hasOwnProperty(
                                            loc
                                        )}
                                    />
                                );
                            })}
                    </div>
                ))}
        </>
    );
}

export default function Game() {
    const [history, setHistory] = useState([Array(9).fill(null)]);
    const [currentMove, setCurrentMove] = useState(0);
    const [sort, setSort] = useState(false);
    const currentSquares = history[currentMove];
    const xIsNext = currentMove % 2 === 0;

    function handlePlay(nextSquares) {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    function jumpTo(nextMove) {
        setCurrentMove(nextMove);
    }

    const moves = history.map((squares, move) => {
        const [col, row] = identifyMoveCoordinates(history[move - 1], squares);
        let description;
        if (move > 0) {
            description = "Go to move #" + move;
        } else if (move === currentMove) {
            description = "You are at move #" + move;
        } else {
            description = "Go to game start";
        }

        if (col) {
            description += ` (${col}, ${row})`;
        }

        return (
            <li key={move}>
                {move === currentMove ? (
                    description
                ) : (
                    <button onClick={() => jumpTo(move)}>{description}</button>
                )}
            </li>
        );
    });

    if (sort) {
        moves.reverse();
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board
                    xIsNext={xIsNext}
                    squares={currentSquares}
                    onPlay={handlePlay}
                />
            </div>
            <div className="game-info">
                <button onClick={() => setSort(!sort)}>
                    {sort ? "Sort desc" : "Sort asc"}
                </button>
                <ol>{moves}</ol>
            </div>
        </div>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (
            squares[a] &&
            squares[a] === squares[b] &&
            squares[a] === squares[c]
        ) {
            return [squares[a], { [a]: true, [b]: true, [c]: true }];
        }
    }
    return [null];
}

function identifyMoveCoordinates(prevSquares, currSquares) {
    let col;
    let row;

    if (!prevSquares) {
        return [col, row];
    }

    for (let i = 0; i < prevSquares.length; i++) {
        if (prevSquares[i] !== currSquares[i]) {
            col = Math.floor(i / 3);
            row = i % 3;
        }
    }

    return [col.toString(), row.toString()];
}

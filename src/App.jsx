import React, { useState, useEffect } from "react";
import "./App.css"; // We'll move your CSS there

export default function App() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameActive, setGameActive] = useState(true);
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [gameMode, setGameMode] = useState("pvp");
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("tttHistory")) || []
  );
  const [result, setResult] = useState("Player X's turn");
  const [resultColor, setResultColor] = useState("#ffffff");

  useEffect(() => {
    localStorage.setItem("tttHistory", JSON.stringify(history));
  }, [history]);

  const resetBoard = () => {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setGameActive(true);
    setResult("Player X's turn");
    setResultColor("#ffffff");
  };

  const resetGame = () => {
    resetBoard();
    setXScore(0);
    setOScore(0);
  };

  const addToHistory = (res) => {
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata"
    });
    const updatedHistory = [...history, { result: res, timestamp }];
    if (updatedHistory.length > 5) updatedHistory.shift();
    setHistory(updatedHistory);
  };

  const checkWin = (brd) => {
    return winningCombinations.some(([a, b, c]) => {
      return brd[a] && brd[a] === brd[b] && brd[b] === brd[c];
    });
  };

  const getRandomMove = (brd) => {
    const emptyCells = brd.map((cell, i) => cell === "" ? i : null).filter(i => i !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  };

  const getBestMove = (brd) => {
    for (let [a, b, c] of winningCombinations) {
      if (brd[a] === "O" && brd[b] === "O" && brd[c] === "") return c;
      if (brd[a] === "O" && brd[c] === "O" && brd[b] === "") return b;
      if (brd[b] === "O" && brd[c] === "O" && brd[a] === "") return a;
      if (brd[a] === "X" && brd[b] === "X" && brd[c] === "") return c;
      if (brd[a] === "X" && brd[c] === "X" && brd[b] === "") return b;
      if (brd[b] === "X" && brd[c] === "X" && brd[a] === "") return a;
    }
    if (brd[4] === "") return 4;
    return getRandomMove(brd);
  };

  const handleCellClick = (index) => {
    if (board[index] !== "" || !gameActive) return;

    const updatedBoard = [...board];
    updatedBoard[index] = currentPlayer;
    setBoard(updatedBoard);

    if (checkWin(updatedBoard)) {
      setResult(`Player ${currentPlayer} wins!`);
      setResultColor("#00ff00");
      addToHistory(`Player ${currentPlayer} wins`);
      setGameActive(false);
      if (currentPlayer === "X") setXScore(xScore + 1);
      else setOScore(oScore + 1);
      return;
    }

    if (updatedBoard.every(cell => cell !== "")) {
      setResult("It's a tie!");
      setResultColor("#ffffff");
      addToHistory("Tie");
      setGameActive(false);
      return;
    }

    const nextPlayer = currentPlayer === "X" ? "O" : "X";
    setCurrentPlayer(nextPlayer);
    setResult(`Player ${nextPlayer}'s turn`);

    if (gameMode !== "pvp" && nextPlayer === "O") {
      setTimeout(() => {
        const move = gameMode === "pvc-easy"
          ? getRandomMove(updatedBoard)
          : getBestMove(updatedBoard);
        if (move !== undefined) {
          const compBoard = [...updatedBoard];
          compBoard[move] = "O";
          setBoard(compBoard);

          if (checkWin(compBoard)) {
            setResult("Computer wins!");
            setResultColor("#ff3333");
            addToHistory("Computer wins");
            setGameActive(false);
            setOScore(oScore + 1);
            return;
          }

          if (compBoard.every(cell => cell !== "")) {
            setResult("It's a tie!");
            setResultColor("#ffffff");
            addToHistory("Tie");
            setGameActive(false);
            return;
          }

          setCurrentPlayer("X");
          setResult("Player X's turn");
        }
      }, 500);
    }
  };

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      <div className="container">
        <div className="game-mode">
          <select value={gameMode} onChange={(e) => { setGameMode(e.target.value); resetBoard(); }}>
            <option value="pvp">Player vs Player</option>
            <option value="pvc-easy">Player vs Computer (Easy)</option>
            <option value="pvc-hard">Player vs Computer (Hard)</option>
          </select>
          <button className="reset-btn" onClick={resetGame}>
            <i className="fas fa-redo icon"></i> Reset Game
          </button>
        </div>

        <div className="score">
          <span><i className="fas fa-user icon"></i>X: {xScore}</span>
          <span><i className="fas fa-user-friends icon"></i>O: {oScore}</span>
        </div>

        <div className="result" style={{ color: resultColor }}>{result}</div>

        <div className="board">
          {board.map((cell, index) => (
            <div
              key={index}
              className={`cell ${cell.toLowerCase()}`}
              onClick={() => handleCellClick(index)}
            >
              {cell}
            </div>
          ))}
        </div>

        <div className="history">
          <h3>Game History</h3>
          {history.length === 0 ? (
            <div>No games played yet</div>
          ) : (
            history.slice().reverse().map((item, idx) => (
              <div key={idx} className="history-item">
                <i className="fas fa-gamepad icon"></i>
                {item.timestamp}: {item.result}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

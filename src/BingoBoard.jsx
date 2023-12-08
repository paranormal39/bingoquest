import React from 'react';

const BingoBoard = () => {
  // Generate a 5x5 grid of numbers
  const generateNumbers = () => {
    let numbers = [];
    let counter = 1;

    for (let i = 0; i < 5; i++) {
      let row = [];
      for (let j = 0; j < 5; j++) {
        row.push(counter++);
      }
      numbers.push(row);
    }

    return numbers;
  };

  const boardNumbers = generateNumbers();

  return (
    <div>
      <h1 style={{ textAlign: 'center',color:'orange' }}>Bingo</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
        {boardNumbers.map((row, rowIndex) => (
          row.map((number, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                textAlign: 'center',
                color:'orange'
              }}
            >
              {number}
            </div>
          ))
        ))}
      </div>
    </div>
  );
};

export default BingoBoard;

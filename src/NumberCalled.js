// NumberCaller.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';



const NumberCalled = ({ contract }) => {
  //const [numberData, setNumberData] = useState(null);
  const eventName = 'NumberCalled';

  useEffect(() => {
    const handleNumberCalled = (...eventData) => {
      //console.log(eventData[1]);
      //setNumberData(eventData[1]);
    };

    // Subscribe to the NumberCalled event
   
    // Cleanup the event listener when the component unmounts
    return () => {
      
    };
  }, []);

  return (
    <div>
      <h2>Number Called:</h2>
    </div>
  );
};

export default NumberCalled;

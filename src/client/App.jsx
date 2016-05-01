import React from 'react';
import Player from './Player';
import Tricks from './Tricks';
import Scores from './Scores';

const App = () => (
  <div>
    <Player id={0} />
    <Player id={1} />
    <Player id={2} />
    <Player id={3} />
    <Tricks />
    <Scores />
  </div>
);

export default App;

import React from 'react';
import Player from './Player';
import Tricks from './Tricks';
import Scores from './Scores';

const App = () => (
  <div className="ui two column grid">
    <div className="column">
      <Tricks />
      <Scores />
    </div>
    <div className="column">
      <Player id={0} />
      <Player id={1} />
      <Player id={2} />
      <Player id={3} />
    </div>
  </div>
);

export default App;

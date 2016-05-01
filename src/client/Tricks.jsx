import React from 'react';
import { connect } from 'react-redux';
import Card from './Card';
import Lodash from 'lodash';

const Trick = (props) => {
  // TODO: Must be a cleaner way of doing this. I have 4 cells, I want to put cards players have
  //       played into their corresponding cell (leaving players who haven't played blank).

  const cards = {
    [0]: undefined,
    [1]: undefined,
    [2]: undefined,
    [3]: undefined,
    ...Lodash.keyBy(props.cards, card => card.player),
  };

  return (
    <tr>
      <td>{props.id + 1}</td>
      <td>{cards[0] ? <Card suit={cards[0].suit} face={cards[0].face} valid={false} /> : '' }</td>
      <td>{cards[1] ? <Card suit={cards[1].suit} face={cards[1].face} valid={false} /> : '' }</td>
      <td>{cards[2] ? <Card suit={cards[2].suit} face={cards[2].face} valid={false} /> : '' }</td>
      <td>{cards[3] ? <Card suit={cards[3].suit} face={cards[3].face} valid={false} /> : '' }</td>
    </tr>
  );
};

Trick.propTypes = {
  id: React.PropTypes.number,
  cards: React.PropTypes.array,
};

const Tricks = (props) => {
  const tricks = props.tricks.map((trick, key) => <Trick key={key} id={key} cards={trick.cards} />);

  return (
    <div>
      <h1>Tricks</h1>
      <table>
        <thead>
          <tr>
            <th></th>
            <th colSpan={4}>Player</th>
          </tr>
          <tr>
            <th>Trick #</th>
            { [1, 2, 3, 4].map(id => <th>{id}</th>)}
          </tr>
        </thead>
        <tbody>
          {tricks}
        </tbody>
      </table>
    </div>
  );
};

Tricks.propTypes = {
  tricks: React.PropTypes.array,
};

const mapStateToProps = (state) => ({
  tricks: state.tricks,
});

export default connect(mapStateToProps)(Tricks);

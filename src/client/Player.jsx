import React from 'react';
import { connect } from 'react-redux';
import Card from './Card';
import { playCard } from './actions';
import { makeGetCardsForPlayer } from './selectors';

const Player = (props) => {
  const cards = props.cards.map((card, key) => <Card key={key} suit={card.suit} face={card.face} valid={card.valid} playCard={props.onPlayCard} />);

  return (
    <div>
      <h1>{`Player ${props.id} Hand`}</h1>
      {cards}
    </div>
  );
};

Player.propTypes = {
  id: React.PropTypes.number,
  cards: React.PropTypes.array,
  onPlayCard: React.PropTypes.func,
};

const makeMapStateToProps = () => {
  const getCardsForPlayer = makeGetCardsForPlayer();
  const mapStateToProps = (state, ownProps) => ({
    cards: getCardsForPlayer(state, ownProps)
  });
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const { id } = ownProps;

  return {
    onPlayCard: card => dispatch(playCard(id, card)),
  };
};

export default connect(makeMapStateToProps, mapDispatchToProps)(Player);

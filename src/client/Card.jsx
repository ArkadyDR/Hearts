import React from 'react';

const Card = (props) => {
  const { face, suit, valid, playCard } = props;
  let suitChar = undefined;

  switch (suit) {
    case 'spades':
      suitChar = '\u2660';
      break;
    case 'hearts':
      suitChar = '\u2665';
      break;
    case 'diamonds':
      suitChar = '\u2666';
      break;
    case 'clubs':
      suitChar = '\u2663';
      break;
    default:
      suitChar = '?';
      break;
  }

  let faceChar = undefined;

  switch (face) {
    case 11:
      faceChar = 'J';
      break;
    case 12:
      faceChar = 'Q';
      break;
    case 13:
      faceChar = 'K';
      break;
    case 14:
      faceChar = 'A';
      break;
    default:
      faceChar = face;
      break;
  }

  const onClick = () => {
    playCard({ suit, face });
  };

  const className = `huge ui button ${valid ? 'green' : ''}`;

  return (
    <button className={className} onClick={onClick} disabled={!valid}>
        {faceChar} {suitChar}
    </button>
  );
};

Card.propTypes = {
  face: React.PropTypes.number,
  suit: React.PropTypes.string,
  valid: React.PropTypes.bool,
  playCard: React.PropTypes.func,
};

export default Card;

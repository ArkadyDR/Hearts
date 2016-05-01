import React from 'react';
import { connect } from 'react-redux';

const Scores = (props) => {
  const scores = props.scores.map((score, key) => <td key={key} id={key}>{score}</td>);

  return (
    <div>
      <h1>Scores</h1>
      <table>
        <thead>
          <tr>
            <th colSpan={4}>Player</th>
          </tr>
          <tr>
            { [1, 2, 3, 4].map(id => <th>{id}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            {scores}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

Scores.propTypes = {
  scores: React.PropTypes.array,
};

const mapStateToProps = (state) => ({
  scores: state.scores,
});

export default connect(mapStateToProps)(Scores);

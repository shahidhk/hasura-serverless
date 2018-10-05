import React from 'react';
import {Glyphicon, Badge} from 'react-bootstrap';

const icons = {
  running: (<Glyphicon glyph="flash" />),
  waiting: (<Glyphicon glyph="flash" />),
  done:    (<Glyphicon glyph="ok" />),
  notyet:  (<Glyphicon glyph="remove" />)
};

const statuses = [
  {
    name: 'Order validation',
    value: 'notyet'
  },
  {
    name: 'Your payment',
    value: 'notyet'
  },
  {
    name: 'Restaurant approval',
    value: 'notyet'
  },
  {
    name: 'Driver assignment',
    value: 'notyet'
  }
];

const createBar = (statusBar) => {
  return (
    <div>
      {statusBar.map((s,i) => {
        return (
          <span key={i}>
            {icons[s.value]} -
            {s.value === 'running' ? (<b style={{color: 'green'}}>{s.name}</b>) : s.name}
            <br/>
          </span>
        );
      })}
    </div>
  );
};

export default ({is_validated, is_paid, is_approved, is_agent_assigned}) => {

  const statusBar = JSON.parse(JSON.stringify(statuses));
  if (!(is_validated)) {
    statusBar[0].value = 'running';
    return createBar(statusBar);
  } else if (is_validated && !is_paid) {
    statusBar[0].value = 'done';
    statusBar[1].value = 'running';
    return createBar(statusBar);
  } else if (is_paid && !is_approved) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='running';
    return createBar(statusBar);
  } else if (is_approved && !is_agent_assigned) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='done';
    statusBar[3].value ='running';
    return createBar(statusBar);
  } else if (is_agent_assigned) {
    statusBar[0].value ='done';
    statusBar[1].value ='done';
    statusBar[2].value ='done';
    statusBar[3].value ='done';
    return createBar(statusBar);
  } else {
    return (<span><Badge>!?!</Badge> 'Unknown state'</span>);
  }
};

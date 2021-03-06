import React, { PropTypes, Component } from 'react';
import styles from './CustomEventComponent.styl';


export default class CustomEventComponent extends Component {

  render() {
      const { event, title } = this.props;
      const {removeEventFromCurrentCalendar, toggleEventModal} = event.boundActions;
      return (
        <div className={styles.root}>
          <span
            className={styles.delete}
            onClick={()=>{removeEventFromCurrentCalendar(event);}}
          >×</span>
          <span
            className={styles.title}
            onClick={()=>{toggleEventModal(event);}}
          >{title}</span>
        </div>
      );
  }
}

CustomEventComponent.propTypes = {
    event: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
};

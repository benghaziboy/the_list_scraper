import React, { PropTypes, Component } from 'react';
import BandItem from './BandItem';

import styles from './ShowItem.styl';
require('font-awesome-webpack');

export default class ShowItem extends Component {

  render() {
      const { show, date, actions } = this.props;

      return (
        <div>
          <div className={styles.bands}>
            <button className={styles.plusSign} onClick={()=> {actions.addEventToCurrentCalendar({show: show, date: date});}}><i className="fa fa-calendar-plus-o"/></button>
            <span className={styles.headerItem}><b>{show.venue}</b></span>
            <span className={styles.headerItem}>{show.time}</span>
            <span className={styles.headerItem}>{show.price}</span>
            <i className="fa fa-bullseye"></i>
          </div>
          <div className={styles.bands}>
            {show.bands.map((band, i)=>
              <BandItem band={band} key={i}/>
            )}
          </div>
        </div>
      );
  }
}

ShowItem.propTypes = {
    show: PropTypes.object.isRequired,
};

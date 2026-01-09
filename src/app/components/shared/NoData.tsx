import React from 'react';
import NoDataIcon from '../../assets/images/common/svgs/icon-no-data.svg';

type propsTypes = {
  title: string;
};

const NoData = ({ title }: propsTypes) => {
  return (
    <>
      <div className="no-data-wrapper">
        <div className="no-data-inner">
          <div className="no-data-icon"><NoDataIcon /></div>
          <p className="no-data-text">{title}</p>
        </div>
      </div>
    </>
  );
};

export default NoData;
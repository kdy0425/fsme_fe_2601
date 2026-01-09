import React from 'react';

type Props = {
  className?: string;
  textEx: JSX.Element | JSX.Element[];
};

const ContentsExplanation = ({ textEx, className }: Props) => {

  return (
    <>
      <div className="contents-explanation">
        <div className="contents-explanation-inner">
          <div className="contents-explanation-text">
            {textEx}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentsExplanation;

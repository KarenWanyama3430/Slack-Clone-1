import React from "react";
import { Progress } from "semantic-ui-react";

const ProgressBar = ({ uploadState, percentageUploaded }) => {
  return (
    uploadState && (
      <Progress
        className="progress__bar"
        percent={percentageUploaded}
        indicating
        inverted
        size="medium"
      />
    )
  );
};

export default ProgressBar;

import React from 'react';
import PropTypes from 'prop-types';
import { Sparkline, LineSeries, PointSeries, HorizontalReferenceLine, VerticalReferenceLine, WithTooltip } from '@data-ui/sparkline';
import { d3format } from '../modules/utils';
import { getTextDimension } from '../modules/visUtils';

const propTypes = {
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.array.isRequired,
  ariaLabel: PropTypes.string,
  numberFormat: PropTypes.string,
  yAxisBounds: PropTypes.array,
  showYAxis: PropTypes.bool,
  renderTooltip: PropTypes.func,
};
const defaultProps = {
  className: '',
  width: 300,
  height: 50,
  ariaLabel: '',
  numberFormat: undefined,
  yAxisBounds: [null, null],
  showYAxis: false,
  renderTooltip() { return <div />; },
};

const MARGIN = {
  top: 8,
  right: 8,
  bottom: 8,
  left: 8,
};
const tooltipProps = {
  style: {
    opacity: 0.8,
  },
  offsetTop: 0,
};

function getSparklineTextWidth(text) {
  return getTextDimension({
    text,
    style: {
      fontSize: '12px',
      fontWeight: 200,
      letterSpacing: 0.4,
    },
  }).width + 5;
}

function isValidBoundValue(value) {
  return value !== null && value !== undefined && value !== '' && !Number.isNaN(value);
}

class SparklineCell extends React.Component {
  renderHorizontalReferenceLine(value, label) {
    return (
      <HorizontalReferenceLine
        reference={value}
        labelPosition="right"
        renderLabel={() => label}
        stroke="#f9fbfb"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
    );
  }

  render() {
    const {
      width,
      height,
      data,
      ariaLabel,
      numberFormat,
      yAxisBounds,
      showYAxis,
      renderTooltip,
    } = this.props;

    const yScale = {};
    let hasMinBound = false;
    let hasMaxBound = false;

    if (yAxisBounds) {
      const [minBound, maxBound] = yAxisBounds;
      hasMinBound = isValidBoundValue(minBound);
      if (hasMinBound) {
        yScale.min = minBound;
      }
      hasMaxBound = isValidBoundValue(maxBound);
      if (hasMaxBound) {
        yScale.max = maxBound;
      }
    }

    let min;
    let max;
    let minLabel;
    let maxLabel;
    let labelLength = 0;
    if (showYAxis) {
      const [minBound, maxBound] = yAxisBounds;
      min = hasMinBound
        ? minBound
        : data.reduce((acc, current) => Math.min(acc, current), data[0]);
      max = hasMaxBound
        ? maxBound
        : data.reduce((acc, current) => Math.max(acc, current), data[0]);

      minLabel = d3format(numberFormat, min);
      maxLabel = d3format(numberFormat, max);
      labelLength = Math.max(
        getSparklineTextWidth(minLabel),
        getSparklineTextWidth(maxLabel),
      );
    }

    const margin = {
      ...MARGIN,
      right: MARGIN.right + labelLength,
    };

    return (
      <WithTooltip
        tooltipProps={tooltipProps}
        hoverStyles={null}
        renderTooltip={renderTooltip}
      >
        {({ onMouseLeave, onMouseMove, tooltipData }) => (
          <Sparkline
            ariaLabel={ariaLabel}
            width={width}
            height={height}
            margin={margin}
            data={data}
            onMouseLeave={onMouseLeave}
            onMouseMove={onMouseMove}
            {...yScale}
          >
            {showYAxis &&
              this.renderHorizontalReferenceLine(min, minLabel)}
            {showYAxis &&
              this.renderHorizontalReferenceLine(max, maxLabel)}
            <LineSeries
              showArea={false}
              stroke="#767676"
            />
            {tooltipData &&
              <VerticalReferenceLine
                reference={tooltipData.index}
                strokeDasharray="3 3"
                strokeWidth={1}
              />}
            {tooltipData &&
              <PointSeries
                points={[tooltipData.index]}
                fill="#767676"
                strokeWidth={1}
              />}
          </Sparkline>
        )}
      </WithTooltip>
    );
  }
}

SparklineCell.propTypes = propTypes;
SparklineCell.defaultProps = defaultProps;

export default SparklineCell;

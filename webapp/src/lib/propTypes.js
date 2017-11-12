import PropTypes from "prop-types";

export function stateData(data) {
  return PropTypes.shape({
    data,
    loading: PropTypes.bool,
    error: PropTypes.string
  });
}

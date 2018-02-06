
    const parseProps = (props) => {
      try {
        return props.slice ? JSON.parse(props) : props
      } catch (e) {}  //eslint-disable-line no-empty
      return props
    }
    module.exports = parseProps;
  
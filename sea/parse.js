
    module.exports = (props) => {
      try {
        if(props.slice && 'SEA{' === props.slice(0,4)){
          props = props.slice(3);
        }
        return props.slice ? JSON.parse(props) : props
      } catch (e) {}  //eslint-disable-line no-empty
      return props
    }
  
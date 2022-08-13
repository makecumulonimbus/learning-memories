// import React from "react";
// import { connect } from "react-redux";

// class Dashboard extends React.Component {
//   increment = () => {
//     this.props.dispatch({
//       type: "INCREMENT"
//     });
//   };

//   decrement = () => {
//     this.props.dispatch({
//       type: "DECREMENT"
//     });
//   };

//   render() {
//     return (
//       <div className="App mt-5">
//         <button onClick={this.increment} className="btn btn-success mr-5">
//           Increment
//         </button>
//         <button onClick={this.decrement} className="btn btn-danger">
//           Decrement
//         </button>
//         <h2 className="mt-5 display-1">{this.props.count}</h2>
//       </div>
//     );
//   }
// }

// const mapStateToProps = state => {
//   return {
//     count: state.count
//   };
// };

// export default connect(mapStateToProps)(Dashboard);

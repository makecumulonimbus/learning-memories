import React from 'react';
import ReactLoading from 'react-loading';
import '../App.scss'

const LoadingApp = ({ type, color }) => (
    <ReactLoading type={type} color={color} className="loading-app" />
);
 
export default LoadingApp;
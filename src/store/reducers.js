let initialState = { 
  count: 0,
  appList: [],
  topicList : [],
  topicSelected : {},
  topicPageDetail : {} 
};

function reducer(state = initialState, action) {
  if(action.type === 'SET_APP_LIST'){
    return {
      ...state,
      appList : action.payload
    }
  }
  if(action.type === 'SET_TOPIC_LIST'){
    return {
      ...state,
      topicList : action.payload
    }
  }
  if(action.type === 'SET_TOPIC_SELECTED'){
    return {
      ...state,
      topicSelected : action.payload
    }
  }
  if(action.type === 'SET_TOPIC_PAGE_DETAIL'){
    return {
      ...state,
      topicPageDetail : action.payload
    }
  }

  return state;
}

export default reducer;

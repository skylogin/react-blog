import Reflux from 'reflux';

export default Reflux.createActions({
  'getPost':{
    asyncResult: true
  },
  'modifyPost':{
    asyncResult: true
  },
  'deletePost':{
    asyncResult: true
  },
  'login':{
    asyncResult: true
  },
  'logOut':{},
  'createUser':{
    asyncResult: true
  },
  'search':{},
  'getSessionContext':{}
});
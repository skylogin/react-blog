import React from 'react';
import Reflux from 'reflux';
import Classnames from 'classnames';
import UserStore from 'appRoot/stores/users';

export default React.createClass({
  mixins: [
    Reflux.connectFilter(UserStore, 'user', function(users){
      return Array.find(users, function(user){
        return user.id === parseInt(this.props.userId, 10);
      }.bind(this));
    })
  ],
  render: function(){
    var user = this.state.user;

    return user? (
      <div className={ Classnames({'user': true, 'small': this.props.small}) }>
        <img className={ Classnames({'profile-img': true, 'small': this.props.small}) } src={user.profileImageData} />
        <div className="user-meta">
          <strong>{user.blogname}</strong>
          <small>{user.firstname}&nbsp;{user.lastname}</small>
        </div>
      </div>
    ): <div className="user" />;
  }
});



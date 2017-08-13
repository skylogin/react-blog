import React      from 'react';
import Reflux     from 'reflux';
import { Link, History }   from 'react-router';
import ClassNames from 'classnames';
import Moment     from 'moment';
import Actions    from 'appRoot/actions';
import PostStore  from 'appRoot/stores/posts';
import UserStore  from 'appRoot/stores/users';
import Session    from 'appRoot/stores/sessionContext';
import Loader     from 'appRoot/components/loader';

let dateFormat    = 'MM/DD/YYYY HH:mm:ss';

export default React.createClass({
  mixins: [
    Reflux.connect(Session, 'session'),
    Reflux.connect(UserStore, 'users'),
    Reflux.connect(PostStore, 'posts'),
    History
  ],
  getInitialState: function () {
    return {
      post: this.props.post
    };
  },
  componentWillMount: function () {
    if(this.state.post) {

    } else{
      this.getPost();
    }
  },
  getUserFromPost: function (post) {
    return Array.find(this.state.users, function (user) {
      return user.id === post.user;
    });
  },
  getPost: function () {
    if(this.isMounted()) {
      this.setState({loading: true});
    } else{
      this.state.loading = true;
    }

    Actions.getPost(this.props.params.postId)
    .then(function (data) {
      this.setState({
        loading: false,
        post: data
      });
    }.bind(this));
  },
  deletePost: function(){
    let result = window.confirm("Are you sure that deleting this post?");

    //ok한경우 포스트를 지워버린다.
    if(result){
      Actions.deletePost(this.state.session.id, this.state.post.user, this.state.post.id)
        .then(function (data) {
          this.history.pushState('', `/posts`);
        }.bind(this));
    }
  },
  render: function () {
    if (this.state.loading) { return <Loader />; }
    var post = this.state.post;
    var user = this.getUserFromPost(post);
    var name = (user.firstname && user.lastname)?
      (user.firstname + ' ' + user.lastname):
      user.firstname?
        user.firstname:
        user.username;

    return this.props.mode === 'summary' ? (
      // SUMMARY / LIST VIEW
      <li className="post-view-summary">
        <aside>
          <img className="profile-img small" src={user.profileImageData} />
          <div className="post-metadata">
            <strong>{post.title}</strong>
            <span className="user-name">{name}</span>
            <em>{Moment(post.date, 'x').format(dateFormat)}</em>
          </div>
        </aside>
        <summary>{post.summary}</summary>
        <br/>
        <Link to={`/posts/${post.id}`}>read more</Link>
      </li>
    ): (
      // FULL POST VIEW
      <div className="post-view-full">

        <div className="post-view-container">
          <h2>
            <img className="profile-img" src={user.profileImageData} />
            <div className="post-metadata">
              <strong>{post.title}</strong>
              <span className="user-name">{name}</span>
              <em>{Moment(post.date, 'x').format(dateFormat)}</em>
            </div>
          </h2>
          <section className="post-body" dangerouslySetInnerHTML={{__html: post.body}}>
          </section>
          {
            user.id === this.state.session.id ? (
              <div className="post-button">
                <div>
                  <Link to={`/posts/${post.id}/edit`}>
                    <button>edit post</button>
                  </Link>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <button onClick={this.deletePost}>delete post</button>
                </div>
              </div>
            ) : ''
          }
        </div>
      </div>

    );
  }
});


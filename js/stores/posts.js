import Reflux  from 'reflux';
import Actions from 'appRoot/actions';
import Request from 'superagent';
import Config  from 'appRoot/appConfig';

export default Reflux.createStore({
  listenables: Actions,
  endpoint: Config.apiRoot + '/posts',
  posts: [],
  getPostsByPage: function(page=1, params){
    var start = Config.pageSize * (page-1),
        end = start + Config.pageSize,
        query = {
          '_sort': 'date',
          '_order': 'DESC',
          '_start': Config.pageSize * (page-1),
          '_end': Config.pageSize * (page-1) + Config.pageSize
        },
        self = this;

        if(typeof params === 'object'){
          Object.assign(query, params);
        }

        if(this.currentRequest){
          this.currentRequest.abort();
          this.currentRequest = null;
        }

        return new Promise(function(resolve, reject){
          self.currentRequest = Request.get(self.endpoint);
          self.currentRequest
                .query(query)
                .end(function(err, res){
                  var results = res.body;
                  function complete(){
                    resolve({
                      start: query._start,
                      end: query._end,
                      results: results
                    });
                  }

                  if(res.ok){
                    if(params.q){
                      results = results.filter(function(post){
                        return params.user? post.user == params.user: true;
                      })
                    }
                    Config.loadTimeSimMs? setTimeout(complete, Config.loadTimeSimMs): complete();
                  } else{
                    reject(Error(err));
                  }
                  this.currentRequest = null;
                }.bind(self));
        });
  },
  onGetPost: function (id) {
    function req () {
      Request
        .get(this.endpoint)
        .query({
          id: id
        })
        .end(function (err, res) {
          if (res.ok) {
            if (res.body.length > 0) {
              Actions.getPost.completed(res.body[0]);
            } else {
              Actions.getPost.failed('Post (' + id + ') not found');
            }
          } else {
            Actions.getPost.failed(err);
          }
        });
    }
    Config.loadTimeSimMs ? setTimeout(req.bind(this), Config.loadTimeSimMs) : req();
  },
  onModifyPost: function (post, id) {
    function req () {
      Request
        [id ? 'put' : 'post'](id ? this.endpoint+'/'+id : this.endpoint)
        .send(post)
        .end(function (err, res) {
          if (res.ok) {
            Actions.modifyPost.completed(res);
            // if there's already a post in our local store we need to modify it
            // if not, add this one
            var existingPostIdx = Array.findIndex(this.posts, function (post) {
              return res.body.id == post.id;
            });

            //console.log("POST IDX", existingPostIdx);
            if (existingPostIdx > -1) {
              this.posts[existingPostIdx] = res.body;
            } else {
              this.posts.push(res.body);
            }
          } else {
            Actions.modifyPost.completed();
          }
        }.bind(this));
    }
    Config.loadTimeSimMs ? setTimeout(req.bind(this), Config.loadTimeSimMs) : req();
  }
});

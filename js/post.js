(function(){
	var POSTS = [
		{
			id: 1,
			name: 'One Cognizant',
			message: 'Please submit your ESA Timesheet for the current week!',			
			like: '23',
			time: '11.30 AM',
			category: 'office'
		},
		{
			id: 2,
			name: 'Sakthivel S',
			message: 'Guys.. Diwali train ticket booking opens on coming Monday.',
			like: '5',
			time: '1.30 PM',
			category: 'friends'
		},
		{
			id: 3,
			name: 'Vijay',
			message: 'Started a New Company in my hometown.',
			like: '88',
			time: '3 PM',
			category: 'family'
		},
		{
			id: 4,
			name: 'Rajeshkumar',
			message: 'IT returns are submitted, pls collect your receipet from me of IT Tax ack. info',
			like: '45',
			time: '6.30 AM',
			category: 'friends'
		},
		{
			id: 5,
			name: 'Vinoth',
			message: 'My wedding is on Sep 22. Guys i invite all to attend our marriage.',
			like: '99',
			time: '11.30 AM',
			category: 'following'
		} 
	];

	var CATEGORIES = [
		{
			id: 1,
			name: 'Friends',
			data: 'friends'
		},
		{
			id: 2,
			name: 'Family',
			data: 'family'
		},
		{
			id: 3,
			name: 'Office',
			data: 'office'
		},
		{
			id: 4,
			name: 'Following',
			data: 'following'
		},
		{
			id: 5,
			name: 'Others',
			data: 'others'
		}
	];

	Post = can.Model({
		findAll: 'GET /posts',
		create  : "POST /posts",
		update  : "PUT /posts/{id}",
		destroy : "DELETE /posts/{id}"
	},{});

	Post.List = can.Model.List({
		filter: function(category){
			this.attr('length');
			var posts = new Post.List([]);
			this.each(function(post, i){
				if(category === 'all' || category === post.attr('category')) {
					posts.push(post)
				}
			})
			return posts;
		},
		count: function(category) {
			return this.filter(category).length;
		}
	});

	Category = can.Model({
		findAll: 'GET /categories'
	},{});

	can.fixture('GET /posts', function(){
		return [POSTS];
	});

	// create
	var id= 6;
	can.fixture("POST /posts", function(){
		// just need to send back a new id
		return {id: (id++)}
	});

	// update
	can.fixture("PUT /posts/{id}", function(){
		// just send back success
		return {};
	});

	// destroy
	can.fixture("DELETE /posts/{id}", function(){
		// just send back success
		return {};
	});

	can.fixture('GET /categories', function(){
		return [CATEGORIES];
	});

	can.route( 'filter/:category' );
	can.route( '', { category: 'all' } );

	Posts = can.Control({
		init: function(){
			this.element.html(can.view('views/postList.ejs', {
				posts: this.options.posts,
				categories: this.options.categories, 
			}));				 
		},
		'.delete click': function(el, ev){
			el.closest('.pages').data('post').destroy();
		},
		'{Post} created' : function(list, ev, post){
			this.options.posts.push(post);
		},
        '.like click': function(el, ev) {
        	var likePost = el.closest('.pages').data('post');
        	var newCount = parseInt(likePost.attr('like')) + 1;      	 
            likePost.attr('like', newCount).save();
        }
	});

	Create = can.Control({
		show: function(){
			this.post = new Post();
			this.element.html(can.view('views/createView.ejs', {
				post: this.post,
				categories: this.options.categories
			}));
			this.element.slideDown(200);
		},
		hide: function(){
			this.element.slideUp(200);
		},
		'{document} #new-post click': function(){
			this.show();
		},
		createPost: function() {
			var form = this.element.find('form');
				values = can.deparam(form.serialize());
				
			if(values.name !== "") {
				this.post.attr(values).save();
				this.hide();
			}
		},
		'.post input keyup': function(el, ev) {
			if(ev.keyCode == 13){
				this.createPost(el);
			}
		},
		'.save click' : function(el){
			this.createPost(el)
		},
		'.cancel click' : function(){
			this.hide();
		}
	});

	Filter = can.Control({
		init: function(){
			var category = can.route.attr('category') || "all";
			this.element.html(can.view('views/filterView.ejs', {
				posts: this.options.posts,
				categories: this.options.categories
			}));
			this.element.find('[data-category="' + category + '"]').parent().addClass('active');
		},
		'[data-category] click': function(el, ev) {
			this.element.find('[data-category]').parent().removeClass('active');
			el.parent().addClass('active');
			can.route.attr('category', el.data('category'));
		}
	});

	$(document).ready(function(){
		$.when(Category.findAll(), Post.findAll()).then(function(categoryResponse, postResponse){
			var categories = categoryResponse[0], 
				posts = postResponse[0];

			new Create('#post', {
				categories: categories
			});
			new Filter('#filter', {
				posts: posts,
				categories: categories
			});
			new Posts('#view-post', {
				posts: posts,
				categories: categories
			});
		});		 
	});
})();
'use strict';
var blogs = require('../config/blogs');
var Blog = function() {

};

Blog.prototype.getAllBlog = function() {
  return blogs ? blogs : [];
};

Blog.prototype.getLastBlog = function() {
  return (blogs && blogs.length && blogs.length > 1) ? blogs[blogs.length - 1] : '';
};

Blog.prototype.getBlogByIndex = function(index) {
  return (blogs && blogs.length && blogs.length > 1) ? blogs[index] : '';
};

module.exports = new Blog();

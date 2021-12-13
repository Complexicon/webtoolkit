function Route(path, enabled) {
	this.routePath = path;
	this.disabled = !enabled;
	this.router = null;
	this.socketio = null;
}

Route.prototype.setupRoutes = function(handler = async function(app = require('express').Router()){}) {
	this.router = handler;
	return this;
}

Route.prototype.setupSocketIO = function(handler = async function(socket = require('socket.io').Socket()){}) {
	this.socketio = handler;
	return this;
}

module.exports = Route;
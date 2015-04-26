var React = require('react');
var _ = require('lodash');

var myself = {}, room = {};
var lastMessage = 0;
var messageLock = false;
var messageInterval = 3000;

var sendMessage = function(msg){
	$.get("/api/content/add?rid="+room.id+"&user_name="+myself.name+"&text="+msg, function(){
		messageLock = false;
	});
};

var sendFeedBack = function(aid, type){
	$.get("/api/attributes/feedback?rid="+room.id+"&username="+myself.name+"&attribute_id="+aid+"&feedback="+(type==1), function(){
	});
};

var readMessage = function(lastTime, cb){
	$.get("/api/content/?rid="+room.id+"&timestamp="+lastTime, function(response){
		cb(response);
	});
};

var Root = React.createClass({
	getInitialState: function(){
		myself = this.props.model.currentUser;
		room = this.props.model.room;
		return this.props.model;
	},
	render: function(){
		return(
			<div className="hsapp-content">
				<div className="content-lhs">
					<AttributeBox attributes={this.state.attributes.attributeList}/>
				</div>
				<div className="content-rhs">
					<ChatBox users={this.state.users} messages={this.state.messages} newMessageHandler={this.addMessage}/>
				</div>
				<div id="bottom">
					<QrBox rid={this.state.room.id} />
				</div>
			</div>
		);
		//

	},
	addMessage: function(message){
		//post
	}
});

var AttributeBox = React.createClass({
	render: function(){

		var baseAttributes = _.filter(this.props.attributes, {type: "default"});
		var imgAttributes = _.filter(this.props.attributes, {type: "image"});

		return (
			<div>
				{imgAttributes?<ImageBox images={imgAttributes}/>:null}
				{baseAttributes?<BaseAttributeBox attributes={baseAttributes}/>:null}
				<AttributeInputBox/>
			</div>
		);
	}
});

var ImageBox = React.createClass({
	getInitialState: function(){
		return {
			currentIndex: 0
		}
	},
	render: function(){
		return(
			<div className="image-slider-container" id="image-slider-container">
				{this.props.images.map(function(attr, i){
					var clazz = "img ";
					if(this.state.currentIndex == i){
						clazz += "active";
					}

					if(!attr.text)
						return null;
					var neg_votes = attr.votesDown;
					var pos_votes = attr.votesUp;
					var neg_voted = _.filter(neg_votes, {name: myself.name}).length>0;
					var pos_voted = _.filter(pos_votes, {name: myself.name}).length>0;

					var onClickpos = pos_voted?null:this.up;
					var onClickneg = neg_voted?null:this.down;

					return (
						<div className={clazz}>
							<img src={attr.text} className="image" onClick={this.change}/>
							<Attrib title={attr.title} text="" pos_voted={pos_voted} neg_voted={neg_voted} pos={pos_votes} neg={neg_votes} />
						</div>
					);

				}.bind(this))}
			</div>
		);
	},
	change: function(){
		this.setState({currentIndex: this.state.currentIndex + 1});
	}
});

var BaseAttributeBox = React.createClass({
	render: function(){
		return(
			<div className="baseAttrBox">
				<div className="title"></div>
				<div className="attributes">
				{this.props.attributes.map(function(attr,i){
					if(!attr.text)
						return null;
					var neg_votes = attr.votesDown;
					var pos_votes = attr.votesUp;
					var neg_voted = _.filter(neg_votes, {name: myself.name}).length>0;
					var pos_voted = _.filter(pos_voted, {name: myself.name}).length>0;

					var onClickpos = pos_voted?null:this.up;
					var onClickneg = neg_voted?null:this.down;

					return (
						<Attrib title={attr.title} aid={attr.atid} text={attr.text} pos_voted={pos_voted} neg_voted={neg_voted} pos={pos_votes} neg={neg_votes} />
					);
				})}
				</div>
			</div>
		);
	},
	up: function(){

	},
	down: function(){

	}
});

var Attrib = React.createClass({
	getInitialState: function(){
		return {
			pos_voted: this.props.pos_voted,
			neg_voted: this.props.neg_voted,
			posLen: this.props.pos.length,
			negLen: this.props.neg.length
		};
	},
	render: function(){
		var upclazz = "attribute-up " + (this.state.pos_voted?"voted": "");
		var downclazz = "attribute-down " + (this.state.neg_voted?"voted": "");

		return (
			<div className="attribute">
				<div className="sub-title">{this.props.title}</div>
				<div className="title">{this.props.text}</div>
				<div onClick={this.togUP} className={upclazz}>{this.state.posLen}</div>
				<div onClick={this.togDW} className={downclazz}>{this.state.negLen}</div>
			</div>
		);
	},
	togUP: function(){
		sendFeedBack(this.props.aid, 1);
		this.setState({pos_voted: !this.state.pos_voted, posLen: parseInt(this.state.pos_voted?this.state.posLen-1:this.state.posLen+1)});
	},
	togDW: function(){
		sendFeedBack(this.props.aid, 0);
		this.setState({neg_voted: !this.state.neg_voted, negLen: parseInt(this.state.neg_voted?this.state.negLen-1:this.state.negLen+1)});
	}
});

var DerivedAttributeBox = React.createClass({
	render: function(){
		return(
			<div></div>
		);
	}
});

var AttributeInputBox = React.createClass({
	render: function(){
		return(
			<div className="attr-inputBox">
				<input type="text" placeholder="Add +ive feature"/>
				<input type="text" placeholder="Add -ive feature"/>
			</div>
		);
	}
});

var ChatBox = React.createClass({
	getInitialState: function(){
		return {
			messages: this.props.messages
		}
	},
	componentDidMount: function(){
		window.setInterval(function(){
			this.repopMsg();
		}.bind(this), messageInterval);
	},
	render: function(){
		return(
			<div className="chatBox">
				<div className="me">
					<img src="http://comedian-marilyn-35201.bitballoon.com/avtar-large.png" className="image float-left"/>
					<span className="title">{myself.name}</span>
					<div><a href="#bottom">Invite_by_message</a></div>
				</div>
				<div className="userslist">
					<div className="sub-title">Now online ({this.props.users.length})</div>
				{this.props.users.map(function(user){
					return (
						<div className="users">
							<img src="http://comedian-marilyn-35201.bitballoon.com/avtar.png" className="image" title={user.name} />
						</div>
					);
				})}
				</div>
				<div className="messages">
					<div className="sub-title">Messages</div>
				{this.state.messages.map(function(message){
					var author = (message.author==myself.name?"me":message.author);

					return (
						<div className="message">
							<span className="color-red">{author}</span>: {message.text}
						</div>
					);
				})}
				</div>
				<input type="text" className="code-input" ref="val" placeholder="send a message"/>
				<input type="button" className="btn" onClick={this.sendMessage} value=">" />
			</div>
		);
	},
	sendMessage: function(){
		var newState = this.state.messages;
		var val = this.refs.val.getDOMNode().value;
		newState.unshift({
			author: "me",
			text: val
		});
		messageLock = true;
		this.setState(newState);
		sendMessage(val);
	},
	repopMsg: function(){
		if(!messageLock)
			readMessage(0, function(messages){
				console.log(messages);
				this.setState({messages: messages.messages});
			}.bind(this));
	}
});

var QrBox = React.createClass({
	render: function(){
		var deepLinkURL = "http://hsapp-backend.herokuapp.com/triggerinvite#" + this.props.rid;
		var qrCodeURL = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(deepLinkURL);
		return(
			<div className="qrBox">
				<div className="title">Invite_by_qr</div>
				<img src={qrCodeURL} class="qr-image" />
			</div>
		);
	}
});

module.exports = new function(){
	this.init = function(model){
		//Will be executed when module loads on page.
		React.render(<Root model={model}/>, document.getElementById("root"));
	}
};


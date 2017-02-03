var GameLogic = function (game) {
	this.States = {
		PREGAME: -1,
		PLAYING: 0,
		GAMEOVER: 1
	};

	this.game = game;
	this.gameRoundLength = 30;
	this.secondsLeft = -1;

	this.gameTickerEvent = null;

	this.shoppingList = [];

	this.currentState = this.States.PREGAME;
};
GameLogic.prototype.getCurrentState = function () {
	return this.currentState;
};
GameLogic.prototype.startGame = function () {
	if (this.currentState !== this.States.PREGAME) { return; }

	this.currentState = this.States.PLAYING;
	this.secondsLeft = this.gameRoundLength;

	this.shoppingList = ['milk', 'eggs', 'apple', 'lotion'];

	this.gameTickerEvent = this.game.time.events.repeat(1000, this.secondsLeft, function () {
		this.secondsLeft--;

		if (this.secondsLeft === 0) {
			this.gameTickerEvent = null;

			this.game.state.start('Gameplay');
		}
	}, this);
}
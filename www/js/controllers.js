TicTacToe.controller('homeCtrl',function($rootScope, $filter, $ionicModal, $ionicSlideBoxDelegate, storageService, $ionicLoading, $ionicSideMenuDelegate, $window, $document, $state, $ionicPopup, $stateParams, $timeout, $scope){

  $ionicModal.fromTemplateUrl('templates/settings.html', function (modal) {
    $scope.settingsModal = modal;
  }, {scope:$scope});

  $scope.openSettings = ()=>{
    $scope.settingsModal.show();
  }

  var settingsGlobal = storageService.get('settings');
$scope.difficulty_msg = settingsGlobal.difficulty == 'easy' ? 'EASY' : 'HARD';
$scope.gameMode_msg = settingsGlobal.gameMode == 'hth' ? 'Human vs human' : 'Human vs phone';

 $scope.setDifficulty = (option)=>{
    var settings = storageService.get('settings');
    
    settings.difficulty = option;
    storageService.set('settings', settings);
    $scope.difficulty = storageService.get('settings').difficulty;   

    $scope.difficulty_msg = settings.difficulty == 'easy' ? 'EASY' : 'HARD';
    resetBoard();
 }

 $scope.setGameMode = (option)=>{

    var settings = storageService.get('settings');
    
    settings.gameMode = option;
    storageService.set('settings', settings);
    $scope.playAs = storageService.get('settings').gameMode;

    $scope.gameMode_msg = settings.gameMode == 'hth' ? 'Human vs human' : 'Human vs phone';
 }

    $scope.difficulty = storageService.get('settings').difficulty;
    $scope.playAs = storageService.get('settings').gameMode;

    const tiles = Array.from(document.querySelectorAll('.tile'));
    // console.log(tiles);
    // const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');

    let board = ['', '', '', '', '', '', '', '', ''];
    var hardBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    let currentPlayer = 'X';
    let isGameActive = true;


    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // human
    var huPlayer = "X";
    // ai
    var aiPlayer = "O";

    //keeps count of function calls
    var fc = 0;

    function emptyIndexies(board){
      return  board.map((e,i) => (e != "O" && e != "X") ? i : undefined).filter(x => x)
    }

    // winning combinations using the board indexies for instace the first win could be 3 xes in a row
    function winning(board, player){
     if (
            (board[0] == player && board[1] == player && board[2] == player) ||
            (board[3] == player && board[4] == player && board[5] == player) ||
            (board[6] == player && board[7] == player && board[8] == player) ||
            (board[0] == player && board[3] == player && board[6] == player) ||
            (board[1] == player && board[4] == player && board[7] == player) ||
            (board[2] == player && board[5] == player && board[8] == player) ||
            (board[0] == player && board[4] == player && board[8] == player) ||
            (board[2] == player && board[4] == player && board[6] == player)
            ) {
            return true;
        } else {
            return false;
        }
    }

    // the main minimax function
function minimax(newBoard, player){
  //add one to function calls
  fc++;
  
  //available spots
  var availSpots = emptyIndexies(newBoard);

  // checks for the terminal states such as win, lose, and tie and returning a value accordingly
  if (winning(newBoard, huPlayer)){
     return {score:-10};
  }
    else if (winning(newBoard, aiPlayer)){
    return {score:10};
    }
  else if (availSpots.length === 0){
    return {score:0};
  }

// an array to collect all the objects
  var moves = [];

  // loop through available spots
  for (var i = 0; i < availSpots.length; i++){
    //create an object for each and store the index of that spot that was stored as a number in the object's index key
    var move = {};
    move.index = newBoard[availSpots[i]];

    // set the empty spot to the current player
    newBoard[availSpots[i]] = player;

    //if collect the score resulted from calling minimax on the opponent of the current player
    if (player == aiPlayer){
      var result = minimax(newBoard, huPlayer);
      move.score = result.score;
    }
    else{
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    //reset the spot to empty
    newBoard[availSpots[i]] = move.index;

    // push the object to the array
    moves.push(move);
  }

  // console.log(moves)

// if it is the computer's turn loop over the moves and choose the move with the highest score
  var bestMove;
  if(player === aiPlayer){
    var bestScore = -10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score > bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }else{

// else loop over the moves and choose the move with the lowest score
    var bestScore = 10000;
    for(var i = 0; i < moves.length; i++){
      if(moves[i].score < bestScore){
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

// return the chosen move (object) from the array to the higher depth
  return moves[bestMove];
}

    const updateBoard =  (index) => {
        board[index] = currentPlayer;
        hardBoard[index] = currentPlayer
    }


    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;

                tiles[winCondition[0]].classList.add('winningStreak');
                tiles[winCondition[1]].classList.add('winningStreak');
                tiles[winCondition[2]].classList.add('winningStreak');
                break;
            }
        }

        if (roundWon) {
                announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
                isGameActive = false;
                return;
        }

        if (!board.includes('')){
            announce(TIE);
            tiles.forEach((tile)=>{
                tile.classList.add('tietiles');
            })
            isGameActive = false;
        } 
    }


    const computerAction = () =>{
        for (let i = 0; i <= 7; i++) {
            
        }
    };

    const announce = (type) => {
        switch(type){
            case PLAYERO_WON:
                announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        if (tile.innerText === 'X' || tile.innerText === 'O'){
            return false;
        }

        return true;
    };

    const changePlayer = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }


    const userAction = (tile, index, event) => {
        event.preventDefault();

        switch($scope.playAs){
            case 'hth': //human to human
            if(isValidAction(tile) && isGameActive) {
                tile.innerText = currentPlayer;
                tile.classList.add(`player${currentPlayer}`);
                updateBoard(index);
                handleResultValidation();
                changePlayer();
            }
            break;
            case 'htp': //human to phone

            //block user if invalid
            if(isValidAction(tile) && isGameActive && currentPlayer == 'X') {

                tile.innerText = currentPlayer;
                tile.classList.add(`player${currentPlayer}`);
                updateBoard(index);
                handleResultValidation();
                changePlayer();

                if (isGameActive) {
                //Now that the player has been changed, automatically play for player 'O'
                let oIdx;

                switch($scope.difficulty){
                    case 'easy':
                    oIdx = Math.floor(Math.random()*9);

                    //keep picking random number until we find a valid one
                    while(!isValidAction(tiles[oIdx])){
                        oIdx = Math.floor(Math.random()*9);
                    }

                    break;
                    case 'hard':
                    // algorithm for hard game
                    oIdx = minimax(hardBoard, aiPlayer).index;
                    break;
                }

                    $timeout(()=>{
                    tiles[oIdx].innerText = currentPlayer;
                    tiles[oIdx].classList.add(`player${currentPlayer}`);
                    updateBoard(oIdx);
                    handleResultValidation();
                    changePlayer();
                    },1000)   
                }
                      
            }
            break;
        }


    }
    
    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        hardBoard = [0,1,2,3,4,5,6,7,8];
        isGameActive = true;
        announcer.classList.add('hide');

        if (currentPlayer === 'O') {
            changePlayer();
        }

        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
            tile.classList.remove('winningStreak'); 
            tile.classList.remove('tietiles');
        });
    }

    tiles.forEach( (tile, index) => {
        tile.addEventListener('click', (e) => userAction(tile, index, e));
    });

    resetButton.addEventListener('click', resetBoard);
});

TicTacToe.factory('storageService', function($rootScope){

    return{

        set:function(key,value){
            var freshObj=angular.toJson(value);
            return localStorage.setItem(key,freshObj);
        },
        get:function(key){                  
            return  angular.fromJson(localStorage.getItem(key));
        },
        destroy:function(key){
            return localStorage.removeItem(key);
        }
    };
});


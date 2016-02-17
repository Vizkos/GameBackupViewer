import angular from 'angular';

let $http, $filter, $modal, $log;
let reverseSort = [];
        
export default class BackupsCtrl {
    constructor(_$http, _$filter, _$modal, _$log) {
        $http = _$http;
        $filter = _$filter;
        $modal = _$modal;
        $log = _$log;

        this.searchText = "";
        this.orderBy = $filter('orderBy');
        $http.get('data/games.json').then((response) => {
            this.games = response.data;
            this.loadCallback();
        });
    }

    downloadJson() {
        let gamesContent = angular.toJson(this.games);
        let url = 'data:text/json;charset=utf8,' + gamesContent;
        window.open(url, '_blank');
    }

    resetReverseSort(exceptThisIndex) {
        let game = this.games[0];
        for (let i in game) {
            if ((!exceptThisIndex || (exceptThisIndex && i !== exceptThisIndex))) {
                reverseSort[i] = true;
            }
        }
    }
    
    order(predicate) {
        this.resetReverseSort(predicate);
        reverseSort[predicate] = !reverseSort[predicate];
        this.games = this.orderBy(this.games, predicate, reverseSort[predicate]);
    }

    loadCallback() {
        this.resetReverseSort();

        //fill in incomplete records
        angular.forEach(this.games, function (game) {
            if (!game.date) {
                game.status = false;
                game.date = "";
                game.notes = "";
            }
        });

        //sort initially by name
        this.order('name');
    }

    openModal(game) {
        let editMode = true;
        //creating a new game?
        if (!game) {
            game = {};
            game.name = "";
            game.status = false;
            game.date = "";
            game.notes = "";
            editMode = false;
        }

        let modalInstance = $modal.open({
            templateUrl: 'editGame.html',
            controller: 'EditGameCtrl',
            resolve: {
                params: function () {
                    return { game: angular.copy(game), editMode: editMode };
                }
            }
        });

        modalInstance.result.then((params) => {
            //deleting game
            if (params.deleteMode) {
                let index = 0;
                let gameIndex = 0;
                angular.forEach(this.games, function (game) {
                    if (game.name == params.originalGame.name) {
                        gameIndex = index;
                    }

                    index++;
                });

                this.games.splice(gameIndex, 1);
                return;
            }

            //editing existing game
            if (params.editMode) {
                //if we are editing a current game, then go through the games, compare to original game object to match
                //names, then copy everything over -- including name and data modifications
                angular.forEach(this.games, function (game) {
                    if (game.name == params.originalGame.name) {
                        game.name = angular.copy(params.game.name);
                        game.status = angular.copy(params.game.status);
                        game.date = angular.copy(params.game.date);
                        game.notes = angular.copy(params.game.notes);
                    }
                });
            }
            //creating new game
            else {
                this.games.push(angular.copy(params.game));
                this.resetReverseSort();
                this.order('name');
            }
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }


}

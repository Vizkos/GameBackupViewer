var backupsApp = angular.module('backupsApp', ['ui.bootstrap']);

backupsApp.controller('backupsCtrl', ['$scope', '$http', '$filter', '$modal', '$log', function($scope, $http, $filter, $modal, $log) {
    $scope.searchText = "";
    var orderBy = $filter('orderBy');
    var reverseSort = [];

    $scope.downloadJson = function() {
        var gamesContent = angular.toJson($scope.games);
        var url = 'data:text/json;charset=utf8,' + gamesContent;
        window.open(url, '_blank');
    };

    function resetReverseSort(exceptThisIndex) {
        var game = $scope.games[0];
        for (var i in game) {
            if ((!exceptThisIndex || (exceptThisIndex && i !== exceptThisIndex))) {
                reverseSort[i] = true;
            }
        }
    }

    function loadCallback () {
        resetReverseSort();

        //fill in incomplete records
        angular.forEach($scope.games, function(game) {
            if (!game.date) {
                game.status = false;
                game.date = "";
                game.notes = "";
            }
        });

        $scope.order = function(predicate) {
            resetReverseSort(predicate);
            reverseSort[predicate] = !reverseSort[predicate];
            $scope.games = orderBy($scope.games, predicate, reverseSort[predicate]);
        };

        //sort initially by name
        $scope.order('name');
    }

    $scope.openModal = function (game) {
        var editMode = true;
        //creating a new game?
        if (!game) {
            game = {};
            game.name = "";
            game.status = false;
            game.date = "";
            game.notes = "";
            editMode = false;
        }

        var modalInstance = $modal.open({
            templateUrl: 'editGame.html',
            controller: 'editGameCtrl',
            resolve: {
                params: function () {
                    return {game: angular.copy(game), editMode: editMode};
                }
            }
        });

        modalInstance.result.then(function (params) {
            //deleting game
            if (params.deleteMode) {
                var index = 0;
                var gameIndex = 0;
                angular.forEach($scope.games, function(game) {
                    if (game.name == params.originalGame.name) {
                        gameIndex = index;
                    }

                    index++;
                });

                $scope.games.splice(gameIndex, 1);
                return;
            }

            //editing existing game
            if (params.editMode) {
                //if we are editing a current game, then go through the games, compare to original game object to match
                //names, then copy everything over -- including name and data modifications
                angular.forEach($scope.games, function(game) {
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
                $scope.games.push(angular.copy(params.game));
                resetReverseSort();
                $scope.order('name');
            }
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $http.get('data/games.json').then(function(response) {
        $scope.games = response.data;

        loadCallback();
    });
}]);

backupsApp.controller('editGameCtrl', function ($scope, $modalInstance, params) {
    $scope.game = params.game;
    //keep copy
    $scope.originalGame = angular.copy($scope.game);
    $scope.editMode = params.editMode;

    if ($scope.editMode) {
        $scope.saveButtonText = "Save";
        $scope.showDeleteButton = true;
    }
    else {
        $scope.saveButtonText = "Add";
        $scope.showDeleteButton = false;
    }

    $scope.ok = function () {
        $modalInstance.close({game: $scope.game, originalGame: $scope.originalGame, editMode: $scope.editMode});
    };

    $scope.deleteGame = function () {
        $modalInstance.close({game: $scope.game, originalGame: $scope.originalGame, editMode: $scope.editMode, deleteMode: $scope.showDeleteButton});
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
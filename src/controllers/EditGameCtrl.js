import angular from 'angular';

export default class EditGamesCtrl {
    constructor($scope, $uibModalInstance, params) {
        
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
            $uibModalInstance.close({game: $scope.game, originalGame: $scope.originalGame, editMode: $scope.editMode});
        };

        $scope.deleteGame = function () {
            $uibModalInstance.close({game: $scope.game, originalGame: $scope.originalGame, editMode: $scope.editMode, deleteMode: $scope.showDeleteButton});
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
}
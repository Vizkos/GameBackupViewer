import angular from 'angular';
import _angularbootstrap from 'angular-bootstrap';
import BackupsCtrl from './controllers/BackupsCtrl';
import EditGameCtrl from './controllers/EditGameCtrl';

angular.module('backupsApp', ['ui.bootstrap'])
    .controller('BackupsCtrl', ['$http', '$filter', '$uibModal', '$log', BackupsCtrl])
    .controller('EditGameCtrl', ['$scope', '$uibModalInstance', 'params', EditGameCtrl]);

angular.element(document).ready(function () {
    angular.bootstrap(document, ['backupsApp'], {strictDi: true});
});

'use strict';
var angularObj = {
    app: null,
    initAngular: function (api, fresState) {
        angularObj.app = angular.module('myAplicacion', ['ngMaterial', 'md.data.table']);
        angularObj.app.controller('accesoDatosController', ['$scope', function ($scope, $mdSelect) {
            $scope.datos = "hola";
            $scope.lstDeviceGeotab = [];
            $scope.Data = {
                start: new Date(),
                end: new Date()
            };
            $scope.drivers = {};
            $scope.dispositivoSeleccionado = [];
            //var totalEventos = {};
            $scope.eventos = [];
            $scope.lstDevice = [];
            $scope.resultLogRecords = [];

            $scope.selected = [];
            $scope.query = {
                order: "name",
                limit: 10,
                page: 1
            }

            function success(totalEventos) {
                $scope.totalEventos = totalEventos;
            }
            $scope.gettotalEventos = function () {
                $scope.promise = $scope.totalEventos.get($scope.query, success).$promise;
            }
            // funcion que permite ingresar texto en el search 
            $scope.updateSearch = function updateSearch(e) {
                e.stopPropagation();
            };
            $scope.getDevice = function (device) {
                try {
                    $scope.dispositivoSeleccionado = device;
                    $scope.$apply();

                } catch (error) {
                    console.log(error.message);
                }
            }

            api.call("Get", {
                typeName: "Device"
            }, function (result) {
                $scope.lstDeviceGeotab = result;
                $scope.lstDeviceGeotab.forEach(function (device) {
                    $scope.lstDevice.id = device;
                    //console.log(device);
                });
            }, function (error) {
                console.error(error);
            });

            $scope.consultaDriverChange = function () {
                try {
                    if ($scope.dispositivoSeleccionado.length < 0) {
                        const toast = swal.mixin({
                            toast: true,
                            position: 'center',
                            showConfirmButton: false,
                            timer: 9000
                        });
                        toast({
                            type: 'error',
                            title: 'Selecciona un vehículo.'
                        });
                    }
                    var calls = $scope.getCalls();
                    api.multiCall(calls, function (results) {
                        $scope.resultLogRecords = results[2];

                        results[1].forEach(function (resultDriver) {
                            $scope.drivers[resultDriver.id] = resultDriver;
                        });
                        results[0].forEach(function (driverChange) {
                            var totalEventos = {};
                            if (driverChange.driver.id) {
                                console.log("Id User:", driverChange.driver.id, "Nombre : ", $scope.drivers[driverChange.driver.id].name, "nfc: ", $scope.drivers[driverChange.driver.id].keys[0].serialNumber, "fecha: ", driverChange.dateTime);
                                //$scope.totalEventos.push("Id User:", driverChange.driver.id, "Nombre : ", $scope.drivers[driverChange.driver.id].name, "nfc: ", $scope.drivers[driverChange.driver.id].keys[0].serialNumber, "fecha: ", driverChange.dateTime);
                                var idUser = driverChange.driver.id;
                                totalEventos.idUser = idUser;
                                var nombre = $scope.drivers[driverChange.driver.id].name;
                                totalEventos.nombre = nombre;
                                var nfc = $scope.drivers[driverChange.driver.id].keys[0].serialNumber;
                                totalEventos.nfc = nfc;
                                var fechaEve = driverChange.dateTime;
                                totalEventos.fechaEve = fechaEve;
                                $scope.registrosFn(driverChange.dateTime);
                                $scope.eventos.push(totalEventos);
                            }
                        });
                    });
                    const toast = swal.mixin({
                        toast: true,
                        position: 'center',
                        showConfirmButton: false,
                        timer: 9000
                    });
                    toast({
                        type: 'success',
                        title: 'Consulta finalizada, da clic en Exportar para descargar archivo.'
                    });
                } catch (error) {
                    console.log(error.message);
                }
            }

            $scope.getCalls = function () {
                try {
                    var calls = [];
                    calls.push(["Get", {
                            "typeName": "DriverChange",
                            "search": {
                                "deviceSearch": {
                                    "id": "b5" /*$scope.dispositivoSeleccionado.id*/
                                },
                                "fromDate": $scope.Data.start,
                                "toDate": $scope.Data.end
                            }
                        }],
                        ["Get", {
                            "typeName": "User",
                            "search": {
                                "isDriver": true
                            }
                        }],
                        ["Get", {
                            "typeName": "LogRecord",
                            "search": {
                                "dceviceSearch": {
                                    "id": "b5"
                                },
                                "fromDate": $scope.Data.start,
                                "toDate": $scope.Data.end
                            }
                        }]);
                    return calls;
                } catch (error) {
                    console.log(error.message);
                }
            }

            $scope.descargar = function () {
                if ($scope.eventos.length === 0) {
                    const toast = swal.mixin({
                        toast: true,
                        position: 'center',
                        showConfirmButton: false,
                        timer: 3000
                    });

                    toast({
                        type: 'error',
                        title: 'No hay datos'
                    })
                } else
                if ($scope.eventos.length > 0) {
                    Exporter.export(driverChange, 'testDriverChange.xls', 'Data');
                }
            }
            $scope.queHacer = function () {
                const toast = swal.mixin({
                    toast: true,
                    position: 'center-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                toast({
                    type: "info",
                    title: "Que intentas hacer ¬¬"
                });
            }
            $scope.registrosFn = function (fecha) {
                let registroFecha = $scope.resultLogRecords.filter(function (logRecord) {
                    var date = new Date(logRecord.dateTime);
                    return fecha < date;
                });
            }
        }]);
    }
}
var categoryApp = angular.module('category', ['ngRoute']);
categoryApp.controller('CategoryController', ['$scope', '$http', '$route', '$routeParams', '$location', function ($scope, $http, $route, $routeParams, $location) {

        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        var categoryListObj = null;
        $scope.getCategories = function () {
            $http.get('/categories').
            success(function (data, status, headers, config) {

                // this callback will be called asynchronously
                // when the response is available
                if (data != null && data.length > 0) {
                    console.log(data.length);
                    $scope.tree = {};
                    $scope.categoryList = {};
                    $scope.itemList = [];
                    $scope.categoryCovered = [];

                    $scope.categoryList = data;
                    categoryListObj = data;
                    //$scope.generateJSON();
                    $scope.processTree("0", 0);
                    if ($scope.$$phase !== '$digest') {
                        $scope.$digest()
                    }
                    if (!$scope.$$phase) $scope.$apply();
                    //$scope.itemList = [];
                }

            }).
            error(function (data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        };

        $scope.deleteNode = function (data) {

            if (data.name) {
                // Simple POST request example (passing data) :
                $http.delete('/categories/' + data._id).
                success(function (data, status, headers, config) {
                    //alert('deleted');
                    $scope.init();
                    // this callback will be called asynchronously
                    // when the response is available

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong");
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.

                });
            }
        }
        $scope.editCategory = function (data) {

            if ($scope.editCategoryModel.categoryName) {
                // Simple POST request example (passing data) :
                $http.put('/categories/' + data._id, $scope.editCategoryModel).
                success(function (dt, status, headers, config) {

                    data.editCat = false;
                    data.categoryName = $scope.editCategoryModel.categoryName;
                    $scope.init();

                    //scope.init() not working
                    window.location.reload(false);

                    // this callback will be called asynchronously
                    // when the response is available

                }).
                error(function (dt, status, headers, config) {
                    alert("Something gone wrong");
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.

                });
            }
        }

        $scope.addCategory = function () {
            if ($scope.category.categoryName) {
                // Simple POST request example (passing data) :
                $http.post('/categories', $scope.category).
                success(function (data, status, headers, config) {
                    $scope.init();

                    //scope.init() not working
                    window.location.reload(false);
                    // this callback will be called asynchronously
                    // when the response is available

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong");
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.

                });
                $scope.itemList = [];
            }
        };
        // in controller
        $scope.init = function () {
            // check if there is query in url
            // and fire search in case its value is not empty
            $scope.categoryList = [];
            $scope.itemList = [];
            $scope.categoryCovered = [];
            $scope.tree = {};
            $scope.getCategories();
            $scope.lastEditOpenedNode = null;

        };


        $scope.processTree = function (parentId, categoryLevel) {
            console.log('searching for parent ' + parentId);
            //for (x=0; x < categoryListObj.length; x++) {
            //    console.log("hey");
            //    $scope.addNode(categoryListObj[x].categoryName, categoryListObj[x].parentCategory);
            //}
            var d = $scope.categoryList.filter(function (cat) {
                return cat.parentCategory == parentId
            });
            for (var c = 0; c < d.length; c++) {
                d[c].categoryNodeLevel = categoryLevel;
                console.log(d[c]);
                if (parentId == 0) {
                    console.log('adding root ' + d[c].categoryName)
                    $scope.itemList.push({
                        _id: d[c]._id,
                        categorySlug: d[c].categorySlug,
                        name: d[c].categoryName,
                        parentCategory: 0,
                        editCat: false,
                        expandNode: true,
                        isValid: true,
                        categoryNodeLevel: categoryLevel,
                        nodes: []
                    });
                } else {
                    var parent = $scope.getObject($scope.itemList, d[c].parentCategory);
                    if (parent == null) {
                        $scope.itemList.push({
                            _id: d[c]._id,
                            categorySlug: d[c].categorySlug,
                            name: d[c].categoryName,
                            parentCategory: 0,
                            editCat: false,
                            expandNode: true,
                            isValid: true,
                            categoryNodeLevel: categoryLevel,
                            nodes: []
                        });
                        console.log('adding parent not found ' + d[c].categoryName)
                    } else {
                        parent.nodes.push({
                            _id: d[c]._id,
                            categorySlug: d[c].categorySlug,
                            name: d[c].categoryName,
                            parentCategory: d[c].parentCategory,
                            expandNode: true,
                            editCat: false,
                            isValid: true,
                            categoryNodeLevel: categoryLevel,
                            nodes: []
                        });
                        console.log('adding parent found' + d[c].categoryName)
                    }
                }

                //if(d[c].nodes != null && d[c].nodes.length > 0) {
                //for(var ct = 0; ct < d[c].length; ct++) {

                if ($scope.categoryCovered.indexOf(d[c].categoryName) == -1) {
                    console.log('hey');
                    $scope.categoryCovered.push(d[c].categoryName);
                    $scope.processTree(d[c]._id, categoryLevel + 1);

                }
                //}
                //}

            }
            console.log(d);

            //console.log($scope.itemList);
        }

        $scope.addNode = function (categoryName, parentCategory) {
            //var post = data.nodes.length + 1;
            //var newName = data.name + '-' + post;
            if (!(parentCategory === undefined) && parentCategory != null && categoryName != parentCategory && parentCategory != 0) {
                console.log('checking parent => ' + parentCategory);
                var parent = $scope.getObject($scope.itemList, parentCategory); //$scope.itemList.filter(function (cat) { return cat.name == parentCategory })[0];
                if (parent == null)
                    $scope.itemList.push({
                        name: categoryName,
                        nodes: []
                    });
                else {
                    //console.log(parent);
                    parent.nodes.push({
                        name: categoryName,
                        nodes: []
                    });
                }
            } else {
                $scope.itemList.push({
                    name: categoryName,
                    nodes: []
                });
            }

        };


        $scope.fillTree = function (name, steps) {
            var current = null,
                existing = null,
                i = 0;
            for (var y = 0; y < steps.length; y++) {
                if (y == 0) {
                    if (!$scope.tree.children || typeof $scope.tree.children == 'undefined') {
                        $scope.tree = {
                            text: steps[y],
                            leaf: false,
                            children: []
                        };
                    }
                    current = $scope.tree.children;
                } else {
                    existing = null;
                    for (i = 0; i < current.length; i++) {
                        if (current[i].text === steps[y]) {
                            existing = current[i];
                            break;
                        }
                    }
                    if (existing) {
                        current = existing.children;
                    } else {
                        current.push({
                            text: steps[y],
                            leaf: false,
                            children: []
                        });
                        current = current[current.length - 1].children;
                    }
                }
            }
            current.push({
                text: name,
                leaf: true
            })
        }
        $scope.generateJSON = function () {
            //console.log(categoryListObj)
            for (x = 0; x < categoryListObj.length; x++) {
                //steps =data[x].team.split('/');
                $scope.fillTree(categoryListObj[x].categoryName, categoryListObj[x].categoryName)
            }
            //console.log(tree);
        }

        $scope.getObject = function (theObject, parentCategoryId) {
            var result = null;
            if (theObject instanceof Array) {
                for (var i = 0; i < theObject.length; i++) {

                    result = $scope.getObject(theObject[i], parentCategoryId);
                }
            } else {
                console.log('=>' + parentCategoryId)
                for (var prop in theObject) {
                    console.log(prop + ': ' + theObject[prop]);
                    if (prop == '_id') {
                        if (theObject[prop] == parentCategoryId) {
                            return theObject;
                        }
                    }
                    if (theObject[prop] instanceof Object || theObject[prop] instanceof Array)
                        result = $scope.getObject(theObject[prop], parentCategoryId);
                }
            }
            return result;
        }

        $scope.openEditNode = function (data) {
            if ($scope.lastEditOpenedNode != null && $scope.lastEditOpenedNode._id != data._id)
                $scope.cancelEditNode($scope.lastEditOpenedNode);

            $scope.lastEditOpenedNode = data;
            data.editCat = true;
        }
        $scope.cancelEditNode = function (data) {
            data.editCat = false;
        }

        $scope.openAddChildNode = function (data) {
            $scope.category.parentCategory = data._id;
            //alert('adding child node to ' + data.name)
            //  data.nodes.push({ name: '', parentCategory: data.name,  editCat: false, isValid: false, nodes: []});
            //  console.log(data.nodes.length);
            //  console.log(JSON.stringify($scope.itemList, null, 2));
        }

        $scope.cancelAddChildNode = function (data) {
            console.log($scope.itemList);
            if (data.parentCategory == 0) {
                var index = $scope.findIndexByKeyValue($scope.itemList, 'name', data.name);
                $scope.itemList.splice(index, 1);
            } else {
                //alert(data.parentCategory);
                var parent = $scope.getObject($scope.itemList, data.parentCategory);
                //alert(data.parentCategory);
                if (parent != null) {
                    var index = $scope.findIndexByKeyValue(parent.nodes, 'isValid', false);
                    parent.nodes.splice(index, 1);
                } else {
                    var index = $scope.findIndexByKeyValue($scope.itemList, 'isValid', false);
                    //alert(data.isValid + index);
                    $scope.itemList.splice(index, 1);
                }

            }
        }

        $scope.findIndexByKeyValue = function (obj, key, value) {
            // alert(obj.length);
            for (var i = 0; i < obj.length; i++) {
                //alert("HERO" + obj[i][key]);
                if (obj[i][key] == value) {
                    return i;
                }
            }
        }


        $scope.collapse = function (data) {
            data.expandNode = false;
        }
        $scope.expand = function (data) {
            data.expandNode = true;
        }

        $scope.categoryNodeLevelFilter = function (categoryNodeLevel1, categoryNodeLevel2) {
            return categoryNodeLevel1 < categoryNodeLevel2;
        };

}])
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/category.html#/:categorySlug', {
                templateUrl: 'category.html',
                controller: 'CategoryController'
            });
    });

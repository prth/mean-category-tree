var categoryApp = angular.module('category', ['ngRoute']);
categoryApp.controller('CategoryController', ['$scope', '$http', '$route', '$routeParams', '$location', function ($scope, $http, $route, $routeParams, $location) {

        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        var categoryListObj = null;

        //Make a GET Request to fetch all the categories
        $scope.getCategories = function () {
            $http.get('/categories').
            success(function (data, status, headers, config) {

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
                alert("Something went wrong");
            });
        };

        //Make a Delete Request to remove a particular category
        $scope.deleteNode = function (data) {
            if (data.name) {
                $http.delete('/categories/' + data._id).
                success(function (data, status, headers, config) {
                    $scope.init();
                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong");
                });
            }
        }

        //Make a PUT Request to edit a particular category
        $scope.editCategory = function (data) {
            if ($scope.editCategoryModel.categoryName) {
                $http.put('/categories/' + data._id, $scope.editCategoryModel).
                success(function (dt, status, headers, config) {

                    data.editCat = false;
                    data.categoryName = $scope.editCategoryModel.categoryName;
                    $scope.init();
                    //scope.init() not working
                    window.location.reload(false);

                }).
                error(function (dt, status, headers, config) {
                    alert("Something gone wrong");
                });
            }
        }

        //Make a POST Request to add a new category
        $scope.addCategory = function () {
            if ($scope.category.categoryName) {
                $http.post('/categories', $scope.category).
                success(function (data, status, headers, config) {
                    $scope.init();

                    //scope.init() not working
                    window.location.reload(false);

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong");
                });
            }
        };


        $scope.init = function () {
            $scope.categoryList = [];
            $scope.itemList = [];
            $scope.categoryCovered = [];
            $scope.tree = {};
            $scope.lastEditOpenedNode = null;
            $scope.getCategories();
        };


        //recursive method to created a nested Object for category heirarchy
        $scope.processTree = function (parentId, categoryLevel) {
            //console.log('searching for parent ' + parentId);
            //for (x=0; x < categoryListObj.length; x++) {
            //    console.log("hey");
            //    $scope.addNode(categoryListObj[x].categoryName, categoryListObj[x].parentCategory);
            //}

            //filter from main categoryList to get all the child categories
            var childCategories = $scope.categoryList.filter(function (cat) {
                return cat.parentCategory == parentId
            });

            for (var c = 0; c < childCategories.length; c++) {
                childCategories[c].categoryNodeLevel = categoryLevel;
                //console.log(childCategories[c]);
                if (parentId == 0) {
                    $scope.itemList.push({
                        _id: childCategories[c]._id,
                        categorySlug: childCategories[c].categorySlug,
                        name: childCategories[c].categoryName,
                        parentCategory: 0,
                        editCat: false,
                        expandNode: true,
                        isValid: true,
                        showAdd: false,
                        categoryNodeLevel: categoryLevel,
                        nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                    });
                    //console.log('adding root ' + childCategories[c].categoryName)
                } else {
                    var parent = $scope.getCategoryObject($scope.itemList, childCategories[c].parentCategory);
                    if (parent == null) {
                        $scope.itemList.push({
                            _id: childCategories[c]._id,
                            categorySlug: childCategories[c].categorySlug,
                            name: childCategories[c].categoryName,
                            parentCategory: 0,
                            editCat: false,
                            expandNode: true,
                            isValid: true,
                            showAdd: false,
                            categoryNodeLevel: categoryLevel,
                            nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                        });
                        //console.log('adding parent not found ' + childCategories[c].categoryName)
                    } else {
                        parent.nodes.push({
                            _id: childCategories[c]._id,
                            categorySlug: childCategories[c].categorySlug,
                            name: childCategories[c].categoryName,
                            parentCategory: childCategories[c].parentCategory,
                            expandNode: true,
                            editCat: false,
                            isValid: true,
                            showAdd: false,
                            categoryNodeLevel: categoryLevel,
                            nodes: [{isValid: false, showAdd: false, parentCategory: childCategories[c]._id}]
                        });
                        //console.log('adding parent found' + childCategories[c].categoryName)
                    }
                }

                if ($scope.categoryCovered.indexOf(childCategories[c].categoryName) == -1) {
                    $scope.categoryCovered.push(childCategories[c].categoryName);
                    $scope.processTree(childCategories[c]._id, categoryLevel + 1);
                }

            }

            //console.log($scope.itemList);
        }

        //finds and return category object on the basis of categoryId from the provided categoryObject
        $scope.getCategoryObject = function (categoryObject, categoryId) {
            var result = null;
            if (categoryObject instanceof Array) {
                for (var i = 0; i < categoryObject.length; i++) {
                    //console.log(categoryObject[i]);
                    result = $scope.getCategoryObject(categoryObject[i], categoryId);
                }
            } else {
                //console.log('=>' + categoryId + " - " + categoryObject)
                for (var prop in categoryObject) {
                    //console.log(prop + ': ' + categoryObject[prop]);
                    if (prop == '_id') {
                        if (categoryObject[prop] == categoryId) {
                            return categoryObject;
                        }
                    }
                    if (categoryObject[prop] instanceof Object || categoryObject[prop] instanceof Array)
                        result = $scope.getCategoryObject(categoryObject[prop], categoryId);
                }
            }
            return result;
        }

        //opens Edit Category section
        $scope.openEditNode = function (data) {
            if ($scope.lastEditOpenedNode != null && $scope.lastEditOpenedNode._id != data._id)
                $scope.cancelEditNode($scope.lastEditOpenedNode);
            $scope.lastEditOpenedNode = data;
            data.editCat = true;
        }

        //cancels Edit Category section
        $scope.cancelEditNode = function (data) {
            data.editCat = false;
        }

        //opens Add Child Category section
        $scope.openAddChildNode = function (data) {
            //$scope.category.parentCategory = data._id;
            //alert('adding child node to ' + data.name)
            //  data.nodes.push({ name: '', parentCategory: data.name,  editCat: false, isValid: false, nodes: []});
            //  console.log(data.nodes.length);
            //  console.log(JSON.stringify($scope.itemList, null, 2));
            var addNode = data.nodes.filter(function (cat) {
                return !cat.isValid;
            });

            if(addNode.length == 1) {
                addNode[0].showAdd = true;
            }
        }

        //cancels Add Child Category section
        $scope.cancelAddChildNode = function (data) {
            //console.log($scope.itemList);
            data.showAdd = false;
            /*
            if (data.parentCategory == 0) {
                var index = $scope.findIndexByKeyValue($scope.itemList, 'name', data.name);
                $scope.itemList.splice(index, 1);
            } else {
                //alert(data.parentCategory);
                var parent = $scope.getCategoryObject($scope.itemList, data.parentCategory);
                //alert(data.parentCategory);
                if (parent != null) {
                    var index = $scope.findIndexByKeyValue(parent.nodes, 'isValid', false);
                    parent.nodes.splice(index, 1);
                } else {
                    var index = $scope.findIndexByKeyValue($scope.itemList, 'isValid', false);
                    //alert(data.isValid + index);
                    $scope.itemList.splice(index, 1);
                }

            }*/
        }

        $scope.saveChildCategory = function (category) {
            if ($scope.addCategory.categoryName) {
                //console.log($scope.addCategory.categoryName, $scope.addCategory.parentCategory);
                $http.post('/categories', {categoryName: $scope.addCategory.categoryName, parentCategory: $scope.addCategory.parentCategory}).
                success(function (data, status, headers, config) {
                    //$scope.init();
                    /*
                    console.log($scope.itemList);
                    console.log($scope.addCategory.parentCategory);
                    var parentCategory = $scope.getCategoryObject($scope.itemList, $scope.addCategory.parentCategory);

                    console.log(parentCategory);
                    if(parentCategory != null && parentCategory.length == 1) {

                        parentCategory[0].nodes.push({
                            _id: data._id,
                            categorySlug: data.categorySlug,
                            name: data.categoryName,
                            parentCategory: data.parentCategory,
                            expandNode: true,
                            editCat: false,
                            isValid: true,
                            showAdd: false,
                            categoryNodeLevel: parentCategory.categoryLevel + 1,
                            nodes: [{isValid: false, showAdd: false, parentCategory: data._id}]
                        });
                        console.log('adding parent found' + data.categoryName)
                    }
                    */
                    //scope.init() not working
                    window.location.reload(false);

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong in saving child category");
                });
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

        //collapse list view of child categories
        $scope.collapse = function (data) {
            data.expandNode = false;
        }

        //expand list view of child categories
        $scope.expand = function (data) {
            data.expandNode = true;
        }

        //filter on the basis of category node level
        $scope.categoryNodeLevelFilter = function (categoryNode1) {
            return function(categoryNode2) {
                //return true;
                //console.log('PRTH -' + categoryNode1.categoryNodeLevel + ' < ' + categoryNode2.categoryNodeLevel)
                if(categoryNode1.categoryNodeLevel > categoryNode2.categoryNodeLevel)
                    return true;
            }
        };

}])

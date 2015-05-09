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
                console.log(data);
                if (data != null && data.length > 0) {
                    console.log(data.length);
                    $scope.tree = {};
                    $scope.categoryList = {};

                    //console.log($scope.itemList[0]);
                    $scope.categoryCovered = [];

                    $scope.categoryList = data;
                    categoryListObj = data;
                    //$scope.generateJSON();

                    if($scope.categoryList && $scope.categoryList.length > 0)
                        $scope.processTree("0", 0);

                    //alert($scope.itemList.nodes);
                    /*if ($scope.$$phase !== '$digest') {
                        $scope.$digest()
                    }
                    if (!$scope.$$phase) $scope.$apply();*/
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
                    //alert($scope.editCategoryModel.parentCategory);
                    //alert(dt.parentCategory);
                    if(data.parentCategory == dt.parentCategory) {
                        alert("same category");
                        var targetList;
                        if(dt.parentCategory == 0) {
                            //alert("main");
                            targetList = $scope.itemList[0].nodes;
                        }
                        else {
                            var temp = $scope.findNodeById($scope.itemList[0].nodes, dt.parentCategory)
                            //var temp = $scope.findIndexByKeyValue($scope.itemList, '_id', $scope.category.parentCategory);
                            alert(temp);
                            console.log(JSON.stringify(temp));
                            targetList = temp.nodes;
                        }

                        alert(targetList.length);
                        var categoryFound = targetList.filter(function (cat) {
                            return cat._id == dt._id;
                        });
                        alert(categoryFound[0]);
                        console.log("Blast" + categoryFound);
                        console.log(JSON.stringify(categoryFound));
                        alert(categoryFound[0].name);

                        categoryFound[0].name = dt.categoryName;
                    }
                    else
                        alert("different category");



                    data.editCat = false;
                    //data.categoryName = $scope.editCategoryModel.categoryName;
                    //$scope.init();
                    //scope.init() not working
                    //window.location.reload(false);

                }).
                error(function (dt, status, headers, config) {
                    //alert("Something gone wrong");
                });
            }
        }

        //Make a POST Request to add a new category
        $scope.addCategory = function () {
            if ($scope.category.categoryName) {
                $http.post('/categories', $scope.category).
                success(function (data, status, headers, config) {
                    //console.log("dude" + $scope.category);
                    //$scope.init();
                    //console.log(data);
                    //itemList.add(data);
                    $scope.categoryList.push(data);

                    var targetList;
                    var categoryLevel = 0;
                    //alert($scope.category.parentCategory);
                    if(!$scope.category.parentCategory || $scope.category.parentCategory == 0) {

                        //console.log(JSON.stringify($scope.itemList));
                        targetList = $scope.itemList[0].nodes;
                    }
                    else {
                        alert($scope.category.parentCategory);

                        var filterList = $scope.itemList[0].nodes.filter(function(cat) {
                            return cat.isValid == true;
                        });

                        var temp = $scope.findNodeById($scope.itemList[0], $scope.category.parentCategory)
                        //var temp = $scope.findIndexByKeyValue($scope.itemList, '_id', $scope.category.parentCategory);
                        console.log("Found out " + JSON.stringify(temp));
                        targetList = temp.nodes;
                        categoryLevel = temp.categoryNodeLevel + 1;
                    }

                    targetList.push({
                        _id: data._id,
                        categorySlug: data.categorySlug,
                        name: data.categoryName,
                        parentCategory: data.parentCategory,
                        editCat: false,
                        expandNode: true,
                        isValid: true,
                        showAdd: false,
                        categoryNodeLevel: categoryLevel,
                        nodes: [{isValid: false, showAdd: false, parentCategory: data._id}]
                    });
                    console.log($scope.itemList);
                    //scope.init() not working
                    //window.location.reload(false);

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong");
                });
            }
        };


        $scope.init = function () {
            $scope.categoryList = [];
            $scope.itemList = [];
            $scope.itemList.push({isParentNode: true, nodes: []});
            $scope.categoryCovered = [];
            $scope.tree = {};
            $scope.lastEditOpenedNode = null;
            $scope.lastAddOpenedNode = null;
            $scope.getCategories();
        };

        //can be moved to server - can be handled by node.js
        //recursive method to created a nested Object for category heirarchy
        $scope.processTree = function (parentId, categoryLevel) {
            //console.log('searching for parent ' + parentId);
            //for (x=0; x < categorylistobj.length; x++) {
            //    console.log("hey");
            //    $scope.addnode(categorylistobj[x].categoryname, categorylistobj[x].parentcategory);
            //}

            //filter from main categoryList to get all the child categories
            var childCategories = $scope.categoryList.filter(function (cat) {
                return cat.parentCategory == parentId
            });

            for (var c = 0; c < childCategories.length; c++) {
                childCategories[c].categoryNodeLevel = categoryLevel;
                //console.log(childCategories[c]);
                if (parentId == 0) {
                    console.log($scope.itemList);
                    $scope.itemList[0].nodes.push({
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
                        $scope.itemList.nodes.push({
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

            if($scope.lastAddOpenedNode != null && $scope.lastAddOpenedNode.showAdd)
            {
                $scope.lastAddOpenedNode.showAdd = false;
                $scope.lastAddOpenedNode = null;
            }
            var addNode = data.nodes.filter(function (cat) {
                return !cat.isValid;
            });

            if(addNode.length == 1) {
                addNode[0].showAdd = true;
                $scope.lastAddOpenedNode = addNode[0];
            }
        }

        //cancels Add Child Category section
        $scope.cancelAddChildNode = function (data) {
            //console.log($scope.itemList);
            data.showAdd = false;
            $scope.lastAddOpenedNode.showAdd = false;
            $scope.lastAddOpenedNode = null;
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

                    //scope.init() not working
                    //window.location.reload(false);

                }).
                error(function (data, status, headers, config) {
                    alert("Something gone wrong in saving child category");
                });
            }
        }

        $scope.findNodeById = function(obj, idValue) {
            var result;

            console.log("Looking for " + idValue );
            console.log("Looking in " + JSON.stringify(obj) );
            if(obj._id == idValue)
                console.log("we found a match");
            if(obj._id == idValue) {
                console.log("returning " + JSON.stringify(obj));
                return obj;
            }



                if(obj.nodes && obj.nodes.length > 0) {

                    var filterList2 = obj.nodes.filter(function(cat) {
                        return cat.isValid == true;
                    });

                    if(obj.nodes.length > 0) {
                        console.log("Tracing childs " + obj.nodes.length);
                        for(var i = 0; i < obj.nodes.length;i++) {
                            //console.log("SubObject " + JSON.stringify(obj.nodes[i]));
                            if(obj.nodes[i].isValid && obj.nodes[i].isValid == true) {
                                console.log("calling on " + JSON.stringify(obj.nodes[i]))   ;
                                $scope.findNodeById(obj.nodes[i], idValue);
                            }

                        }
                    }
                }

            //return result;
            /*
            for (var i = 0; i < objList.length; i++) {
                if(objList[i].isValid == true) {
                    //alert("HERO" + obj[i][key]);
                    //alert("HERO "  +objList[i]._id);
                    if (objList[i]._id == idValue) {
                        alert("Value match" + objList[i]);
                        return objList[i];
                    }
                    else {

                        if(objList[i].nodes && objList[i].nodes.length > 1) {
                            //alert('inner loop');
                            var filterList = objList[i].nodes.filter(function(cat) {
                                return cat.isValid == true;
                            });
                            console.log("Filtered List");
                            console.log(filterList);
                            if(filterList.length > 0) {
                                return result = $scope.findNodeById(filterList, idValue);
                            }
                        }
                    }
                }
            }
            return result;*/
            alert('thats it');
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
                return categoryNode1.isValid == true && categoryNode1.categoryNodeLevel > categoryNode2.categoryNodeLevel
                  && categoryNode1.parentCategory != categoryNode2._id;
            }
        };

}])
